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
      const normAppliedList = casualty.interventions.flatMap((i: { name: string }) =>
        Array.isArray(normalizeInterventionName(i.name))
          ? normalizeInterventionName(i.name)
          : [normalizeInterventionName(i.name)]
      );
  
      const stabilized = required.every(req => {
        const normalizedReq = normalizeInterventionName(req);
        const normReqList = Array.isArray(normalizedReq) ? normalizedReq : [normalizedReq];
        return normReqList.some(req => normAppliedList.includes(req));
      });
  
      if (casualty.isDemo || timers.current[index] || !revealedIndexes.includes(index) || stabilized) {
        return;
      }
  
      const delayMs = Math.floor(Math.random() * 45000) + 45000;
      const frozenCasualty = { ...casualty };
  
      timers.current[index] = window.setTimeout(() => {
        console.log(`[Deterioration Timer Fired] Casualty: ${frozenCasualty.name}`);
  
        const stored = localStorage.getItem('casualties');
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
  
        const normAppliedList = freshCasualty.interventions.flatMap((i: { name: string }) =>
          Array.isArray(normalizeInterventionName(i.name))
            ? normalizeInterventionName(i.name)
            : [normalizeInterventionName(i.name)]
        );
  
        const stabilized = required.every(req => {
          const normalizedReq = normalizeInterventionName(req);
          const normReqList = Array.isArray(normalizedReq) ? normalizedReq : [normalizedReq];
          return normReqList.some(req => normAppliedList.includes(req));
        });
  
        if (!stabilized) {
          freshCasualty.deteriorated = true;
          localStorage.setItem("casualties", JSON.stringify(fresh));
          onUpdate(fresh);
          onNotify(`${freshCasualty.name} has deteriorated due to lack of treatment.`);
        }
      }, delayMs);
    });
<<<<<<< HEAD
    }, [casualties, revealedIndexes, phase, onNotify, onUpdate]);
=======
    }, [casualties, revealedIndexes, phase]);
>>>>>>> refs/remotes/origin/main
  }