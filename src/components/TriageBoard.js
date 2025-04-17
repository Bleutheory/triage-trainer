import React from 'react';
import { useEffect, useState } from 'react';
import CasualtyCard from './CasualtyCard';
import injuryProfiles from '../data/injuryProfiles.js';
import { generateCasualty } from './casualtyGenerator';
// Manual fixes: Casualty Reveal on Escalation, Prevent Re-Deterioration, Show Snuffy immediately, AAR "Deteriorated?" column, and Vital Reveal Penalty Logging are fully implemented.

export default TriageBoard;

const interventionAliases = {
  "Tourniquet": ["Combat Application Tourniquet (C-A-T)", "Tourniquet"],
  "Wound Packing": ["Combat Gauze Hemostatic Dressing", "Compressed Gauze"],
  "Chest Seal": ["HyFin Chest Seal ", "Chest Seal"],
  "Needle Decompression": ["Needle Decompression Kit (14 GA x 3.25 IN)", "Needle Decompression"],
  "Cric": ["CRICKIT", "Cric"],
  "Pelvic Binder": ["Pelvic Binder"],
  "IV Fluid NS": ["IV Fluid NS"]
};

const isStabilized = (casualty) =>
  (casualty.requiredInterventions || []).every(req => {
    const aliases = interventionAliases[req] || [req];
    if (req === "Wound Packing") {
      const hasCombat = casualty.interventions.some(i => aliases.includes(i.name) && i.name.includes("Combat Gauze"));
      const hasCompressed = casualty.interventions.some(i => aliases.includes(i.name) && i.name.includes("Compressed Gauze"));
      return hasCombat && hasCompressed;
    }
    return casualty.interventions.some(i => aliases.includes(i.name) && i.count > 0);
  });
