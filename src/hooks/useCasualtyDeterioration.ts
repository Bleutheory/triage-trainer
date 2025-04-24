import { useEffect, useRef } from 'react';
import { Casualty } from '../types';

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
      // Inline stabilization check (from CasualtyCard.tsx)
      const profile = require('../data').default[casualty.injuryKey];
      const triage = casualty.triage;
      const flags = {
        airway: casualty.vitals.airway.toLowerCase().includes('stridor'),
        bleeding: typeof casualty.vitals.bp === 'string' && casualty.vitals.bp.startsWith('65'),
        pneumo: casualty.vitals.steth.toLowerCase().includes('tracheal deviation'),
        ams: false,
        arterial: false,
      };

      let required: string[] = [];
      if (profile?.getRequiredInterventions) {
        required = profile.getRequiredInterventions(flags, triage);
      } else {
        required = profile?.requiredInterventions || [];
      }

      const { normalizeInterventionName } = require('../components/AidBagSetup/interventions');
      const stabilized = required.every(req => {
        const normalizedReq = normalizeInterventionName(req);
        return casualty.interventions.some(i => {
          const applied = normalizeInterventionName(i.name);
          const normReqList = Array.isArray(normalizedReq) ? normalizedReq : [normalizedReq];
          const normAppliedList = Array.isArray(applied) ? applied : [applied];
          return normReqList.some(req => normAppliedList.includes(req));
        });
      });

      // Debug log before skipping logic
      console.log("Checking casualty for deterioration:", index, casualty.name, {
        isDemo: casualty.isDemo,
        revealed: revealedIndexes.includes(index),
        stabilized,
        alreadyScheduled: Boolean(timers.current[index]),
        phase
      });
      if (
        casualty.isDemo ||
        timers.current[index] ||
        !revealedIndexes.includes(index) ||
        stabilized
      ) {
        return;
      }
      // Random delay between 45s and 90s:
      const delayMs = Math.floor(Math.random() * 45000) + 45000; // 45–90 seconds

      // Capture a frozen copy of the casualty at the time of scheduling
      const frozenCasualty = { ...casualty };

      // Use setTimeout correctly to schedule the deterioration logic
      setTimeout(() => {
        timers.current[index] = 1;
        console.log(`[Deterioration Timer Fired] Casualty: ${frozenCasualty.name}`);

        // Reload casualties from localStorage to ensure freshest state
        const stored = localStorage.getItem('casualties');
        const fresh = stored ? JSON.parse(stored) : [];

        // Re-evaluate stabilization using fresh casualty
        const freshCasualty = fresh.find(
          (c: Casualty) =>
            c.name === frozenCasualty.name && c.startTime === frozenCasualty.startTime
        );
        if (!freshCasualty) return;

        const profile = require('../data').default[freshCasualty.injury];
        const triage = freshCasualty.triage;
        const flags = {
          airway: freshCasualty.vitals.airway.toLowerCase().includes('stridor'),
          bleeding: typeof freshCasualty.vitals.bp === 'string' && freshCasualty.vitals.bp.startsWith('65'),
          pneumo: freshCasualty.vitals.steth.toLowerCase().includes('tracheal deviation'),
          ams: false,
          arterial: false,
        };

        let required: string[] = [];
        if (profile?.getRequiredInterventions) {
          required = profile.getRequiredInterventions(flags, triage);
        } else {
          required = profile?.requiredInterventions || [];
        }

        const { normalizeInterventionName } = require('../components/AidBagSetup/interventions');
        const stabilized = required.every(req => {
          const normalizedReq = normalizeInterventionName(req);
          return freshCasualty.interventions.some((i: { name: string }) => {
            const applied = normalizeInterventionName(i.name);
            const normReqList = Array.isArray(normalizedReq) ? normalizedReq : [normalizedReq];
            const normAppliedList = Array.isArray(applied) ? applied : [applied];
            return normReqList.some(req => normAppliedList.includes(req));
          });
        });

        if (!stabilized && !freshCasualty.deteriorated) {
          const updated = fresh.map((c: Casualty) =>
            c.name === frozenCasualty.name && c.startTime === frozenCasualty.startTime
              ? {
                  ...c,
                  deteriorated: true,
                  vitals: {
                    ...c.vitals,
                    pulse: (typeof c.vitals.pulse === 'number' ? c.vitals.pulse + 25 : c.vitals.pulse),
                    respiratory: (typeof c.vitals.respiratory === 'number' ? c.vitals.respiratory + 6 : c.vitals.respiratory),
                    bp: typeof c.vitals.bp === 'string' ? c.vitals.bp : '↓ systolic ~50',
                    spo2: (typeof c.vitals.spo2 === 'number' ? c.vitals.spo2 - 10 : c.vitals.spo2),
                    steth: "Worsened breath/heart sounds"
                  }
                }
              : c
          );
          localStorage.setItem('casualties', JSON.stringify(updated));
          onUpdate(updated);
          onNotify(`${frozenCasualty.name} has deteriorated due to lack of treatment.`);
        }
            }, delayMs); // Close setTimeout block
          });
        }, [casualties, revealedIndexes, phase, onUpdate, onNotify]); // Close useEffect dependencies
      }
