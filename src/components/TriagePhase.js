import React from 'react';
import TriageBoard from './TriageBoard';

export default function TriagePhase({ aidBag, removeItem, notifications, setNotifications, phase }) {
  return (
    <section className="page visible" id="triage">
      <h2>Triage Phase</h2>
      <p>Drag and drop items from your aid bag to treat casualties. Assign triage categories accordingly.</p>
      <TriageBoard
        aidBag={aidBag}
        removeItem={removeItem}
        notifications={notifications}
        setNotifications={setNotifications}
       phase={phase}
      />
    </section>
  );
}
