import React, { createContext, useContext, useState, ReactNode, Dispatch, SetStateAction, useEffect, useRef } from 'react';

interface AppContextProps {
  aidBag: Record<string, number>;
  setAidBag: Dispatch<SetStateAction<Record<string, number>>>;
  notifications: string[];
  setNotifications: Dispatch<SetStateAction<string[]>>;
  phase: string;
  setPhase: Dispatch<SetStateAction<string>>;
}

const AppContext = createContext<AppContextProps | undefined>(undefined);

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const channelRef = useRef<BroadcastChannel | null>(null);

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

  useEffect(() => {
    // Ensure initial localStorage value is respected on load
    const storedPhase = localStorage.getItem("phase");
    if (storedPhase && storedPhase !== phase) {
      setPhase(storedPhase);
    }

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
  }, [phase]);

  return (
    <AppContext.Provider value={{ aidBag, setAidBag, notifications, setNotifications, phase, setPhase }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useAppContext must be used within AppProvider');
  return ctx;
};