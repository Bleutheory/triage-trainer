import React, { FC } from 'react';
import { useAppContext } from '../../context/AppContext';
// Removed unused useState import

interface AidBagSetupProps {
  isSetupPhase: boolean;
}

const AidBagSetup: FC<AidBagSetupProps> = ({ isSetupPhase }) => {
const { aidBag, setAidBag } = useAppContext();
  const addItem = (item: string) => {
    setAidBag((prev: Record<string, number>) => ({ ...prev, [item]: (prev[item] || 0) + 1 }));
  };
  const removeItem = (item: string) => {
    setAidBag((prev: Record<string, number>) => {
      const updated = { ...prev };
      if (updated[item] > 1) {
        updated[item] = updated[item] - 1;
      } else {
        delete updated[item];
      }
      return updated;
    });
  };
  const marchCategories = {
    "Massive Hemorrhage": [
      "Combat Application Tourniquet (C-A-T)",
      "Combat Gauze Hemostatic Dressing",
      "Compressed Gauze ",
      "Emergency Trauma Dressing - 4 in.",
      "Abdominal Emergency Trauma Dressing",
      "Elastic Wrap Bandage - 4 in.",
      "Elastic Wrap Bandage - 6 in.",
      "F.A.S.T. 1",
      "Surgical Tape Roll - 1 in."
    ],
    "Airway": [
      "Nasopharyngeal Airway ",
      "CRICKIT",
      "Pocket Mask"
    ],
    "Respiratory": [
      "HyFin Chest Seal ",
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
      "FOX Eye Shield ",
      "Cervical Spine Collar"
    ],
    "PPE & Misc": [
      "PPE Kit - Gloves, Mask, Eye Protection",
      "Flexible Adhesive Bandages"
    ]
  };

  const [openCategories, setOpenCategories] = React.useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    for (const category of Object.keys(marchCategories)) {
      initial[category] = true;
    }
    return initial;
  });

  // Removed effect that commits local state on exit

  return (
    <section style={{ padding: "2rem", backgroundColor: "#1A202C", color: "#F7FAFC", fontFamily: "'Segoe UI', sans-serif" }}>
      <h2 style={{ fontSize: "1.4rem", marginBottom: "1rem", color: "#EDF2F7" }}>🧰 Aid Bag Packing</h2>
      <div style={{ marginBottom: "2rem" }}>
        {Object.entries(marchCategories).map(([category, items]) => {
          const open = openCategories[category];
          const toggleOpen = () =>
            setOpenCategories(prev => ({ ...prev, [category]: !prev[category] }));
          return (
            <div key={category} style={{ marginBottom: "1rem" }}>
              <button
                onClick={toggleOpen}
                style={{
                  width: "100%",
                  textAlign: "left",
                  padding: "0.5rem",
                  backgroundColor: "#2D3748",
                  border: "none",
                  color: "#F7FAFC",
                  fontWeight: "bold",
                  fontSize: "1.1rem",
                  cursor: "pointer",
                  borderBottom: "1px solid #4A5568"
                }}
              >
                {open ? "▼" : "▶"} {category}
              </button>
              {open && (
                <div style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "0.5rem",
                  marginTop: "0.5rem"
                }}>
                  {items.map(item => (
                    <div
                      key={item}
                      style={{
                        padding: "6px 10px",
                        backgroundColor: "#4A5568",
                        borderRadius: "4px",
                        cursor: "pointer"
                      }}
                      onMouseOver={(e) => e.currentTarget.style.backgroundColor = "#2C7A7B"}
                      onMouseOut={(e) => e.currentTarget.style.backgroundColor = "#4A5568"}
                      draggable={isSetupPhase}
                      onDragStart={(e) => e.dataTransfer.setData("text/plain", item)}
                      onClick={() => isSetupPhase && addItem(item)}
                    >
                      {item}
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <main style={{ marginTop: "2rem" }}>
        <h3 style={{ fontSize: "1.3rem", marginBottom: "1rem" }}>🎒 Current Aid Bag Contents</h3>
        <div style={{ backgroundColor: "#2D3748", borderRadius: "8px", padding: "1rem", maxHeight: "80vh", overflowY: "auto" }}>
          <p>Total Items: {Object.values(aidBag).reduce((sum, count) => sum + count, 0)}</p>
          <ul style={{ listStyle: "none", paddingLeft: 0 }}>
            {Object.entries(aidBag).map(([item, count]) => (
              <li key={item} style={{ marginBottom: "0.75rem", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span>{item} x{count}</span>
                <button
                  onClick={() => removeItem(item)}
                  disabled={!isSetupPhase}
                  style={{
                    backgroundColor: "#E53E3E",
                    color: "#F7FAFC",
                    border: "none",
                    padding: "4px 8px",
                    borderRadius: "4px",
                    cursor: "pointer"
                  }}
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>
        </div>
      </main>
    </section>
  );
}

export default AidBagSetup;
