
import React, { FC, useEffect, useState } from 'react';
import { useAppContext } from '../../context/AppContext';
import { Casualty } from '../../types';
// @ts-ignore: allow importing JS module without type declarations
import { generateCasualty } from '../casualtyGenerator/casualtyGenerator';

const InstructorDashboard: FC = () => {
  const { setAidBag, broadcast } = useAppContext();
  const [casualties, setCasualties] = useState<Casualty[]>([]);
  const [scenarioTimeLimit, setScenarioTimeLimit] = useState<number>(20);
  const [casualtyCount, setCasualtyCount] = useState<number>(15);
  const [autoReveal, setAutoReveal] = useState<boolean>(true);

  useEffect(() => {
    const loadSettings = async () => {
      const timeLimit = await window.electronAPI.getItem("scenarioTimeLimit");
      const count = await window.electronAPI.getItem("casualtyCount");
      const reveal = await window.electronAPI.getItem("autoReveal");
      setScenarioTimeLimit(Number(timeLimit) || 20);
      setCasualtyCount(Number(count) || 15);
      setAutoReveal(reveal !== "false");
    };
    loadSettings();
  }, []);

  const addItem = (item: string) => {
    setAidBag(prev => {
      const updated = { ...prev, [item]: (prev[item] || 0) + 1 };
      window.electronAPI.setItem("aidBag", JSON.stringify(updated));
      broadcast("aidBag", updated);
      return updated;
    });
  };


  useEffect(() => {
    // Initial load of casualties from secure storage
    const loadCasualties = async () => {
      const storedCasualties = await window.electronAPI.getItem('casualties');
      if (storedCasualties) {
        setCasualties(JSON.parse(storedCasualties));
      }
    };
    loadCasualties();
    const channel = new BroadcastChannel('triage-updates');
    channel.onmessage = (msg) => {
      if (msg.data?.type === "casualties" && Array.isArray(msg.data.payload)) {
        setCasualties(msg.data.payload);
      }
    };
    return () => channel.close();
  }, []);

  return (
    <section style={{ padding: '20px' }}>
      <h2 style={{ marginBottom: '12px' }}>Instructor Dashboard</h2>
      <div style={{ marginBottom: '1rem' }}>
  <h3>Scenario Controls</h3>
  <button onClick={() => broadcast("phase", "packing")}>Start Packing</button>
  <button onClick={() => broadcast("phase", "brief")}>Start Brief</button>
  <button onClick={() => broadcast("phase", "triage")}>Start Triage</button>
  <button onClick={() => broadcast("phase", "aar")}>End Scenario</button>
  <button onClick={async () => {
    Object.keys(localStorage).forEach(key => window.electronAPI.setItem(key, null));
    broadcast("reset", {});
    window.location.reload();
  }}>Reset Everything</button>
</div>
      <div style={{ marginBottom: "1rem" }}>
        <button
          onClick={async () => {
            const stored = await window.electronAPI.getItem('casualties');
            const casualtiesList: Casualty[] = stored ? JSON.parse(stored) : [];
            const newCasualty = await generateCasualty();
            const updatedList = [...casualtiesList, newCasualty];
            await window.electronAPI.setItem('casualties', JSON.stringify(updatedList));
            setCasualties(updatedList);
            broadcast("casualties", updatedList);
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
              window.electronAPI.setItem("scenarioTimeLimit", String(value));
              broadcast("settings", { scenarioTimeLimit: value });
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
              localStorage.setItem("casualtyCount", String(value));
              broadcast("settings", { casualtyCount: value });
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

export default InstructorDashboard;
