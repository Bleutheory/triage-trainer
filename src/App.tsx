// src/App.tsx
import React, { FC } from 'react';
import { useAppContext } from './context/AppContext';
import usePhaseTimer from './hooks/usePhaseTimer';
import { generateUniqueCasualties } from './components/casualtyGenerator/casualtyGenerator';
import AidBagSetup from './components/AidBagSetup/AidBagSetup';
import ScenarioBrief from './components/ScenarioBrief/ScenarioBrief';
import TriagePhase from './components/TriagePhase/TriagePhase';
import AARPage from './components/AARPage/AARPage';
import PhaseControls from './components/TriageBoard/PhaseControls';
import './style.css';

type HookPhase = 'setup' | 'scenario-brief' | 'triage' | 'aar';

const safeGetItem = (key: string): string | null => {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
};

const safeSetItem = (key: string, value: string): void => {
  try {
    localStorage.setItem(key, value);
  } catch {
    console.warn(`Failed to set localStorage key: ${key}`);
  }
};

const App: FC = () => {
  const {
    packDuration,
    briefDuration,
    triageLimit,
    setPhase,
    phase,
    aidBag,
  } = useAppContext();

  // Map app-phase into the hook’s phase key
  const hookPhase: HookPhase = (() => {
    switch (phase) {
      case 'packing':
        return 'setup';
      case 'brief':
        return 'scenario-brief';
      case 'triage':
        return 'triage';
      case 'aar':
        return 'aar';
      default:
        return 'setup';
    }
  })();

  // Unified timer label for header
  const timerLabel = usePhaseTimer(hookPhase, {
    packDuration,
    briefDuration,
    triageLimit,
  });

  // Handlers
  const onStartPacking = () => {
    const end = Date.now() + packDuration * 60_000;
    safeSetItem('packingEndTime', String(end));
    setPhase('packing');
  };

  const onStartBrief = () => {
    const end = Date.now() + briefDuration * 60_000;
    safeSetItem('briefEndTime', String(end));
    setPhase('brief');
  };

  const onStartTriage = () => {
    const count = Number(safeGetItem('casualtyCount')) || 15;
    const list = generateUniqueCasualties(count);
    safeSetItem('casualties', JSON.stringify(list));

    const end = Date.now() + triageLimit * 60_000;
    safeSetItem('triageEndTime', String(end));

    setPhase('triage');
  };

  const onEndScenario = () => {
    setPhase('aar');
  };

  const onRestart = () => {
    localStorage.clear();
    window.location.reload();
  };

  return (
    <div className="app-container">
      <header className="header-bar">
        <PhaseControls
          phase={phase}
          timerLabel={timerLabel}
          onStartPacking={onStartPacking}
          onStartBrief={onStartBrief}
          onStartTriage={onStartTriage}
          onEndScenario={onEndScenario}
          onRestart={onRestart}
        />
      </header>

      <div className="content-wrapper">
        <aside className="sidebar">
          <h2>Triage Trainer</h2>
          <nav>
            <ul>
              <li>
                <button onClick={() => setPhase('packing')}>
                  🧰 Aid Bag Setup
                </button>
              </li>
              <li>
                <button onClick={() => setPhase('brief')}>
                  👨‍🏫 View Scenario
                </button>
              </li>
              <li>
                <button
                  onClick={() => setPhase('triage')}
                  disabled={phase === 'triage'}
                >
                  🩺 Triage Phase
                </button>
              </li>
              <li>
                <button onClick={() => setPhase('aar')}>
                  📊 AAR Summary
                </button>
              </li>
            </ul>
          </nav>

          <section className="aidbag-snapshot">
            <h3>🎒 Aid Bag Contents</h3>
            <ul>
              {Object.entries(aidBag).map(([item, count]) => (
                <li key={item}>
                  {item} x{count}
                </li>
              ))}
            </ul>
          </section>
        </aside>

        <main className="main-content">
          {phase === 'packing' && <AidBagSetup isSetupPhase={true} />}
          {phase === 'brief' && <ScenarioBrief />}
          {phase === 'triage' && <TriagePhase />}
          {phase === 'aar' && <AARPage />}
        </main>
      </div>
    </div>
  );
};

export default App;