function getRandomInRange(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function TriageBoard({ aidBag, removeItem, phase }) {
  console.log("LocalStorage casualties:", JSON.parse(localStorage.getItem("casualties")));
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
      if (event.data?.type === "reset") {
        localStorage.clear();
        channel.postMessage({ type: "reset" }); // forward reset
        window.location.reload();
      }
      if (event.data?.type === "timer") {
        localStorage.setItem("scenarioEndTime", event.data.payload);
      }
      if (event.data?.type === "notifications") {
        setNotifications(n => [...event.data.payload, ...n].slice(0, 10));
      }
    };
    return () => channel.close();
  }, []);
  const [notifications, setNotifications] = useState(() => {
    const stored = localStorage.getItem("notifications");
    return stored ? JSON.parse(stored) : [];
  });
  const [scenarioTimer, setScenarioTimer] = useState("--:--");

  useEffect(() => {
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
 
        return;
      }

      const count = Math.floor(Math.random() * 6) + 15;
      const generated = Array.from({ length: count }, generateCasualty);
      setCasualties(generated);
      setRevealedIndexes([0]);

      const autoReveal = localStorage.getItem("autoReveal") !== "false";
      if (autoReveal) {
        const totalDuration = 15 * 60 * 1000;
        const randomDelays = Array.from({ length: generated.length - 1 }, () =>
          Math.floor(Math.random() * totalDuration)
        ).sort((a, b) => a - b); // sort so casualties appear in order
 
        randomDelays.forEach((delay, i) => {
          setTimeout(() => {
            setRevealedIndexes(prev => [...new Set([...prev, i + 1])]);
          }, delay);
        });
      }

      localStorage.setItem("casualties", JSON.stringify(generated));
    }
  }, [phase]);
  const [penaltyPoints, setPenaltyPoints] = useState(0);
  const [revealedIndexes, setRevealedIndexes] = useState(() => {
    const stored = localStorage.getItem("revealedIndexes");
    return stored ? JSON.parse(stored) : [0];
  });
  const janeDoe = {
    name: "Jane Doe",
    injury: "Amputation of left leg due to IED blast",
    vitals: {
      pulse: 130,
      respiratory: 28,
      bp: "80/60",
      spo2: "85%",
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
  };
  const generateInitialCasualties = () => {
    return [janeDoe]; // Always start with just Jane Doe
  };
  const [casualties, setCasualties] = useState(() => {
    const stored = localStorage.getItem("casualties");
    const loaded = stored ? JSON.parse(stored) : [];
    return loaded.length === 0 ? [janeDoe] : loaded;
  });

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
  }, [phase]);
  useEffect(() => {
    localStorage.setItem("notifications", JSON.stringify(notifications));
  }, [notifications]);

  useEffect(() => {
    localStorage.setItem("casualties", JSON.stringify(casualties));
  }, [casualties]);

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
        setCasualties(prev => {
          const newCasualties = Array.from({ length: newCount }, generateCasualty);
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

  const handleTriageChange = (index, value) => {
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

  const handleApplyItem = (index, item) => {
    const casualtyName = casualties[index].name;
    setCasualties(prev => {
      const updated = prev.map(c => ({
        ...c,
        interventions: c.interventions.map(i => ({ ...i }))
      }));
      const casualty = updated[index];
      const existing = casualty.interventions.find(i => i.name === item);

      if (existing) {
        existing.count += 1;
      } else {
        casualty.interventions.push({ name: item, count: 1 });
      }

      if (!casualty.treatmentTime) {
        const cricNames = ["CRICKIT", "Cric"];
        if (cricNames.includes(item)) {
          const current = Number(localStorage.getItem("penaltyPoints") || 0);
          localStorage.setItem("penaltyPoints", current + 40);
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

  useEffect(() => {
    const timerInterval = setInterval(() => {
      const endTime = Number(localStorage.getItem("scenarioEndTime"));
      if (!endTime || phase !== "triage") {
        setScenarioTimer("--:--");
        return;
      }
      const remaining = Math.max(0, endTime - Date.now());
      const minutes = Math.floor(remaining / 60000).toString().padStart(2, '0');
      const seconds = Math.floor((remaining % 60000) / 1000).toString().padStart(2, '0');
      setScenarioTimer(`${minutes}:${seconds}`);
    }, 1000);

    return () => clearInterval(timerInterval);
  }, [phase]);

  useEffect(() => {
    const scheduleDeterioration = (index) => {
      const delay = Math.floor(Math.random() * (90 - 45 + 1) + 45) * 1000;
      return setTimeout(() => {
        setCasualties(prev => {
          const updated = prev.map((c, i) => {
            if (i !== index || c.isDemo || !revealedIndexes.includes(i)) return c;
            if (isStabilized(c)) return c;

            const dynamic = c.dynamicVitals || {};
            const get = (range) => Array.isArray(range) ? getRandomInRange(range[0], range[1]) : range;

            const newVitals = {
              pulse: get(dynamic.pulse),
              respiratory: get(dynamic.respiratory),
              bp: `${get([dynamic.bp[0], dynamic.bp[1]])}/${get([40, 60])}`,
              spo2: `${get(dynamic.spo2)}%`,
              airway: c.vitals.airway,
              steth: c.vitals.steth
            };

            setNotifications(n => [`${c.name}: Vital signs worsening due to lack of treatment.`, ...n].slice(0, 10));
            setPenaltyPoints(p => p + 1);

            return { ...c, vitals: newVitals, deteriorated: true };
          });

          localStorage.setItem("casualties", JSON.stringify(updated));

          // Reschedule if still not stabilized
          if (!isStabilized(updated[index])) {
            timers[index] = scheduleDeterioration(index);
          }

          return updated;
        });
      }, delay);
    };

    const timers = [];

    casualties.forEach((_, index) => {
      if (revealedIndexes.includes(index)) {
        timers[index] = scheduleDeterioration(index);
      }
    });

    return () => timers.forEach(timer => clearTimeout(timer));
  }, [casualties, revealedIndexes]);

  return (
    <>
      <section>
        <h4>Notifications</h4>
        <ul id="notification-list" className="compact-list">
          {notifications.map((note, index) => (
            <li key={index}>{note}</li>
          ))}
        </ul>
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
          return triageOrder[a.casualty.triage] - triageOrder[b.casualty.triage];
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
              casualty={casualty}
              applyItem={(item) => handleApplyItem(index, item)}
              onTriageChange={(value) => handleTriageChange(index, value)}
              isHighlighted={notifications.some(note => note.includes(casualty.name))}
            />
          </div>
        )})}
      </div>
    </>
  );
}
