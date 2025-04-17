import React from 'react';
import { useState } from 'react';

function AidBagSetup({ aidBag, addItem, removeItem, isSetupPhase }) {
  const initialItems = {
    Airway: [
      "Nasopharyngeal Airway ",
      "Bag-Valve Mask (BVM)",
      "Pocket Mask",
      "CRICKIT"
    ],
    Breathing: [
      "HyFin Chest Seal ",
      "Needle Decompression Kit (14 GA x 3.25 IN)"
    ],
    Circulation: [
      "Combat Application Tourniquet (C-A-T)",
      "Combat Gauze Hemostatic Dressing",
      "Compressed Gauze ",
      "Emergency Trauma Dressing - 4 in.",
      "Abdominal Emergency Trauma Dressing",
      "Triangular Bandage",
      "Elastic Wrap Bandage - 4 in.",
      "Elastic Wrap Bandage - 6 in.",
      "Surgical Tape Roll - 1 in.",
      "F.A.S.T. 1",
      "IV Fluid NS"
    ],
    Fractures: [
      "SAM Splint - Universal",
      "Pelvic Binder",
      "Cervical Spine Collar"
    ],
    "Eyes & Face": [
      "FOX Eye Shield "
    ],
    Burns: [
      "Sterile Burn Sheet - 60 x 96 in.",
      "IF Fludid LR"
    ],
    "PPE & Misc": [
      "Emergency Survival Blanket",
      "Flexible Adhesive Bandages",
      "PPE Kit - Gloves, Mask, Eye Protection"
    ]
  };

  return (
    <section style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "2rem", padding: "1rem" }}>
      <div>
        <h3>Item Categories</h3>
        <div style={{ maxHeight: "500px", overflowY: "auto", border: "1px solid #ccc", padding: "0.5rem" }}>
          {Object.entries(initialItems).map(([category, items]) => (
            <details key={category} style={{ marginBottom: "1rem" }}>
              <summary style={{ fontWeight: "bold", marginBottom: "0.5rem" }}>{category}</summary>
              <ul style={{ listStyle: "none", paddingLeft: 0 }}>
                {items.map(item => (
                  <li
                    key={item}
                    style={{ margin: "0.25rem 0", cursor: "pointer" }}
                    draggable={isSetupPhase}
                    onDragStart={(e) => e.dataTransfer.setData("text/plain", item)}
                    onClick={() => isSetupPhase && addItem(item)}
                  >
                    {item}
                  </li>
                ))}
              </ul>
            </details>
          ))}
        </div>
      </div>
      <div>
        <h3>Current Aid Bag Contents</h3>
        <div style={{ border: "1px solid #ccc", padding: "0.5rem", maxHeight: "500px", overflowY: "auto" }}>
          <p>Total Items: {Object.values(aidBag).reduce((sum, count) => sum + count, 0)}</p>
          <ul style={{ listStyle: "none", paddingLeft: 0 }}>
            {Object.entries(aidBag).map(([item, count]) => (
              <li key={item} style={{ marginBottom: "0.5rem" }}>
                {item} x{count}{" "}
                <button
                  onClick={() => removeItem(item)}
                  style={{ marginLeft: "0.5rem" }}
                  disabled={!isSetupPhase}
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

export default AidBagSetup;
