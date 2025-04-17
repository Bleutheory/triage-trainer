

import injuryProfiles from '../data/injuryProfiles';

function getRandomInRange(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

const ranks = ["PVT", "PV2", "PFC", "SPC", "SGT", "1LT", "CPT"];
let usedKeys = new Set();
const lastNames = ["Smith", "Johnson", "Taylor", "White", "Lee", "Martinez", "Brown"];

export function generateName() {
  return `${ranks[Math.floor(Math.random() * ranks.length)]} ${lastNames[Math.floor(Math.random() * lastNames.length)]}`;
}

export function generateCasualty() {
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

  const rawVitals = profile.vitals(state);
  const get = (range) => {
    if (Array.isArray(range[0])) return [getRandomInRange(range[0][0], range[0][1]), getRandomInRange(range[1][0], range[1][1])];
    if (Array.isArray(range)) return getRandomInRange(range[0], range[1]);
    return range;
  };

  const bpSystolic = getRandomInRange(rawVitals.bp[0], rawVitals.bp[1]);
  const bpDiastolic = getRandomInRange(40, 60);

  const vitals = {
    pulse: get(rawVitals.pulse),
    respiratory: get(rawVitals.respiratory),
    bp: `${bpSystolic}/${bpDiastolic}`,
    spo2: `${get(rawVitals.spo2)}%`,
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

export function generateUniqueCasualties(count) {
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
    const get = (range) => {
      if (Array.isArray(range[0])) return [getRandomInRange(range[0][0], range[0][1]), getRandomInRange(range[1][0], range[1][1])];
      if (Array.isArray(range)) return getRandomInRange(range[0], range[1]);
      return range;
    };

    const bpSystolic = getRandomInRange(rawVitals.bp[0], rawVitals.bp[1]);
    const bpDiastolic = getRandomInRange(40, 60);

    const vitals = {
      pulse: get(rawVitals.pulse),
      respiratory: get(rawVitals.respiratory),
      bp: `${bpSystolic}/${bpDiastolic}`,
      spo2: `${get(rawVitals.spo2)}%`,
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