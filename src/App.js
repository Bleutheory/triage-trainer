import React from 'react';
import './App.css';
import './style.css';
import { useState, useEffect, useRef } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import InstructorDashboard from './components/InstructorDashboard';
import { generateCasualty, generateUniqueCasualties } from './components/casualtyGenerator';
import AidBagSetup from './components/AidBagSetup';
import ScenarioBrief from './components/ScenarioBrief';
import TriagePhase from './components/TriagePhase';
import AARPage from './components/AARPage';

function App() {
  const timerRef = useRef(null);
  const [aidBag, setAidBag] = useState({});
  const [notifications, setNotifications] = useState([]);
  const [currentPage, setCurrentPage] = useState("setup");
  const [startTime] = useState(Date.now());
  const [timerLabel, setTimerLabel] = useState("Timer: --:--");
  const [phase, setPhase] = useState("idle"); // "idle", "packing", "brief", "triage"
  const [resupplyInProgress, setResupplyInProgress] = useState(false);
  useEffect(() => {
    const channel = new BroadcastChannel("triage-updates");
    channel.onmessage = (event) => {
      switch(event.data?.type) {
        case "phase":
          setPhase(event.data.payload);
          if (event.data.payload === "triage") navigateTo("triage");
          if (event.data.payload === "brief") navigateTo("scenario-brief");
          if (event.data.payload === "packing") navigateTo("setup");
          if (event.data.payload === "aar") navigateTo("aar");
          break;
        case "timer-label":
          setTimerLabel(event.data.payload);
          break;
        case "aidBag":
          setAidBag(event.data.payload);
          break;
      }
    };
    return () => channel.close();
  }, []);
  useEffect(() => {
    if (phase === "packing") {
      const end = Date.now() + 5 * 60 * 1000;
      timerRef.current = setInterval(() => {
        const remaining = Math.max(0, end - Date.now());
        const minutes = Math.floor(remaining / 60000).toString().padStart(2, '0');
        const seconds = Math.floor((remaining % 60000) / 1000).toString().padStart(2, '0');
        setTimerLabel(`Packing Time Left: ${minutes}:${seconds}`);
        const channel = new BroadcastChannel("triage-updates");
        channel.postMessage({ type: "timer-label", payload: `Packing Time Left: ${minutes}:${seconds}` });
        if (remaining <= 0) {
          if (timerRef.current) clearInterval(timerRef.current);
          setAidBagLocked(true);
        }
      }, 1000);
    } else if (phase === "brief") {
      const end = Date.now() + 5 * 60 * 1000;
      timerRef.current = setInterval(() => {
        const remaining = Math.max(0, end - Date.now());
        const minutes = Math.floor(remaining / 60000).toString().padStart(2, '0');
        const seconds = Math.floor((remaining % 60000) / 1000).toString().padStart(2, '0');
        setTimerLabel(`Brief Time Left: ${minutes}:${seconds}`);
        const channel = new BroadcastChannel("triage-updates");
        channel.postMessage({ type: "timer-label", payload: `Brief Time Left: ${minutes}:${seconds}` });
        if (remaining <= 0) {
          if (timerRef.current) clearInterval(timerRef.current);
          navigateTo("scenario-brief");
        }
      }, 1000);
    } else if (phase === "triage") {
      const endTime = Number(localStorage.getItem("scenarioEndTime"));
      timerRef.current = setInterval(() => {
        const remaining = endTime - Date.now();
        const elapsed = Math.max(0, Math.floor((Date.now() - (endTime - (Number(localStorage.getItem("scenarioTimeLimit")) || 20) * 60000)) / 1000));
        const minutes = Math.floor(elapsed / 60).toString().padStart(2, '0');
        const seconds = (elapsed % 60).toString().padStart(2, '0');
        setTimerLabel(`Scenario Time: ${minutes}:${seconds}`);
        const channel = new BroadcastChannel("triage-updates");
        channel.postMessage({ type: "timer-label", payload: `Scenario Time: ${minutes}:${seconds}` });
        if (Date.now() >= endTime) {
          if (timerRef.current) clearInterval(timerRef.current);
          const allCasualties = JSON.parse(localStorage.getItem("casualties")) || [];
          localStorage.setItem("casualties", JSON.stringify(allCasualties));
          navigateTo("aar");
        }
      }, 1000);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [phase]);
  const [aidBagLocked, setAidBagLocked] = useState(false);

  useEffect(() => {
    const endTimer = setTimeout(() => {
      console.log("Scenario ended after 20 minutes");
    }, 20 * 60 * 1000);
    return () => clearTimeout(endTimer);
  }, []);

  const addItem = (item) => {
    setAidBag(prev => ({
      ...prev,
      [item]: (prev[item] || 0) + 1
    }));
  };

  const removeItem = (item) => {
    setAidBag(prev => {
      const count = prev[item];
      if (!count) return prev;
      const updated = { ...prev };
      if (count === 1) {
        delete updated[item];
      } else {
        updated[item]--;
      }
      return updated;
    });
  };

  const navigateTo = (pageId) => {
    setCurrentPage(pageId);
  };

  const isSetupPhase = currentPage === "setup";
  console.log("Render Debug:", { phase, currentPage });

  return (
    <Router>
      <div className="layout-container">
        <header className="header-bar">
          <h1 className="app-title">Triage Trainer</h1>
          <div className="instructor-controls">
            <button onClick={() => { 
              setAidBagLocked(false); 
              setPhase("packing"); 
              const channel = new BroadcastChannel("triage-updates");
              channel.postMessage({ type: "phase", payload: "packing" });
            }}>Start Packing</button>
            <button onClick={() => { 
              setAidBagLocked(true); 
              setPhase("brief"); 
              const channel = new BroadcastChannel("triage-updates");
              channel.postMessage({ type: "phase", payload: "brief" });
            }}>Start Brief</button>
            <button
              onClick={() => {
                setAidBagLocked(true);
                const count = Number(localStorage.getItem("casualtyCount")) || 15;
                const generated = generateUniqueCasualties(count);
                localStorage.setItem("casualties", JSON.stringify(generated));

                const timeLimit = Number(localStorage.getItem("scenarioTimeLimit")) || 20;
                localStorage.setItem("scenarioEndTime", (Date.now() + timeLimit * 60000).toString());

                const autoReveal = localStorage.getItem("autoReveal") !== "false";
                localStorage.setItem("autoReveal", autoReveal);

                const channel = new BroadcastChannel("triage-updates");
                channel.postMessage({ type: "phase", payload: "triage" });
                channel.postMessage({ type: "timer", payload: (Date.now() + timeLimit * 60000).toString() });

                setPhase("triage");
                navigateTo("triage");
              }}
            >
              Start Triage
            </button>
            <button onClick={() => { 
              localStorage.setItem("casualties", JSON.stringify(JSON.parse(localStorage.getItem("casualties")) || []));
              const channel = new BroadcastChannel("triage-updates");
              channel.postMessage({ type: "phase", payload: "aar" });
              navigateTo("aar"); 
            }}>
              End Scenario
            </button>
            <button
              onClick={() => {
                localStorage.clear();
                const channel = new BroadcastChannel("triage-updates");
                channel.postMessage({ type: "reset" });
                window.location.reload();
              }}
            >
              Restart Program
            </button>
            <div className="linked-timer" style={{
              backgroundColor: "#2D3748",
              color: "#F7FAFC",
              padding: "8px 16px",
              borderRadius: "6px",
              fontSize: "1.2rem",
              fontWeight: "bold",
              marginLeft: "auto"
            }}>
              {timerLabel}
            </div>
          </div>
        </header>

        <Routes>
          <Route path="/" element={
            <div className="app-container">
              <aside className="sidebar">
                <nav>
                  <ul>
                    <li><button onClick={() => navigateTo("setup")}>🧰 Aid Bag Setup</button></li>
                    <li><button onClick={() => navigateTo("scenario-brief")}>👨‍🏫 View Scenario</button></li>
                    <li><button onClick={() => navigateTo("triage")}>🩺 Triage Phase</button></li>
                    <li><button onClick={() => navigateTo("aar")}>📊 AAR Summary</button></li>
                  </ul>
                </nav>
                <div className="locked-aidbag">
                  <h4>Locked Aid Bag</h4>
                  <ul>
                    {Object.entries(aidBag).length === 0 ? (
                      <li style={{ fontStyle: "italic", color: "#999" }}>Aid bag is empty.</li>
                    ) : (
                      Object.entries(aidBag).map(([item, count]) => (
                        <li
                          key={item}
                          draggable
                          onDragStart={(e) => e.dataTransfer.setData("text/plain", item)}
                          style={{ cursor: "grab" }}
                        >
                          {item} x{count}
                        </li>
                      ))
                    )}
                  </ul>
                </div>
                <div className="sidebar-resupply">
                  <button
                    onClick={() => {
                      if (resupplyInProgress) return;
                      setResupplyInProgress(true);
                      setNotifications(n => [`PVT Snuffy is out looking for supplies. Please wait...`, ...n]);
                      setTimeout(() => {
                        const current = JSON.parse(localStorage.getItem("resupplyCount") || "0");
                        const casualties = JSON.parse(localStorage.getItem("casualties") || "[]");
                        const penaltyPoints = Number(localStorage.getItem("penaltyPoints") || 0);
                        localStorage.setItem("penaltyPoints", penaltyPoints + 50);
                        console.log("Resupply requested: +50 penalty points");
 
                        if (current < 3) {
                          const aidBag = JSON.parse(localStorage.getItem("aidBag") || "{}");
                          const resupplyItems = {
                            "CRICKIT": 1,
                            "Combat Application Tourniquet (C-A-T)": 2,
                            "Combat Gauze Hemostatic Dressing": 3,
                            "Compressed Gauze ": 3
                          };
                          Object.entries(resupplyItems).forEach(([item, count]) => {
                            aidBag[item] = (aidBag[item] || 0) + count;
                          });
                          localStorage.setItem("aidBag", JSON.stringify(aidBag));
                          setAidBag(aidBag);
                          const channel = new BroadcastChannel("triage-updates");
                          channel.postMessage({ type: "aidBag", payload: aidBag });
                          localStorage.setItem("resupplyCount", JSON.stringify(current + 1));
                          setNotifications(n => [`Resupply delivered after delay.`, ...n]);
                        } else {
                          const snuffy = {
                            name: "PVT Snuffy",
                            injury: "Gunshot wound during resupply attempt",
                            vitals: {
                              pulse: 145,
                              respiratory: 34,
                              bp: "70/50",
                              spo2: "82%",
                              airway: "Clear",
                              steth: "Diminished left"
                            },
                            triage: "",
                            interventions: [],
                            deteriorated: false,
                            requiredInterventions: ["Tourniquet"],
                            startTime: Date.now(),
                            treatmentTime: null,
                            triageTime: null
                          };
                          casualties.push(snuffy);
                          localStorage.setItem("casualties", JSON.stringify(casualties));
                          setNotifications(n => [`PVT Snuffy became a casualty during resupply.`, ...n]);
                          setTimeout(() => {
                            const idx = casualties.length - 1;
                            const revealed = JSON.parse(localStorage.getItem("revealedIndexes") || "[]");
                            revealed.push(idx);
                            localStorage.setItem("revealedIndexes", JSON.stringify(revealed));
                          }, 0);
                        }
                        setResupplyInProgress(false);
                      }, 60000);
                    }}
                    disabled={resupplyInProgress}
                    style={{
                      marginTop: "10px",
                      padding: "8px",
                      backgroundColor: "#B7B199",
                      color: "#1A202C",
                      fontWeight: "bold",
                      width: "100%"
                    }}
                  >
                    Request Resupply
                  </button>
                </div>
              </aside>

              <main className="main-content">
                {currentPage === "setup" && (
                  <AidBagSetup
                    aidBag={aidBag}
                    addItem={addItem}
                    removeItem={removeItem}
                    isSetupPhase={isSetupPhase}
                    aidBagLocked={aidBagLocked}
                  />
                )}
                {currentPage === "scenario-brief" && <ScenarioBrief />}
                {currentPage === "triage" && (
                  <TriagePhase
                    aidBag={aidBag}
                    removeItem={removeItem}
                    aidBagLocked={aidBagLocked}
                    notifications={notifications}
                    setNotifications={setNotifications}
                    phase={phase}
                  />
                )}
                {currentPage === "aar" && <AARPage />}
                {!["setup", "scenario-brief", "triage", "aar"].includes(currentPage) && (
                  <p>Unknown currentPage: {currentPage}</p>
                )}
              </main>
            </div>
          } />
          <Route path="/instructor" element={<InstructorDashboard />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
