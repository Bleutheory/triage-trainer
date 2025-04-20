// @ts-ignore: allow importing CSS modules
import styles from './TriagePhase.module.css';
import React, { FC } from 'react';
import { useAppContext } from '../../context/AppContext';
// @ts-ignore: Allow importing JS module without type declarations
import TriageBoard from '../TriageBoard/TriageBoard';

const TriagePhase: FC = () => {
  const { aidBag, setAidBag, notifications, setNotifications, phase } = useAppContext();

  const removeItem = (item: string) => {
    setAidBag((prev: Record<string, number>) => {
      const updated = { ...prev };
      delete updated[item];
      return updated;
    });
  };

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
};

export default TriagePhase;