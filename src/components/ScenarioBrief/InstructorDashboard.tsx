
import React, { FC, useEffect, useState } from 'react';
import { useAppContext } from '../../context/AppContext';
import { Casualty } from '../../types';
// @ts-ignore: allow importing JS module without type declarations
import { generateCasualty } from '../casualtyGenerator/casualtyGenerator';
import { storage } from '../../utils/storage';

const InstructorDashboard: FC = () => {
  const { setAidBag, broadcast } = useAppContext();
  const [casualties, setCasualties] = useState<Casualty[]>([]);
  const [scenarioTimeLimit, setScenarioTimeLimit] = useState<number>(
    () => storage.get<number>(storage.KEYS.SCENARIO_TIME_LIMIT, 20)
  );
  const [casualtyCount, setCasualtyCount] = useState<number>(
    () => storage.get<number>(storage.KEYS.CASUALTY_COUNT, 15)
  );
  const [autoReveal, setAutoReveal] = useState<boolean>(
    () => storage.get<boolean>(storage.KEYS.AUTO_REVEAL, true)
  );
  const addItem = (item: string) => {
    setAidBag(prev => {
      const updated = { ...prev, [item]: (prev[item] || 0) + 1 };
      storage.set(storage.KEYS.AID_BAG, updated);
      broadcast("aidBag", updated);
      return updated;
    });
  };


  useEffect(() => {
    // Initial load of casualties from storage
    const loaded = storage.get<Casualty[]>(storage.KEYS.CASUALTIES, []);
    setCasualties(loaded);
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
  <button onClick={() => {
    storage.clearAppData();
    broadcast("reset", {});
    window.location.reload();
  }}>Reset Everything</button>
</div>
      <div style={{ marginBottom: "1rem" }}>
        <button
        onClick={() => {
            const casualtiesList = storage.get<Casualty[]>(storage.KEYS.CASUALTIES, []);
            const newCasualty = generateCasualty();
            const updatedList = [...casualtiesList, newCasualty];
            storage.set(storage.KEYS.CASUALTIES, updatedList);
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
              storage.set(storage.KEYS.SCENARIO_TIME_LIMIT, value);
              broadcast("settings", { scenarioTimeLimit: value });
            }}
            min={1}
            max={60}
            style={{ width: "60px", marginRight: "1rem" }}
            disabled={storage.get<string>(storage.KEYS.PHASE, '') === 'triage'}
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
              storage.set(storage.KEYS.CASUALTY_COUNT, value);
              broadcast("settings", { casualtyCount: value });
            }}
            min={1}
            max={50}
            style={{ width: "60px", marginRight: "1rem" }}
            disabled={storage.get<string>(storage.KEYS.PHASE, '') === 'triage'}
          />
        </label>
        <label>
          Auto-Reveal Casualties:{" "}
          <input
            type="checkbox"
            checked={autoReveal}
            onChange={e => setAutoReveal(e.target.checked)}
            disabled={storage.get<string>(storage.KEYS.PHASE, '') === 'triage'}
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
