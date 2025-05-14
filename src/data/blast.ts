import { InjuryProfile } from '../types';

const blast: Record<string, InjuryProfile> = {
  "tq_lower_arm_bleed": {
    description: "Blast fragment wound to the forearm with arterial spurting",
    arterialBleedChance: 1,
    triageLogic: function (flags) {
      return flags.arterial ? "Immediate" : "Delayed";
    },
    vitals: function (flags) {
      return flags.arterial ? {
        pulse: [130, 150],
        respiratory: [22, 28],
        bp: [70, 90],
        spo2: [88, 94],
        airway: "Airway: Clear",
        steth: "Normal"
      } : {
        pulse: [95, 105],
        respiratory: [18, 22],
        bp: [110, 125],
        spo2: [95, 98],
        airway: "Airway: Clear",
        steth: "Normal"
      };
    },
    requiredInterventions: [["Tourniquet", "Direct Pressure"]], // Example of static OR
    getRequiredInterventions: (flags, triage) => {
      return triage === "Immediate" ? [["Tourniquet", "Direct Pressure"]] : []; // Tourniquet OR Wound Packing
    },
    deterioration: {
      pulse: 20,
      respiratory: 6,
      bp: -15,
      spo2: -8,
      steth: "Faint heart tones, rapid shallow breathing"
    }
  },
  "tq_amputation_mid_thigh": {
    "description": "Traumatic mid-thigh amputation from explosion, heavy bleeding",
    "triageLogic": function () { return "Immediate"; },
    "vitals": function () { return ({
            pulse: [140, 160],
            respiratory: [26, 34],
            bp: [60, 80],
            spo2: [80, 88],
            airway: "Airway: Clear",
            steth: "Rapid heart tones, shallow breath sounds"
        }); },
    "requiredInterventions": ["Tourniquet"],
    "getRequiredInterventions": (flags, triage) => {
      return triage === "Immediate" ? ["Tourniquet"] : [];
    },
    "deterioration": {
      "pulse": 22,
      "respiratory": 6,
      "bp": -18,
      "spo2": -7,
      "steth": "Weak pulses, fast shallow breaths"
    }
  },
  "mine_bka_immediate": {
    description: "Below‑knee amputation, uncontrolled bleed",
    triageLogic: function () { return "Immediate"; },
    vitals: function () {
      return {
        pulse: [135, 155],
        respiratory: [26, 32],
        bp: [65, 85],
        spo2: [80, 88],
        airway: "Airway: Clear",
        steth: "Rapid heart tones"
      };
    },
    requiredInterventions: ["Tourniquet"],
    getRequiredInterventions: (flags) => {
      return flags?.tourniquet ? [] : ["Tourniquet"];
    },
    deterioration: {
      pulse: 24,
      respiratory: 7,
      bp: -15,
      spo2: -8,
      steth: "Faint heart tones, hypoperfusion signs"
    }
  },
  "mine_bka_delayed": {
    "description": "Below‑knee amputation, Hastey TQ applied",
    "triageLogic": function () { return "Delayed"; },
    "vitals": function () { return ({
            pulse: [95, 110],
            respiratory: [18, 22],
            bp: [108, 122],
            spo2: [94, 97],
            airway: "Airway: Clear",
            steth: "Normal"
        }); },
    getRequiredInterventions: (flags, triage) => {
      return [];
    }
  },
  "dcbi_tripleamp_immediate": {
    description: "DCBI, bilat. legs + 1 arm amps",
    triageLogic: function () { return "Immediate"; },
    vitals: function () {
      return {
        pulse: [140, 160],
        respiratory: [28, 36],
        bp: [60, 80],
        spo2: [78, 86],
        airway: "Airway: Clear",
        steth: "Weak heart tones"
      };
    },
    requiredInterventions: ["Tourniquet", "Pelvic Binder"],
    getRequiredInterventions: (flags, triage) => {
      return triage === "Immediate" ? ["Tourniquet", "Pelvic Binder"] : [];
    },
    deterioration: {
      pulse: 25,
      respiratory: 8,
      bp: -20,
      spo2: -10,
      steth: "Diminished heart tones, weak perfusion"
    }
  },
  "dcbi_tripleamp_delayed": {
    description: "Bilat. leg amputation 2 hastey TQs on, pelvic binder placed",
    triageLogic: function () { return "Delayed"; },
    vitals: function () {
      return {
        pulse: [100, 115],
        respiratory: [20, 24],
        bp: [100, 115],
        spo2: [93, 96],
        airway: "Airway: Clear",
        steth: "Normal"
      };
    },
    getRequiredInterventions: (flags, triage) => {
      // Assuming all required interventions are already applied
      return [];
    }
  },
  
  "cluster_frag_peppering_immediate": {
    description: "Left side frag peppering w/ uncontrolled bleeding from the arm",
    triageLogic: function () { return "Immediate"; },
    vitals: function () {
      return {
        pulse: [130, 150],
        respiratory: [24, 30],
        bp: [70, 90],
        spo2: [82, 90],
        airway: "Airway: Clear",
        steth: "Normal"
      };
    },
    requiredInterventions: ["Tourniquet"],
    getRequiredInterventions: (flags, triage) => {
      return triage === "Immediate" ? ["Tourniquet"] : [];
    },
    deterioration: {
      pulse: 18,
      respiratory: 5,
      bp: -15,
      spo2: -7,
      steth: "Sluggish cap refill, weak heart sounds"
    }
  }
};

export default blast;