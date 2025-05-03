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

  // Mark update as async
  const update = useCallback(async () => {
    if (phase !== 'triage') {
      setTimerLabel('--:--');
      return;
    }
    // New logic: use electronAPI.getItem instead of localStorage.getItem
    const effectiveEndTime = (!endTime || isNaN(endTime))
      ? Number(await window.electronAPI.getItem("scenarioEndTime"))
      : endTime;
    if (!effectiveEndTime || isNaN(effectiveEndTime)) {
      setTimerLabel('--:--');
      return;
    }
    const remaining = Math.max(0, effectiveEndTime - Date.now());
    const minutes = String(Math.floor(remaining / 60000)).padStart(2, '0');
    const seconds = String(Math.floor((remaining % 60000) / 1000)).padStart(2, '0');
    setTimerLabel(`${minutes}:${seconds}`);
  }, [endTime, phase]);

  useEffect(() => {
    // Call update initially
    update();

    // Use async function in setInterval
    const interval = window.setInterval(() => {
      // Call update (which is async, but we don't need to await here)
      update();
    }, 1000);

    return () => clearInterval(interval);
  }, [update, endTime, phase]);

  return timerLabel;
}