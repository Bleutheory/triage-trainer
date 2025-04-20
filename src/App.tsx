import React, { useState, useEffect, useRef, useCallback, FC } from 'react';
import { useAppContext } from './context/AppContext';
// @ts-ignore: allow importing global CSS
import './style.css';

import { generateUniqueCasualties } from './components/casualtyGenerator/casualtyGenerator';
import AidBagSetup from './components/AidBagSetup/AidBagSetup';
import ScenarioBrief from './components/ScenarioBrief/ScenarioBrief';
import TriagePhase from './components/TriagePhase/TriagePhase';
import AARPage from './components/AARPage/AARPage';
import PhaseControls from './components/TriageBoard/PhaseControls';

type BroadcastMessage = 
  | { type: 'phase'; payload: 'packing' | 'brief' | 'triage' | 'aar' }
  | { type: 'timer'; payload: string }
  | { type: 'reset' };

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
  const timerRef = useRef<number | null>(null);
  const channel = useRef(new BroadcastChannel('triage-updates'));
  const [timerLabel, setTimerLabel] = useState<string>('Timer: --:--');
  const [currentPage, setCurrentPage] = useState<'setup'|'scenario-brief'|'triage'|'aar'>('setup');
  const phaseTimers = useRef<Record<string, number | null>>({
    setup: null,
    brief: null
  });
  const { aidBag = {}, setPhase, phase } = useAppContext();

  const navigateTo = useCallback((page: typeof currentPage) => {
    setCurrentPage(page);
  }, []);


  const startPacking = () => {
    setPhase("packing");
    const endTime = Date.now() + 5 * 60 * 1000; // 5 minutes
    safeSetItem("scenarioEndTime", String(endTime));

    phaseTimers.current.packing = window.setTimeout(() => {
      setPhase("brief");
    }, 5 * 60 * 1000); // Transition to "brief" after 5 minutes
  };


  useEffect(() => {
    const chan = channel.current;
    const handleMessage = ({ data }: MessageEvent<BroadcastMessage>) => {
      if (data?.type === 'phase') {
        const map: Record<string, typeof currentPage> = {
          packing: 'setup',
          brief: 'scenario-brief',
          triage: 'triage',
          aar: 'aar',
        };
        navigateTo(map[data.payload] || 'setup');
      }
    };

    chan.onmessage = handleMessage;
    return () => {
      chan.onmessage = null;
    };
  }, [navigateTo]);

  useEffect(() => {
    if (timerRef.current !== null) {
      clearInterval(timerRef.current);
    }
    timerRef.current = window.setInterval(() => {
      const end = Number(safeGetItem('scenarioEndTime') || 0);
      if (!end || isNaN(end)) {
        setTimerLabel('Timer: --:--');
        return;
      }
      const remaining = Math.max(0, end - Date.now());
      const m = Math.floor(remaining / 60000).toString().padStart(2, '0');
      const s = Math.floor((remaining % 60000) / 1000).toString().padStart(2, '0');
      setTimerLabel(`Timer: ${m}:${s}`);
    }, 500);
    return () => {
      if (timerRef.current !== null) {
        clearInterval(timerRef.current);
      }
    };
  }, [currentPage]);

  return (
    <>
      <header className="header-bar">
        <h1 className="app-title">Triage Trainer</h1>
        <PhaseControls
          phase={phase}
          timerLabel={timerLabel}
          onStartPacking={startPacking}
          onStartBrief={() => {
            const duration = 5 * 60 * 1000;
            safeSetItem("phase", "brief");
            safeSetItem("scenarioEndTime", String(Date.now() + duration));
            channel.current.postMessage({ type: 'phase', payload: 'brief' });
            if (phaseTimers.current.brief) clearTimeout(phaseTimers.current.brief);
            phaseTimers.current.brief = window.setTimeout(() => {
              const count = Number(safeGetItem('casualtyCount')) || 15;
              const list = generateUniqueCasualties(count);
              safeSetItem('casualties', JSON.stringify(list));
              const limit = Number(safeGetItem('scenarioTimeLimit')) || 20;
              const end = Date.now() + limit * 60000;
              safeSetItem('scenarioEndTime', String(end));
              channel.current.postMessage({ type: 'phase', payload: 'triage' });
              channel.current.postMessage({ type: 'timer', payload: String(end) });
            }, duration);
          }}
          onStartTriage={() => {
            if (phase === 'triage') return;
            const count = Number(safeGetItem('casualtyCount')) || 15;
            const list = generateUniqueCasualties(count);
            safeSetItem('casualties', JSON.stringify(list));
            const limit = Number(safeGetItem('scenarioTimeLimit')) || 20;
            safeSetItem('scenarioEndTime', String(Date.now() + limit * 60000));
            channel.current.postMessage({ type: 'phase', payload: 'triage' });
            channel.current.postMessage({ type: 'timer', payload: String(Date.now() + limit * 60000) });
          }}
          onEndScenario={() => channel.current.postMessage({ type: 'phase', payload: 'aar' })}
          onRestart={() => {
            localStorage.clear();
            channel.current.postMessage({ type: 'reset' });
            window.location.reload();
          }}
        />
      </header>
      <div className="app-container">
        <aside className="sidebar">
          <nav>
            <ul>
              <li><button onClick={() => navigateTo('setup')} aria-label="Navigate to Aid Bag Setup">🧰 Aid Bag Setup</button></li>
              <li><button onClick={() => navigateTo('scenario-brief')} aria-label="Navigate to Scenario Brief">👨‍🏫 View Scenario</button></li>
              <li><button onClick={() => navigateTo('triage')} aria-label="Navigate to Triage Phase">🩺 Triage Phase</button></li>
              <li><button onClick={() => navigateTo('aar')} aria-label="Navigate to AAR Summary">📊 AAR Summary</button></li>
            </ul>
          </nav>
          <div className="sidebar-aidbag-view" style={{ marginTop: '1rem' }}>
            <h3>Aid Bag</h3>
            <ul style={{ listStyle: 'none', padding: 0 }}>
              {Object.entries(aidBag).map(([item, count]) => (
                <li
                  key={item}
                  draggable
                  onDragStart={(e: React.DragEvent<HTMLLIElement>) => e.dataTransfer.setData('text/plain', item)}
                  style={{ cursor: 'grab' }}
                >
                  {item} x{count}
                </li>
              ))}
            </ul>
          </div>
        </aside>
        <main className="main-content">
          {currentPage === 'setup' && <AidBagSetup isSetupPhase={true} />}
          {currentPage === 'scenario-brief' && <ScenarioBrief />}
          {currentPage === 'triage' && <TriagePhase />}
          {currentPage === 'aar' && <AARPage />}
        </main>
      </div>
    </>
  );
};

export default App;