import { InjuryProfile } from '../types';

const environmental: Record<string, InjuryProfile> = {
  "frostbite_handsfeet_immediate": {
    "description": "Frostbite hands/feet, deep, no pulses",
    "requiredInterventions": [],
    "triageLogic": function () { return "Immediate"; },
    "vitals": function () { return ({
            pulse: [90, 100],
            respiratory: [18, 22],
            bp: [110, 125],
            spo2: [96, 99],
            airway: "Airway: Clear",
            steth: "Normal"
        }); }
  },
  "frostbite_handsfeet_delayed": {
    "description": "Frostbite hands/feet, superficial",
    "triageLogic": function () { return "Delayed"; },
    "vitals": function () { return ({
            pulse: [80, 90],
            respiratory: [16, 20],
            bp: [115, 130],
            spo2: [97, 100],
            airway: "Airway: Clear",
            steth: "Normal"
        }); }
  }
};

export default environmental;
