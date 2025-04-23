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
    notifications,
    setNotifications,
    setAidBag,
  } = useAppContext();

  const hookPhase = (() => {
    switch (phase) {
      case 'packing': return 'setup';
      case 'brief': return 'scenario-brief';
      case 'triage': return 'triage';
      case 'aar': return 'aar';
      default: return 'setup';
    }
  })();

  const timerLabel = usePhaseTimer(hookPhase as any, {
    packDuration,
    briefDuration,
    triageLimit,
  });

  const onStartPacking = () => {
    const end = Date.now() + packDuration * 60000;
    safeSetItem('packingEndTime', String(end));
    setPhase('packing');
  };

  const onStartBrief = () => {
    const end = Date.now() + briefDuration * 60000;
    safeSetItem('briefEndTime', String(end));
    setPhase('brief');
  };

  const onStartTriage = () => {
    const count = Number(safeGetItem('casualtyCount')) || 15;
    const list = generateUniqueCasualties(count);
    safeSetItem('casualties', JSON.stringify(list));

    const channel = new BroadcastChannel('triage-updates');
    channel.postMessage({ type: 'casualties', payload: list });
    channel.close();

    const now = Date.now();
    const end = now + triageLimit * 60000;
    safeSetItem('triageEndTime', String(end));

    localStorage.removeItem('packingEndTime');
    localStorage.removeItem('briefEndTime');

    setPhase('triage');
  };

  const onEndScenario = () => {
    setPhase('aar');
  };

  const onRestart = () => {
    localStorage.clear();

    const jane = {
      name: 'SPC Jane Doe (Demo)',
      injury: 'Traumatic left leg amputation with severe arterial bleeding',
      triage: '',
      interventions: [],
      deteriorated: false,
      requiredInterventions: [],
      vitals: { pulse: 0, respiratory: 0, bp: '0/0', spo2: 0, airway: '', steth: '' },
      dynamicVitals: { pulse: 0, respiratory: 0, bp: '0/0', spo2: 0, airway: '', steth: '' },
      startTime: Date.now(),
      treatmentTime: null,
      triageTime: null,
      isDemo: true,
    };

    localStorage.setItem('casualties', JSON.stringify([jane]));
    localStorage.setItem('revealedIndexes', JSON.stringify([0]));

    window.location.reload();
  };

  const removeItem = (item: string) => {
    setAidBag((prev) => {
      const updated = { ...prev };
      if (updated[item] > 1) {
        updated[item] -= 1;
      } else {
        delete updated[item];
      }
      return updated;
    });
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
                <li
                  key={item}
                  draggable
                  onDragStart={(e) => {
                    e.dataTransfer.setData("text/plain", item);
                    console.log("Dragging from sidebar:", item);
                  }}
                  style={{ cursor: "grab" }}
                >
                  {item} x{count}
                </li>
              ))}
            </ul>
          </section>
        </aside>

        <main className="main-content">
          {phase === 'packing' && <AidBagSetup isSetupPhase={true} />}
          {phase === 'brief' && <ScenarioBrief />}
          {phase === 'triage' && (
            <TriagePhase
              aidBag={aidBag}
              removeItem={removeItem}
              notifications={notifications}
              setNotifications={setNotifications}
              phase={phase}
            />
          )}
          {phase === 'aar' && <AARPage />}
        </main>
      </div>
    </div>
  );
};

export default App;