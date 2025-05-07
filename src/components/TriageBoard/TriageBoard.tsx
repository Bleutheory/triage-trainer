// src/components/TriageBoard/TriageBoard.tsx

import React, { FC, useEffect, useState } from 'react';
import { useAppContext } from '../../context/AppContext';
import NotificationPanel from './NotificationPanel';
import CasualtyGrid from '../casualtyGenerator/CasualtyGrid';
import { Casualty } from '../../types';
import { generateCasualty } from '../casualtyGenerator/casualtyGenerator';
import useCasualtyReveal from '../../hooks/useCasualtyReveal';
import useScenarioTimer from '../../hooks/useScenarioTimer';
import useCasualtyDeterioration from '../../hooks/useCasualtyDeterioration';
import { useResupply } from '../AidBagSetup/resupplyManager';
import { janeDoe as demoCasualty } from './demoCasualty';

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
    if (!stored) return;
    const loaded: Casualty[] = JSON.parse(stored);
    setCasualties(loaded);
  }, [phase, broadcast]);

  const initialCasualtyCount = Number(localStorage.getItem('casualtyCount')) || 40;
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
    onUpdate: () => {
      const stored = localStorage.getItem('casualties');
      const updated = stored ? JSON.parse(stored) : [];
      setCasualties(updated);
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
          const stored = localStorage.getItem('casualties');
          const latest = stored ? JSON.parse(stored) : payload;
          setCasualties(latest);
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

// Applies one intervention and removes one item from the aid bag
const handleApplyItem = (index: number, item: string) => {
  // 1) Update that casualty’s interventions array
  setCasualties(prev => {
    const updated = [...prev];
    const cas = { ...updated[index] };
    
    // Look for an existing intervention entry
    const existing = cas.interventions.find(i => i.name === item);
    if (existing) {
      // If it exists, bump its count
      existing.count += 1;
    } else {
      // Otherwise add a new entry
      cas.interventions = [
        ...cas.interventions,
        { name: item, count: 1 }
      ];
    }
    
    updated[index] = cas;
    // Persist and broadcast
    localStorage.setItem("casualties", JSON.stringify(updated));
    broadcast("casualties", updated);
    return updated;
  });

  // 2) Remove one from the aid bag
  setAidBag(prevBag => {
    const bag = { ...prevBag };
    if (bag[item] > 1) {
      bag[item]--;
    } else {
      delete bag[item];
    }
    localStorage.setItem("aidBag", JSON.stringify(bag));
    broadcast("aidBag", bag);
    return bag;
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