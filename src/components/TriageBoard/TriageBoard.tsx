import React, { FC } from 'react';
import NotificationPanel from './NotificationPanel';
import { Casualty, Intervention } from '../../types';
import { generateCasualty } from '../casualtyGenerator/casualtyGenerator';
import useCasualtyDeterioration from '../../hooks/useCasualtyDeterioration';
import CasualtyGrid from './CasualtyGrid';

interface TriageBoardProps {
  aidBag: Record<string, number>;
  removeItem: (item: string) => void;
  notifications: string[];
  setNotifications: React.Dispatch<React.SetStateAction<string[]>>;
  phase: string;
}

const interventionAliases: Record<string, string[]> = {
  "Tourniquet": ["Combat Application Tourniquet (C-A-T)", "Tourniquet"],
  "Wound Packing": ["Combat Gauze Hemostatic Dressing", "Compressed Gauze"],
  "Chest Seal": ["HyFin Chest Seal ", "Chest Seal"],
  "Needle Decompression": ["Needle Decompression Kit (14 GA x 3.25 IN)", "Needle Decompression"],
  "Cric": ["CRICKIT", "Cric"],
  "Pelvic Binder": ["Pelvic Binder"],
  "IV Fluid NS": ["IV Fluid NS"]
};

export const isStabilized = (casualty: Casualty): boolean => {
  if (!Array.isArray(casualty.requiredInterventions) || casualty.requiredInterventions.length === 0) return true;

  return casualty.requiredInterventions.every((req: string) => {
    const aliases = interventionAliases[req] || [req];
    if (req === "Wound Packing") {
      const hasCombat = casualty.interventions.some((i: Intervention) => aliases.includes(i.name) && i.name.includes("Combat Gauze"));
      const hasCompressed = casualty.interventions.some((i: Intervention) => aliases.includes(i.name) && i.name.includes("Compressed Gauze"));
      return hasCombat && hasCompressed;
    }
    return casualty.interventions.some((i: Intervention) => aliases.includes(i.name) && i.count > 0);
  });
};

