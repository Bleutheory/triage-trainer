import { useState, useEffect, useCallback } from 'react';

type Phase = 'setup' | 'scenario-brief' | 'triage' | 'aar';

/**
 * Hook for a countdown timer displayed during the triage phase.
 * @param endTime Timestamp (ms) when the scenario ends.
 * @param phase Current phase string ('setup' | 'scenario-brief' | 'triage' | 'aar').
 * @returns A formatted "MM:SS" timer or "--:--" outside the triage phase.
 */
export default function useScenarioTimer(endTime: number = 0, phase: Phase): string {
  const [timerLabel, setTimerLabel] = useState('--:--');

  const update = useCallback(() => {
    if (phase !== 'triage' || !endTime || isNaN(endTime)) {
      setTimerLabel('--:--');
      return;
    }
    const remaining = Math.max(0, endTime - Date.now());
    const minutes = String(Math.floor(remaining / 60000)).padStart(2, '0');
    const seconds = String(Math.floor((remaining % 60000) / 1000)).padStart(2, '0');
    setTimerLabel(`${minutes}:${seconds}`);
  }, [endTime, phase]);

  useEffect(() => {
    update(); // initial render

    const interval = window.setInterval(() => {
      if (phase === 'triage' && (!endTime || isNaN(endTime))) {
        const fallbackEnd = Number(localStorage.getItem("scenarioEndTime") || 0);
        if (fallbackEnd) {
          update();
        } else {
          setTimerLabel('--:--');
        }
      } else {
        update();
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [update, endTime, phase]);

  return timerLabel;
}