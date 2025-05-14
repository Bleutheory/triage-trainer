import React, { useEffect, useState, FC } from 'react';
import { Casualty } from '../../types';
import { storage } from '../../utils/storage';
//@ts-ignore
import styles from './AARPage.module.css';
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

  // Helper to check if BP is abnormal
  const isBPAbnormal = (bpString: string | undefined): boolean => {
    if (!bpString || typeof bpString !== 'string') return false;
    const parts = bpString.split('/');
    if (parts.length !== 2) return false; // Invalid format

    const systolic = parseInt(parts[0], 10);
    const diastolic = parseInt(parts[1], 10);

    if (isNaN(systolic) || isNaN(diastolic)) return false; // Not numbers

    // Define normal ranges (adjust as per medical guidelines if necessary)
    const normalSystolicMin = 90;
    const normalSystolicMax = 120; // Or 130, 140 depending on definition
    const normalDiastolicMin = 60;
    const normalDiastolicMax = 80; // Or 90 depending on definition

    return systolic < normalSystolicMin || systolic > normalSystolicMax ||
           diastolic < normalDiastolicMin || diastolic > normalDiastolicMax;
  };

  return (
    <section>
      <h2>After Action Review</h2>
      {casualties.filter(c => !c.isDemo).map((c) => {
        // Helper to check abnormal vitals (accepts tuples)
        const isAbnormal = (
          vital: number | [number, number] | string,
          normalRange: [number, number]
        ): boolean => {
          if (typeof vital === 'number') {
            return vital < normalRange[0] || vital > normalRange[1];
          }
          if (Array.isArray(vital)) {
            const [low, high] = vital;
            return low < normalRange[0] || high > normalRange[1];
          }
          return false;
        };

        return (
          <div key={c.id}>
            <div className={styles.sectionHeader}>Casualty Identification</div>
            <p>Name: {c.name} | Final Triage: {c.triage}</p>
                        <div className={styles.sectionHeader}>Primary Condition & Injuries</div>
            <p>{c.injury}</p>
            <p className={styles.instructorPrompt}>
              Why did you decide to place this casualty in the triage category you did?
              What were the most important factors?
            </p>
            

            <div className={styles.sectionHeader}>Initial Physiological State</div>
            <ul>
              <li className={isAbnormal(c.vitals.pulse, [60, 100]) ? styles.vitalAbnormal : ''}>
                Pulse: {c.vitals.pulse}
              </li>
              <li className={isAbnormal(c.vitals.respiratory, [12, 20]) ? styles.vitalAbnormal : ''}>
                Resp: {c.vitals.respiratory}
              </li>
              <li className={isBPAbnormal(c.vitals.bp as string | undefined) ? styles.vitalAbnormal : ''}>
                BP: {formatBP(c.vitals.bp)}
              </li>
              <li className={isAbnormal(c.vitals.spo2, [95, 100]) ? styles.vitalAbnormal : ''}>
                SpO2: {c.vitals.spo2}
              </li>
            </ul>

            <p className={styles.instructorPrompt}>
              Based on these vitals & injuries, what was going on with this patient?
              What trajectory was the patient on?
              How do these injuries interact with the vital sign abnormalities above?
            </p>

            <div className={styles.sectionHeader}>Intervention Rationale & Execution</div>
            <div>
              <strong>Required Treatments:</strong>
              <ul>
                { (c.requiredInterventions || []).map((req: string, idx) => {
                  const met = c.interventions.some(i => i.name === req);
                  return (
                    <li key={`req-${c.id}-${idx}`} className={ met ? styles.treatmentMet : styles.treatmentMissed }>
                      {req} { met ? '(applied)' : '(missed)' }
                    </li>
                  );
                }) }
              </ul>
              <p className={styles.instructorPrompt}>
                For each treatment: Why was it necessary based on the initial state?
                What was the end goal?
              </p>
            </div>
            <div>
              <strong>Applied Treatments:</strong>
              <ul>
                { c.interventions.map((appl, idx) => {
                  const expected = (c.requiredInterventions || []).some(req => req === appl.name);
                  return (
                    <li key={`appl-${c.id}-${idx}`} className={ expected ? styles.treatmentMet : styles.treatmentUnexpected }>
                      {appl.name} { expected ? '' : '(unexpected)' }
                    </li>
                  );
                }) }
              </ul>
              <p className={styles.instructorPrompt}>
                For each applied treatment: Did it address a required need?
                How would you assess its effectiveness?
              </p>
            </div>

            <div className={styles.sectionHeader}>Outcome</div>
            <p>
              {c.deteriorated ? 'Outcome: Died' : 'Outcome: Stabilized'} |
              Total Penalty Points: {c.penaltyPoints !== undefined ? c.penaltyPoints : 0}
            </p>
            <p className={styles.instructorPrompt}>
              How did the interventions (or lack thereof) contribute to casualty outcome?
            </p>
            <hr />
          </div>
        );
      })}
    </section>
  );
}
export default AARPage;
// Note: For the `c.penaltyPoints` change to work without `as any`, 
// you'll need to ensure that the `Casualty` type in `../../types`
// includes an optional `penaltyPoints` field, for example:
//
// export interface Casualty { ... penaltyPoints?: number; ... }
