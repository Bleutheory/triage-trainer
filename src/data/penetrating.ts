import { InjuryProfile } from '../types';

const penetrating: Record<string, InjuryProfile> = {
  "abdominal_stab_peritonitis": {
    "description": "Stab wound to abdomen with abdomin is distended and rigid",
    "triageLogic": function () { return "Immediate"; },
    "vitals": function () { return ({
            pulse: [115, 135],
            respiratory: [24, 30],
            bp: [70, 90],
            spo2: [85, 93],
            airway: "Airway: Clear",
            steth: "Hypoactive bowel sounds"
        }); }
  },
  "massive_abdominal_evisceration": {
    "description": "Massive abdominal evisceration with uncontrolled hemorrhage",
    "triageLogic": function () { return "Expectant"; },
    "vitals": function () { return ({
            pulse: [140, 160],
            respiratory: [34, 44],
            bp: [60, 80],
            spo2: [65, 75],
            airway: "Airway: Shallow, labored",
            steth: "Hypoactive bowel sounds, faint heart tones"
        }); }
  }
};

export default penetrating;
