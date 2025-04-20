"use strict";
exports.__esModule = true;
exports.injuryProfiles = exports.getCauseForKey = exports.injuryKeysByCause = void 0;
/* ------------------------------------------------------------
   Reorganized helpers and categories
   ------------------------------------------------------------ */
exports.injuryKeysByCause = {
    ballistic: [
        "gsw_abdomen_multiple", "tq_upper_leg_arterial", "gsw_chest", "gsw_leg",
        "gsw_head_critical", "gsw_neck_airway", "gsw_shoulder_plexus", "gsw_arm_venous",
        "junctional_groin_bleed", "junctional_axilla_bleed",
        "multiple_penetrating_chest_wounds", "pack_axillary_gsw", "pack_neck_laceration",
        "ndc_single_sided_breathing", "ndc_right_tension_pneumo",
        "chestseal_sucking_wound", "chestseal_open_chest",
        "pelvic_efp_immediate", "pelvic_efp_delayed",
        "babt_chest_immediate", "babt_chest_delayed"
    ],
    blast: [
        "tq_lower_arm_bleed", "tq_amputation_mid_thigh",
        "mine_bka_immediate", "mine_bka_delayed",
        "dcbi_tripleamp_immediate", "dcbi_tripleamp_delayed",
        "cluster_frag_peppering_immediate", "cluster_frag_peppering_delayed",
        "drone_frag_headneck_immediate", "drone_frag_headneck_delayed",
        "blast_injury_combined", "blast_tbi", "blast_primary_hearing_loss",
        "blast_concussion_immediate", "blast_concussion_delayed", "blast_unresponsive",
        "shrapnel_abdomen", "pack_groin_fragment",
        "open_fracture_bleeding", "open_fracture_femur"
    ],
    burns: [
        "burns_face", "burns_90_percent_tbsa", "burns_fullbody_critical",
        "superficial_face_burn", "burns_hand_only",
        "cric_burn_airway", "thermobaric_airway_immediate",
        "thermobaric_airway_delayed", "high_voltage_electrical_burns"
    ],
    crush: [
        "crush_injury_torso", "crush_syndrome_immediate", "crush_syndrome_delayed",
        "pelvic_crush_injury", "blunt_chest_contusion",
        "blunt_force_head_trauma_unresponsive",
        "babt_chest_immediate", "babt_chest_delayed",
        "multiple_systems_failure", "crushed_skull"
    ],
    environmental: [
        "frostbite_handsfeet_immediate", "frostbite_handsfeet_delayed"
    ],
    penetrating: [
        "abdominal_stab_peritonitis", "massive_abdominal_evisceration"
    ],
    other: [
        "decapitation", "cardiac_arrest_on_arrival", "minor_lacerations",
        "orbital_fracture", "abrasions_and_sprain", "head_injury", "pelvic_fracture",
        "bilateral_above_elbow_amputations", "bilateral_leg_amputations"
    ]
};
function getCauseForKey(key) {
    for (var _i = 0, _a = Object.entries(exports.injuryKeysByCause); _i < _a.length; _i++) {
        var _b = _a[_i], cause = _b[0], list = _b[1];
        if (list.includes(key))
            return cause;
    }
    return "other";
}
exports.getCauseForKey = getCauseForKey;
/* ---------------------------------------------------------- */
exports.injuryProfiles = {
    "decapitation": {
        description: "Complete traumatic decapitation at the cervical spine",
        triageLogic: function () { return "Expectant"; },
        vitals: function () { return ({
            pulse: [0, 0],
            respiratory: [0, 0],
            bp: [0, 0],
            spo2: [0, 0],
            airway: "Airway: Absent",
            steth: "No heart or lung sounds"
        }); }
    },
    "gsw_abdomen_multiple": {
        description: "Multiple gunshot wounds to the abdomen with signs of internal bleeding",
        internalBleedChance: 0.7,
        triageLogic: function (_a) {
            var bleeding = _a.bleeding;
            return bleeding ? "Immediate" : "Delayed";
        },
        vitals: function (_a) {
            var bleeding = _a.bleeding;
            return bleeding ? {
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
        }
    },
    "amputation_hand": {
        description: "Traumatic amputation of the right hand with bleeding controlled by improvised tourniquet",
        triageLogic: function () { return "Delayed"; },
        vitals: function () { return ({
            pulse: [100, 115],
            respiratory: [20, 26],
            bp: [100, 115],
            spo2: [94, 98],
            airway: "Airway: Clear",
            steth: "Normal"
        }); }
    },
    "facial_laceration_bleeding": {
        description: "Severe facial laceration with bleeding near the airway",
        airwayCompromiseChance: 0.3,
        triageLogic: function (_a) {
            var airway = _a.airway;
            return airway ? "Immediate" : "Delayed";
        },
        vitals: function (_a) {
            var airway = _a.airway;
            return airway ? {
                pulse: [120, 135],
                respiratory: [28, 34],
                bp: [85, 100],
                spo2: [80, 90],
                airway: "Airway: Obstructed by blood",
                steth: "Stridor, gurgling breath sounds"
            } : {
                pulse: [95, 105],
                respiratory: [18, 22],
                bp: [110, 125],
                spo2: [95, 98],
                airway: "Airway: Partially clear",
                steth: "Breath sounds wet but present"
            };
        }
    },
    "tq_upper_leg_arterial": {
        description: "Gunshot wound to the upper leg with pulsatile arterial bleeding",
        requiredInterventions: ["Tourniquet"],
        arterialBleedChance: 1.0,
        triageLogic: function (_a) {
            var arterial = _a.arterial;
            return arterial ? "Immediate" : "Delayed";
        },
        vitals: function (_a) {
            var arterial = _a.arterial;
            return arterial ? {
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
        }
    },
    "tq_lower_arm_bleed": {
        description: "Blast fragment wound to the forearm with arterial spurting",
        requiredInterventions: ["Tourniquet"],
        arterialBleedChance: 1.0,
        triageLogic: function (_a) {
            var arterial = _a.arterial;
            return arterial ? "Immediate" : "Delayed";
        },
        vitals: function (_a) {
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
        deterioration: {
            pulse: +20,
            respiratory: +6,
            bp: -15,
            spo2: -8,
            steth: "Faint heart tones, rapid shallow breathing"
        }
    },
    "tq_amputation_mid_thigh": {
        description: "Traumatic mid-thigh amputation from explosion, heavy bleeding",
        requiredInterventions: ["Tourniquet"],
        triageLogic: function () { return "Immediate"; },
        vitals: function () { return ({
            pulse: [140, 160],
            respiratory: [26, 34],
            bp: [60, 80],
            spo2: [80, 88],
            airway: "Airway: Clear",
            steth: "Rapid heart tones, shallow breath sounds"
        }); },
        deterioration: {
            pulse: +22,
            respiratory: +6,
            bp: -18,
            spo2: -7,
            steth: "Weak pulses, fast shallow breaths"
        }
    },
    "pack_axillary_gsw": {
        description: "Gunshot wound to the left axilla with junctional bleeding",
        requiredInterventions: ["Wound Packing"],
        triageLogic: function () { return "Immediate"; },
        vitals: function () { return ({
            pulse: [125, 145],
            respiratory: [26, 32],
            bp: [65, 85],
            spo2: [82, 90],
            airway: "Airway: Clear",
            steth: "Normal"
        }); },
        deterioration: {
            pulse: +12,
            respiratory: +4,
            bp: -10,
            spo2: -5,
            steth: "Worsening perfusion signs"
        }
    },
    "pack_groin_fragment": {
        description: "Fragment wound to right groin with uncontrolled junctional bleeding",
        requiredInterventions: ["Wound Packing"],
        triageLogic: function () { return "Immediate"; },
        vitals: function () { return ({
            pulse: [130, 150],
            respiratory: [28, 34],
            bp: [60, 80],
            spo2: [80, 88],
            airway: "Airway: Clear",
            steth: "Normal"
        }); },
        deterioration: {
            pulse: +20,
            respiratory: +5,
            bp: -15,
            spo2: -8,
            steth: "Diminished heart sounds, worsening perfusion"
        }
    },
    "pack_neck_laceration": {
        description: "Deep neck laceration with junctional bleeding, no airway involvement",
        requiredInterventions: ["Wound Packing"],
        triageLogic: function () { return "Immediate"; },
        vitals: function () { return ({
            pulse: [120, 140],
            respiratory: [24, 30],
            bp: [70, 90],
            spo2: [88, 94],
            airway: "Airway: Clear",
            steth: "Normal"
        }); },
        deterioration: {
            pulse: +18,
            respiratory: +6,
            bp: -12,
            spo2: -7,
            steth: "Wet gurgling, worsening perfusion signs"
        }
    },
    "chestseal_sucking_wound": {
        description: "Gunshot wound to right chest with bubbling air and sucking noise",
        requiredInterventions: ["Chest Seal"],
        triageLogic: function () { return "Immediate"; },
        vitals: function () { return ({
            pulse: [125, 140],
            respiratory: [30, 38],
            bp: [80, 95],
            spo2: [80, 88],
            airway: "Airway: Clear",
            steth: "Gurgling breath sounds on right side"
        }); },
        deterioration: {
            pulse: +10,
            respiratory: +6,
            bp: -10,
            spo2: -10,
            steth: "Absent breath sounds or increased gurgling"
        }
    },
    "chestseal_open_chest": {
        description: "Fragment wound to left chest, open pneumothorax evident",
        requiredInterventions: ["Chest Seal"],
        triageLogic: function () { return "Immediate"; },
        vitals: function () { return ({
            pulse: [120, 135],
            respiratory: [28, 36],
            bp: [85, 100],
            spo2: [82, 90],
            airway: "Airway: Clear",
            steth: "Wet and diminished breath sounds left"
        }); }
    },
    "chestseal_knife_puncture": {
        description: "Shrapnel puncture to anterior chest with decreased breath sounds",
        requiredInterventions: ["Chest Seal"],
        triageLogic: function () { return "Immediate"; },
        vitals: function () { return ({
            pulse: [110, 125],
            respiratory: [28, 34],
            bp: [85, 100],
            spo2: [85, 92],
            airway: "Airway: Clear",
            steth: "Sluggish breath sounds on affected side"
        }); }
    },
    "ndc_bilateral_decomp": {
        description: "Progressive respiratory distress from bilateral tension pneumothorax",
        requiredInterventions: ["Needle Decompression"],
        triageLogic: function () { return "Immediate"; },
        vitals: function () { return ({
            pulse: [135, 155],
            respiratory: [36, 44],
            bp: [60, 80],
            spo2: [70, 80],
            airway: "Airway: Clear",
            steth: "Absent breath sounds bilaterally"
        }); }
    },
    "ndc_right_tension_pneumo": {
        description: "Right-sided chest trauma, tracheal deviation, respiratory distress",
        requiredInterventions: ["Needle Decompression"],
        triageLogic: function () { return "Immediate"; },
        vitals: function () { return ({
            pulse: [130, 145],
            respiratory: [34, 40],
            bp: [65, 85],
            spo2: [75, 85],
            airway: "Airway: Clear",
            steth: "Absent breath sounds on right side"
        }); }
    },
    "ndc_single_sided_breathing": {
        description: "Gunshot wound with diminished breath sounds, cyanosis",
        requiredInterventions: ["Needle Decompression"],
        triageLogic: function () { return "Immediate"; },
        vitals: function () { return ({
            pulse: [125, 140],
            respiratory: [30, 36],
            bp: [70, 90],
            spo2: [78, 88],
            airway: "Airway: Clear",
            steth: "Breath sounds only on one side"
        }); }
    },
    "cric_burn_airway": {
        description: "Facial burns with soot in oropharynx and stridor",
        requiredInterventions: ["Cric"],
        triageLogic: function () { return "Immediate"; },
        vitals: function () { return ({
            pulse: [120, 140],
            respiratory: [28, 36],
            bp: [80, 95],
            spo2: [82, 90],
            airway: "Airway: Soot in airway, stridor",
            steth: "Stridor, diminished sounds"
        }); },
        deterioration: {
            pulse: +8,
            respiratory: +4,
            spo2: -8,
            steth: "Stridor, worsening obstruction"
        }
    },
    "cric_gsw_neck": {
        description: "Gunshot wound to neck with gurgling and obstructed airway",
        requiredInterventions: ["Cric"],
        triageLogic: function () { return "Immediate"; },
        vitals: function () { return ({
            pulse: [125, 140],
            respiratory: [32, 40],
            bp: [70, 85],
            spo2: [75, 88],
            airway: "Airway: Bubbling, obstructed",
            steth: "Absent breath sounds, stridor"
        }); },
        deterioration: {
            pulse: +12,
            respiratory: +6,
            bp: -10,
            spo2: -10,
            steth: "Stridor, gurgling, worsening airway sounds"
        }
    },
    "cric_smoke_inhalation": {
        description: "Smoke inhalation ",
        requiredInterventions: ["Cric"],
        airwayCompromiseChance: 1.0,
        triageLogic: function (_a) {
            var airway = _a.airway;
            return airway ? "Immediate" : "Delayed";
        },
        vitals: function (_a) {
            var airway = _a.airway;
            return airway ? {
                pulse: [120, 135],
                respiratory: [28, 34],
                bp: [85, 100],
                spo2: [82, 90],
                airway: "Airway: Obstructed with carbonaceous sputum",
                steth: "Gurgling, wet breath sounds"
            } : {
                pulse: [95, 105],
                respiratory: [18, 22],
                bp: [110, 125],
                spo2: [94, 98],
                airway: "Airway: Clear",
                steth: "Normal"
            };
        },
        deterioration: {
            pulse: +10,
            respiratory: +7,
            bp: -12,
            spo2: -10,
            steth: "Wet breath sounds, worsening airway compromise"
        }
    },
    "crushed_skull": {
        description: "Crushed skull with exposed brain matter and agonal respirations",
        triageLogic: function () { return "Expectant"; },
        vitals: function () { return ({
            pulse: [30, 50],
            respiratory: [4, 8],
            bp: [40, 60],
            spo2: [50, 65],
            airway: "Airway: Gurgling, obstructed",
            steth: "Irregular heart sounds, diminished breath sounds"
        }); },
        deterioration: {
            pulse: -10,
            respiratory: -4,
            bp: -15,
            spo2: -15,
            steth: "Irregular rhythm, fading heart tones"
        }
    },
    "cardiac_arrest_on_arrival": {
        description: "No pulse or respiration on arrival, pupils fixed and dilated",
        triageLogic: function () { return "Expectant"; },
        vitals: function () { return ({
            pulse: [0, 0],
            respiratory: [0, 0],
            bp: [0, 0],
            spo2: [0, 0],
            airway: "Airway: None",
            steth: "Absent"
        }); }
    },
    "massive_abdominal_evisceration": {
        description: "Massive abdominal evisceration with uncontrolled hemorrhage",
        triageLogic: function () { return "Expectant"; },
        vitals: function () { return ({
            pulse: [140, 160],
            respiratory: [34, 44],
            bp: [60, 80],
            spo2: [65, 75],
            airway: "Airway: Shallow, labored",
            steth: "Hypoactive bowel sounds, faint heart tones"
        }); }
    },
    "high_voltage_electrical_burns": {
        description: "High-voltage electrical burns with deep charring and no spontaneous movement",
        triageLogic: function () { return "Expectant"; },
        vitals: function () { return ({
            pulse: [40, 60],
            respiratory: [6, 10],
            bp: [60, 80],
            spo2: [60, 75],
            airway: "Airway: Patent but dry and burned",
            steth: "Slow heart sounds, minimal respiratory activity"
        }); }
    },
    "burns_90_percent_tbsa": {
        description: "Full-thickness burns covering 90% of total body surface area",
        triageLogic: function () { return "Expectant"; },
        vitals: function () { return ({
            pulse: [130, 150],
            respiratory: [28, 34],
            bp: [65, 85],
            spo2: [70, 82],
            airway: "Airway: Clear, soot at nares",
            steth: "Poor breath sounds, faint heart tones"
        }); },
        deterioration: {
            pulse: +12,
            respiratory: +5,
            bp: -15,
            spo2: -10,
            steth: "Weak heart tones, diminished breath sounds"
        }
    },
    "bilateral_above_elbow_amputations": {
        description: "Bilateral above-elbow amputations with profuse bleeding and no distal perfusion",
        triageLogic: function () { return "Expectant"; },
        vitals: function () { return ({
            pulse: [140, 160],
            respiratory: [30, 36],
            bp: [50, 70],
            spo2: [70, 85],
            airway: "Airway: Clear",
            steth: "Weak heart sounds, rapid breathing"
        }); }
    },
    "multiple_penetrating_chest_wounds": {
        description: "Multiple penetrating chest wounds with massive hemothorax",
        requiredInterventions: ["Chest Seal", "Needle Decompression"],
        triageLogic: function () { return "Expectant"; },
        vitals: function () { return ({
            pulse: [130, 150],
            respiratory: [36, 42],
            bp: [60, 80],
            spo2: [65, 75],
            airway: "Airway: Bubble sounds, gurgling",
            steth: "Absent or wet breath sounds"
        }); }
    },
    "blunt_force_head_trauma_unresponsive": {
        description: "Blunt force trauma to head, unresponsive with decerebrate posturing",
        triageLogic: function () { return "Expectant"; },
        vitals: function () { return ({
            pulse: [40, 60],
            respiratory: [6, 10],
            bp: [60, 80],
            spo2: [55, 70],
            airway: "Airway: Irregular",
            steth: "Bradycardia, agonal sounds"
        }); }
    },
    "multiple_systems_failure": {
        description: "Polytrauma with bilateral long bone fractures, abdominal bleeding, and decreased LOC",
        triageLogic: function () { return "Expectant"; },
        vitals: function () { return ({
            pulse: [130, 160],
            respiratory: [28, 36],
            bp: [60, 80],
            spo2: [70, 85],
            airway: "Airway: Shallow",
            steth: "Poor breath sounds, faint heart tones"
        }); }
    },
    "burns_face": {
        description: "Burns to the face",
        requiredInterventions: ["Cric"],
        airwayCompromiseChance: 0.4,
        triageLogic: function (_a) {
            var airway = _a.airway;
            return airway ? "Immediate" : "Delayed";
        },
        vitals: function (_a) {
            var airway = _a.airway;
            return airway ? {
                pulse: [120, 140],
                respiratory: [28, 36],
                bp: [80, 95],
                spo2: [82, 90],
                airway: "Airway: Soot in oropharynx, stridor present",
                steth: "Stridor, diminished breath sounds"
            } : {
                pulse: [90, 110],
                respiratory: [20, 26],
                bp: [110, 130],
                spo2: [92, 96],
                airway: "Airway: Clear",
                steth: "Breath sounds clear"
            };
        }
    },
    "gsw_chest": {
        description: "Gunshot wound to the chest with difficulty breathing",
        requiredInterventions: ["Chest Seal", "Needle Decompression"],
        pneumoChance: 0.5,
        triageLogic: function (_a) {
            var pneumo = _a.pneumo;
            return pneumo ? "Immediate" : "Delayed";
        },
        vitals: function (_a) {
            var pneumo = _a.pneumo;
            return pneumo ? {
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
        }
    },
    "gsw_leg": {
        description: "Gunshot wound to the upper leg with heavy bleeding",
        requiredInterventions: ["Tourniquet"],
        arterialBleedChance: 0.4,
        triageLogic: function (_a) {
            var arterial = _a.arterial;
            return arterial ? "Immediate" : "Delayed";
        },
        vitals: function (_a) {
            var arterial = _a.arterial;
            return arterial ? {
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
        deterioration: {
            pulse: +18,
            respiratory: +5,
            bp: -12,
            spo2: -6,
            steth: "Muffled heart sounds, fast breathing"
        }
    },
    "pelvic_fracture": {
        description: "Pelvic injury with signs of internal bleeding",
        requiredInterventions: ["Pelvic Binder"],
        internalBleedChance: 0.6,
        triageLogic: function (_a) {
            var bleeding = _a.bleeding;
            return bleeding ? "Immediate" : "Delayed";
        },
        vitals: function (_a) {
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
    "head_injury": {
        description: "Closed head injury from blast",
        amsChance: 0.3,
        triageLogic: function (_a) {
            var ams = _a.ams;
            return ams ? "Immediate" : "Delayed";
        },
        vitals: function (_a) {
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
    "gsw_head_critical": {
        description: "Gunshot wound to the head with exposed brain matter and no response to stimuli",
        triageLogic: function () { return "Expectant"; },
        vitals: function () { return ({
            pulse: [40, 60],
            respiratory: [6, 10],
            bp: [60, 80],
            spo2: [65, 75],
            airway: "Airway: Gurgling, unprotected",
            steth: "Irregular heart sounds, diminished breath sounds"
        }); }
    },
    "bilateral_leg_amputations": {
        description: "Bilateral above-knee amputations with signs of hypovolemic shock and altered consciousness",
        triageLogic: function () { return "Expectant"; },
        vitals: function () { return ({
            pulse: [140, 160],
            respiratory: [30, 38],
            bp: [50, 70],
            spo2: [70, 85],
            airway: "Airway: Clear",
            steth: "Faint heart sounds, rapid shallow breathing"
        }); }
    },
    "burns_fullbody_critical": {
        description: "Full-thickness burns covering more than 85% of total body surface area",
        triageLogic: function () { return "Expectant"; },
        vitals: function () { return ({
            pulse: [130, 150],
            respiratory: [28, 34],
            bp: [65, 85],
            spo2: [75, 88],
            airway: "Airway: Clear but dry mucosa, audible distress",
            steth: "Crackles, poor air movement"
        }); },
        deterioration: {
            pulse: +12,
            respiratory: +6,
            bp: -12,
            spo2: -10,
            steth: "Crackles increasing, signs of decompensation"
        }
    },
    "gsw_neck_airway": {
        description: "Gunshot wound to the neck with gurgling sounds and airway obstruction",
        requiredInterventions: ["Cric"],
        triageLogic: function () { return "Immediate"; },
        vitals: function () { return ({
            pulse: [125, 140],
            respiratory: [32, 40],
            bp: [70, 85],
            spo2: [75, 88],
            airway: "Airway: Obstructed, bubbling at wound site",
            steth: "Absent breath sounds, stridor"
        }); },
        deterioration: {
            pulse: +12,
            respiratory: +7,
            bp: -12,
            spo2: -10,
            steth: "Stridor with gurgling, diminished breath sounds"
        }
    },
    "abdominal_stab_peritonitis": {
        description: "Stab wound to abdomen with rigid abdomen and signs of peritonitis",
        triageLogic: function () { return "Immediate"; },
        vitals: function () { return ({
            pulse: [115, 135],
            respiratory: [24, 30],
            bp: [70, 90],
            spo2: [85, 93],
            airway: "Airway: Clear",
            steth: "Hypoactive bowel sounds"
        }); }
    },
    "bilateral_tension_pneumothorax": {
        description: "Bilateral tension pneumothorax with cyanosis and respiratory distress",
        requiredInterventions: ["Needle Decompression"],
        triageLogic: function () { return "Expectant"; },
        vitals: function () { return ({
            pulse: [140, 160],
            respiratory: [40, 50],
            bp: [60, 80],
            spo2: [65, 75],
            airway: "Airway: Tracheal deviation, cyanotic lips",
            steth: "Absent breath sounds bilaterally"
        }); }
    },
    "crush_injury_torso": {
        description: "Crush injury to torso with poor perfusion and suspected organ damage",
        triageLogic: function () { return "Expectant"; },
        vitals: function () { return ({
            pulse: [120, 140],
            respiratory: [30, 40],
            bp: [60, 80],
            spo2: [70, 85],
            airway: "Airway: Shallow, obstructed",
            steth: "Diminished breath and muffled heart sounds"
        }); }
    },
    "open_fracture_bleeding": {
        description: "Open fracture with heavy external bleeding and visible bone",
        requiredInterventions: ["Tourniquet"],
        triageLogic: function () { return "Immediate"; },
        vitals: function () { return ({
            pulse: [130, 145],
            respiratory: [26, 32],
            bp: [70, 90],
            spo2: [85, 92],
            airway: "Airway: Clear",
            steth: "Normal"
        }); },
        deterioration: {
            pulse: +18,
            respiratory: +5,
            bp: -10,
            spo2: -6,
            steth: "Faint heart tones with shallow breaths"
        }
    },
    "minor_lacerations": {
        description: "Multiple superficial lacerations from shrapnel; ambulatory",
        triageLogic: function () { return "Minimal"; },
        vitals: function () { return ({
            pulse: [85, 95],
            respiratory: [16, 20],
            bp: [110, 125],
            spo2: [96, 99],
            airway: "Airway: Clear",
            steth: "Normal"
        }); }
    },
    "gsw_arm_venous": {
        description: "Gunshot wound to the arm with steady venous bleeding",
        triageLogic: function () { return "Delayed"; },
        vitals: function () { return ({
            pulse: [100, 115],
            respiratory: [18, 24],
            bp: [100, 115],
            spo2: [94, 97],
            airway: "Airway: Clear",
            steth: "Normal"
        }); }
    },
    "blunt_chest_contusion": {
        description: "Blunt trauma to chest with visible bruising and pain on inspiration",
        triageLogic: function () { return "Delayed"; },
        vitals: function () { return ({
            pulse: [95, 110],
            respiratory: [22, 28],
            bp: [105, 120],
            spo2: [94, 97],
            airway: "Airway: Clear",
            steth: "Decreased breath sounds, no tracheal shift"
        }); }
    },
    "orbital_fracture": {
        description: "Orbital fracture with periorbital ecchymosis and blurred vision",
        triageLogic: function () { return "Minimal"; },
        vitals: function () { return ({
            pulse: [85, 100],
            respiratory: [16, 20],
            bp: [115, 125],
            spo2: [97, 100],
            airway: "Airway: Clear",
            steth: "Normal"
        }); }
    },
    "blast_injury_combined": {
        description: "Blast injury with bilateral hearing loss, burns, and soft tissue damage",
        triageLogic: function () { return "Immediate"; },
        vitals: function () { return ({
            pulse: [125, 140],
            respiratory: [28, 36],
            bp: [75, 95],
            spo2: [88, 94],
            airway: "Airway: Soot present, partial obstruction",
            steth: "Wheezing, diminished sounds"
        }); }
    },
    "blast_tbi": {
        description: "Blast injury with confusion and vomiting",
        amsChance: 0.6,
        triageLogic: function (_a) {
            var ams = _a.ams;
            return ams ? "Immediate" : "Delayed";
        },
        vitals: function (_a) {
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
    "shrapnel_abdomen": {
        description: "Shrapnel wound to the abdomen with signs of internal bleeding",
        internalBleedChance: 0.6,
        triageLogic: function (_a) {
            var bleeding = _a.bleeding;
            return bleeding ? "Immediate" : "Delayed";
        },
        vitals: function (_a) {
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
    "gsw_shoulder_plexus": {
        description: "Gunshot wound to the shoulder with massive uncontrolled bleeding",
        requiredInterventions: ["Wound Packing"],
        arterialBleedChance: 0.5,
        triageLogic: function (_a) {
            var arterial = _a.arterial;
            return arterial ? "Immediate" : "Delayed";
        },
        vitals: function (_a) {
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
        deterioration: {
            pulse: +17,
            respiratory: +4,
            bp: -10,
            spo2: -5,
            steth: "Worsening perfusion, muffled heart tones"
        }
    },
    "blast_primary_hearing_loss": {
        description: "Exposure to IED blast, bilateral hearing loss and disorientation",
        triageLogic: function () { return "Delayed"; },
        vitals: function () { return ({
            pulse: [90, 100],
            respiratory: [16, 22],
            bp: [110, 125],
            spo2: [96, 99],
            airway: "Airway: Clear",
            steth: "Normal"
        }); }
    },
    "blast_unresponsive": {
        description: "Unresponsive post-blast, no external trauma visible",
        triageLogic: function () { return "Expectant"; },
        vitals: function () { return ({
            pulse: [30, 50],
            respiratory: [6, 10],
            bp: [50, 70],
            spo2: [60, 75],
            airway: "Airway: Irregular",
            steth: "Bradycardia, agonal sounds"
        }); }
    },
    "junctional_groin_bleed": {
        description: "Gunshot wound to the groin with arterial bleeding (junctional)",
        requiredInterventions: ["Wound Packing"],
        triageLogic: function () { return "Immediate"; },
        vitals: function () { return ({
            pulse: [130, 150],
            respiratory: [24, 30],
            bp: [70, 90],
            spo2: [85, 92],
            airway: "Airway: Clear",
            steth: "Normal"
        }); },
        deterioration: {
            pulse: +20,
            respiratory: +5,
            bp: -15,
            spo2: -8,
            steth: "Bounding carotid, diminished peripheral pulses"
        }
    },
    "junctional_axilla_bleed": {
        description: "Shrapnel wound to axilla with uncontrolled bleeding",
        requiredInterventions: ["Wound Packing"],
        triageLogic: function () { return "Immediate"; },
        vitals: function () { return ({
            pulse: [125, 145],
            respiratory: [26, 32],
            bp: [65, 85],
            spo2: [82, 90],
            airway: "Airway: Clear",
            steth: "Normal"
        }); },
        deterioration: {
            pulse: +18,
            respiratory: +6,
            bp: -12,
            spo2: -6,
            steth: "Weak radial pulse, fast shallow breathing"
        }
    },
    "open_fracture_femur": {
        description: "Open fracture of femur with bone exposed, bleeding controlled",
        triageLogic: function () { return "Delayed"; },
        vitals: function () { return ({
            pulse: [95, 110],
            respiratory: [18, 22],
            bp: [105, 120],
            spo2: [94, 97],
            airway: "Airway: Clear",
            steth: "Normal"
        }); }
    },
    "pelvic_crush_injury": {
        description: "Crush injury to pelvis with instability and suspected internal bleeding",
        requiredInterventions: ["Pelvic Binder"],
        internalBleedChance: 0.6,
        triageLogic: function (_a) {
            var bleeding = _a.bleeding;
            return bleeding ? "Immediate" : "Delayed";
        },
        vitals: function (_a) {
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
    "superficial_face_burn": {
        description: "Superficial facial burn with soot at nares, airway clear",
        triageLogic: function () { return "Delayed"; },
        vitals: function () { return ({
            pulse: [95, 105],
            respiratory: [18, 24],
            bp: [110, 125],
            spo2: [94, 98],
            airway: "Airway: Clear, soot present",
            steth: "Normal breath sounds"
        }); }
    },
    "burns_hand_only": {
        description: "Partial-thickness burns localized to both hands",
        triageLogic: function () { return "Delayed"; },
        vitals: function () { return ({
            pulse: [90, 100],
            respiratory: [16, 22],
            bp: [110, 125],
            spo2: [97, 100],
            airway: "Airway: Clear",
            steth: "Normal"
        }); }
    },
    "abrasions_and_sprain": {
        description: "Multiple abrasions and ankle sprain from blast shockwave",
        triageLogic: function () { return "Minimal"; },
        vitals: function () { return ({
            pulse: [85, 95],
            respiratory: [16, 20],
            bp: [110, 125],
            spo2: [98, 100],
            airway: "Airway: Clear",
            steth: "Normal"
        }); }
    },
    /* ----------  DRONE FRAGMENTATION, HEAD / NECK  ---------- */
    "drone_frag_headneck_immediate": {
        description: "Drone frag to head/neck, airway bleed",
        requiredInterventions: ["CRICKIT", "Wound Packing"],
        triageLogic: function () { return "Immediate"; },
        vitals: function () { return ({
            pulse: [115, 135],
            respiratory: [26, 32],
            bp: [90, 110],
            spo2: [84, 92],
            airway: "Airway: Obstructed by blood",
            steth: "Stridor & gurgling"
        }); },
        deterioration: {
            pulse: +13,
            respiratory: +6,
            bp: -10,
            spo2: -9,
            steth: "Increased gurgling and stridor, worsening airway compromise"
        }
    },
    "drone_frag_headneck_delayed": {
        description: "Drone frag to head/neck, bleeding controlled",
        triageLogic: function () { return "Delayed"; },
        vitals: function () { return ({
            pulse: [90, 105],
            respiratory: [18, 22],
            bp: [110, 125],
            spo2: [95, 98],
            airway: "Airway: Clear, packed",
            steth: "Breath sounds equal"
        }); }
    },
    /* ----------  CLUSTER‑FRAGMENT PEPPERING  ---------- */
    "cluster_frag_peppering_immediate": {
        description: "Cluster frag peppering w/ arterial spurter",
        requiredInterventions: ["Tourniquet"],
        triageLogic: function () { return "Immediate"; },
        vitals: function () { return ({
            pulse: [130, 150],
            respiratory: [24, 30],
            bp: [70, 90],
            spo2: [82, 90],
            airway: "Airway: Clear",
            steth: "Normal"
        }); },
        deterioration: {
            pulse: +19,
            respiratory: +6,
            bp: -12,
            spo2: -7,
            steth: "Rapid heart rate, thready pulse"
        }
    },
    "cluster_frag_peppering_delayed": {
        description: "Cluster frag peppering, superficial hits only",
        triageLogic: function () { return "Delayed"; },
        vitals: function () { return ({
            pulse: [88, 100],
            respiratory: [16, 20],
            bp: [115, 130],
            spo2: [97, 100],
            airway: "Airway: Clear",
            steth: "Normal"
        }); }
    },
    /* ----------  BELOW‑KNEE MINE AMPUTATION  ---------- */
    "mine_bka_immediate": {
        description: "Below‑knee amputation, uncontrolled bleed",
        requiredInterventions: ["Tourniquet"],
        triageLogic: function () { return "Immediate"; },
        vitals: function () { return ({
            pulse: [135, 155],
            respiratory: [26, 32],
            bp: [65, 85],
            spo2: [80, 88],
            airway: "Airway: Clear",
            steth: "Rapid heart tones"
        }); },
        deterioration: {
            pulse: +24,
            respiratory: +7,
            bp: -15,
            spo2: -8,
            steth: "Faint heart tones, hypoperfusion signs"
        }
    },
    "mine_bka_delayed": {
        description: "Below‑knee amputation, TQ applied",
        triageLogic: function () { return "Delayed"; },
        vitals: function () { return ({
            pulse: [95, 110],
            respiratory: [18, 22],
            bp: [108, 122],
            spo2: [94, 97],
            airway: "Airway: Clear",
            steth: "Normal"
        }); }
    },
    /* ----------  DISMOUNTED COMPLEX BLAST INJURY (DCBI)  ---------- */
    "dcbi_tripleamp_immediate": {
        description: "DCBI, bilat. legs + 1 arm amps, pelvic fx",
        requiredInterventions: ["Tourniquet", "Pelvic Binder"],
        triageLogic: function () { return "Immediate"; },
        vitals: function () { return ({
            pulse: [140, 160],
            respiratory: [28, 36],
            bp: [60, 80],
            spo2: [78, 86],
            airway: "Airway: Clear",
            steth: "Weak heart tones"
        }); },
        deterioration: {
            pulse: +25,
            respiratory: +8,
            bp: -20,
            spo2: -10,
            steth: "Diminished heart tones, weak perfusion"
        }
    },
    "dcbi_tripleamp_delayed": {
        description: "DCBI, all TQs on, pelvic binder placed",
        triageLogic: function () { return "Delayed"; },
        vitals: function () { return ({
            pulse: [100, 115],
            respiratory: [20, 24],
            bp: [100, 115],
            spo2: [93, 96],
            airway: "Airway: Clear",
            steth: "Normal"
        }); }
    },
    /* ----------  BEHIND‑ARMOR BLUNT TRAUMA (BABT) CHEST  ---------- */
    "babt_chest_immediate": {
        description: "BABT chest contusion w/ resp distress",
        requiredInterventions: ["Needle Decompression Kit (14 GA x 3.25 IN)"],
        triageLogic: function () { return "Immediate"; },
        vitals: function () { return ({
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
        vitals: function () { return ({
            pulse: [92, 105],
            respiratory: [18, 22],
            bp: [110, 125],
            spo2: [95, 98],
            airway: "Airway: Clear",
            steth: "Mild crackles"
        }); }
    },
    /* ----------  BLAST CONCUSSION (mTBI)  ---------- */
    "blast_concussion_immediate": {
        description: "Blast concussion, vomiting & AMS",
        requiredInterventions: [],
        triageLogic: function () { return "Immediate"; },
        vitals: function () { return ({
            pulse: [105, 120],
            respiratory: [20, 24],
            bp: [100, 115],
            spo2: [95, 98],
            airway: "Airway: Clear, risk of vomit",
            steth: "Normal"
        }); }
    },
    "blast_concussion_delayed": {
        description: "Blast concussion, oriented x3",
        triageLogic: function () { return "Delayed"; },
        vitals: function () { return ({
            pulse: [80, 95],
            respiratory: [16, 20],
            bp: [115, 130],
            spo2: [97, 100],
            airway: "Airway: Clear",
            steth: "Normal"
        }); }
    },
    /* ----------  FROSTBITE / TRENCH FOOT  ---------- */
    "frostbite_handsfeet_immediate": {
        description: "Frostbite hands/feet, deep, no pulses",
        requiredInterventions: [],
        triageLogic: function () { return "Immediate"; },
        vitals: function () { return ({
            pulse: [90, 100],
            respiratory: [18, 22],
            bp: [110, 125],
            spo2: [96, 99],
            airway: "Airway: Clear",
            steth: "Normal"
        }); }
    },
    "frostbite_handsfeet_delayed": {
        description: "Frostbite hands/feet, superficial",
        triageLogic: function () { return "Delayed"; },
        vitals: function () { return ({
            pulse: [80, 90],
            respiratory: [16, 20],
            bp: [115, 130],
            spo2: [97, 100],
            airway: "Airway: Clear",
            steth: "Normal"
        }); }
    },
    /* ----------  STRUCTURAL‑COLLAPSE CRUSH SYNDROME  ---------- */
    "crush_syndrome_immediate": {
        description: "Crush syndrome torso/limb entrapped",
        requiredInterventions: ["Tourniquet", "IV Fluid NS"],
        triageLogic: function () { return "Immediate"; },
        vitals: function () { return ({
            pulse: [115, 135],
            respiratory: [24, 30],
            bp: [80, 95],
            spo2: [88, 92],
            airway: "Airway: Clear",
            steth: "Muffled heart sounds"
        }); },
        deterioration: {
            pulse: +20,
            respiratory: +5,
            bp: -15,
            spo2: -9,
            steth: "Muffled heart tones, delayed capillary refill"
        }
    },
    "crush_syndrome_delayed": {
        description: "Crush injury freed, fluids running",
        triageLogic: function () { return "Delayed"; },
        vitals: function () { return ({
            pulse: [90, 105],
            respiratory: [18, 22],
            bp: [105, 120],
            spo2: [94, 97],
            airway: "Airway: Clear",
            steth: "Normal"
        }); }
    },
    /* ----------  THERMOBARIC INHALATION BURN  ---------- */
    "thermobaric_airway_immediate": {
        description: "Thermobaric airway burn, stridor",
        requiredInterventions: ["CRICKIT"],
        triageLogic: function () { return "Immediate"; },
        vitals: function () { return ({
            pulse: [120, 140],
            respiratory: [30, 38],
            bp: [80, 95],
            spo2: [78, 86],
            airway: "Airway: Soot, swollen",
            steth: "Inspiratory stridor"
        }); }
    },
    "thermobaric_airway_delayed": {
        description: "Thermobaric burn, airway monitored",
        triageLogic: function () { return "Delayed"; },
        vitals: function () { return ({
            pulse: [95, 110],
            respiratory: [18, 22],
            bp: [110, 125],
            spo2: [94, 97],
            airway: "Airway: Clear (no stridor)",
            steth: "Normal breath sounds"
        }); }
    },
    /* ----------  PELVIC EFP WOUND  ---------- */
    "pelvic_efp_immediate": {
        description: "Pelvic EFP wound, arterial bleed",
        requiredInterventions: ["Pelvic Binder", "Wound Packing"],
        triageLogic: function () { return "Immediate"; },
        vitals: function () { return ({
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
        vitals: function () { return ({
            pulse: [100, 115],
            respiratory: [18, 22],
            bp: [105, 120],
            spo2: [93, 96],
            airway: "Airway: Clear",
            steth: "Normal"
        }); }
    }
};
exports["default"] = exports.injuryProfiles;
