import { InjuryProfile } from '../types';

const crush: Record<string, InjuryProfile> = {
  "crush_injury_torso": {
    "description": "Crush injury to torso with poor perfusion and suspected organ damage",
    "triageLogic": function () { return "Expectant"; },
    "vitals": function () { return ({
            pulse: [120, 140],
            respiratory: [30, 40],
            bp: [60, 80],
            spo2: [70, 85],
            airway: "Airway: Shallow, obstructed",
            steth: "Diminished breath and muffled heart sounds"
        }); }
  },
  "crush_syndrome_immediate": {
    "description": "Crush syndrome torso/limb entrapped",
    "requiredInterventions": [
  "Tourniquet",
  "IV Fluid NS"
],
    "triageLogic": function () { return "Immediate"; },
    "vitals": function () { return ({
            pulse: [115, 135],
            respiratory: [24, 30],
            bp: [80, 95],
            spo2: [88, 92],
            airway: "Airway: Clear",
            steth: "Muffled heart sounds"
        }); },
    "deterioration": {
  "pulse": 20,
  "respiratory": 5,
  "bp": -15,
  "spo2": -9,
  "steth": "Muffled heart tones, delayed capillary refill"
}
  },
  "crush_syndrome_delayed": {
    "description": "Crush injury freed, fluids running",
    "triageLogic": function () { return "Delayed"; },
    "vitals": function () { return ({
            pulse: [90, 105],
            respiratory: [18, 22],
            bp: [105, 120],
            spo2: [94, 97],
            airway: "Airway: Clear",
            steth: "Normal"
        }); }
  },
  "pelvic_crush_injury": {
    "description": "Crush injury to pelvis with instability and suspected internal bleeding",
    "requiredInterventions": [
  "Pelvic Binder"
],
    "internalBleedChance": 0.6,
    "triageLogic": function (_a) {
            var bleeding = _a.bleeding;
            return bleeding ? "Immediate" : "Delayed";
        },
    "vitals": function (_a) {
            var bleeding = _a.bleeding;
            return bleeding ? {
                pulse: [120, 140],
                respiratory: [28, 36],
                bp: [70, 90],
                spo2: [85, 93],
                airway: "Airway: Clear",
                steth: "Normal"
            } : {
                pulse: [100, 110],
                respiratory: [18, 22],
                bp: [110, 125],
                spo2: [96, 99],
                airway: "Airway: Clear",
                steth: "Normal"
            };
        }
  },
  "blunt_chest_contusion": {
    "description": "Blunt trauma to chest with visible bruising and pain on inspiration",
    "triageLogic": function () { return "Delayed"; },
    "vitals": function () { return ({
            pulse: [95, 110],
            respiratory: [22, 28],
            bp: [105, 120],
            spo2: [94, 97],
            airway: "Airway: Clear",
            steth: "Decreased breath sounds, no tracheal shift"
        }); }
  },
  "blunt_force_head_trauma_unresponsive": {
    "description": "Blunt force trauma to head, unresponsive with decerebrate posturing",
    "triageLogic": function () { return "Expectant"; },
    "vitals": function () { return ({
            pulse: [40, 60],
            respiratory: [6, 10],
            bp: [60, 80],
            spo2: [55, 70],
            airway: "Airway: Irregular",
            steth: "Bradycardia, agonal sounds"
        }); }
  },
  "babt_chest_immediate": {
    "description": "BABT chest contusion w/ resp distress",
    "requiredInterventions": [
  "Needle Decompression Kit (14 GA x 3.25 IN)"
],
    "triageLogic": function () { return "Immediate"; },
    "vitals": function () { return ({
            pulse: [120, 135],
            respiratory: [30, 38],
            bp: [85, 95],
            spo2: [82, 90],
            airway: "Airway: Clear",
            steth: "Diminished left, hyperresonant"
        }); }
  },
  "babt_chest_delayed": {
    "description": "BABT chest contusion, stable",
    "triageLogic": function () { return "Delayed"; },
    "vitals": function () { return ({
            pulse: [92, 105],
            respiratory: [18, 22],
            bp: [110, 125],
            spo2: [95, 98],
            airway: "Airway: Clear",
            steth: "Mild crackles"
        }); }
  },
  "multiple_systems_failure": {
    "description": "Polytrauma with bilateral long bone fractures, abdominal bleeding, and decreased LOC",
    "triageLogic": function () { return "Expectant"; },
    "vitals": function () { return ({
            pulse: [130, 160],
            respiratory: [28, 36],
            bp: [60, 80],
            spo2: [70, 85],
            airway: "Airway: Shallow",
            steth: "Poor breath sounds, faint heart tones"
        }); }
  },
  "crushed_skull": {
    "description": "Crushed skull with exposed brain matter and agonal respirations",
    "triageLogic": function () { return "Expectant"; },
    "vitals": function () { return ({
            pulse: [30, 50],
            respiratory: [4, 8],
            bp: [40, 60],
            spo2: [50, 65],
            airway: "Airway: Gurgling, obstructed",
            steth: "Irregular heart sounds, diminished breath sounds"
        }); },
    "deterioration": {
  "pulse": -10,
  "respiratory": -4,
  "bp": -15,
  "spo2": -15,
  "steth": "Irregular rhythm, fading heart tones"
}
  }
};

export default crush;
