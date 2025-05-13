import { storage } from '../utils/storage';
import React, { createContext, useContext, useState, ReactNode, Dispatch, SetStateAction, useEffect, useRef } from 'react';

interface AppContextProps {
  aidBag: Record<string, number>;
  setAidBag: Dispatch<SetStateAction<Record<string, number>>>;
  notifications: string[];
  setNotifications: Dispatch<SetStateAction<string[]>>;
  phase: string;
  setPhase: Dispatch<SetStateAction<string>>;
  broadcast: (type: string, payload: any) => void;
  packDuration: number;
  setPackDuration: Dispatch<SetStateAction<number>>;
  briefDuration: number;
  setBriefDuration: Dispatch<SetStateAction<number>>;
  triageLimit: number;
  setTriageLimit: Dispatch<SetStateAction<number>>;
}

const AppContext = createContext<AppContextProps | undefined>(undefined);

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const channelRef = useRef<BroadcastChannel | null>(null);
  // Helper to broadcast messages on the shared channel
  const broadcast = (type: string, payload: any) => {
    if (channelRef.current) {
      channelRef.current.postMessage({ type, payload });
    }
  };

  const [aidBag, setAidBag] = useState<Record<string, number>>(
    () => storage.get<Record<string, number>>(storage.KEYS.AID_BAG, {})
  );

  const [notifications, setNotifications] = useState<string[]>(
    () => storage.get<string[]>(storage.KEYS.NOTIFICATIONS, [])
  );

  const [phase, setPhase] = useState<string>(
    () => storage.get<string>(storage.KEYS.PHASE, 'setup')
  );
  // Configurable phase durations (minutes)
  const [packDuration, setPackDuration] = useState<number>(
    () => storage.get<number>(storage.KEYS.PACK_DURATION, 5)
  );
  const [briefDuration, setBriefDuration] = useState<number>(
    () => storage.get<number>(storage.KEYS.BRIEF_DURATION, 5)
  );
  const [triageLimit, setTriageLimit] = useState<number>(
    () => storage.get<number>(storage.KEYS.TRIAGE_LIMIT, 20)
  );

  useEffect(() => {
    storage.set(storage.KEYS.AID_BAG, aidBag);
    channelRef.current?.postMessage({ type: 'aidBag', payload: aidBag });
  }, [aidBag]);

  useEffect(() => {
    storage.set(storage.KEYS.NOTIFICATIONS, notifications);
    // channelRef.current?.postMessage({ type: 'notifications', payload: notifications });
  }, [notifications]);

  useEffect(() => {
    storage.set(storage.KEYS.PHASE, phase);
    channelRef.current?.postMessage({ type: 'phase', payload: phase });
  }, [phase]);
  
  // Persist and broadcast pack duration
  useEffect(() => {
    storage.set(storage.KEYS.PACK_DURATION, packDuration);
    channelRef.current?.postMessage({ type: 'settings:packDuration', payload: packDuration });
  }, [packDuration]);
  
  // Persist and broadcast brief duration
  useEffect(() => {
    storage.set(storage.KEYS.BRIEF_DURATION, briefDuration);
    channelRef.current?.postMessage({ type: 'settings:briefDuration', payload: briefDuration });
  }, [briefDuration]);
  
  // Persist and broadcast triage time limit
  useEffect(() => {
    storage.set(storage.KEYS.TRIAGE_LIMIT, triageLimit);
    channelRef.current?.postMessage({ type: 'settings:triageLimit', payload: triageLimit });
  }, [triageLimit]);

  useEffect(() => {
    // Ensure initial localStorage value is respected on load
    const storedPhase = storage.get<string>(storage.KEYS.PHASE, phase);
    if (storedPhase && storedPhase !== phase) {
      setPhase(storedPhase);
    }

    // Only create BroadcastChannel in non-test environments
    if (process.env.NODE_ENV !== 'test') {
      const channel = new BroadcastChannel('triage-updates');
      channelRef.current = channel;
      channel.onmessage = (event) => {
        const { type, payload } = event.data || {};
        if (type === 'aidBag') {
          setAidBag(payload);
        }
        if (type === 'notifications') {
          setNotifications(payload);
        }
        if (type === 'phase' && typeof payload === 'string') {
          setPhase(payload);
        }
      };
      return () => {
        channel.close();
        channelRef.current = null;
      };
    }
    // In test env, do nothing
    return () => {};
  }, [phase]);

  return (
    <AppContext.Provider value={{
      aidBag, setAidBag,
      notifications, setNotifications,
      phase, setPhase,
      broadcast,
      packDuration, setPackDuration,
      briefDuration, setBriefDuration,
      triageLimit, setTriageLimit
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useAppContext must be used within AppProvider');
  return ctx;
};