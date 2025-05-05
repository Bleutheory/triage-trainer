// @ts-ignore: allow importing CSS modules
import React, { FC, useState } from 'react';
import { useAppContext } from '../../context/AppContext';
import { Casualty, Vitals } from '../../types';
import { generateCasualty } from './casualtyGenerator';
import { normalizeInterventionName } from '../AidBagSetup/interventions';
import injuryProfiles from '../../data';

interface CasualtyCardProps {
  index: number;
  aidBag: Record<string, number>;
  removeItem: (item: string) => void;
  casualty: Casualty;
  onTriageChange: (value: string) => void;
  isHighlighted: boolean;
  applyItem: (item: string) => void;
}

const CasualtyCard: FC<CasualtyCardProps> = ({ index, aidBag, removeItem, casualty, onTriageChange, isHighlighted, applyItem }) => {
  const { broadcast } = useAppContext();
  const [showVitals, setShowVitals] = useState(false);
  const [visibleVitals, setVisibleVitals] = useState<Record<keyof Vitals, boolean>>(() => ({
    pulse: false,
    respiratory: false,
    bp: false,
    spo2: false,
    airway: false,
    steth: false
  }));

  React.useEffect(() => {
    const flags = {
      airway: casualty.vitals.airway.toLowerCase().includes('stridor'),
      bleeding: !!(casualty.vitals.bp && typeof casualty.vitals.bp === 'string' && casualty.vitals.bp.startsWith('65')),
      pneumo: casualty.vitals.steth.toLowerCase().includes('tracheal deviation'),
      ams: false,
      arterial: false,
    };

    const profile = injuryProfiles[casualty.injury];
    const triage = casualty.triage;

    let required: string[] = [];
    if (profile?.getRequiredInterventions) {
      required = profile.getRequiredInterventions(flags, triage);
    } else {
      required = profile?.requiredInterventions || [];
    }

    const normalizedRequired = required.flatMap(req => {
      const norm = normalizeInterventionName(req);
      return Array.isArray(norm) ? norm : [norm];
    });

    const normalizedApplied = casualty.interventions.flatMap(i => {
      const norm = normalizeInterventionName(i.name);
      return Array.isArray(norm) ? norm : [norm];
    });

    const stabilized = normalizedRequired.every(req => normalizedApplied.includes(req));

    if (stabilized && casualty.treatmentTime == null) {
      const list = JSON.parse(localStorage.getItem("casualties") || "[]");
      const updated = list.map((c: Casualty, i: number) =>
        i === index
          ? { ...c, treatmentTime: Math.floor((Date.now() - c.startTime) / 1000) }
          : c
      );
      localStorage.setItem("casualties", JSON.stringify(updated));
      broadcast("casualties", updated);
    }
  }, [casualty, index, broadcast]);
  // eslint-disable-next-line
  const [showStabilized, setShowStabilized] = useState(true);
  const baseClass = 'casualty-card';
  const triageClass = casualty.triage
    ? `triage-${casualty.triage.toLowerCase()}`
    : '';
  const fullClassName = [
    baseClass,
    casualty.isDemo ? 'demo-card' : '',
    triageClass,
    casualty.deteriorated ? 'deteriorated' : '',
  ].filter(Boolean).join(' ');
  const labelMap: Record<keyof Vitals, string> = {
    pulse: "Request Pulse",
    respiratory: "Request Respiratory Rate",
    bp: "Request Blood Pressure",
    spo2: "Request SpO2",
    airway: "Request Airway Status",
    steth: "Request Lung Sounds"
  };
  // Reveal logic moved to useEffect below

  React.useEffect(() => {
    const stored = JSON.parse(localStorage.getItem("revealedIndexes") || "[]") as number[];
    const updated = Array.from(new Set([...stored, index]));
    localStorage.setItem("revealedIndexes", JSON.stringify(updated));
    broadcast("revealedIndexes", updated);
  }, [index, broadcast]);

  return (
    <div className={fullClassName}>
      <h3>{casualty.name}</h3>
      <p><strong>Injury:</strong> {casualty.injury}</p>
      <div>
        <label htmlFor={`triage-${casualty.name}`}>Triage Category: </label>

        <select
          id={`triage-${casualty.name}`}
          value={casualty.triage || ""}
          onChange={(e) => {
            const newTriage = e.target.value;
            const list = JSON.parse(localStorage.getItem("casualties") || "[]") as Casualty[];
            const updated = list.map((c, i) =>
              i === index
                ? {
                  ...c,
                  triage: newTriage,
                  triageTime: Math.floor((Date.now() - c.startTime) / 1000),
                }
                : c
            );
            localStorage.setItem("casualties", JSON.stringify(updated));

            broadcast("casualties", updated);

            onTriageChange(newTriage);
          }}
          style={{
            backgroundColor: '#4A5568',
            color: '#F7FAFC',
            border: 'none',
            padding: '4px 8px',
            borderRadius: '4px',
            marginLeft: '8px'
          }}
        >
          <option value="">-- Select --</option>
          <option value="Immediate">Immediate</option>
          <option value="Delayed">Delayed</option>
          <option value="Minimal">Minimal</option>
          <option value="Expectant">Expectant</option>
        </select>
      </div>

      <div style={{ marginTop: '10px' }}>
        <button
          onClick={() => setShowVitals(prev => !prev)}
          style={{
            padding: '6px 10px',
            marginBottom: '8px',
            backgroundColor: '#4A5568',
            color: '#F7FAFC',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          {showVitals ? "Hide Vitals" : "Show Vitals"}
        </button>
        {showVitals && (
          <ul>
            {(Object.entries(labelMap) as [keyof Vitals, string][]).map(([key, label]) => (
              <li key={key}>
                <button
                  onClick={() => {
                    setVisibleVitals(v => ({ ...v, [key]: true }));
                    const current = Number(localStorage.getItem("penaltyPoints") || 0);
                    localStorage.setItem("penaltyPoints", String(current + 20));
                    if (current + 20 >= 120) {
                      const list = JSON.parse(localStorage.getItem("casualties") || "[]");
                      const newCasualty = {
                        ...generateCasualty(),
                        startTime: Date.now(),
                      };
                      const updated = [...list, newCasualty];

                      localStorage.setItem("casualties", JSON.stringify(updated));
                      localStorage.setItem("penaltyPoints", "0");
                      broadcast("casualties", updated);

                      const revealed = JSON.parse(localStorage.getItem("revealedIndexes") || "[]");
                      const newIndex = updated.length - 1;
                      const nextRevealed = Array.from(new Set([...revealed, newIndex]));
                      localStorage.setItem("revealedIndexes", JSON.stringify(nextRevealed));
                      broadcast("revealedIndexes", nextRevealed);

                      const note = `${newCasualty.name} Arrived while you were taking vitals!`;
                      const oldNotes = JSON.parse(localStorage.getItem("notifications") || "[]");
                      const nextNotes = [note, ...oldNotes].slice(0, 10);
                      localStorage.setItem("notifications", JSON.stringify(nextNotes));
                      broadcast("notifications", nextNotes);
                    }

                    console.log(`${casualty.name}: +20 penalty points for requesting ${key}`);
                  }}
                  disabled={visibleVitals[key]}
                  style={{
                    padding: '4px 8px',
                    marginRight: '10px',
                    backgroundColor: visibleVitals[key] ? '#2C7A7B' : '#4A5568',
                    color: '#F7FAFC',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: visibleVitals[key] ? 'default' : 'pointer'
                  }}
                >
                  {visibleVitals[key] ? `${label}: ${casualty.vitals[key]}` : label}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div>
        <h4>Interventions Applied:</h4>
        <ul>
          {casualty.interventions.map((item, index) => (
            <li key={index}>{item.name} (x{item.count})</li>
          ))}
        </ul>
      </div>
      <div>
        {showStabilized && (
          <div>
            <strong>Stabilized:</strong>{" "}
            {(() => {
              const required = casualty.requiredInterventions || [];
              const normalizedRequired = required.flatMap(req => {
                const norm = normalizeInterventionName(req);
                return Array.isArray(norm) ? norm : [norm];
              });

              const normalizedApplied = casualty.interventions.flatMap(i => {
                const norm = normalizeInterventionName(i.name);
                return Array.isArray(norm) ? norm : [norm];
              });

              return normalizedRequired.every(req => normalizedApplied.includes(req)) ? "Yes" : "No";
            })()}
          </div>
        )}
      </div>
    </div>
  );
}

export default CasualtyCard;
