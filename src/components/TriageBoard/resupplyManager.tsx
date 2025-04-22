import { Dispatch, SetStateAction } from 'react';
import { useState, useEffect } from 'react';
import { Casualty } from '../../types';

const MAX_RESUPPLIES = 3;

export function getResupplyCount(): number {
  return Number(localStorage.getItem('resupplyCount') || 0);
}

export function isResupplyDisabled(): boolean {
  return localStorage.getItem('resupplyDisabled') === 'true';
}

export function recordResupplyCount(newCount: number) {
  localStorage.setItem('resupplyCount', String(newCount));
}

export function disableResupply() {
  localStorage.setItem('resupplyDisabled', 'true');
}

export function generateSnuffyCasualty(): Casualty {
  return {
    name: "PVT Snuffy",
    injury: "Minor tibia fracture with swelling and full distal pulse",
    triage: "",
    interventions: [],
    deteriorated: false,
    requiredInterventions: [],
    vitals: {
      pulse: 90,
      respiratory: 18,
      bp: "118/76",
      spo2: 98,
      airway: "Clear",
      steth: "Normal",
    },
    dynamicVitals: {
      pulse: 90,
      respiratory: 18,
      bp: "118/76",
      spo2: 98,
      airway: "Clear",
      steth: "Normal",
    },
    startTime: Date.now(),
    treatmentTime: null,
    triageTime: null,
    isDemo: false,
  };
}

export function shouldTriggerSnuffy(count: number): boolean {
  return count > MAX_RESUPPLIES;
}

export const useResupply = () => {
  const [resupplyCount, setResupplyCount] = useState<number>(() => Number(localStorage.getItem('resupplyCount') || 0));
  const [resupplyDisabled, setResupplyDisabled] = useState<boolean>(() => localStorage.getItem('resupplyDisabled') === 'true');
  const [resupplyCooldown, setResupplyCooldown] = useState<number>(0);
  const [snuffyDispatchTime, setSnuffyDispatchTime] = useState<number>(() => Number(localStorage.getItem('snuffyDispatchTime') || 0));
  const [resupplyCooldownUntil, setResupplyCooldownUntil] = useState<number>(() => Number(localStorage.getItem('resupplyCooldownUntil') || 0));

  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      if (now < resupplyCooldownUntil) {
        setResupplyCooldown(Math.ceil((resupplyCooldownUntil - now) / 1000));
      } else {
        setResupplyCooldown(0);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [resupplyCooldownUntil]);

  const onRequestResupply = (
    aidBag: Record<string, number>,
    setAidBag: (bag: Record<string, number>) => void,
    setNotifications: Dispatch<SetStateAction<string[]>>,
    setCasualties: (casualties: Casualty[]) => void
  ) => {
    const now = Date.now();

    if (resupplyDisabled) {
      setNotifications((prev: string[]) => [
        "No further resupplies available. PVT Snuffy is out of commission.",
        ...prev
      ]);
      return;
    }

    if (now - snuffyDispatchTime < 120000) {
      setNotifications((prev: string[]) => [
        "No one is available to retrieve supplies. Try again later.",
        ...prev
      ]);
      return;
    }

    setSnuffyDispatchTime(now);
    localStorage.setItem('snuffyDispatchTime', String(now));
    setNotifications((prev: string[]) => [
      "You have sent PVT Snuffy to find some supplies...",
      ...prev
    ]);

    setTimeout(() => {
      const resupplyItems = {
        "C-A-T® Combat Application Tourniquet": 2,
        "Compressed Gauze": 3,
        "Combat Gauze® Z-fold Hemostatic": 2,
      };

      const updatedBag = { ...aidBag };
      for (const [item, qty] of Object.entries(resupplyItems)) {
        updatedBag[item] = (updatedBag[item] || 0) + qty;
      }

      setAidBag(updatedBag);
      localStorage.setItem("aidBag", JSON.stringify(updatedBag));

      const newCount = resupplyCount + 1;
      setResupplyCount(newCount);
      localStorage.setItem('resupplyCount', String(newCount));

      let arrivalNotes = Object.entries(resupplyItems).map(
        ([item, qty]) => `${qty} x ${item} has arrived and was added to the aid bag.`
      );

      if (newCount > MAX_RESUPPLIES) {
        setResupplyDisabled(true);
        localStorage.setItem('resupplyDisabled', 'true');

        const snuffy = generateSnuffyCasualty();
        const current = JSON.parse(localStorage.getItem('casualties') || '[]');
        const updated = [...current, snuffy];
        setCasualties(updated);
        localStorage.setItem("casualties", JSON.stringify(updated));
        arrivalNotes.unshift("PVT Snuffy broke his ankle while retrieving your supplies. He is now a casualty.");
      }

      setNotifications((prev: string[]) => [...arrivalNotes, ...prev]);

      const cooldownEnds = Date.now() + 60000;
      setResupplyCooldownUntil(cooldownEnds);
      localStorage.setItem("resupplyCooldownUntil", String(cooldownEnds));

    }, 60000);
  };

  return { onRequestResupply, resupplyDisabled, resupplyCooldown };
};