import { useEffect, useRef } from 'react';
import { Casualty } from '../types';
import { isStabilized } from '../components/TriageBoard/TriageBoard';

interface Params {
  casualties: Casualty[];
  revealedIndexes: number[];
  phase: string;
  onUpdate: (updated: Casualty[]) => void;
  onNotify: (message: string) => void;
}

/**
 * Hook to schedule deterioration for casualties during the triage phase.
 */
export default function useCasualtyDeterioration({
  casualties,
  revealedIndexes,
  phase,
  onUpdate,
  onNotify,
}: Params) {
  const timers = useRef<Record<number, number>>({});

  useEffect(() => {
    if (phase !== 'triage') return;
    casualties.forEach((casualty, index) => {
      if (
        casualty.isDemo ||
        timers.current[index] ||
        !revealedIndexes.includes(index) ||
        isStabilized(casualty)
      ) {
        return;
      }
      // Random delay between 45s and 90s:
      const delayMs = (Math.floor(Math.random() * 46) + 45) * 1000;
      timers.current[index] = window.setTimeout(() => {
        onNotify(`${casualty.name}: Vital signs worsening due to lack of treatment.`);
        const updated = casualties.map((c, i) =>
          i === index ? { ...c, deteriorated: true } : c
        );
        onUpdate(updated);
      }, delayMs);
    });

    return () => {
      Object.values(timers.current).forEach(clearTimeout);
      timers.current = {};
    };
  }, [casualties, revealedIndexes, phase, onUpdate, onNotify]);
}