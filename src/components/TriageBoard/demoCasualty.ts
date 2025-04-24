import { Casualty } from '../../types';

export const janeDoe: Casualty = {
  name: 'SPC Jane Doe (Demo)',
  injuryKey: 'demo_amputation',
  injury: 'Traumatic left leg amputation with severe arterial bleeding',
  triage: '',
  interventions: [],
  deteriorated: false,
  requiredInterventions: [],
  vitals: {
    pulse: 0,
    respiratory: 0,
    bp: '0/0',
    spo2: 0,
    airway: '',
    steth: '',
  },
  dynamicVitals: {
    pulse: 0,
    respiratory: 0,
    bp: '0/0',
    spo2: 0,
    airway: '',
    steth: '',
  },
  startTime: Date.now(),
  treatmentTime: null,
  triageTime: null,
  isDemo: true,
};