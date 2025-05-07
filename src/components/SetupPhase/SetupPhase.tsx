import React from 'react';

interface Props {
  casualtyCount: number;
  setCasualtyCount: (n: number) => void;
  scenarioTimeLimit: number;
  setScenarioTimeLimit: (n: number) => void;
  autoReveal: boolean;
  setAutoReveal: (val: boolean) => void;
  startPackingPhase: () => void;
}

const SetupPhase: React.FC<Props> = ({
  casualtyCount,
  setCasualtyCount,
  scenarioTimeLimit,
  setScenarioTimeLimit,
  autoReveal,
  setAutoReveal,
  startPackingPhase,
}) => {
  return (
    <div style={{ padding: '2rem' }}>
      <h2>Scenario Setup</h2>
      <div style={{ marginBottom: '1rem' }}>
        <label>
          Casualty Count:
          <input
            type="number"
            value={casualtyCount}
            onChange={(e) => setCasualtyCount(Number(e.target.value))}
            min={1}
            max={50}
          />
        </label>
      </div>
      <div style={{ marginBottom: '1rem' }}>
        <label>
          Time Limit (min):
          <input
            type="number"
            value={scenarioTimeLimit}
            onChange={(e) => setScenarioTimeLimit(Number(e.target.value))}
            min={1}
            max={60}
          />
        </label>
      </div>
      <div style={{ marginBottom: '1rem' }}>
        <label>
          Auto-Reveal Casualties:
          <input
            type="checkbox"
            checked={autoReveal}
            onChange={(e) => setAutoReveal(e.target.checked)}
          />
        </label>
      </div>
      <button onClick={startPackingPhase}>🚀 Start Packing Phase</button>
    </div>
  );
};

export default SetupPhase;