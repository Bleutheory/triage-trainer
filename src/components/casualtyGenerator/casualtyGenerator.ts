// @ts-ignore: allow importing CSS modules

import { Casualty, Vitals } from '../../types'; // Ensure Casualty is correctly defined in '../../types'
import injuryProfiles from '../../data/injuryProfiles'; // Adjust the path to match the actual export location of injury profiles

function getRandomInRange(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

const ranks = ["PVT", "PV2", "PFC", "SPC", "SGT", "1LT", "CPT"];
let usedKeys = new Set();
const lastNames = ["Smith", "Johnson", "Taylor", "White", "Lee", "Martinez", "Stapleton", "Brown"];

export function generateName(): string {
  return `${ranks[Math.floor(Math.random() * ranks.length)]} ${lastNames[Math.floor(Math.random() * lastNames.length)]}`;
}

export function generateCasualty(): Casualty {
  const keys = Object.keys(injuryProfiles).filter(key => !usedKeys.has(key));
  if (keys.length === 0) {
    usedKeys.clear(); // Reset once all keys have been used
    return generateCasualty();
  }
  const randomKey = keys[Math.floor(Math.random() * keys.length)];
  usedKeys.add(randomKey);

  const profile = injuryProfiles[randomKey];
  const state = {
    airway: Math.random() < 0.5,
    bleeding: Math.random() < 0.5,
    pneumo: Math.random() < 0.5,
    ams: Math.random() < 0.5,
    arterial: Math.random() < 0.5
  };

const rawVitals = (typeof profile.vitals === 'function' ? profile.vitals(state) : {}) as Vitals; // Ensure `profile.vitals` is a valid function
const get = (range: number | [number, number]): number => {
  if (Array.isArray(range)) {
    const [min, max] = range;
    return getRandomInRange(min, max);
  }
  return range;
};

  // Removed unused bpSystolic and bpDiastolic variables

  const vitals = {
    pulse: get(rawVitals.pulse),
    respiratory: get(rawVitals.respiratory),
    bp: `${getRandomInRange(Number(rawVitals.bp[0]), Number(rawVitals.bp[1]))}/${getRandomInRange(40, 60)}`,
    spo2: get(rawVitals.spo2),
    airway: rawVitals.airway,
    steth: rawVitals.steth
  };

  return {
    name: generateName(),
    injury: profile.description,
    triage: "",
    interventions: [],
    deteriorated: false,
    requiredInterventions: profile.requiredInterventions || [],
    vitals,
    dynamicVitals: rawVitals,
    startTime: Date.now(),
    treatmentTime: null,
    triageTime: null,
    isDemo: false
  };
}

export function generateUniqueCasualties(count: number): Casualty[] {
  const now = Date.now();
  const keys = Object.keys(injuryProfiles).sort(() => 0.5 - Math.random());
  const selected = keys.slice(0, Math.min(count, keys.length));

  return selected.map(key => {
    const profile = injuryProfiles[key];
    const state = {
      airway: Math.random() < 0.5,
      bleeding: Math.random() < 0.5,
      pneumo: Math.random() < 0.5,
      ams: Math.random() < 0.5,
      arterial: Math.random() < 0.5
    };

    const rawVitals = profile.vitals(state);
    const get = (range: any): any => {
      if (Array.isArray(range[0]) && Array.isArray(range[1])) {
        return [
          getRandomInRange((range[0] as number[])[0], (range[0] as number[])[1]),
          getRandomInRange((range[1] as number[])[0], (range[1] as number[])[1])
        ];
      }
      if (Array.isArray(range)) return getRandomInRange((range as number[])[0], (range as number[])[1]);
      return range;
    };

    const bpSystolic = getRandomInRange(
      Number(rawVitals.bp[0]),
      Number(rawVitals.bp[1])
    );
    const bpDiastolic = getRandomInRange(40, 60);

    const vitals = {
      pulse: get(rawVitals.pulse),
      respiratory: get(rawVitals.respiratory),
      bp: `${bpSystolic}/${bpDiastolic}`,
      spo2: Number(get(rawVitals.spo2)),
      airway: rawVitals.airway,
      steth: rawVitals.steth
    };

    return {
      name: generateName(),
      injury: profile.description,
      triage: "",
      interventions: [],
      deteriorated: false,
      requiredInterventions: profile.requiredInterventions || [],
      vitals,
      dynamicVitals: rawVitals,
      startTime: now,
      treatmentTime: null,
      triageTime: null,
      isDemo: false
    };
  });
}