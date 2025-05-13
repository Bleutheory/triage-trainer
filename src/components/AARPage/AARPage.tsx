import React, { useEffect, useState, FC } from 'react';
import { Casualty } from '../../types';
import { storage } from '../../utils/storage';

const AARPage: FC = () => {
  const [casualties, setCasualties] = useState<Casualty[]>([]);

  useEffect(() => {
    // Load stored casualties and revealed indexes using the storage utility
    const casualtiesData = storage.get<Casualty[]>(storage.KEYS.CASUALTIES, []);
    const revealedArray = storage.get<number[]>(storage.KEYS.REVEALED_INDEXES, []);
    const revealedIndexes = new Set<number>(revealedArray);
    setCasualties(casualtiesData.filter((_, idx) => revealedIndexes.has(idx)));
  }, []);

  // Helper to format BP field for display
  const formatBP = (bp: string | number | [number, number]): string => {
    if (typeof bp === 'number') return `↓ systolic ~${Math.abs(bp)}`;
    if (Array.isArray(bp)) return `${bp[0]}/${bp[1]}`;
    return bp;
  };

  return (
    <section>
      <h2>After Action Review</h2>
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Injury</th>
            <th>Triage</th>
            <th>Interventions</th>
            <th>Time to Treat</th>
            <th>Time to Triage</th>
            <th>Vitals</th>
            <th>Deteriorated?</th>
          </tr>
        </thead>
        <tbody>
          {casualties.filter(c => !c.isDemo).map((c, i) => (
            <tr key={i}>
              <td>{c.name}</td>
              <td>{c.injury}</td>
              <td>{c.triage}</td>
              <td>{c.interventions.map(i => `${i.name} (x${i.count})`).join(', ')}</td>
              <td>{c.treatmentTime != null ? `${c.treatmentTime}s` : '--'}</td>
              <td>{c.triageTime != null ? `${c.triageTime}s` : '--'}</td>
              <td>
                Pulse: {c.vitals.pulse}, Resp: {c.vitals.respiratory}, BP: {formatBP(c.vitals.bp)}, SpO2: {c.vitals.spo2}
              </td>
              <td>{c.deteriorated ? "Yes" : "No"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}
export default AARPage;
