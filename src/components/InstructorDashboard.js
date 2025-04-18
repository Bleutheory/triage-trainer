

import React from 'react';
import { useEffect, useState } from 'react';
import { generateCasualty } from './casualtyGenerator';

export default function InstructorDashboard() {
  const [casualties, setCasualties] = useState([]);
  const [aidBag, setAidBag] = useState({});
  const [scenarioTimeLimit, setScenarioTimeLimit] = useState(() => {
    return Number(localStorage.getItem("scenarioTimeLimit")) || 20;
  });
  const [casualtyCount, setCasualtyCount] = useState(() => {
    return Number(localStorage.getItem("casualtyCount")) || 15;
  });
  const [autoReveal, setAutoReveal] = useState(() => {
    return localStorage.getItem("autoReveal") !== "false";
  });
  const addItem = (item) => {
    const updated = { ...aidBag, [item]: (aidBag[item] || 0) + 1 };
    setAidBag(updated);
    localStorage.setItem("aidBag", JSON.stringify(updated));
    const channel = new BroadcastChannel("triage-updates");
    channel.postMessage({ type: "aidBag", payload: updated });
  };

  useEffect(() => {
    const updateData = () => {
      const stored = localStorage.getItem('casualties');
      if (stored) setCasualties(JSON.parse(stored));
    };

    updateData();
    const interval = setInterval(updateData, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const channel = new BroadcastChannel('triage-updates');
    channel.onmessage = (msg) => {
      if (Array.isArray(msg.data)) {
        setCasualties(msg.data);
      }
    };
    return () => channel.close();
  }, []);

  return (
    <section style={{ padding: '20px' }}>
      <h2 style={{ marginBottom: '12px' }}>Instructor Dashboard</h2>
      <div style={{ marginBottom: "1rem" }}>
        <button
          onClick={() => {
            const casualties = JSON.parse(localStorage.getItem('casualties')) || [];
            const newCasualty = generateCasualty();
            casualties.push(newCasualty);
            localStorage.setItem('casualties', JSON.stringify(casualties));
            setCasualties(casualties);
            const channel = new BroadcastChannel("triage-updates");
            channel.postMessage({ type: "casualties", payload: casualties });
          }}
          style={{ marginRight: "10px", padding: "8px" }}
        >
          ➕ Add Casualty
        </button>

        <button
          onClick={() => {
            const item = prompt("Enter item name to add to aid bag:");
            if (item) addItem(item);
          }}
          style={{ padding: "8px" }}
        >
          🎒 Add Item to Aid Bag
        </button>
      </div>
      <div style={{ marginBottom: "1rem" }}>
        <label>
          Scenario Time Limit (minutes):{" "}
          <input
            type="number"
            value={scenarioTimeLimit}
            onChange={e => {
              const value = Number(e.target.value);
              setScenarioTimeLimit(value);
              localStorage.setItem("scenarioTimeLimit", value);
              const channel = new BroadcastChannel("triage-updates");
              channel.postMessage({ type: "settings", payload: { scenarioTimeLimit: value } });
            }}
            min={1}
            max={60}
            style={{ width: "60px", marginRight: "1rem" }}
            disabled={localStorage.getItem("phase") === "triage"}
          />
        </label>
        <label>
          Number of Casualties:{" "}
          <input
            type="number"
            value={casualtyCount}
            onChange={e => {
              const value = Number(e.target.value);
              setCasualtyCount(value);
              localStorage.setItem("casualtyCount", value);
              const channel = new BroadcastChannel("triage-updates");
              channel.postMessage({ type: "settings", payload: { casualtyCount: value } });
            }}
            min={1}
            max={50}
            style={{ width: "60px", marginRight: "1rem" }}
            disabled={localStorage.getItem("phase") === "triage"}
          />
        </label>
        <label>
          Auto-Reveal Casualties:{" "}
          <input
            type="checkbox"
            checked={autoReveal}
            onChange={e => setAutoReveal(e.target.checked)}
            disabled={localStorage.getItem("phase") === "triage"}
          />
        </label>
      </div>
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Injury</th>
            <th>Triage</th>
            <th>Stabilized?</th>
            <th>Deteriorated?</th>
          </tr>
        </thead>
        <tbody>
          {casualties.map((c, i) => (
            <tr key={i}>
              <td>{c.name}</td>
              <td>{c.injury}</td>
              <td>{c.triage}</td>
              <td>
                {(c.requiredInterventions || []).every(req =>
                  c.interventions?.some(i => i.name === req && i.count > 0)
                ) ? 'Yes' : 'No'}
              </td>
              <td>{c.deteriorated ? 'Yes' : 'No'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}
