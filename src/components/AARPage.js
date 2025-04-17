import React from 'react';
import { useEffect, useState } from 'react';

export default function AARPage() {
  const [casualties, setCasualties] = useState([]);

  useEffect(() => {
    const stored = localStorage.getItem('casualties');
    const revealed = localStorage.getItem('revealedIndexes');
    if (stored && revealed) {
      const casualtiesData = JSON.parse(stored);
      const revealedIndexes = new Set(JSON.parse(revealed));
      setCasualties(casualtiesData.filter((_, idx) => revealedIndexes.has(idx)));
    }
  }, []);

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
                Pulse: {c.vitals.pulse}, Resp: {c.vitals.respiratory}, BP: {c.vitals.bp}, SpO2: {c.vitals.spo2}
              </td>
          <td>{c.deteriorated ? "Yes" : "No"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}
