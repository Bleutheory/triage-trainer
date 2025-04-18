import React from 'react';
import { useState } from 'react';

function CasualtyCard({ aidBag, removeItem, casualty, onTriageChange, isHighlighted }) {
  // Removed unused startTime variable
  const [showVitals, setShowVitals] = useState(false);
  const [visibleVitals, setVisibleVitals] = useState({
    pulse: false,
    respiratory: false,
    bp: false,
    spo2: false,
    airway: false,
    steth: false
  });





  const triageClass = casualty.isDemo
    ? 'casualty-card demo-card'
    : casualty.triage
    ? `casualty-card triage-${casualty.triage.toLowerCase()}`
    : 'casualty-card';
  const finalClass = `${triageClass} ${isHighlighted ? 'pulsate' : ''}`;

  const labelMap = {
    pulse: "Request Pulse",
    respiratory: "Request Respiratory Rate",
    bp: "Request Blood Pressure",
    spo2: "Request SpO2",
    airway: "Request Airway Status",
    steth: "Request Lung Sounds"
  };

  return (
    <div className={finalClass}>
      <h3>{casualty.name}</h3>
      <p><strong>Injury:</strong> {casualty.injury}</p>
      <div>
        <label htmlFor={`triage-${casualty.name}`}>Triage Category: </label>
        <select
          id={`triage-${casualty.name}`}
          value={casualty.triage || ""}
          onChange={(e) => onTriageChange(e.target.value)}
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
            {Object.entries(labelMap).map(([key, label]) => (
              <li key={key}>
                <button
                  onClick={() => {
                    setVisibleVitals(v => ({ ...v, [key]: true }));
                    const current = Number(localStorage.getItem("penaltyPoints") || 0);
                    localStorage.setItem("penaltyPoints", current + 20);
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

    </div>
  );
}

export default CasualtyCard;
