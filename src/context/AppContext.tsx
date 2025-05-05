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

  const [aidBag, setAidBag] = useState<Record<string, number>>(() => {
    const stored = localStorage.getItem('aidBag');
    return stored ? JSON.parse(stored) : {};
  });

  const [notifications, setNotifications] = useState<string[]>(() => {
    const stored = localStorage.getItem('notifications');
    return stored ? JSON.parse(stored) : [];
  });

  const [phase, setPhase] = useState<string>(() => {
    return localStorage.getItem('phase') || 'idle';
  });
  // Configurable phase durations (minutes)
  const [packDuration, setPackDuration] = useState<number>(() =>
    Number(localStorage.getItem('packDuration')) || 5
  );
  const [briefDuration, setBriefDuration] = useState<number>(() =>
    Number(localStorage.getItem('briefDuration')) || 5
  );
  const [triageLimit, setTriageLimit] = useState<number>(() =>
    Number(localStorage.getItem('triageLimit')) || 20
  );

  useEffect(() => {
    localStorage.setItem('aidBag', JSON.stringify(aidBag));
    channelRef.current?.postMessage({ type: 'aidBag', payload: aidBag });
  }, [aidBag]);

  useEffect(() => {
    localStorage.setItem('notifications', JSON.stringify(notifications));
    // channelRef.current?.postMessage({ type: 'notifications', payload: notifications });
  }, [notifications]);

  useEffect(() => {
    localStorage.setItem('phase', phase);
    channelRef.current?.postMessage({ type: 'phase', payload: phase });
  }, [phase]);
  
  // Persist and broadcast pack duration
  useEffect(() => {
    localStorage.setItem('packDuration', String(packDuration));
    channelRef.current?.postMessage({ type: 'settings:packDuration', payload: packDuration });
  }, [packDuration]);
  
  // Persist and broadcast brief duration
  useEffect(() => {
    localStorage.setItem('briefDuration', String(briefDuration));
    channelRef.current?.postMessage({ type: 'settings:briefDuration', payload: briefDuration });
  }, [briefDuration]);
  
  // Persist and broadcast triage time limit
  useEffect(() => {
    localStorage.setItem('triageLimit', String(triageLimit));
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