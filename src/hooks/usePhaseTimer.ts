import { useState, useEffect } from 'react';

type Phase = 'setup' | 'scenario-brief' | 'triage' | 'aar';

interface Durations {
  packDuration: number;
  briefDuration: number;
  triageLimit: number;
}

/**
 * Returns a timer label for the given phase:
 * - Countdown for 'setup' and 'scenario-brief'
 * - Count-up (capped) for 'triage'
 * - Static '--:--' for 'aar' or unknown
 */
export default function usePhaseTimer(
  phase: Phase,
  durations: Durations
): string {
  const [label, setLabel] = useState('--:--');

  useEffect(() => {
    let interval: number;

    const run = async () => {
      let durationMs = 0;
      let storageKey = '';
      let isCountUp = false;

      switch (phase) {
        case 'setup':
          storageKey = 'packingEndTime';
          durationMs = durations.packDuration * 60 * 1000;
          break;
        case 'scenario-brief':
          storageKey = 'briefEndTime';
          durationMs = durations.briefDuration * 60 * 1000;
          break;
        case 'triage':
          storageKey = 'triageEndTime';
          durationMs = durations.triageLimit * 60 * 1000;
          isCountUp = true;
          break;
        default:
          setLabel('--:--');
          return;
      }

      const raw = await window.electronAPI.getItem(storageKey);
      const endTime = Number(raw);
      if (!endTime || isNaN(endTime)) {
        setLabel('--:--');
        return;
      }

      const updateLabel = () => {
        const now = Date.now();
        if (!isCountUp) {
          const remaining = Math.max(0, endTime - now);
          const minutes = String(Math.floor(remaining / 60000)).padStart(2, '0');
          const seconds = String(Math.floor((remaining % 60000) / 1000)).padStart(2, '0');
          setLabel(`${minutes}:${seconds}`);
        } else {
          const start = endTime - durationMs;
          const elapsed = Math.min(durationMs, now - start);
          const minutes = String(Math.floor(elapsed / 60000)).padStart(2, '0');
          const seconds = String(Math.floor((elapsed % 60000) / 1000)).padStart(2, '0');
          setLabel(`${minutes}:${seconds}`);
        }
      };

      updateLabel();
      interval = window.setInterval(updateLabel, 1000);
    };

    run();
    return () => clearInterval(interval);
  }, [phase, durations.packDuration, durations.briefDuration, durations.triageLimit]);

  return label;
}