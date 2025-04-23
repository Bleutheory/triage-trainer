// @ts-ignore: allow importing CSS modules
// src/components/casualtyGenerator/casualtyGenerator.ts

import { Casualty, Vitals } from '../../types';
import injuryProfiles from '../../data/injuryProfiles';

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
    usedKeys.clear();
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

  const rawVitals = profile.vitals(state) as Vitals;
  const get = (range: number | [number, number]): number =>
    Array.isArray(range) ? getRandomInRange(range[0], range[1]) : range;

  const vitals = {
    pulse: get(rawVitals.pulse),
    respiratory: get(rawVitals.respiratory),
    bp: Array.isArray(rawVitals.bp)
      ? `${getRandomInRange(rawVitals.bp[0], rawVitals.bp[1])}/${getRandomInRange(40, 60)}`
      : typeof rawVitals.bp === 'number'
        ? `↓ systolic ~${Math.abs(rawVitals.bp)}`
        : rawVitals.bp,
    spo2: get(rawVitals.spo2),
    airway: rawVitals.airway,
    steth: rawVitals.steth
  };

  // Do not compute triage or interventions; let students select
  return {
    name: generateName(),
    injury: profile.description,
    triage: "",
    interventions: [],
    deteriorated: false,
    requiredInterventions: [],
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
    const get = (range: any): any =>
      Array.isArray(range) ? getRandomInRange(range[0], range[1]) : range;

    const vitals = {
      pulse: get(rawVitals.pulse),
      respiratory: get(rawVitals.respiratory),
      bp: Array.isArray(rawVitals.bp)
        ? `${getRandomInRange(rawVitals.bp[0], rawVitals.bp[1])}/${getRandomInRange(40, 60)}`
        : typeof rawVitals.bp === 'number'
          ? `↓ systolic ~${Math.abs(rawVitals.bp)}`
          : rawVitals.bp,
      spo2: get(rawVitals.spo2),
      airway: rawVitals.airway,
      steth: rawVitals.steth
    };

    // Do not compute triage or interventions; let students select
    return {
      name: generateName(),
      injury: profile.description,
      triage: "",
      interventions: [],
      deteriorated: false,
      requiredInterventions: [],
      vitals,
      dynamicVitals: rawVitals,
      startTime: now,
      treatmentTime: null,
      triageTime: null,
      isDemo: false
    };
  });
}