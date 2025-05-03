// src/App.tsx
import React, { FC } from 'react';
import { useAppContext } from './context/AppContext';
import usePhaseTimer from './hooks/usePhaseTimer';
import { generateUniqueCasualties } from './components/casualtyGenerator/casualtyGenerator';
import AidBagSetup from './components/AidBagSetup/AidBagSetup';
import ScenarioBrief from './components/ScenarioBrief/ScenarioBrief';
import TriagePhase from './components/casualtyGenerator/TriagePhase';
import AARPage from './components/AARPage/AARPage';
import PhaseControls from './components/TriageBoard/PhaseControls';
import './style.css';

const safeGetItem = async (key: string): Promise<string | null> => {
  try {
    return await window.electronAPI.getItem(key);
  } catch {
    return null;
  }
};

const safeSetItem = async (key: string, value: string): Promise<void> => {
  try {
    await window.electronAPI.setItem(key, value);
  } catch {
    console.warn(`Failed to set localStorage key: ${key}`);
  }
};

const StudentApp: FC = () => {
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
      broadcast,
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

  const onStartPacking = async () => {
    const end = Date.now() + packDuration * 60000;
    await safeSetItem('packingEndTime', String(end));
    setPhase('packing');
    broadcast('phase', 'packing');
  };

  const onStartBrief = async () => {
    const end = Date.now() + briefDuration * 60000;
    await safeSetItem('briefEndTime', String(end));
    setPhase('brief');
    broadcast('phase', 'brief');
  };

  const onStartTriage = async () => {
    const count = Number(await safeGetItem('casualtyCount')) || 15;
    const list = await generateUniqueCasualties(count);
    await safeSetItem('casualties', JSON.stringify(list));

    const channel = new BroadcastChannel('triage-updates');
    channel.postMessage({ type: 'casualties', payload: list });
    channel.close();

    const now = Date.now();
    const end = now + triageLimit * 60000;
    await safeSetItem('triageEndTime', String(end));
    await window.electronAPI.setItem('packingEndTime', null);
    await window.electronAPI.setItem('briefEndTime', null);

    setPhase('triage');
    broadcast('phase', 'triage');
  };

  const onEndScenario = () => {
    setPhase('aar');
    broadcast('phase', 'aar');
  };

  const onRestart = async () => {
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

    await window.electronAPI.setItem('casualties', JSON.stringify([jane]));
    await window.electronAPI.setItem('revealedIndexes', JSON.stringify([0]));
    broadcast('reset', {});
    window.location.reload();
  };

  const removeItem = React.useCallback((item: string) => {
    // Defer so we’re OUTSIDE the current render phase
    setTimeout(() => {
      setAidBag(prev => {
        const updated = { ...prev };
        if (updated[item] > 1) {
          updated[item]--;
        } else {
          delete updated[item];
        }
        window.electronAPI.setItem("aidBag", JSON.stringify(updated));
        broadcast("aidBag", updated);
        return updated;
      });
    }, 0);
  }, [setAidBag, broadcast]);

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

export default StudentApp;