import { InjuryProfile } from '../types';

const burns: Record<string, InjuryProfile> = {
  "burns_face": {
    description: "Burns to the face",
    requiredInterventions: [],
    getRequiredInterventions: function (_a) {
      var airway = _a.airway;
      return airway ? ["Cric"] : [];
    },
    airwayCompromiseChance: 0.4,
    triageLogic: function (_a) {
      var airway = _a.airway;
      return airway ? "Immediate" : "Delayed";
    },
    vitals: function (_a) {
      var airway = _a.airway;
      return airway
        ? {
            pulse: [120, 140],
            respiratory: [28, 36],
            bp: [80, 95],
            spo2: [82, 90],
            airway: "Airway: Soot in oropharynx, stridor present",
            steth: "Stridor, diminished breath sounds",
          }
        : {
            pulse: [90, 110],
            respiratory: [20, 26],
            bp: [110, 130],
            spo2: [92, 96],
            airway: "Airway: Clear",
            steth: "Breath sounds clear",
          };
    }
  },
  "burns_90_percent_tbsa": {
    description: "Full-thickness burns covering 90% of total body surface area",
    triageLogic: function () { return "Expectant"; },
    vitals: function () {
      return {
        pulse: [130, 150],
        respiratory: [28, 34],
        bp: [65, 85],
        spo2: [70, 82],
        airway: "Airway: Clear, soot at nares",
        steth: "Poor breath sounds, faint heart tones"
      };
    },
    getRequiredInterventions: (flags, triage) => {
      return [];
    },
    deterioration: {
      pulse: 12,
      respiratory: 5,
      bp: -15,
      spo2: -10,
      steth: "Weak heart tones, diminished breath sounds"
    }
  },
  "burns_fullbody_critical": {
    description: "Full-thickness burns covering more than 85% of total body surface area",
    triageLogic: function () { return "Expectant"; },
    vitals: function () {
      return {
        pulse: [130, 150],
        respiratory: [28, 34],
        bp: [65, 85],
        spo2: [75, 88],
        airway: "Airway: Clear but dry mucosa, audible distress",
        steth: "Crackles, poor air movement"
      };
    },
    getRequiredInterventions: (flags, triage) => {
      return [];
    },
    deterioration: {
      pulse: 12,
      respiratory: 6,
      bp: -12,
      spo2: -10,
      steth: "Crackles increasing, signs of decompensation"
    }
  },
  "superficial_face_burn": {
    description: "Superficial facial burn with soot at nares, airway clear",
    triageLogic: function () { return "Delayed"; },
    vitals: function () {
      return {
        pulse: [95, 105],
        respiratory: [18, 24],
        bp: [110, 125],
        spo2: [94, 98],
        airway: "Airway: Clear, soot present",
        steth: "Normal breath sounds"
      };
    }
  },
  "burns_hand_only": {
    description: "Partial-thickness burns localized to both hands",
    triageLogic: function () { return "Delayed"; },
    vitals: function () {
      return {
        pulse: [90, 100],
        respiratory: [16, 22],
        bp: [110, 125],
        spo2: [97, 100],
        airway: "Airway: Clear",
        steth: "Normal"
      };
    },
    getRequiredInterventions: (flags, triage) => {
      return [];
    }
  },
  "cric_burn_airway": {
    description: "Facial burns with soot in oropharynx and stridor",
    getRequiredInterventions: (flags, triage) => {
      return triage === "Immediate" ? ["Cric"] : [];
    },
    triageLogic: function () { return "Immediate"; },
    vitals: function () {
      return {
        pulse: [120, 140],
        respiratory: [28, 36],
        bp: [80, 95],
        spo2: [82, 90],
        airway: "Airway: Soot in airway, stridor",
        steth: "Stridor, diminished sounds"
      };
    },
    deterioration: {
      pulse: 8,
      respiratory: 4,
      spo2: -8,
      steth: "Stridor, worsening obstruction"
    }
  },
  "thermobaric_airway_immediate": {
    description: "Thermobaric airway burn, stridor",
    getRequiredInterventions: (flags, triage) => {
      return triage === "Immediate" ? ["CRICKIT"] : [];
    },
    triageLogic: function () { return "Immediate"; },
    vitals: function () {
      return {
        pulse: [120, 140],
        respiratory: [30, 38],
        bp: [80, 95],
        spo2: [78, 86],
        airway: "Airway: Soot, swollen",
        steth: "Inspiratory stridor"
      };
    }
  },
  "thermobaric_airway_delayed": {
    description: "Thermobaric burn, airway monitored",
    triageLogic: function () { return "Delayed"; },
    vitals: function () {
      return {
        pulse: [95, 110],
        respiratory: [18, 22],
        bp: [110, 125],
        spo2: [94, 97],
        airway: "Airway: Clear (no stridor)",
        steth: "Normal breath sounds"
      };
    }
  },
  "high_voltage_electrical_burns": {
    description: "High-voltage electrical burns with deep charring and no spontaneous movement",
    triageLogic: function () { return "Expectant"; },
    vitals: function () {
      return {
        pulse: [40, 60],
        respiratory: [6, 10],
        bp: [60, 80],
        spo2: [60, 75],
        airway: "Airway: Patent but dry and burned",
        steth: "Slow heart sounds, minimal respiratory activity"
      };
    }
  }
};

export default burns;