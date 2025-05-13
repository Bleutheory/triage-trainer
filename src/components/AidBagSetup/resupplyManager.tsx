import { storage } from '../../utils/storage';
import { Dispatch, SetStateAction } from 'react';
import { useState, useEffect } from 'react';
import { Casualty } from '../../types';
import { v4 as uuid } from 'uuid';

const MAX_RESUPPLIES = 3;

export function getResupplyCount(): number {
  return storage.get<number>(storage.KEYS.RESUPPLY_COUNT, 0);
}

export function isResupplyDisabled(): boolean {
  return storage.get<boolean>(storage.KEYS.RESUPPLY_DISABLED, false);
}

export function recordResupplyCount(newCount: number) {
  storage.set(storage.KEYS.RESUPPLY_COUNT, newCount);
}

export function disableResupply() {
  storage.set(storage.KEYS.RESUPPLY_DISABLED, true);
}

export function generateSnuffyCasualty(): Casualty {
  return {
    id: uuid(),
    name: "PVT Snuffy",
    injuryKey: "minor_tibia_fracture",
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
  const [resupplyCount, setResupplyCount] = useState<number>(() => storage.get<number>(storage.KEYS.RESUPPLY_COUNT, 0));
  const [resupplyDisabled, setResupplyDisabled] = useState<boolean>(() => storage.get<boolean>(storage.KEYS.RESUPPLY_DISABLED, false));
  const [resupplyCooldown, setResupplyCooldown] = useState<number>(0);
  const [snuffyDispatchTime, setSnuffyDispatchTime] = useState<number>(() => storage.get<number>(storage.KEYS.SNUFFY_DISPATCH_TIME, 0));
  const [resupplyCooldownUntil, setResupplyCooldownUntil] = useState<number>(() => storage.get<number>(storage.KEYS.RESUPPLY_COOLDOWN_UNTIL, 0));

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
    storage.set(storage.KEYS.SNUFFY_DISPATCH_TIME, now);
    setNotifications((prev: string[]) => [
      "You have sent PVT Snuffy to find some supplies...",
      ...prev
    ]);

    setTimeout(() => {
      const resupplyItems = {
        "Combat Application Tourniquet (C-A-T)": 2,
        "Compressed Gauze": 3,
        "Combat Gauze Hemostatic Dressing": 2,
      };

      const updatedBag = { ...aidBag };
      for (const [item, qty] of Object.entries(resupplyItems)) {
        updatedBag[item] = (updatedBag[item] || 0) + qty;
      }

      setAidBag(updatedBag);
      storage.set(storage.KEYS.AID_BAG, updatedBag);

      const newCount = resupplyCount + 1;
      setResupplyCount(newCount);
      storage.set(storage.KEYS.RESUPPLY_COUNT, newCount);

      let arrivalNotes = Object.entries(resupplyItems).map(
        ([item, qty]) => `${qty} x ${item} has arrived and was added to the aid bag.`
      );

      if (newCount > MAX_RESUPPLIES) {
        setResupplyDisabled(true);
        storage.set(storage.KEYS.RESUPPLY_DISABLED, true);

        const snuffy = generateSnuffyCasualty();
        const current = storage.get<Casualty[]>(storage.KEYS.CASUALTIES, []);
        const updated = [...current, snuffy];
        setCasualties(updated);
        storage.set(storage.KEYS.CASUALTIES, updated);
        arrivalNotes.unshift("PVT Snuffy broke his ankle while retrieving your supplies. He is now a casualty.");
      }

      setNotifications((prev: string[]) => [...arrivalNotes, ...prev]);

      const cooldownEnds = Date.now() + 60000;
      setResupplyCooldownUntil(cooldownEnds);
      storage.set(storage.KEYS.RESUPPLY_COOLDOWN_UNTIL, cooldownEnds);

    }, 60000);
  };

  return { onRequestResupply, resupplyDisabled, resupplyCooldown };
};