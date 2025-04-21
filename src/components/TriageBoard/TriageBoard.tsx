import React, { FC, useEffect, useState } from 'react';
import { useAppContext } from '../../context/AppContext';
import NotificationPanel from './NotificationPanel';
import CasualtyGrid from './CasualtyGrid';
import { Casualty, Intervention } from '../../types';
import { generateCasualty } from '../casualtyGenerator/casualtyGenerator';
import useCasualtyReveal from '../../hooks/useCasualtyReveal';
import useScenarioTimer from '../../hooks/useScenarioTimer';
import useCasualtyDeterioration from '../../hooks/useCasualtyDeterioration';

  // Demo casualty always present until triage starts
  const demoCasualty: Casualty = {
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
  
interface TriageBoardProps {
  aidBag: Record<string, number>;
  removeItem: (item: string) => void;
  notifications: string[];
  setNotifications: React.Dispatch<React.SetStateAction<string[]>>;
  phase: string;
}

// Utility for the deterioration hook
export const isStabilized = (casualty: Casualty): boolean => {
  if (!casualty.requiredInterventions?.length) return true;
  return casualty.requiredInterventions.every(req =>
    casualty.interventions.some(i => i.name === req && i.count > 0)
  );
};

const TriageBoard: FC<TriageBoardProps> = ({
  aidBag,
  removeItem,
  notifications,
  setNotifications,
  phase,
}) => {
  const { broadcast } = useAppContext();

  // 1) Resupply timer
  const timerLabel = useScenarioTimer(
    Number(localStorage.getItem('scenarioEndTime') || 0),
    phase as any
  );
  const [secondsLeft, setSecondsLeft] = useState<number>(0);
  useEffect(() => {
    const [m, s] = timerLabel.split(':').map(Number);
    setSecondsLeft(m * 60 + s);
  }, [timerLabel]);
  const resupplyDisabled = secondsLeft > 0;
  const disableLabel = resupplyDisabled ? `${secondsLeft}s` : '';

  // 2) Load casualties & revealed indexes
  const [casualties, setCasualties] = useState<Casualty[]>(() => {
    const stored = localStorage.getItem('casualties');
    const loaded: Casualty[] = stored ? JSON.parse(stored) : [];
    return [demoCasualty, ...loaded];
  });
  const [revealedIndexes, setRevealedIndexes] = useState<number[]>(() => {
    const stored = localStorage.getItem('revealedIndexes');
    return stored ? JSON.parse(stored) : [0];
  });

  // 3) Auto‑reveal hook
  useCasualtyReveal(
    phase,
    casualties.length,
    localStorage.getItem('autoReveal') !== 'false',
    (idx: number) => {
      setRevealedIndexes(prev => {
        const next = Array.from(new Set([...prev, idx]));
        localStorage.setItem('revealedIndexes', JSON.stringify(next));
        return next;
      });
    }
  );

  // 4) Deterioration hook
  useCasualtyDeterioration({
    casualties,
    revealedIndexes,
    phase,
    onUpdate: updated => {
      setCasualties(updated);
      localStorage.setItem('casualties', JSON.stringify(updated));
      broadcast('casualties', updated);
    },
    onNotify: msg => {
      const next = [msg, ...notifications].slice(0, 10);
      setNotifications(next);
      broadcast('notifications', next);
    },
  });

  // 5) Listen for broadcasts
  useEffect(() => {
    const channel = new BroadcastChannel('triage-updates');
    channel.onmessage = event => {
      const { type, payload } = event.data || {};
      switch (type) {
        case 'phase':
          localStorage.setItem('phase', payload);
          broadcast('phase', payload);
          window.location.reload();
          break;
        case 'casualties':
          setCasualties(payload);
          break;
        case 'notifications':
          setNotifications(payload);
          break;
        case 'reset':
          window.location.reload();
          break;
      }
    };
    return () => channel.close();
  }, [broadcast, setNotifications]);
  // Strip demo casualty once actual triage begins
  useEffect(() => {
    if (phase === 'triage') {
      setCasualties(prev => {
        const filtered = prev.filter(c => !c.isDemo);
        localStorage.setItem('casualties', JSON.stringify(filtered));
        broadcast('casualties', filtered);
        return filtered;
      });
    }
  }, [phase, broadcast]);

  // 6) Add casualty handler
  const handleAdd = () => {
    const list = [...casualties, generateCasualty()];
    setCasualties(list);
    localStorage.setItem('casualties', JSON.stringify(list));
    broadcast('casualties', list);
  };
  // Apply item to a casualty; demo casualties do not consume supplies
  const handleApplyItem = (index: number, item: string) => {
    setCasualties(prev => {
      const updated = prev.map((c, i) => {
        if (i !== index) return c;
        if (!c.isDemo) removeItem(item);
        // Build a new interventions array of Intervention objects
        const interventions: Intervention[] = c.interventions.map(inter => ({ ...inter }));
        const existing = interventions.find(inter => inter.name === item);
        if (existing) {
          existing.count += 1;
        } else {
          interventions.push({ name: item, count: 1 });
        }
        return { ...c, interventions };
      });
      localStorage.setItem('casualties', JSON.stringify(updated));
      broadcast('casualties', updated);
      return updated;
    });
  };

  return (
    <section className="triage-board">
      {phase !== 'triage' && (
        <button onClick={handleAdd}>➕ Add Casualty</button>
      )}
      <NotificationPanel
        notifications={notifications}
        onRequestResupply={() => broadcast('reset', null)}
        resupplyDisabled={resupplyDisabled}
        disableLabel={disableLabel}
      />
      <CasualtyGrid
        aidBag={aidBag}
        casualties={casualties}
        revealedIndexes={revealedIndexes}
        phase={phase}
        removeItem={removeItem}
        handleApplyItem={handleApplyItem}
        setNotifications={setNotifications}
      />
    </section>
  );
};

export default TriageBoard;