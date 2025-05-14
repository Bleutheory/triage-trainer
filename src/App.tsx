import React, { FC, useState, useCallback } from 'react'; // React and hooks
import { useAppContext } from './context/AppContext'; // Global application context
import SetupPhase from './components/SetupPhase/SetupPhase'; // Component for scenario setup
import usePhaseTimer from './hooks/usePhaseTimer'; // Hook for managing phase timers
import { generateUniqueCasualties } from './components/casualtyGenerator/casualtyGenerator'; // Utility to create casualty data
import AidBagSetup from './components/AidBagSetup/AidBagSetup'; // Component for setting up the aid bag
import ScenarioBrief from './components/ScenarioBrief/ScenarioBrief'; // Component to display the scenario briefing
import TriagePhase from './components/casualtyGenerator/TriagePhase'; // Component for the main triage gameplay
import AARPage from './components/AARPage/AARPage'; // Component for the After Action Review
import PhaseControls from './components/TriageBoard/PhaseControls'; // Component for timer and phase navigation
import './style.css'; // Main application styling
import { storage } from './utils/storage'; // Utility for interacting with localStorage
// Note: The original user-provided code did not use useCallback for phase handlers,
// but it's generally good practice if these were to be passed to memoized children.
// For this update, I'm keeping them as plain functions as in the user's provided code.

