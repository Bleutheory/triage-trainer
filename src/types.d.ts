// src/types.d.ts

export interface Intervention {
  name: string;
  count: number;
}

export interface Vitals {
  pulse: number | [number, number];
  respiratory: number | [number, number];
  bp: string | number | [number, number];
  spo2: number | [number, number];
  airway: string;
  steth: string;
}

export interface InjuryProfile {
  description: string;
  triageLogic: (flags: Record<string, boolean>) => string;
  vitals: (flags: Record<string, boolean>) => Vitals;
  deterioration?: Partial<Vitals> & { steth?: string };
  airwayCompromiseChance?: number;
  internalBleedChance?: number;
  pneumoChance?: number;
  arterialBleedChance?: number;
  amsChance?: number;

  /** Static fallback if dynamic not defined */
  requiredInterventions?: string[];

  /** Optional dynamic generator: gets priority over static if defined */
  getRequiredInterventions?: (flags: Record<string, boolean>, triage: string) => string[];
}

export interface Casualty {
  id: string;   
  name: string;
  injuryKey: string;
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

// Allow importing these JS modules without type declarations
declare module '../components/casualtyGenerator/casualtyGenerator' {
  import { Casualty } from './types';
  export function generateCasualty(): Casualty;
  export function generateUniqueCasualties(count: number): Casualty[];
}

declare module '../components/ScenarioBrief/ScenarioBrief';