const TriageBoard: FC<TriageBoardProps> = ({
  aidBag,
  removeItem,
  notifications,
  setNotifications,
  phase
}) => { 
  console.log("LocalStorage casualties:", JSON.parse(localStorage.getItem("casualties") || "[]"));
  
  const RESUPPLY_COOLDOWN = 120000; // 2 minutes
  const [resupplyCountdown, setResupplyCountdown] = React.useState(0);
  React.useEffect(() => {
    const interval = setInterval(() => {
      const last = Number(localStorage.getItem("lastResupplyTime") || "0");
      const elapsed = Date.now() - last;
      setResupplyCountdown(elapsed < RESUPPLY_COOLDOWN ? RESUPPLY_COOLDOWN - elapsed : 0);
    }, 500);
    return () => clearInterval(interval);
  }, []);
  const resupplyDisabled = resupplyCountdown > 0;
  const disableLabel = resupplyDisabled
    ? `${Math.ceil(resupplyCountdown / 1000)}s`
    : '';
  
  React.useEffect(() => {
    const channel = new BroadcastChannel("triage-updates");
    channel.onmessage = (event) => {
      if (event.data?.type === "phase") {
        const newPhase = event.data.payload;
        localStorage.setItem("phase", newPhase);
        channel.postMessage({ type: "phase", payload: newPhase }); // forward phase
        window.location.reload();
      }
      if (event.data?.type === "timer") {
        localStorage.setItem("scenarioEndTime", event.data.payload);
      }
      if (event.data?.type === "notifications") {
        setNotifications(n => [...event.data.payload, ...n].slice(0, 10));
      }
      if (event.data?.type === "reset") {
        window.location.reload();
      }
    };
    return () => channel.close();
  }, [setNotifications]);

  const [revealedIndexes, setRevealedIndexes] = React.useState<number[]>(() => {
    const stored = localStorage.getItem("revealedIndexes");
    return stored ? (JSON.parse(stored) as number[]) : [0];
  });
  const janeDoe = React.useMemo(() => ({
    name: "Jane Doe",
    injury: "Amputation of left leg due to IED blast",
    vitals: {
      pulse: 130,
      respiratory: 28,
      bp: "80/60",
      spo2: 85,
      airway: "Clear",
      steth: "Normal"
    },
    triage: "",
    interventions: [],
    deteriorated: false,
    requiredInterventions: ["Tourniquet"],
    startTime: Date.now(),
    treatmentTime: null,
    triageTime: null,
    isDemo: true
  }), []);
  const [casualties, setCasualties] = React.useState<Casualty[]>(() => {
    const stored = localStorage.getItem("casualties");
    const loaded = stored ? (JSON.parse(stored) as Casualty[]) : [];
    return loaded.length === 0 ? [janeDoe] : loaded;
  });
  useCasualtyDeterioration({
    casualties,
    revealedIndexes,
    phase,
    onUpdate: setCasualties,
    onNotify: msg => setNotifications(n => [msg, ...n].slice(0,10)),
  });

  React.useEffect(() => {
    if (phase === "triage") {
      const stored = localStorage.getItem("casualties");
      const existing = stored ? JSON.parse(stored) : [];
  
      if (existing.length > 0) {
        setCasualties(existing);
        console.log("Restoring casualties from localStorage:", existing);
        const revealedStored = localStorage.getItem("revealedIndexes");
        const revealed = revealedStored ? JSON.parse(revealedStored) : [0];
        setRevealedIndexes(revealed);
        console.log("Restoring revealedIndexes:", revealed);
        const autoReveal = localStorage.getItem("autoReveal") !== "false";
        if (autoReveal) {
          const totalDuration = 15 * 60 * 1000;
          const randomDelays = Array.from({ length: existing.length - 1 }, () =>
            Math.floor(Math.random() * totalDuration)
          ).sort((a, b) => a - b);
          console.log("Scheduling casualty reveals:", randomDelays.map((d, i) => `Index ${i + 1} in ${d / 1000}s`));
          randomDelays.forEach((delay, i) => {
            setTimeout(() => {
              console.log(`Revealing casualty index ${i + 1}`);
              setRevealedIndexes(prev => [...new Set([...prev, i + 1])]);
            }, delay);
          });
        }
      }
    }
  }, [phase, casualties]);

  React.useEffect(() => {
    if (phase !== "triage") {
      const stored = localStorage.getItem("casualties");
      const parsed = stored ? JSON.parse(stored) : [];
      if (parsed.length === 0) {
        setCasualties([janeDoe]);
        setRevealedIndexes([0]);
      } else {
        setCasualties(parsed);
      }
    }
  }, [phase, janeDoe]);
  React.useEffect(() => {
    localStorage.setItem("notifications", JSON.stringify(notifications));
  }, [notifications]);

  React.useEffect(() => {
    localStorage.setItem("casualties", JSON.stringify(casualties));
  }, [casualties]);
  
  React.useEffect(() => {
    const checkInterval = () => Math.floor(Math.random() * (60 - 45 + 1) + 45) * 1000;
    const interval = setInterval(() => {
      setCasualties((prev): Casualty[] => {
        const updated: Casualty[] = prev.map((c, i) => {
          if (
            !revealedIndexes.includes(i) ||
            !Array.isArray(c.requiredInterventions) ||
            c.requiredInterventions.length === 0 ||
            c.isDemo
          ) return c;

          const wasStable = c.deteriorated === false;
          const nowStable = isStabilized(c);

          if (!wasStable && nowStable) {
            setNotifications(n => [`${c.name} has been stabilized.`, ...n].slice(0, 10));
          }

          return nowStable
            ? { ...c, deteriorated: false }
            : c;
        });

        localStorage.setItem("casualties", JSON.stringify(updated));
        return updated;
      });
    }, checkInterval());
 
    return () => clearInterval(interval);
  }, [revealedIndexes, setNotifications]);

  React.useEffect(() => {
    const endTimer = setTimeout(() => {
      console.log("Scenario ended after 20 minutes");
      localStorage.setItem("casualties", JSON.stringify(casualties));
    }, 20 * 60 * 1000);
    return () => clearTimeout(endTimer);
  }, [casualties]);

  React.useEffect(() => {
    const interval = setInterval(() => {
      const points = Number(localStorage.getItem("penaltyPoints") || 0);
      if (points >= 120) {
        const newCount = Math.floor(Math.random() * 3) + 1;
        setCasualties((prev: Casualty[]): Casualty[] => {
          const newCasualties = Array.from({ length: newCount }, generateCasualty) as Casualty[];
          const updatedCasualties = [...prev, ...newCasualties];
          setRevealedIndexes(prevIndexes => [
            ...prevIndexes,
            ...newCasualties.map((_, i) => prev.length + i)
          ]);
          return updatedCasualties;
        });
        setNotifications(n => [`Escalation triggered: ${newCount} new casualty${newCount > 1 ? 'ies' : ''} added.`].concat(n).slice(0, 10));
        localStorage.setItem("penaltyPoints", "0");
      }
    }, 2000);
    return () => clearInterval(interval);
  }, [setNotifications]);


  const handleApplyItem = (index: number, item: string): void => {
    const updated = [...casualties];
    const casualty = updated[index];
    const existing = casualty.interventions.find(i => i.name === item);
    if (existing) {
      existing.count += 1;
    } else {
      casualty.interventions.push({ name: item, count: 1 });
    }
    // Combined wound-packing logic
    if (casualty.requiredInterventions.includes("Wound Packing")) {
      const hasCombat = casualty.interventions.some(i => i.name.includes("Combat Gauze"));
      const hasCompressed = casualty.interventions.some(i => i.name.includes("Compressed Gauze"));
      if (hasCombat && hasCompressed && !casualty.interventions.find(i => i.name === "Wound Packing")) {
        casualty.interventions.push({ name: "Wound Packing", count: 1 });
        setNotifications(n => ["Wound Packing applied.", ...n].slice(0, 10));
      }
    }
    if (!casualty.treatmentTime) {
      casualty.treatmentTime = Math.floor((Date.now() - casualty.startTime) / 1000);
    }
    setCasualties(updated);
    removeItem(item);
    new BroadcastChannel("triage-updates").postMessage({ type: "casualties", payload: updated });
  };

  React.useEffect(() => {
    localStorage.setItem("revealedIndexes", JSON.stringify(revealedIndexes));
  }, [revealedIndexes]);


  return (
    <>
      <NotificationPanel
        notifications={notifications}
        onRequestResupply={() => {
          const now = Date.now();
          const last = Number(localStorage.getItem("lastResupplyTime") || "0");
          if (now - last < 120000) {
            const warn = "No one is available to retrieve supplies right now. Try again later.";
            setNotifications(n => [warn, ...n].slice(0, 10));
            return;
          }
          localStorage.setItem("lastResupplyTime", String(now));
          const resuppliesUsed = Number(localStorage.getItem("resuppliesUsed") || "0") + 1;
          localStorage.setItem("resuppliesUsed", String(resuppliesUsed));
          const penalty = Number(localStorage.getItem("penaltyPoints") || "0") + 30;
          localStorage.setItem("penaltyPoints", String(penalty));
          const message = `Resupply requested. +30 point penalty (${resuppliesUsed} used)`;
          setNotifications(n => [message, ...n].slice(0, 10));
        }}
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
    </>
  );
}
export default TriageBoard;