import React, { FC, useState } from 'react';
import { useAppContext } from './context/AppContext';
import SetupPhase from './components/SetupPhase/SetupPhase';
import usePhaseTimer from './hooks/usePhaseTimer';
import { generateUniqueCasualties } from './components/casualtyGenerator/casualtyGenerator';
import AidBagSetup from './components/AidBagSetup/AidBagSetup';
import ScenarioBrief from './components/ScenarioBrief/ScenarioBrief';
import TriagePhase from './components/casualtyGenerator/TriagePhase';
import AARPage from './components/AARPage/AARPage';
import PhaseControls from './components/TriageBoard/PhaseControls';
import './style.css'; // Assuming this is your main application styling

// Helper function for safe localStorage operations
// This function wraps localStorage.setItem in a try...catch block
// to prevent errors if localStorage is not available (e.g., in some browsers or environments).
const safeSetItem = (key: string, value: string): void => {
  try {
    localStorage.setItem(key, value);
  } catch (error) {
    console.warn(`Failed to set localStorage key: ${key}`, error);
  }
};

// Main application component
const StudentApp: FC = () => {
  // Get necessary state and functions from AppContext
  // AppContext provides global state like phase, aid bag contents, notifications, and durations.
  const {
    packDuration, // Duration for the packing phase (from context)
    briefDuration, // Duration for the brief phase (from context)
    triageLimit, // Duration for the triage phase (from context, set by user input)
    setPhase, // Function to change the current phase
    phase, // Current phase of the application (e.g., 'setup', 'packing', 'triage', 'aar')
    aidBag, // Contents of the aid bag
    notifications, // List of notifications
    setNotifications, // Function to update notifications
    setAidBag, // Function to update the aid bag contents
    broadcast, // Function to broadcast messages across different instances (e.g., student/instructor)
    setTriageLimit, // Function to update triageLimit in context
  } = useAppContext();

  // Local state for setup phase inputs
  // These states hold the values entered by the user in the SetupPhase component.
  const [casualtyCount, setCasualtyCount] = useState(15); // Number of casualties for the scenario
  const [scenarioTimeLimit, setScenarioTimeLimit] = useState(20); // User sets this value in minutes
  const [autoReveal, setAutoReveal] = useState(true); // Whether casualties should reveal automatically

  // Determine which phase timer hook should be active
  // This maps the application phase to the phase names used by the usePhaseTimer hook.
  const hookPhase = (() => {
    switch (phase) {
      case 'packing': return 'setup'; // Use 'setup' for packing timer logic
      case 'brief': return 'scenario-brief'; // Use 'scenario-brief' for brief timer logic
      case 'triage': return 'triage'; // Use 'triage' for triage timer logic
      case 'aar': return 'aar'; // No timer for AAR phase
      default: return 'setup'; // Default to setup phase timer
    }
  })();

  // Get the timer label based on the current phase and durations
  // usePhaseTimer hook provides the formatted time string (e.g., "10:00").
  const timerLabel = usePhaseTimer(hookPhase as any, {
    packDuration,
    briefDuration,
    triageLimit, // Pass the context's triageLimit to the timer hook
  });

  // Handler to start the packing phase
  const onStartPacking = () => {
    const end = Date.now() + packDuration * 60000; // Calculate end time in milliseconds
    safeSetItem('packingEndTime', String(end)); // Save packing phase end time to localStorage
    setPhase('packing'); // Set the application phase to 'packing'
    broadcast('phase', 'packing'); // Broadcast the phase change to other instances
  };

  // Handler to start the brief phase
  const onStartBrief = () => {
    const end = Date.now() + briefDuration * 60000; // Calculate end time in milliseconds
    safeSetItem('briefEndTime', String(end)); // Save brief phase end time to localStorage
    setPhase('brief'); // Set the application phase to 'brief'
    broadcast('phase', 'brief'); // Broadcast the phase change
  };

  // Handler to start the triage phase
  const onStartTriage = () => {
    const count = casualtyCount; // Get the desired number of casualties from local state
    const list = generateUniqueCasualties(count); // Generate a list of unique casualties
    safeSetItem('casualties', JSON.stringify(list)); // Save the generated casualties to localStorage

    // Use BroadcastChannel to send casualties to other instances (like instructor view)
    const channel = new BroadcastChannel('triage-updates');
    channel.postMessage({ type: 'casualties', payload: list });
    channel.close();

    const now = Date.now();
    // Calculate triage end time using the triageLimit from context (set during setup)
    const end = now + triageLimit * 60000; // triageLimit is in minutes, convert to milliseconds
    safeSetItem('triageEndTime', String(end)); // Save triage phase end time

    // Clean up previous phase end times from localStorage as they are no longer needed
    localStorage.removeItem('packingEndTime');
    localStorage.removeItem('briefEndTime');

    setPhase('triage'); // Set the application phase to 'triage'
    broadcast('phase', 'triage'); // Broadcast the phase change
  };

  // Handler to end the scenario and go to AAR (After Action Review)
  const onEndScenario = () => {
    setPhase('aar'); // Set the application phase to 'aar'
    broadcast('phase', 'aar'); // Broadcast the phase change
  };

  // Handler to restart the scenario
  const onRestart = () => {
    localStorage.clear(); // Clear all data stored in localStorage
    broadcast('reset', {}); // Broadcast a reset event to other instances
    // Re-initialize with a demo casualty for a clean start example
    // This provides a basic casualty to work with immediately after a reset.
    const jane = {
      id: 'demo-casualty', // Unique ID for demo casualty
      name: 'SPC Jane Doe (Demo)',
      injury: 'Traumatic left leg amputation with severe arterial bleeding',
      triage: '', // Initial triage status
      interventions: [], // Applied interventions
      deteriorated: false, // Deterioration status
      requiredInterventions: [], // Required interventions for stabilization
      vitals: { pulse: 0, respiratory: 0, bp: '0/0', spo2: 0, airway: '', steth: '' }, // Initial vitals
      dynamicVitals: { pulse: 0, respiratory: 0, bp: '0/0', spo2: 0, airway: '', steth: '' }, // Dynamic vitals for deterioration
      startTime: Date.now(), // Time casualty appeared
      treatmentTime: null, // Time treatment started
      triageTime: null, // Time triage assigned
      isDemo: true, // Flag for demo casualty
    };

    // Set initial casualties with the demo casualty
    localStorage.setItem('casualties', JSON.stringify([jane]));
    // Reveal the demo casualty initially (index 0)
    localStorage.setItem('revealedIndexes', JSON.stringify([0]));

    window.location.reload(); // Reload the page to fully reset the application state
  };

  // Function to remove an item from the aid bag (used in TriagePhase when an item is used)
  const removeItem = React.useCallback((item: string) => {
    // Defer the state update using setTimeout to avoid potential issues with drag/drop
    // and ensure the state update happens after the current event loop.
    setTimeout(() => {
      setAidBag(prev => {
        const updated = { ...prev };
        if (updated[item] > 1) {
          updated[item]--; // Decrease count if more than one of the item exists
        } else {
          delete updated[item]; // Remove the item from the aid bag if only one exists
        }
        safeSetItem("aidBag", JSON.stringify(updated)); // Save the updated aid bag to localStorage
        broadcast("aidBag", updated); // Broadcast the aid bag changes to other instances
        return updated; // Return the updated aid bag state
      });
    }, 0);
  }, [setAidBag, broadcast]); // Dependencies for useCallback: setAidBag and broadcast should not change often

  // Render the SetupPhase component if the current phase is 'setup'
  if (phase === 'setup') {
    return (
      <SetupPhase
        casualtyCount={casualtyCount} // Pass casualty count state
        setCasualtyCount={setCasualtyCount} // Pass function to update casualty count
        scenarioTimeLimit={scenarioTimeLimit} // Pass scenario time limit state
        setScenarioTimeLimit={setScenarioTimeLimit} // Pass function to update scenario time limit
        autoReveal={autoReveal} // Pass auto-reveal state
        setAutoReveal={setAutoReveal} // Pass function to update auto-reveal state
        // When starting the packing phase, first set the triageLimit in context
        // This ensures the user's chosen time limit is used for the triage phase.
        startPackingPhase={() => {
          setTriageLimit(scenarioTimeLimit); // Save user's time limit to the context's triageLimit
          setPhase('packing'); // Then proceed to the packing phase
        }}
      />
    );
  }

  // Render the main application layout for other phases ('packing', 'brief', 'triage', 'aar')
  return (
    <div className="app-container">
      <header className="header-bar">
        {/* Phase controls component - displays timer and phase transition buttons */}
        <PhaseControls
          phase={phase} // Pass current phase
          timerLabel={timerLabel} // Pass the formatted timer string
          onStartPacking={onStartPacking} // Pass handler to start packing
          onStartBrief={onStartBrief} // Pass handler to start brief
          onStartTriage={onStartTriage} // Pass handler to start triage
          onEndScenario={onEndScenario} // Pass handler to end scenario
          onRestart={onRestart} // Pass handler to restart
        />
      </header>

      <div className="content-wrapper">
        <aside className="sidebar">
          <h2>Triage Trainer</h2>
          <nav>
            <ul>
              {/* Navigation buttons to switch between phases */}
              <li>
                <button onClick={() => setPhase('packing')}>
                  🧰 Aid Bag Setup
                </button>
              </li>
              <li>
                <button onClick={() => setPhase('brief')}>
                  👨‍🏫 View Scenario
                </button>
              </li>
              <li>
                <button
                  onClick={() => setPhase('triage')}
                  disabled={phase === 'triage'} // Disable the button if already in the triage phase
                >
                  🩺 Triage Phase
                </button>
              </li>
              <li>
                <button onClick={() => setPhase('aar')}>
                  📊 AAR Summary
                </button>
              </li>
              {/* Report Bug button - opens a new tab with the provided Google Form link */}
              <li>
                <button onClick={() => window.open('https://docs.google.com/forms/d/e/1FAIpQLScNsBN-wzsuNKoO-MbP_FMNquIimbdKhJq8aAgYfnLDU7Dlig/viewform?usp=header', '_blank')}>
                  🐛 Report Bug
                </button>
              </li>
            </ul>
          </nav>

          <section className="aidbag-snapshot">
            <h3>🎒 Aid Bag Contents</h3>
            <ul>
              {/* Display items currently in the aid bag */}
              {Object.entries(aidBag).map(([item, count]) => (
                <li
                  key={item} // Unique key for list items
                  draggable // Make items draggable for use in the TriageBoard
                  onDragStart={(e) => {
                    e.dataTransfer.setData("text/plain", item); // Set the item name as data for drag event
                    console.log("Dragging from sidebar:", item); // Log which item is being dragged
                  }}
                  style={{ cursor: "grab" }} // Change cursor to indicate draggable item
                >
                  {item} x{count} {/* Display item name and count */}
                </li>
              ))}
            </ul>
          </section>
        </aside>

        <main className="main-content">
          {/* Render the appropriate component based on the current phase */}
          {phase === 'packing' && <AidBagSetup isSetupPhase={true} />}
          {phase === 'brief' && <ScenarioBrief />}
          {phase === 'triage' && (
            <TriagePhase
              aidBag={aidBag} // Pass aid bag contents
              removeItem={removeItem} // Pass function to remove items from aid bag
              notifications={notifications} // Pass notifications list
              setNotifications={setNotifications} // Pass function to update notifications
              phase={phase} // Pass current phase
            />
          )}
          {phase === 'aar' && <AARPage />}
        </main>
      </div>
    </div>
  );
};

export default StudentApp; // Export the main application component
