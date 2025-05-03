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

  const [aidBag, setAidBag] = useState<Record<string, number>>({});
  const [notifications, setNotifications] = useState<string[]>([]);
  const [phase, setPhase] = useState<string>('idle');
  // Configurable phase durations (minutes)
  const [packDuration, setPackDuration] = useState<number>(5);
  const [briefDuration, setBriefDuration] = useState<number>(5);
  const [triageLimit, setTriageLimit] = useState<number>(20);

  useEffect(() => {
    const load = async () => {
      const bag = await window.electronAPI.getItem('aidBag');
      const notes = await window.electronAPI.getItem('notifications');
      const savedPhase = await window.electronAPI.getItem('phase');
      const pack = await window.electronAPI.getItem('packDuration');
      const brief = await window.electronAPI.getItem('briefDuration');
      const triage = await window.electronAPI.getItem('triageLimit');

      setAidBag(bag ? JSON.parse(bag) : {});
      setNotifications(notes ? JSON.parse(notes) : []);
      setPhase(savedPhase || 'idle');
      setPackDuration(Number(pack) || 5);
      setBriefDuration(Number(brief) || 5);
      setTriageLimit(Number(triage) || 20);
    };
    load();
  }, []);

  useEffect(() => {
    window.electronAPI.setItem('aidBag', JSON.stringify(aidBag));
    channelRef.current?.postMessage({ type: 'aidBag', payload: aidBag });
  }, [aidBag]);

  useEffect(() => {
    window.electronAPI.setItem('notifications', JSON.stringify(notifications));
  }, [notifications]);

  useEffect(() => {
    window.electronAPI.setItem('phase', phase);
    channelRef.current?.postMessage({ type: 'phase', payload: phase });
  }, [phase]);

  useEffect(() => {
    window.electronAPI.setItem('packDuration', String(packDuration));
    channelRef.current?.postMessage({ type: 'settings:packDuration', payload: packDuration });
  }, [packDuration]);

  useEffect(() => {
    window.electronAPI.setItem('briefDuration', String(briefDuration));
    channelRef.current?.postMessage({ type: 'settings:briefDuration', payload: briefDuration });
  }, [briefDuration]);

  useEffect(() => {
    window.electronAPI.setItem('triageLimit', String(triageLimit));
    channelRef.current?.postMessage({ type: 'settings:triageLimit', payload: triageLimit });
  }, [triageLimit]);

  useEffect(() => {
    // Ensure initial localStorage value is respected on load
    const storedPhase = localStorage.getItem("phase");
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