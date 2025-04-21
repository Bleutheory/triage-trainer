
// src/types.d.ts

export interface Intervention {
  name: string;
  count: number;
}

export interface Vitals {
  pulse: number | [number, number];
  respiratory: number | [number, number];
  bp: string | [number, number];
  spo2: number | [number, number];
  airway: string;
  steth: string;
}

export interface InjuryProfile {
  description: string;
  requiredInterventions?: string[];
  triageLogic: (state: Record<string, boolean>) => string;
  vitals: (state: Record<string, boolean>) => Vitals;
  deterioration?: Partial<Record<keyof Vitals, number | string>>;
  arterialBleedChance?: number;
  internalBleedChance?: number;
  pneumoChance?: number;
  airwayCompromiseChance?: number;
  amsChance?: number;
}

export interface Casualty {
  name: string;
  injury: string;
  triage: string;
  interventions: Intervention[];
  deteriorated: boolean;
  requiredInterventions: string[];
  vitals: Vitals;
  dynamicVitals?: ReturnType<InjuryProfile["vitals"]>;
  startTime: number;
  treatmentTime: number | null;
  triageTime: number | null;
  isDemo: boolean;
}

// Allow CSS imports without type errors
declare module '*.css';
declare module '*.module.css';
