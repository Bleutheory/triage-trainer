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
    "Triangular Bandage",
    "Surgical Tape Roll - 3 in."
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
    "F.A.S.T. 1",
    "IV Starter Kit",
    "Blood collection kit",
    "Pelvic Binder"
  ],
  "Head Injury / Hypothermia": [
    "Emergency Survival Blanket",
    "Sterile Burn Sheet - 60 x 96 in.",
    "FOX Eye Shield",
    "Cervical Spine Collar"
  ],
  "Medication & Misc": [
    "TXA 1G",
    "Calcium Gluconate 1G",
    "Calcium Chloride 1G",
    "Ketamine 100mg/ml 5ML vial",
    "PPE Kit - Gloves, Mask, Eye Protection",
    "Flexible Adhesive Bandages",
    "Samsplint"
  ]
};
// src/components/AidBagSetup/interventions.ts
export function normalizeInterventionName(name: string): string | string[] {
  const aliasMap: Record<string, string | string[]> = {
    "Combat Gauze Hemostatic Dressing": "Combat Gauze",
    "Compressed Gauze": "Compressed Gauze",
    "Emergency Trauma Dressing - 4 in.": "Pressure Dressing",
    "Emergency Trauma Dressing": "Pressure Dressing",
    "Abdominal Emergency Trauma Dressing": "Pressure Dressing",
    "Elastic Wrap Bandage - 4 in.": "Pressure Dressing",
    "Elastic Wrap Bandage - 6 in.": "Pressure Dressing",
    "F.A.S.T. 1": "F.A.S.T. 1",
    "Surgical Tape Roll - 1 in.": "Surgical Tape Roll - 3 in.",
    "C-A-T® Combat Application Tourniquet": "Tourniquet",
    "Combat Application Tourniquet (C-A-T)": "Tourniquet",
    "Combat Gauze® Z-fold Hemostatic": "Combat Gauze",
    "Wound Pack": ["Compressed Gauze", "Combat Gauze"], // Standardized
    "Wound pack": "Compressed Gauze", // Standardized
    "HyFin Chest Seal": "Chest Seal",
    "Chest Seal": "Chest Seal",
    "Needle Decompression Kit (14 GA x 3.25 IN)": "Needle Decompression",
    "Needle Decompression": "Needle Decompression",
    "Bag-Valve Mask (BVM)": "Bag-Valve Mask",
    "Triangular Bandage": ["Pressure Dressing", "Tourniquet"],
    "Belt": "Tourniquet",
    "Cric": "CRICKIT", // Added for consistency
    "Wound Packing": ["Compressed Gauze", "Combat Gauze"], // Added for consistency
    "ETD": "Pressure Dressing" // Changed from Emergency Trauma Dressing
    // add other aliases as students come up with things…
  };
  return aliasMap[name.trim()] || name.trim();
}