// Main application component
const StudentApp: FC = () => {
  // Destructure state and functions from the global AppContext
  const {
    packDuration, // Duration for the aid bag packing phase (from context)
    briefDuration, // Duration for the scenario briefing phase (from context)
    triageLimit, // Time limit for the triage phase (from context, set by user in SetupPhase)
    setPhase, // Function to change the current application phase
    phase, // Current active phase of the application (e.g., 'setup', 'packing', 'triage', 'aar')
    aidBag, // Contents of the medic's aid bag
    notifications, // List of in-scenario notifications
    setNotifications, // Function to update notifications
    setAidBag, // Function to update the aid bag contents
    broadcast, // Function to send messages to other browser tabs/windows (e.g., for instructor view)
    setTriageLimit, // Function to update the triageLimit in the global context
  } = useAppContext();

  // Local state for inputs gathered during the SetupPhase
  const [casualtyCount, setCasualtyCount] = useState(15); // Default number of casualties
  const [scenarioTimeLimit, setScenarioTimeLimit] = useState(20); // Default overall scenario time limit in minutes (used for triageLimit)
  const [autoReveal, setAutoReveal] = useState(true); // Default setting for automatic casualty reveal

  // Determine the correct phase string for the usePhaseTimer hook based on the current app phase
  const hookPhase = (() => {
    switch (phase) {
      case 'packing':
        return 'setup'; // Timer logic for packing might be grouped under 'setup' or a specific 'packing' key in usePhaseTimer
      case 'brief':
        return 'scenario-brief'; // Timer logic for the briefing phase
      case 'triage':
        return 'triage'; // Timer logic for the main triage phase
      case 'aar':
        return 'aar'; // After Action Review typically doesn't have a countdown
      default:
        return 'setup'; // Default phase for the timer
    }
  })();

  // Initialize the phase timer and get the displayable time string
  const timerLabel = usePhaseTimer(hookPhase as any, { // `as any` might be used if hookPhase types don't perfectly align with hook's expectations
    packDuration,
    briefDuration,
    triageLimit, // Pass the triageLimit from context (which was set from scenarioTimeLimit)
  });

  // Handler to initiate the packing phase
  const onStartPacking = () => {
    const endTime = Date.now() + packDuration * 60000; // Calculate end time in milliseconds
    storage.set(storage.KEYS.PACKING_END_TIME, endTime); // Store in localStorage
    setPhase('packing'); // Update application phase
    broadcast('phase', 'packing'); // Notify other instances
  };

  // Handler to initiate the briefing phase
  const onStartBrief = () => {
    const endTime = Date.now() + briefDuration * 60000; // Calculate end time
    storage.set(storage.KEYS.BRIEF_END_TIME, endTime); // Store in localStorage
    setPhase('brief'); // Update application phase
    broadcast('phase', 'brief'); // Notify other instances
  };

  // Handler to initiate the triage phase
  const onStartTriage = () => {
    const count = casualtyCount; // Use the locally stored casualty count from SetupPhase
    const list = generateUniqueCasualties(count); // Generate the casualty list

    // *** DEBUGGING LOG ADDED HERE ***
    // This log will show how many casualties were requested versus how many were actually generated.
    console.log(`Requested to generate: ${count}, Actually generated: ${list.length}`);

    storage.set(storage.KEYS.CASUALTIES, list); // Save the generated casualties to localStorage

    // Broadcast the newly generated casualties to other instances (e.g., instructor dashboard)
    const channel = new BroadcastChannel('triage-updates');
    channel.postMessage({ type: 'casualties', payload: list });
    channel.close(); // Close the channel after message is sent

    const now = Date.now();
    // Calculate triage phase end time using triageLimit from context (set from scenarioTimeLimit)
    const endTime = now + triageLimit * 60000; // triageLimit is in minutes
    storage.set(storage.KEYS.TRIAGE_END_TIME, endTime); // Store in localStorage

    // Clean up localStorage keys for previous phase end times
    storage.remove(storage.KEYS.PACKING_END_TIME);
    storage.remove(storage.KEYS.BRIEF_END_TIME);

    setPhase('triage'); // Update application phase
    broadcast('phase', 'triage'); // Notify other instances
  };

  // Handler to end the current scenario and move to the After Action Review (AAR)
  const onEndScenario = () => {
    setPhase('aar'); // Update application phase
    broadcast('phase', 'aar'); // Notify other instances
    // Optionally, clear triage timer from storage if not handled by AAR phase init
    storage.remove(storage.KEYS.TRIAGE_END_TIME);
  };

  // Handler to restart the entire scenario from the beginning
  const onRestart = () => {
    storage.clearAppData(); // Clear all application-specific data from localStorage
    broadcast('reset', {}); // Send a reset signal to other instances

    // Optional: Re-initialize with a demo casualty for a clean start if desired,
    // or simply let the SetupPhase handle new scenario creation.
    // The user's original code included re-creating a demo casualty here.
    const jane = {
      id: 'demo-casualty',
      name: 'SPC Jane Doe (Demo)',
      injury: 'Traumatic left leg amputation with severe arterial bleeding',
      triage: '',
      interventions: [],
      deteriorated: false,
      requiredInterventions: [],
      vitals: { pulse: 0, respiratory: 0, bp: '0/0', spo2: 0, airway: '', steth: '' },
      dynamicVitals: { pulse: 0, respiratory: 0, bp: '0/0', spo2: 0, airway: '', steth: '' },
      startTime: Date.now(),
      treatmentTime: null,
      triageTime: null,
      isDemo: true,
    };
    storage.set(storage.KEYS.CASUALTIES, [jane]); // Set demo casualty
    storage.set(storage.KEYS.REVEALED_INDEXES, [0]); // Reveal demo casualty

    window.location.reload(); // Force a full page reload to ensure a clean state
  };

  // Callback function to remove an item from the aid bag
  // Wrapped in useCallback to memoize the function if passed to child components
  const removeItem = useCallback((item: string) => {
    // Use setTimeout to ensure the state update occurs after the current event loop,
    // which can be helpful with drag-and-drop or rapid UI interactions.
    setTimeout(() => {
      setAidBag(prevAidBag => {
        const updatedAidBag = { ...prevAidBag };
        if (updatedAidBag[item] > 1) {
          updatedAidBag[item]--; // Decrement count if more than one
        } else {
          delete updatedAidBag[item]; // Remove item if count is one
        }
        storage.set(storage.KEYS.AID_BAG, updatedAidBag); // Persist to localStorage
        broadcast("aidBag", updatedAidBag); // Notify other instances of aid bag change
        return updatedAidBag; // Return the new state
      });
    }, 0);
  }, [setAidBag, broadcast]); // Dependencies for useCallback

  // Conditional rendering: If in 'setup' phase, render the SetupPhase component
  if (phase === 'setup') {
    return (
      <SetupPhase
        casualtyCount={casualtyCount}
        setCasualtyCount={setCasualtyCount}
        scenarioTimeLimit={scenarioTimeLimit}
        setScenarioTimeLimit={setScenarioTimeLimit}
        autoReveal={autoReveal}
        setAutoReveal={setAutoReveal}
        // When starting packing phase from setup:
        // 1. Set the triageLimit in global context using the scenarioTimeLimit from setup.
        // 2. Transition the application to the 'packing' phase.
        startPackingPhase={() => {
          setTriageLimit(scenarioTimeLimit); // Update context
          // Call onStartPacking directly if it contains all setup logic for packing
          // or just setPhase if onStartPacking is handled by PhaseControls
          onStartPacking(); // This will set the phase and broadcast
        }}
      />
    );
  }

  // Main application layout for phases other than 'setup'
  return (
    <div className="app-container">
      <header className="header-bar">
        {/* Component for displaying timer and phase navigation buttons */}
        <PhaseControls
          phase={phase}
          timerLabel={timerLabel}
          onStartPacking={onStartPacking}
          onStartBrief={onStartBrief}
          onStartTriage={onStartTriage}
          onEndScenario={onEndScenario}
          onRestart={onRestart}
        />
      </header>

      <div className="content-wrapper">
        <aside className="sidebar">
          <h2>Triage Trainer</h2>
          <nav>
            <ul>
              {/* Manual navigation buttons - consider if these should respect phase flow or be admin-like overrides */}
              <li><button onClick={() => setPhase('packing')}>🧰 Aid Bag Setup</button></li>
              <li><button onClick={() => setPhase('brief')}>👨‍🏫 View Scenario</button></li>
              <li><button onClick={() => setPhase('triage')} disabled={phase === 'triage'}>🩺 Triage Phase</button></li>
              <li><button onClick={() => setPhase('aar')}>📊 AAR Summary</button></li>
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
              {/* Display current contents of the aid bag */}
              {Object.entries(aidBag).map(([item, count]) => (
                <li
                  key={item}
                  draggable // Make items draggable for use in TriagePhase
                  onDragStart={(e) => {
                    e.dataTransfer.setData("text/plain", item); // Set data for drag operation
                    console.log("Dragging from sidebar:", item); // Log dragged item
                  }}
                  style={{ cursor: "grab" }} // Visual cue for draggable item
                >
                  {item} x{count}
                </li>
              ))}
            </ul>
          </section>
        </aside>

        <main className="main-content">
          {/* Render the main content component based on the current phase */}
          {phase === 'packing' && <AidBagSetup isSetupPhase={true} />}
          {phase === 'brief' && <ScenarioBrief />}
          {phase === 'triage' && (
            <TriagePhase
              aidBag={aidBag}
              removeItem={removeItem}
              notifications={notifications}
              setNotifications={setNotifications}
              phase={phase} // Pass current phase, might be used by TriagePhase for its logic
            />
          )}
          {phase === 'aar' && <AARPage />}
        </main>
      </div>
    </div>
  );
};

export default StudentApp; // Export the main application component
