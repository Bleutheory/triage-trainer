import React from 'react';

interface PhaseControlsProps {
  phase: string;
  timerLabel: string;
  onStartPacking: () => void;
  onStartBrief: () => void;
  onStartTriage: () => void;
  onEndScenario: () => void;
  onRestart: () => void;
}

const PhaseControls: React.FC<PhaseControlsProps> = ({
  phase,
  timerLabel,
  onStartPacking,
  onStartBrief,
  onStartTriage,
  onEndScenario,
  onRestart
}) => (
  <div className="instructor-controls">
    <button onClick={onStartPacking}>Start Packing</button>
    <button onClick={onStartBrief}>Start Brief</button>
    <button disabled={phase === 'triage'} onClick={onStartTriage}>
      Start Triage
    </button>
    <button onClick={onEndScenario}>End Scenario</button>
    <button onClick={onRestart}>Restart Program</button>
    <div className="linked-timer">{timerLabel}</div>
  </div>
);

export default PhaseControls;