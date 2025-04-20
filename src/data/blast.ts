import { InjuryProfile } from '../types';

const blast: Record<string, InjuryProfile> = {
  "tq_lower_arm_bleed": {
    "description": "Blast fragment wound to the forearm with arterial spurting",
    "requiredInterventions": [
  "Tourniquet"
],
    "arterialBleedChance": 1,
    "triageLogic": function (_a) {
            var arterial = _a.arterial;
            return arterial ? "Immediate" : "Delayed";
        },
    "vitals": function (_a) {
            var arterial = _a.arterial;
            return arterial ? {
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
    "deterioration": {
  "pulse": 20,
  "respiratory": 6,
  "bp": -15,
  "spo2": -8,
  "steth": "Faint heart tones, rapid shallow breathing"
}
  },
  "tq_amputation_mid_thigh": {
    "description": "Traumatic mid-thigh amputation from explosion, heavy bleeding",
    "requiredInterventions": [
  "Tourniquet"
],
    "triageLogic": function () { return "Immediate"; },
    "vitals": function () { return ({
            pulse: [140, 160],
            respiratory: [26, 34],
            bp: [60, 80],
            spo2: [80, 88],
            airway: "Airway: Clear",
            steth: "Rapid heart tones, shallow breath sounds"
        }); },
    "deterioration": {
  "pulse": 22,
  "respiratory": 6,
  "bp": -18,
  "spo2": -7,
  "steth": "Weak pulses, fast shallow breaths"
}
  },
  "mine_bka_immediate": {
    "description": "Below‑knee amputation, uncontrolled bleed",
    "requiredInterventions": [
  "Tourniquet"
],
    "triageLogic": function () { return "Immediate"; },
    "vitals": function () { return ({
            pulse: [135, 155],
            respiratory: [26, 32],
            bp: [65, 85],
            spo2: [80, 88],
            airway: "Airway: Clear",
            steth: "Rapid heart tones"
        }); },
    "deterioration": {
  "pulse": 24,
  "respiratory": 7,
  "bp": -15,
  "spo2": -8,
  "steth": "Faint heart tones, hypoperfusion signs"
}
  },
  "mine_bka_delayed": {
    "description": "Below‑knee amputation, TQ applied",
    "triageLogic": function () { return "Delayed"; },
    "vitals": function () { return ({
            pulse: [95, 110],
            respiratory: [18, 22],
            bp: [108, 122],
            spo2: [94, 97],
            airway: "Airway: Clear",
            steth: "Normal"
        }); }
  },
  "dcbi_tripleamp_immediate": {
    "description": "DCBI, bilat. legs + 1 arm amps, pelvic fx",
    "requiredInterventions": [
  "Tourniquet",
  "Pelvic Binder"
],
    "triageLogic": function () { return "Immediate"; },
    "vitals": function () { return ({
            pulse: [140, 160],
            respiratory: [28, 36],
            bp: [60, 80],
            spo2: [78, 86],
            airway: "Airway: Clear",
            steth: "Weak heart tones"
        }); },
    "deterioration": {
  "pulse": 25,
  "respiratory": 8,
  "bp": -20,
  "spo2": -10,
  "steth": "Diminished heart tones, weak perfusion"
}
  },
  "dcbi_tripleamp_delayed": {
    "description": "DCBI, all TQs on, pelvic binder placed",
    "triageLogic": function () { return "Delayed"; },
    "vitals": function () { return ({
            pulse: [100, 115],
            respiratory: [20, 24],
            bp: [100, 115],
            spo2: [93, 96],
            airway: "Airway: Clear",
            steth: "Normal"
        }); }
  },
  "cluster_frag_peppering_immediate": {
    "description": "Cluster frag peppering w/ arterial spurter",
    "requiredInterventions": [
  "Tourniquet"
],
    "triageLogic": function () { return "Immediate"; },
    "vitals": function () { return ({
            pulse: [130, 150],
            respiratory: [24, 30],
            bp: [70, 90],
            spo2: [82, 90],
            airway: "Airway: Clear",
            steth: "Normal"
        }); },
    "deterioration": {
  "pulse": 19,
  "respiratory": 6,
  "bp": -12,
  "spo2": -7,
  "steth": "Rapid heart rate, thready pulse"
}
  },
  "cluster_frag_peppering_delayed": {
    "description": "Cluster frag peppering, superficial hits only",
    "triageLogic": function () { return "Delayed"; },
    "vitals": function () { return ({
            pulse: [88, 100],
            respiratory: [16, 20],
            bp: [115, 130],
            spo2: [97, 100],
            airway: "Airway: Clear",
            steth: "Normal"
        }); }
  },
  "drone_frag_headneck_immediate": {
    "description": "Drone frag to head/neck, airway bleed",
    "requiredInterventions": [
  "CRICKIT",
  "Wound Packing"
],
    "triageLogic": function () { return "Immediate"; },
    "vitals": function () { return ({
            pulse: [115, 135],
            respiratory: [26, 32],
            bp: [90, 110],
            spo2: [84, 92],
            airway: "Airway: Obstructed by blood",
            steth: "Stridor & gurgling"
        }); },
    "deterioration": {
  "pulse": 13,
  "respiratory": 6,
  "bp": -10,
  "spo2": -9,
  "steth": "Increased gurgling and stridor, worsening airway compromise"
}
  },
  "drone_frag_headneck_delayed": {
    "description": "Drone frag to head/neck, bleeding controlled",
    "triageLogic": function () { return "Delayed"; },
    "vitals": function () { return ({
            pulse: [90, 105],
            respiratory: [18, 22],
            bp: [110, 125],
            spo2: [95, 98],
            airway: "Airway: Clear, packed",
            steth: "Breath sounds equal"
        }); }
  },
  "blast_injury_combined": {
    "description": "Blast injury with bilateral hearing loss, burns, and soft tissue damage",
    "triageLogic": function () { return "Immediate"; },
    "vitals": function () { return ({
            pulse: [125, 140],
            respiratory: [28, 36],
            bp: [75, 95],
            spo2: [88, 94],
            airway: "Airway: Soot present, partial obstruction",
            steth: "Wheezing, diminished sounds"
        }); }
  },
  "blast_tbi": {
    "description": "Blast injury with confusion and vomiting",
    "amsChance": 0.6,
    "triageLogic": function (_a) {
            var ams = _a.ams;
            return ams ? "Immediate" : "Delayed";
        },
    "vitals": function (_a) {
            var ams = _a.ams;
            return ams ? {
                pulse: [110, 130],
                respiratory: [22, 28],
                bp: [85, 100],
                spo2: [90, 96],
                airway: "Airway: Clear but patient is confused and vomiting",
                steth: "Normal with irregular pulse"
            } : {
                pulse: [85, 100],
                respiratory: [18, 22],
                bp: [100, 115],
                spo2: [95, 99],
                airway: "Airway: Clear, responsive",
                steth: "Normal"
            };
        }
  },
  "blast_primary_hearing_loss": {
    "description": "Exposure to IED blast, bilateral hearing loss and disorientation",
    "triageLogic": function () { return "Delayed"; },
    "vitals": function () { return ({
            pulse: [90, 100],
            respiratory: [16, 22],
            bp: [110, 125],
            spo2: [96, 99],
            airway: "Airway: Clear",
            steth: "Normal"
        }); }
  },
  "blast_concussion_immediate": {
    "description": "Blast concussion, vomiting & AMS",
    "requiredInterventions": [],
    "triageLogic": function () { return "Immediate"; },
    "vitals": function () { return ({
            pulse: [105, 120],
            respiratory: [20, 24],
            bp: [100, 115],
            spo2: [95, 98],
            airway: "Airway: Clear, risk of vomit",
            steth: "Normal"
        }); }
  },
  "blast_concussion_delayed": {
    "description": "Blast concussion, oriented x3",
    "triageLogic": function () { return "Delayed"; },
    "vitals": function () { return ({
            pulse: [80, 95],
            respiratory: [16, 20],
            bp: [115, 130],
            spo2: [97, 100],
            airway: "Airway: Clear",
            steth: "Normal"
        }); }
  },
  "blast_unresponsive": {
    "description": "Unresponsive post-blast, no external trauma visible",
    "triageLogic": function () { return "Expectant"; },
    "vitals": function () { return ({
            pulse: [30, 50],
            respiratory: [6, 10],
            bp: [50, 70],
            spo2: [60, 75],
            airway: "Airway: Irregular",
            steth: "Bradycardia, agonal sounds"
        }); }
  },
  "shrapnel_abdomen": {
    "description": "Shrapnel wound to the abdomen with signs of internal bleeding",
    "internalBleedChance": 0.6,
    "triageLogic": function (_a) {
            var bleeding = _a.bleeding;
            return bleeding ? "Immediate" : "Delayed";
        },
    "vitals": function (_a) {
            var bleeding = _a.bleeding;
            return bleeding ? {
                pulse: [125, 140],
                respiratory: [26, 32],
                bp: [65, 85],
                spo2: [85, 92],
                airway: "Airway: Clear",
                steth: "Decreased bowel sounds, faint heart tones"
            } : {
                pulse: [90, 105],
                respiratory: [18, 22],
                bp: [105, 120],
                spo2: [96, 99],
                airway: "Airway: Clear",
                steth: "Normal"
            };
        }
  },
  "pack_groin_fragment": {
    "description": "Fragment wound to right groin with uncontrolled junctional bleeding",
    "requiredInterventions": [
  "Wound Packing"
],
    "triageLogic": function () { return "Immediate"; },
    "vitals": function () { return ({
            pulse: [130, 150],
            respiratory: [28, 34],
            bp: [60, 80],
            spo2: [80, 88],
            airway: "Airway: Clear",
            steth: "Normal"
        }); },
    "deterioration": {
  "pulse": 20,
  "respiratory": 5,
  "bp": -15,
  "spo2": -8,
  "steth": "Diminished heart sounds, worsening perfusion"
}
  },
  "open_fracture_bleeding": {
    "description": "Open fracture with heavy external bleeding and visible bone",
    "requiredInterventions": [
  "Tourniquet"
],
    "triageLogic": function () { return "Immediate"; },
    "vitals": function () { return ({
            pulse: [130, 145],
            respiratory: [26, 32],
            bp: [70, 90],
            spo2: [85, 92],
            airway: "Airway: Clear",
            steth: "Normal"
        }); },
    "deterioration": {
  "pulse": 18,
  "respiratory": 5,
  "bp": -10,
  "spo2": -6,
  "steth": "Faint heart tones with shallow breaths"
}
  },
  "open_fracture_femur": {
    "description": "Open fracture of femur with bone exposed, bleeding controlled",
    "triageLogic": function () { return "Delayed"; },
    "vitals": function () { return ({
            pulse: [95, 110],
            respiratory: [18, 22],
            bp: [105, 120],
            spo2: [94, 97],
            airway: "Airway: Clear",
            steth: "Normal"
        }); }
  }
};

export default blast;
