import { InjuryProfile } from '../types';

const other: Record<string, InjuryProfile> = {
  "decapitation": {
    "description": "Complete traumatic decapitation at the cervical spine",
    "triageLogic": function () { return "Expectant"; },
    "vitals": function () { return ({
            pulse: [0, 0],
            respiratory: [0, 0],
            bp: [0, 0],
            spo2: [0, 0],
            airway: "Airway: Absent",
            steth: "No heart or lung sounds"
        }); }
  },
  "cardiac_arrest_on_arrival": {
    "description": "No pulse or respiration on arrival, pupils fixed and dilated",
    "triageLogic": function () { return "Expectant"; },
    "vitals": function () { return ({
            pulse: [0, 0],
            respiratory: [0, 0],
            bp: [0, 0],
            spo2: [0, 0],
            airway: "Airway: None",
            steth: "Absent"
        }); }
  },
  "minor_lacerations": {
    "description": "Multiple superficial lacerations from shrapnel; ambulatory",
    "triageLogic": function () { return "Minimal"; },
    "vitals": function () { return ({
            pulse: [85, 95],
            respiratory: [16, 20],
            bp: [110, 125],
            spo2: [96, 99],
            airway: "Airway: Clear",
            steth: "Normal"
        }); }
  },
  "orbital_fracture": {
    "description": "Orbital fracture with periorbital ecchymosis and blurred vision",
    "triageLogic": function () { return "Minimal"; },
    "vitals": function () { return ({
            pulse: [85, 100],
            respiratory: [16, 20],
            bp: [115, 125],
            spo2: [97, 100],
            airway: "Airway: Clear",
            steth: "Normal"
        }); }
  },
  "abrasions_and_sprain": {
    "description": "Multiple abrasions and ankle sprain from blast shockwave",
    "triageLogic": function () { return "Minimal"; },
    "vitals": function () { return ({
            pulse: [85, 95],
            respiratory: [16, 20],
            bp: [110, 125],
            spo2: [98, 100],
            airway: "Airway: Clear",
            steth: "Normal"
        }); }
  },
  "head_injury": {
    "description": "Closed head injury from blast",
    "amsChance": 0.3,
    "triageLogic": function (_a) {
            var ams = _a.ams;
            return ams ? "Immediate" : "Delayed";
        },
    "vitals": function (_a) {
            var ams = _a.ams;
            return ams ? {
                pulse: [110, 130],
                respiratory: [18, 24],
                bp: [90, 110],
                spo2: [92, 96],
                airway: "Airway: Clear",
                steth: "Normal"
            } : {
                pulse: [80, 95],
                respiratory: [16, 20],
                bp: [110, 130],
                spo2: [97, 100],
                airway: "Airway: Clear",
                steth: "Normal"
            };
        }
  },
  "pelvic_fracture": {
    "description": "Pelvic injury with signs of internal bleeding",
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
  "bilateral_above_elbow_amputations": {
    "description": "Bilateral above-elbow amputations with profuse bleeding and no distal perfusion",
    "triageLogic": function () { return "Expectant"; },
    "vitals": function () { return ({
            pulse: [140, 160],
            respiratory: [30, 36],
            bp: [50, 70],
            spo2: [70, 85],
            airway: "Airway: Clear",
            steth: "Weak heart sounds, rapid breathing"
        }); }
  },
  "bilateral_leg_amputations": {
    "description": "Bilateral above-knee amputations with signs of hypovolemic shock and altered consciousness",
    "triageLogic": function () { return "Expectant"; },
    "vitals": function () { return ({
            pulse: [140, 160],
            respiratory: [30, 38],
            bp: [50, 70],
            spo2: [70, 85],
            airway: "Airway: Clear",
            steth: "Faint heart sounds, rapid shallow breathing"
        }); }
  }
};

export default other;
