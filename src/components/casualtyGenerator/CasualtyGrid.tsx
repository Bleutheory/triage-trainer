

import React from 'react';
import CasualtyCard from './CasualtyCard';
import { Casualty } from '../../types';

interface CasualtyGridProps {
  aidBag: Record<string, number>;
  casualties: Casualty[];
  revealedIndexes: number[];
  phase: string;
  removeItem: (item: string) => void;
  handleApplyItem: (index: number, item: string) => void;
  setNotifications: React.Dispatch<React.SetStateAction<string[]>>;
}

const CasualtyGrid: React.FC<CasualtyGridProps> = ({
  aidBag,
  casualties,
  revealedIndexes,
  phase,
  removeItem,
  handleApplyItem,
  setNotifications
}) => (
  <div className="casualty-grid">
    {casualties
      .map((casualty, index) => ({ casualty, index }))
      .filter(({ casualty, index }) =>
        revealedIndexes.includes(index) || casualty.isDemo
      )
      .sort((a, b) => {
        const order: Record<string, number> = { '': 0, Immediate: 1, Delayed: 2, Minimal: 3, Expectant: 4 };
        if (!a.casualty.triage && !b.casualty.triage) {
          return a.casualty.startTime - b.casualty.startTime;
        }
        if (!a.casualty.triage) return -1;
        if (!b.casualty.triage) return 1;
        return order[a.casualty.triage] - order[b.casualty.triage];
      })
      .map(({ casualty, index }) => (
        <div
        key={casualty.id}
          onDragOver={e => e.preventDefault()}
          onDrop={e => {
            e.preventDefault();
            const item = e.dataTransfer.getData('text/plain');
            if (item) {
              setTimeout(() => handleApplyItem(index, item), 0);
            }
          }}
        >
          <CasualtyCard
            index={index}
            aidBag={aidBag}
            removeItem={removeItem}
            casualty={casualty}
            isHighlighted={false}
            onTriageChange={(value: string) => {
              // no-op here; triage change handled in parent
            }}
            applyItem={item => handleApplyItem(index, item)}
          />
        </div>
      ))}
  </div>
);

export default CasualtyGrid;