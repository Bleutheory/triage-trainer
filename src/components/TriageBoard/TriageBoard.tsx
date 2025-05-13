// src/components/TriageBoard/TriageBoard.tsx

import React, { FC, useEffect, useState } from 'react';
import { storage } from '../../utils/storage';
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
  const { broadcast, setAidBag, triageLimit } = useAppContext(); // Destructure triageLimit here
  const { onRequestResupply, resupplyDisabled } = useResupply();

  const timerLabel = useScenarioTimer(
    storage.get<number>(storage.KEYS.SCENARIO_END_TIME, 0),
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
    const loaded = storage.get<Casualty[]>(storage.KEYS.CASUALTIES, []);
    return [demoCasualty, ...loaded];
  });

  const [revealedIndexes, setRevealedIndexes] = useState<number[]>(
    () => storage.get<number[]>(storage.KEYS.REVEALED_INDEXES, [0])
  );

  useEffect(() => {
    const loaded = storage.get<Casualty[]>(storage.KEYS.CASUALTIES, []);
    setCasualties(loaded);
  }, [phase, broadcast]);

  const initialCasualtyCount = storage.get<number>(storage.KEYS.CASUALTY_COUNT, 40);
  useCasualtyReveal(
    phase,
    initialCasualtyCount,
    storage.get<boolean>(storage.KEYS.AUTO_REVEAL, true),
    triageLimit, // Pass triageLimit as the new parameter
    (idx: number) => {
      setRevealedIndexes(prev => {
        const next = Array.from(new Set([...prev, idx]));
        storage.set(storage.KEYS.REVEALED_INDEXES, next);
        return next;
      });
    }
  );

  useCasualtyDeterioration({
    casualties,
    revealedIndexes,
    phase,
    onUpdate: () => {
      const updated = storage.get<Casualty[]>(storage.KEYS.CASUALTIES, []);
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
          storage.set(storage.KEYS.PHASE, payload);
          broadcast('phase', payload);
          window.location.reload();
          break;
        case 'casualties':
          const latest = storage.get<Casualty[]>(storage.KEYS.CASUALTIES, payload);
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
    const reveals = storage.get<number[]>(storage.KEYS.REVEALED_INDEXES, []);
    setRevealedIndexes(reveals);
  }, [phase]);

  const handleAdd = () => {
    const list = [...casualties, generateCasualty()];
    setCasualties(list);
    storage.set(storage.KEYS.CASUALTIES, list);
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
    storage.set(storage.KEYS.CASUALTIES, updated);
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
    storage.set(storage.KEYS.AID_BAG, bag);
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