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

export const TriageBoard: FC<TriageBoardProps> = ({
  aidBag,
  removeItem,
  notifications,
  setNotifications,
  phase,
}) => {
  const { broadcast, setAidBag } = useAppContext();
  const { onRequestResupply, resupplyDisabled } = useResupply();

  // Securely retrieve scenarioEndTime using electronAPI.getItem
  const [endTime, setEndTime] = useState<number>(0);
  useEffect(() => {
    const load = async () => {
      const raw = await window.electronAPI.getItem('scenarioEndTime');
      setEndTime(Number(raw || 0));
    };
    load();
  }, []);

  const timerLabel = useScenarioTimer(endTime, phase as any);
  const [secondsLeft, setSecondsLeft] = useState<number>(0);
  useEffect(() => {
    const [m, s] = timerLabel.split(':').map(Number);
    setSecondsLeft(m * 60 + s);
  }, [timerLabel]);
  const resupplyButtonDisabled = secondsLeft > 0 || resupplyDisabled;
  const disableLabel = resupplyButtonDisabled && secondsLeft > 0 ? `${secondsLeft}s` : '';

  const [casualties, setCasualties] = useState<Casualty[]>([]);
  useEffect(() => {
    const load = async () => {
      const stored = await window.electronAPI.getItem('casualties');
      const loaded: Casualty[] = stored ? JSON.parse(stored) : [];
      setCasualties([demoCasualty, ...loaded]);
    };
    load();
  }, []);

  const [revealedIndexes, setRevealedIndexes] = useState<number[]>([]);
  useEffect(() => {
    const load = async () => {
      const stored = await window.electronAPI.getItem('revealedIndexes');
      const parsed = stored ? JSON.parse(stored) : [0];
      setRevealedIndexes(parsed);
    };
    load();
  }, []);

  useEffect(() => {
    const reload = async () => {
      const stored = await window.electronAPI.getItem('casualties');
      if (!stored) return;
      const loaded: Casualty[] = JSON.parse(stored);
      setCasualties(loaded);
    };
    reload();
  }, [phase, broadcast]);

  const [initialCasualtyCount, setInitialCasualtyCount] = useState<number>(15);
  useEffect(() => {
    const load = async () => {
      const val = await window.electronAPI.getItem('casualtyCount');
      setInitialCasualtyCount(Number(val) || 15);
    };
    load();
  }, []);
  useCasualtyReveal(
    phase,
    initialCasualtyCount,
    true,
    async (idx: number) => {
      setRevealedIndexes(prev => {
        const next = Array.from(new Set([...prev, idx]));
        window.electronAPI.setItem('revealedIndexes', JSON.stringify(next));
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
    channel.onmessage = async event => {
      const { type, payload } = event.data || {};
      switch (type) {
        case 'phase':
          await window.electronAPI.setItem('phase', payload);
          broadcast('phase', payload);
          window.location.reload();
          break;
        case 'aidBag':
          setAidBag(payload);
          break;
        case 'casualties':
          setCasualties(payload);
          break;
        case 'notifications':
          setNotifications(payload);
          break;
        default:
          break;
      }
    };
    return () => channel.close();
  }, [broadcast, setAidBag, setNotifications]);

  // Render the triage board UI
  return (
    <div>
      <NotificationPanel
        notifications={notifications}
        onRequestResupply={() =>
          onRequestResupply(aidBag, setAidBag, setNotifications, setCasualties)
        }
        resupplyDisabled={resupplyButtonDisabled}
        disableLabel={disableLabel}
      />
      <div style={{ marginTop: '2rem' }}>
        <CasualtyGrid
          aidBag={aidBag}
          casualties={casualties}
          revealedIndexes={revealedIndexes}
          phase={phase}
          removeItem={removeItem}
          handleApplyItem={() => {}}
          setNotifications={setNotifications}
        />
      </div>
      <div style={{ marginTop: '2rem', fontWeight: 'bold' }}>
        Scenario Timer: {timerLabel}
      </div>
    </div>
  );
};