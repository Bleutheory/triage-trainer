import { InjuryProfile } from '../types';

const ballistic: Record<string, InjuryProfile> = {
  "gsw_abdomen_multiple": {
    description: "Multiple gunshot wounds to the abdomen with signs of internal bleeding",
    internalBleedChance: 0.7,
    triageLogic: function (flags) {
      return flags.bleeding ? "Immediate" : "Delayed";
    },
    vitals: function (flags) {
      return flags.bleeding ? {
        pulse: [130, 145],
        respiratory: [28, 36],
        bp: [65, 85],
        spo2: [85, 90],
        airway: "Airway: Clear",
        steth: "Faint heart tones, hypoactive bowel sounds"
      } : {
        pulse: [95, 105],
        respiratory: [18, 22],
        bp: [110, 125],
        spo2: [96, 99],
        airway: "Airway: Clear",
        steth: "Normal"
      };
    },
    requiredInterventions: ["Direct Pressure", "Emergency Trauma Dressing"],
    getRequiredInterventions: (flags, triage) => {
      return triage === "Immediate" ? ["Direct Pressure", "Emergency Trauma Dressing"] : [];
    }
  },
  "tq_upper_leg_arterial": {
    description: "Gunshot wound to the upper leg with massive bleeding",
    arterialBleedChance: 1,
    triageLogic: function (flags) {
      return flags.arterial ? "Immediate" : "Delayed";
    },
    vitals: function (flags) {
      return flags.arterial ? {
        pulse: [135, 155],
        respiratory: [24, 30],
        bp: [65, 85],
        spo2: [85, 90],
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
    },
    requiredInterventions: ["Tourniquet"],
    getRequiredInterventions: (flags, triage) => {
      return triage === "Immediate" ? ["Tourniquet"] : [];
    }
  },

  "through_and_through_abdomen": {
  description: "Through-and-through abdominal gunshot wound with bowel evisceration",
  internalBleedChance: 0.6,
  triageLogic: function (flags) {
    return flags.bleeding ? "Immediate" : "Delayed";
  },
  vitals: function (flags) {
    return flags.bleeding ? {
      pulse: [130, 145],
      respiratory: [26, 34],
      bp: [70, 90],
      spo2: [85, 90],
      airway: "Airway: Clear",
      steth: "Hypoactive bowel sounds, faint heart tones"
    } : {
      pulse: [95, 105],
      respiratory: [18, 22],
      bp: [110, 125],
      spo2: [95, 98],
      airway: "Airway: Clear",
      steth: "Normal"
    };
  },
  getRequiredInterventions: (flags, triage) => {
    return triage === "Immediate" ? ["Abdominal Emergency Trauma Dressing", "Direct Pressure"] : [];
  },
  deterioration: {
    pulse: 15,
    respiratory: 5,
    bp: -12,
    spo2: -8,
    steth: "Absent bowel sounds, worsening perfusion"
  }
},

  "gsw_chest": {
    description: "Gunshot wound to the chest with difficulty breathing",
    pneumoChance: 0.5,
    triageLogic: function (flags) {
      return flags.pneumo ? "Immediate" : "Delayed";
    },
    vitals: function (flags) {
      return flags.pneumo ? {
        pulse: [130, 145],
        respiratory: [30, 38],
        bp: [80, 95],
        spo2: [75, 88],
        airway: "Airway: Clear",
        steth: "Absent breath sounds on affected side, tracheal deviation"
      } : {
        pulse: [100, 110],
        respiratory: [22, 28],
        bp: [105, 120],
        spo2: [93, 97],
        airway: "Airway: Clear",
        steth: "Diminished breath sounds on affected side"
      };
    },
    requiredInterventions: ["Chest Seal", "Needle Decompression"],
    getRequiredInterventions: (flags, triage) => {
      return triage === "Immediate" ? ["Chest Seal", "Needle Decompression"] : [];
    }
  },
  "gsw_leg": {
    description: "Gunshot wound to the upper leg with heavy bleeding",
    arterialBleedChance: 0.4,
    triageLogic: function (flags) {
      return flags.arterial ? "Immediate" : "Delayed";
    },
    vitals: function (flags) {
      return flags.arterial ? {
        pulse: [130, 150],
        respiratory: [24, 30],
        bp: [70, 90],
        spo2: [85, 93],
        airway: "Airway: Clear",
        steth: "Normal"
      } : {
        pulse: [95, 110],
        respiratory: [18, 22],
        bp: [110, 125],
        spo2: [96, 99],
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
      bp: -12,
      spo2: -6,
      steth: "Muffled heart sounds, fast breathing"
    }
  },
  "gsw_head_critical": {
    description: "Gunshot wound to the head with exposed brain matter and no response to stimuli",
    triageLogic: function () { return "Expectant"; },
    vitals: function () {
      return {
        pulse: [40, 60],
        respiratory: [6, 10],
        bp: [60, 80],
        spo2: [65, 75],
        airway: "Airway: Gurgling, unprotected",
        steth: "Irregular heart sounds, diminished breath sounds"
      };
    },
    getRequiredInterventions: (flags, triage) => {
      // Even expectant cases might require basic comfort measures or palliative care
      return triage === "Expectant" && flags.airway ? ["Basic Airway Management"] : [];
    }
  },
"gsw_neck_airway": {
  description: "Gunshot wound to the neck with gurgling sounds and airway obstruction",
  triageLogic: function () { return "Immediate"; },
  vitals: function () {
    return {
      pulse: [130, 150],
      respiratory: [28, 36],
      bp: [75, 90],
      spo2: [78, 88],
      airway: "Airway: Gurgling, obstructed",
      steth: "Stridor, diminished breath sounds"
    };
  },
  getRequiredInterventions: (flags, triage) => {
    return triage === "Immediate" ? ["Cric"] : [];
  },
  deterioration: {
    pulse: 10,
    respiratory: 6,
    bp: -15,
    spo2: -10,
    steth: "Absent breath sounds, airway collapse"
  }
},
"gsw_arm_grazing": {
  description: "Grazing gunshot wound to the upper arm, superficial bleeding only",
  triageLogic: function () { return "Minimal"; },
  vitals: function () {
    return {
      pulse: [85, 95],
      respiratory: [16, 20],
      bp: [110, 125],
      spo2: [96, 99],
      airway: "Airway: Clear",
      steth: "Normal"
    };
  },
  getRequiredInterventions: (flags, triage) => {
    return [];
  }
},

  "gsw_shoulder_plexus": {
    "description": "Gunshot wound to the shoulder with massive uncontrolled bleeding",
    "requiredInterventions": [
  "Wound Packing"
],
    "arterialBleedChance": 0.5,
    "triageLogic": function (_a) {
            var arterial = _a.arterial;
            return arterial ? "Immediate" : "Delayed";
        },
    "vitals": function (_a) {
            var arterial = _a.arterial;
            return arterial ? {
                pulse: [130, 150],
                respiratory: [22, 30],
                bp: [70, 90],
                spo2: [88, 95],
                airway: "Airway: Clear",
                steth: "Normal"
            } : {
                pulse: [95, 110],
                respiratory: [18, 22],
                bp: [110, 125],
                spo2: [95, 99],
                airway: "Airway: Clear",
                steth: "Normal"
            };
        },
    "deterioration": {
  "pulse": 17,
  "respiratory": 4,
  "bp": -10,
  "spo2": -5,
  "steth": "Worsening perfusion, muffled heart tones"
}
  },
"gsw_arm_venous": {
  description: "Gunshot wound to the arm with steady venous bleeding",
  triageLogic: function () { return "Delayed"; },
  vitals: function () {
    return {
      pulse: [100, 115],
      respiratory: [18, 24],
      bp: [100, 115],
      spo2: [94, 97],
      airway: "Airway: Clear",
      steth: "Normal"
    };
  },
  getRequiredInterventions: (flags, triage) => {
    return triage === "Delayed" ? ["Direct Pressure", "Bandage"] : [];
  }
},

  "junctional_groin_bleed": {
    "description": "Gunshot wound to the groin with arterial bleeding (junctional)",
    "requiredInterventions": [
  "Wound Packing"
],
    "triageLogic": function () { return "Immediate"; },
    "vitals": function () { return ({
            pulse: [130, 150],
            respiratory: [24, 30],
            bp: [70, 90],
            spo2: [85, 92],
            airway: "Airway: Clear",
            steth: "Normal"
        }); },
    "deterioration": {
  "pulse": 20,
  "respiratory": 5,
  "bp": -15,
  "spo2": -8,
  "steth": "Bounding carotid, diminished peripheral pulses"
}
  },
  "junctional_axilla_bleed": {
    "description": "Shrapnel wound to axilla with uncontrolled bleeding",
    "requiredInterventions": [
  "Wound Packing"
],
    "triageLogic": function () { return "Immediate"; },
    "vitals": function () { return ({
            pulse: [125, 145],
            respiratory: [26, 32],
            bp: [65, 85],
            spo2: [82, 90],
            airway: "Airway: Clear",
            steth: "Normal"
        }); },
    "deterioration": {
  "pulse": 18,
  "respiratory": 6,
  "bp": -12,
  "spo2": -6,
  "steth": "Weak radial pulse, fast shallow breathing"
}
  },
"multiple_penetrating_chest_wounds": {
  description: "Multiple penetrating chest wounds with massive hemothorax",
  triageLogic: function () { return "Expectant"; },
  vitals: function () {
    return {
      pulse: [130, 150],
      respiratory: [36, 42],
      bp: [60, 80],
      spo2: [65, 75],
      airway: "Airway: Bubble sounds, gurgling",
      steth: "Absent or wet breath sounds"
    };
  },
  getRequiredInterventions: (flags, triage) => {
    return triage === "Expectant" ? ["Chest Seal", "Needle Decompression"] : [];
  }
},

  "pack_axillary_gsw": {
    "description": "Gunshot wound to the left axilla with junctional bleeding",
    "requiredInterventions": [
  "Wound Packing"
],
    "triageLogic": function () { return "Immediate"; },
    "vitals": function () { return ({
            pulse: [125, 145],
            respiratory: [26, 32],
            bp: [65, 85],
            spo2: [82, 90],
            airway: "Airway: Clear",
            steth: "Normal"
        }); },
    "deterioration": {
  "pulse": 12,
  "respiratory": 4,
  "bp": -10,
  "spo2": -5,
  "steth": "Worsening perfusion signs"
}
  },
  "pack_neck_laceration": {
    "description": "Deep neck laceration with junctional bleeding, no airway involvement",
    "requiredInterventions": [
  "Wound Packing"
],
    "triageLogic": function () { return "Immediate"; },
    "vitals": function () { return ({
            pulse: [120, 140],
            respiratory: [24, 30],
            bp: [70, 90],
            spo2: [88, 94],
            airway: "Airway: Clear",
            steth: "Normal"
        }); },
    "deterioration": {
  "pulse": 18,
  "respiratory": 6,
  "bp": -12,
  "spo2": -7,
  "steth": "Wet gurgling, worsening perfusion signs"
}
  },
  "ndc_single_sided_breathing": {
    "description": "Gunshot wound with diminished breath sounds, cyanosis",
    "requiredInterventions": [
  "Needle Decompression"
],
    "triageLogic": function () { return "Immediate"; },
    "vitals": function () { return ({
            pulse: [125, 140],
            respiratory: [30, 36],
            bp: [70, 90],
            spo2: [78, 88],
            airway: "Airway: Clear",
            steth: "Breath sounds only on one side"
        }); }
  },
  "ndc_right_tension_pneumo": {
    "description": "Right-sided chest trauma, tracheal deviation, respiratory distress",
    "requiredInterventions": [
  "Needle Decompression"
],
    "triageLogic": function () { return "Immediate"; },
    "vitals": function () { return ({
            pulse: [130, 145],
            respiratory: [34, 40],
            bp: [65, 85],
            spo2: [75, 85],
            airway: "Airway: Clear",
            steth: "Absent breath sounds on right side"
        }); }
  },
  "chestseal_sucking_wound": {
    "description": "Gunshot wound to right chest with bubbling air and sucking noise",
    "requiredInterventions": [
  "Chest Seal"
],
    "triageLogic": function () { return "Immediate"; },
    "vitals": function () { return ({
            pulse: [125, 140],
            respiratory: [30, 38],
            bp: [80, 95],
            spo2: [80, 88],
            airway: "Airway: Clear",
            steth: "Gurgling breath sounds on right side"
        }); },
    "deterioration": {
  "pulse": 10,
  "respiratory": 6,
  "bp": -10,
  "spo2": -10,
  "steth": "Absent breath sounds or increased gurgling"
}
  },
  "chestseal_open_chest": {
    "description": "Fragment wound to left chest, open pneumothorax evident",
    "requiredInterventions": [
  "Chest Seal"
],
    "triageLogic": function () { return "Immediate"; },
    "vitals": function () { return ({
            pulse: [120, 135],
            respiratory: [28, 36],
            bp: [85, 100],
            spo2: [82, 90],
            airway: "Airway: Clear",
            steth: "Wet and diminished breath sounds left"
        }); }
  },
  "pelvic_efp_immediate": {
    "description": "Pelvic EFP wound, arterial bleed",
    "requiredInterventions": [
  "Pelvic Binder",
  "Wound Packing"
],
    "triageLogic": function () { return "Immediate"; },
    "vitals": function () { return ({
            pulse: [130, 150],
            respiratory: [26, 32],
            bp: [70, 90],
            spo2: [82, 90],
            airway: "Airway: Clear",
            steth: "Tachycardic heart sounds"
        }); }
  },

  "pelvic_efp_delayed": {
    description: "Pelvic EFP wound, binder on, packed",
    triageLogic: function () { return "Delayed"; },
    vitals: function () {
      return {
        pulse: [100, 115],
        respiratory: [18, 22],
        bp: [105, 120],
        spo2: [93, 96],
        airway: "Airway: Clear",
        steth: "Normal"
      };
    },
    getRequiredInterventions: (flags, triage) => {
      return triage === "Delayed" ? ["Pelvic Binder", "Wound Packing"] : [];
    }
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
  description: "BABT chest contusion, stable",
  triageLogic: function () { return "Delayed"; },
  vitals: function () {
    return {
      pulse: [92, 105],
      respiratory: [18, 22],
      bp: [110, 125],
      spo2: [95, 98],
      airway: "Airway: Clear",
      steth: "Mild crackles"
    };
  },
  getRequiredInterventions: (flags, triage) => {
    return triage === "Delayed" ? ["Observation", "Pain Management"] : [];
  }
}
};

export default ballistic;
