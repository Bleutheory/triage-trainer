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

      const normalizedRequired = required.flatMap(req => {
        const norm = normalizeInterventionName(req);
        return Array.isArray(norm) ? norm : [norm];
      });

      const normalizedApplied = casualty.interventions.flatMap(i => {
        const norm = normalizeInterventionName(i.name);
        return Array.isArray(norm) ? norm : [norm];
      });

      const stabilized = normalizedRequired.every(req => normalizedApplied.includes(req));
  
      if (casualty.isDemo || timers.current[index] || !revealedIndexes.includes(index) || stabilized) {
        return;
      }
  
      const delayMs = Math.floor(Math.random() * 45000) + 45000;
      const frozenCasualty = { ...casualty };
  
      timers.current[index] = window.setTimeout(() => {
        (async () => {
          console.log(`[Deterioration Timer Fired] Casualty: ${frozenCasualty.name}`);

          const stored = await window.electronAPI.getItem('casualties');
          const fresh = stored ? JSON.parse(stored) : [];

          const freshCasualty = fresh.find(
            (c: Casualty) =>
              c.name === frozenCasualty.name && c.startTime === frozenCasualty.startTime
          );
          if (!freshCasualty) return;

          const profile = require('../data').default[freshCasualty.injuryKey];
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

          const normalizedRequired = required.flatMap(req => {
            const norm = normalizeInterventionName(req);
            return Array.isArray(norm) ? norm : [norm];
          });

          const normalizedApplied = freshCasualty.interventions.flatMap(
            (i: { name: string; count: number }) => {
              const norm = normalizeInterventionName(i.name);
              return Array.isArray(norm) ? norm : [norm];
            }
          );

          const stabilized = normalizedRequired.every(req => normalizedApplied.includes(req));

          if (!stabilized) {
            freshCasualty.deteriorated = true;
            await window.electronAPI.setItem("casualties", JSON.stringify(fresh));
            onUpdate(fresh);
            onNotify(`${freshCasualty.name} has deteriorated due to lack of treatment.`);
          }
        })();
      }, delayMs);
    });
  }, [casualties, revealedIndexes, phase, onNotify, onUpdate]);
}
