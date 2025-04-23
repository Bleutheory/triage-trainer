// src/components/AidBagSetup/interventions.ts
export const marchCategories = {
  "Massive Hemorrhage": [
    "Combat Application Tourniquet (C-A-T)",
    "Combat Gauze Hemostatic Dressing",
    "Compressed Gauze",
    "Emergency Trauma Dressing - 4 in.",
    "Abdominal Emergency Trauma Dressing",
    "Elastic Wrap Bandage - 4 in.",
    "Elastic Wrap Bandage - 6 in.",
    "F.A.S.T. 1",
    "Surgical Tape Roll - 1 in."
  ],
  "Airway": [
    "Nasopharyngeal Airway",
    "CRICKIT",
    "Pocket Mask"
  ],
  "Respiratory": [
    "HyFin Chest Seal",
    "Needle Decompression Kit (14 GA x 3.25 IN)",
    "Bag-Valve Mask (BVM)"
  ],
  "Circulation": [
    "IV Fluid NS",
    "Pelvic Binder",
    "Triangular Bandage"
  ],
  "Head Injury / Hypothermia": [
    "Emergency Survival Blanket",
    "Sterile Burn Sheet - 60 x 96 in.",
    "FOX Eye Shield",
    "Cervical Spine Collar"
  ],
  "PPE & Misc": [
    "PPE Kit - Gloves, Mask, Eye Protection",
    "Flexible Adhesive Bandages"
  ]
};
// src/components/AidBagSetup/interventions.ts
export function normalizeInterventionName(name: string): string | string[] {
  const aliasMap: Record<string, string | string[]> = {
    "Combat Gauze Hemostatic Dressing": "Combat Gauze",
    "Compressed Gauze": "Compressed Gauze",
    "Emergency Trauma Dressing - 4 in.": "ETD",
    "C-A-T® Combat Application Tourniquet": "Tourniquet",
    "Combat Gauze® Z-fold Hemostatic": "Combat Gauze",
    "Wound Pack": ["Compressed Gauze", "Combat Gauze"], 
  };
  return aliasMap[name.trim()] || name.trim();
}