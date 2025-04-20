// @ts-ignore: allow importing CSS modules
import styles from './TriageBoard.module.css';
/* eslint-disable @typescript-eslint/no-unused-vars, react-hooks/exhaustive-deps */
// @ts-nocheck
import React, { FC, useEffect, useState, useMemo, useRef } from 'react';
import { Casualty, Intervention } from '../../types';
import { generateCasualty } from '../casualtyGenerator/casualtyGenerator';
import InstructorDashboard from '../InstructorDashboard/InstructorDashboard';
import useScenarioTimer from '../../hooks/useScenarioTimer';
import useCasualtyDeterioration from '../../hooks/useCasualtyDeterioration';
import CasualtyCard from '../CasualtyCard/CasualtyCard';

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
  if (!Array.isArray(casualty.requiredInterventions) || casualty.requiredInterventions.length === 0) return false;

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

function getRandomInRange(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

const TriageBoard: FC<TriageBoardProps> = ({
  aidBag,
  removeItem,
  notifications,
  setNotifications,
  phase
}) => {
  const showInstructor = phase === "instructor";
  console.log("LocalStorage casualties:", JSON.parse(localStorage.getItem("casualties") || "[]"));
  useEffect(() => {
    const channel = new BroadcastChannel("triage-updates");
    channel.onmessage = (event) => {
      const channel = new BroadcastChannel("triage-updates");
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
  }, []);

  const [revealedIndexes, setRevealedIndexes] = useState<number[]>(() => {
    const stored = localStorage.getItem("revealedIndexes");
    return stored ? (JSON.parse(stored) as number[]) : [0];
  });
  const janeDoe = useMemo(() => ({
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
  const [casualties, setCasualties] = useState<Casualty[]>(() => {
    const stored = localStorage.getItem("casualties");
    const loaded = stored ? (JSON.parse(stored) as Casualty[]) : [];
    return loaded.length === 0 ? [janeDoe] : loaded;
  });
  const endTime = Number(localStorage.getItem('scenarioEndTime') || 0);
  const scenarioTimer = useScenarioTimer(endTime, phase as 'setup' | 'scenario-brief' | 'triage' | 'aar');
  useCasualtyDeterioration({
    casualties,
    revealedIndexes,
    phase,
    onUpdate: setCasualties,
    onNotify: (msg: string) => setNotifications(n => [msg, ...n].slice(0,10)),
  });

  useEffect(() => {
    if (phase === "triage") {
      setRevealedIndexes([0]);

      const revealSchedule = casualties.map((_, index) => {
        const delay = index === 0 ? getRandomInRange(25, 30) : getRandomInRange(45, 60);
        return delay * 1000; // Convert to milliseconds
      });

      revealSchedule.forEach((delay, index) => {
        setTimeout(() => {
          setRevealedIndexes((prev) => [...prev, index]);
          localStorage.setItem("revealedIndexes", JSON.stringify([...prev, index]));
        }, delay);
      });
    }
  }, [phase, casualties]);

  useEffect(() => {
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
  useEffect(() => {
    localStorage.setItem("notifications", JSON.stringify(notifications));
  }, [notifications]);

  useEffect(() => {
    localStorage.setItem("casualties", JSON.stringify(casualties));
  }, [casualties]);
  
  useEffect(() => {
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
  }, [revealedIndexes]);

  useEffect(() => {
    const endTimer = setTimeout(() => {
      console.log("Scenario ended after 20 minutes");
      localStorage.setItem("casualties", JSON.stringify(casualties));
    }, 20 * 60 * 1000);
    return () => clearTimeout(endTimer);
  }, [casualties]);

  useEffect(() => {
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
  }, []);

  const handleTriageChange = (index: number, value: string): void => {
    setCasualties(prev => {
      const updated = [...prev];
      updated[index].triage = value;
      if (!updated[index].triageTime) {
        updated[index].triageTime = Math.floor((Date.now() - updated[index].startTime) / 1000);
      }
      localStorage.setItem("casualties", JSON.stringify(updated));
      return updated;
    });
  };

  const handleApplyItem = (index: number, item: string): void => {
    const casualtyName = casualties[index].name;
    setCasualties(prev => {
      const updated = prev.map(c => ({
        ...c,
        interventions: c.interventions.map((i: Intervention) => ({ ...i }))
      }));
      const casualty = updated[index];
      const existing = casualty.interventions.find((i: Intervention) => i.name === item);

      if (existing) {
        existing.count += 1;
      } else {
        casualty.interventions.push({ name: item, count: 1 });
      }

      if (!casualty.treatmentTime) {
        const cricNames = ["CRICKIT", "Cric"];
        if (cricNames.includes(item)) {
          const current = Number(localStorage.getItem("penaltyPoints") || 0);
          localStorage.setItem("penaltyPoints", String(current + 40));
          console.log(`${casualtyName}: +40 penalty for using ${item}`);
        }
        casualty.treatmentTime = Math.floor((Date.now() - casualty.startTime) / 1000);
      }

      if (!casualty.isDemo && isStabilized(casualty)) {
        casualty.deteriorated = false;
        setNotifications(n => [`${casualty.name} has been stabilized.`, ...n].slice(0, 10));
      }

      return updated;
    });

    if (!casualties[index].isDemo) {
      removeItem(item);
    }
  };

  useEffect(() => {
    localStorage.setItem("revealedIndexes", JSON.stringify(revealedIndexes));
  }, [revealedIndexes]);

  const [highlightedCasualtyIndex, setHighlightedCasualtyIndex] = useState<number | null>(null);

  return (
    <>
  <section>
  <h4>Notifications</h4>
  <ul id="notification-list" className="compact-list">
    {notifications.map((note, index) => (
      <li key={index}>{note}</li>
    ))}
  </ul>
  <button
    onClick={() => {
      const resuppliesUsed = Number(localStorage.getItem("resuppliesUsed") || "0") + 1;
      localStorage.setItem("resuppliesUsed", String(resuppliesUsed));

      const penalty = Number(localStorage.getItem("penaltyPoints") || "0") + 30;
      localStorage.setItem("penaltyPoints", String(penalty));

      const message = `Resupply requested. +30s penalty (${resuppliesUsed} used)`;
      setNotifications(n => [message, ...n].slice(0, 10));

      const channel = new BroadcastChannel("triage-updates");
      channel.postMessage({ type: "notifications", payload: [message] });

      if (resuppliesUsed === 3) {
        let casualties = [];
        try {
          casualties = JSON.parse(localStorage.getItem("casualties") || "[]");
        } catch (error) {
          console.error("Failed to parse casualties from localStorage:", error);
        }

        const snuffy = {
          name: "PVT Snuffy",
          injury: "Hit by falling debris while carrying aid bag",
          vitals: {
            pulse: 110,
            respiratory: 24,
            bp: "100/70",
            spo2: 96,
            airway: "Clear",
            steth: "Normal"
          },
          triage: "",
          interventions: [],
          deteriorated: false,
          requiredInterventions: ["Wound Packing"],
          startTime: Date.now(),
          treatmentTime: null,
          triageTime: null,
          isDemo: false
        };

        const updated = [...casualties, snuffy];
        localStorage.setItem("casualties", JSON.stringify(updated));

        channel.postMessage({ type: "casualties", payload: updated });
        channel.postMessage({ type: "notifications", payload: ["⚠️ Snuffy injured during resupply and needs care."] });
      }

      channel.close();
    }}
  >
    Request Resupply
  </button>
</section>
    <div className="casualty-grid">
      {casualties
        .map((casualty, index) => ({ casualty, index }))
        .filter(({ casualty, index }) => {
          if (casualty.isDemo && phase === "triage") return false;
          return revealedIndexes.includes(index) || casualty.isDemo;
        })
        .sort((a, b) => {
          const triageOrder = { "": 0, "Immediate": 1, "Delayed": 2, "Minimal": 3, "Expectant": 4 };
          if (!a.casualty.triage && !b.casualty.triage) {
            return a.casualty.startTime - b.casualty.startTime;
          }
          if (!a.casualty.triage) return -1;
          if (!b.casualty.triage) return 1;
          return triageOrder[a.casualty.triage as keyof typeof triageOrder] - triageOrder[b.casualty.triage as keyof typeof triageOrder];
        })
        .map(({ casualty, index }) => {
          console.log("Rendering casualty:", casualty.name, "Index:", index);
          return (
          <div
            key={index}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              const item = e.dataTransfer.getData("text/plain");
              if (item) {
                handleApplyItem(index, item);
                e.dataTransfer.clearData();
              }
            }}
          >
           <CasualtyCard
  aidBag={aidBag}
  removeItem={removeItem}
  casualty={casualty}
  isHighlighted={highlightedCasualtyIndex === index}
  onTriageChange={(value: string) => {
    const updated = [...casualties];
    updated[index].triage = value;
    updated[index].triageTime = Math.floor((Date.now() - updated[index].startTime) / 1000);
    setCasualties(updated);
    localStorage.setItem("casualties", JSON.stringify(updated));
    new BroadcastChannel("triage-updates").postMessage({ type: "casualties", payload: updated });
  }}
  applyItem={(item: string) => {
    const updated = [...casualties];
    const existing = updated[index].interventions.find(i => i.name === item);
    if (existing) {
      existing.count += 1;
    } else {
      updated[index].interventions.push({ name: item, count: 1 });
    }
    updated[index].treatmentTime = Math.floor((Date.now() - updated[index].startTime) / 1000);
    setCasualties(updated);
    localStorage.setItem("casualties", JSON.stringify(updated));
    new BroadcastChannel("triage-updates").postMessage({ type: "casualties", payload: updated });
  }}
/>
          </div>
        )})}
      </div>
    </>
  );
}
export default TriageBoard;

