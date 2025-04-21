import { useEffect, useRef } from 'react';

/**
 * Schedules automatic reveals of casualties over the triage period.
 *
 * @param phase      Current scenario phase ("triage" triggers reveals)
 * @param casualtyCount  Number of casualties to reveal
 * @param autoReveal Whether auto‑reveal is enabled (from localStorage)
 * @param revealCallback  Called with each index (1…n‑1) when it’s time to reveal that casualty
 */
export default function useCasualtyReveal(
  phase: string,
  casualtyCount: number,
  autoReveal: boolean,
  revealCallback: (idx: number) => void
) {
  const hasScheduled = useRef(false);

  useEffect(() => {
    if (phase === 'triage' && autoReveal && !hasScheduled.current) {
      hasScheduled.current = true;
      const totalDuration = 15 * 60 * 1000;
      // Generate sorted random delays for each casualty after the first
      const delays = Array.from({ length: casualtyCount - 1 }, () =>
        Math.floor(Math.random() * totalDuration)
      ).sort((a, b) => a - b);

      delays.forEach((delay, i) => {
        setTimeout(() => {
          revealCallback(i + 1);
        }, delay);
      });
    }
  }, [phase, autoReveal, casualtyCount, revealCallback]);
}