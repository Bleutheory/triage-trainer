// src/components/TriageBoard/TriageBoard.tsx

import React, { FC, useEffect, useState } from 'react';
import { useAppContext } from '../../context/AppContext';
import NotificationPanel from './NotificationPanel';
import CasualtyGrid from './CasualtyGrid';
import { Casualty } from '../../types';
import { generateCasualty } from '../casualtyGenerator/casualtyGenerator';
import useCasualtyReveal from '../../hooks/useCasualtyReveal';
import useScenarioTimer from '../../hooks/useScenarioTimer';
import useCasualtyDeterioration from '../../hooks/useCasualtyDeterioration';
import { useResupply } from './resupplyManager';
import { janeDoe as demoCasualty } from '../CasualtyCard/demoCasualty';

interface TriageBoardProps {
  aidBag: Record<string, number>;
  removeItem: (item: string) => void;
  notifications: string[];
  setNotifications: React.Dispatch<React.SetStateAction<string[]>>;
  phase: string;
}

const TriageBoard: FC<TriageBoardProps> = ({
  aidBag,
  removeItem,
  notifications,
  setNotifications,
  phase,
}) => {
  const { broadcast, setAidBag } = useAppContext();
  const { onRequestResupply, resupplyDisabled } = useResupply();

  const timerLabel = useScenarioTimer(
    Number(localStorage.getItem('scenarioEndTime') || 0),
    phase as any
  );
  const [secondsLeft, setSecondsLeft] = useState<number>(0);
  useEffect(() => {
    const [m, s] = timerLabel.split(':').map(Number);
    setSecondsLeft(m * 60 + s);
  }, [timerLabel]);
  const resupplyButtonDisabled = secondsLeft > 0 || resupplyDisabled;
  const disableLabel = resupplyButtonDisabled && secondsLeft > 0 ? `${secondsLeft}s` : '';

  const [casualties, setCasualties] = useState<Casualty[]>(() => {
    const stored = localStorage.getItem('casualties');
    const loaded: Casualty[] = stored ? JSON.parse(stored) : [];
    return [demoCasualty, ...loaded];
  });

  const [revealedIndexes, setRevealedIndexes] = useState<number[]>(() => {
    const stored = localStorage.getItem('revealedIndexes');
    return stored ? JSON.parse(stored) : [0];
  });

  useEffect(() => {
    const stored = localStorage.getItem('casualties');
    const loaded: Casualty[] = stored ? JSON.parse(stored) : [];
    const includesDemo = loaded.some(c => c.isDemo);
    if (!includesDemo && phase !== 'triage') {
      const updated = [demoCasualty, ...loaded];
      setCasualties(updated);
      localStorage.setItem('casualties', JSON.stringify(updated));
      broadcast('casualties', updated);
    } else {
      setCasualties(loaded);
    }
  }, [phase, broadcast]);

  const initialCasualtyCount = Number(localStorage.getItem('casualtyCount')) || 15;
  useCasualtyReveal(
    phase,
    initialCasualtyCount,
    localStorage.getItem('autoReveal') !== 'false',
    (idx: number) => {
      setRevealedIndexes(prev => {
        const next = Array.from(new Set([...prev, idx]));
        localStorage.setItem('revealedIndexes', JSON.stringify(next));
        return next;
      });
    }
  );

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
        case 'revealedIndexes':
          setRevealedIndexes(payload);
          break;
      }
    };
    return () => channel.close();
  }, [broadcast, setNotifications]);

  useEffect(() => {
    if (phase === 'triage') {
      // Preserve demo casualty
      setCasualties(prev => {
        const updated = [...prev];
        localStorage.setItem('casualties', JSON.stringify(updated));
        broadcast('casualties', updated);
        return updated;
      });
    }
  }, [phase, broadcast]);

  useEffect(() => {
    const storedReveals = localStorage.getItem('revealedIndexes');
    if (storedReveals) {
      setRevealedIndexes(JSON.parse(storedReveals));
    }
  }, [phase]);

  const handleAdd = () => {
    const list = [...casualties, generateCasualty()];
    setCasualties(list);
    localStorage.setItem('casualties', JSON.stringify(list));
    broadcast('casualties', list);
  };

  const handleRequestResupply = () => {
    onRequestResupply(aidBag, setAidBag, setNotifications, setCasualties);
  };

  const handleApplyItem = (index: number, item: string) => {
    setCasualties(prev => {
      const updated = prev.map((c, i) => {
        if (i !== index) return c;
        if (!c.isDemo) removeItem(item);
        const interventions = [...c.interventions];
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
        onRequestResupply={handleRequestResupply}
        resupplyDisabled={resupplyButtonDisabled}
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

export const isStabilized = (casualty: Casualty): boolean => {
  if (!casualty.requiredInterventions?.length) return true;
  return casualty.requiredInterventions.every(req =>
    casualty.interventions.some(i => i.name === req && i.count > 0)
  );
};

export default TriageBoard;