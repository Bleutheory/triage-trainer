// @ts-ignore: allow importing CSS modules
// src/components/casualtyGenerator/casualtyGenerator.ts
import { v4 as uuid } from 'uuid';
import { Casualty, Vitals } from '../../types';
import injuryProfiles from '../../data/injuryProfiles';

function getRandomInRange(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

const ranks = ["PVT", "PV2", "PFC", "SPC", "SGT", "1LT", "CPT", "SSG", "SFC", "2LT"];
const getUsedKeys = async (): Promise<Set<string>> => {
  const raw = await window.electronAPI.getItem('usedInjuryKeys');
  return new Set(raw ? JSON.parse(raw) : []);
};

const addUsedKey = async (key: string) => {
  const used = await getUsedKeys();
  used.add(key);
  await window.electronAPI.setItem('usedInjuryKeys', JSON.stringify([...used]));
};

const resetUsedKeys = async () => {
  await window.electronAPI.setItem('usedInjuryKeys', null);
};
const lastNames = ["Smith", "Johnson", "Taylor", "White", "Lee", "Martinez", "Stapleton", "Brown", "Meese", "Jones", "Garcia", "Miller", "Davis", "Rodriguez", "Wilson", "Anderson", "Thomas", "Hernandez", "Moore", "Martin"];

export function generateName(): string {
  return `${ranks[Math.floor(Math.random() * ranks.length)]} ${lastNames[Math.floor(Math.random() * lastNames.length)]}`;
}


export async function generateCasualty(): Promise<Casualty> {
  let usedKeys = await getUsedKeys();
  const keys = Object.keys(injuryProfiles).filter(key => !usedKeys.has(key));
  if (keys.length === 0) {
    await resetUsedKeys();
    usedKeys = new Set();
    return await generateCasualty();
  }
  const randomKey = keys[Math.floor(Math.random() * keys.length)];
  await addUsedKey(randomKey);

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

  // Determine triage and interventions dynamically
  const triage = profile.triageLogic(state);
  const requiredInterventions = profile.getRequiredInterventions
    ? profile.getRequiredInterventions(state, triage)
    : profile.requiredInterventions || [];

  return {
    id: uuid(),
    name: generateName(),
    injury: profile.description,
    injuryKey: randomKey,
    triage: "",
    interventions: [],
    deteriorated: false,
    requiredInterventions: requiredInterventions,
    vitals,
    dynamicVitals: rawVitals,
    startTime: Date.now(),
    treatmentTime: null,
    triageTime: null,
    isDemo: false
  };
}

export async function generateUniqueCasualties(count: number): Promise<Casualty[]> {
  const usedRaw = await window.electronAPI.getItem('usedInjuryKeys');
  const used = new Set<string>(usedRaw ? JSON.parse(usedRaw) : []);

  const now = Date.now();
  const keys = Object.keys(injuryProfiles)
    .filter(k => !used.has(k))
    .sort(() => 0.5 - Math.random());

  const selected = keys.slice(0, Math.min(count, keys.length));
  for (const key of selected) {
    used.add(key);
  }
  await window.electronAPI.setItem('usedInjuryKeys', JSON.stringify([...used]));

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

    const triage = profile.triageLogic(state);
    const requiredInterventions = profile.getRequiredInterventions
      ? profile.getRequiredInterventions(state, triage)
      : profile.requiredInterventions || [];

    return {
      id: uuid(),
      name: generateName(),
      injury: profile.description,
      injuryKey: key,
      triage: "",
      interventions: [],
      deteriorated: false,
      requiredInterventions,
      vitals,
      dynamicVitals: rawVitals,
      startTime: now,
      treatmentTime: null,
      triageTime: null,
      isDemo: false
    };
  });
}