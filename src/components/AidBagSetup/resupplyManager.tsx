import { Dispatch, SetStateAction } from 'react';
import { useState, useEffect } from 'react';
import { Casualty } from '../../types';
import { v4 as uuid } from 'uuid';

const MAX_RESUPPLIES = 3;

export async function getResupplyCount(): Promise<number> {
  const value = await window.electronAPI.getItem('resupplyCount');
  return Number(value || 0);
}

export async function isResupplyDisabled(): Promise<boolean> {
  const value = await window.electronAPI.getItem('resupplyDisabled');
  return value === 'true';
}

export async function recordResupplyCount(newCount: number) {
  await window.electronAPI.setItem('resupplyCount', String(newCount));
}

export async function disableResupply() {
  await window.electronAPI.setItem('resupplyDisabled', 'true');
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
  const [resupplyCount, setResupplyCount] = useState<number>(0);
  const [resupplyDisabled, setResupplyDisabled] = useState<boolean>(false);
  const [resupplyCooldown, setResupplyCooldown] = useState<number>(0);
  const [snuffyDispatchTime, setSnuffyDispatchTime] = useState<number>(0);
  const [resupplyCooldownUntil, setResupplyCooldownUntil] = useState<number>(0);

  // Async effect to load values from secure storage
  useEffect(() => {
    const load = async () => {
      const count = await window.electronAPI.getItem('resupplyCount');
      const disabled = await window.electronAPI.getItem('resupplyDisabled');
      const snuffy = await window.electronAPI.getItem('snuffyDispatchTime');
      const until = await window.electronAPI.getItem('resupplyCooldownUntil');
      setResupplyCount(Number(count || 0));
      setResupplyDisabled(disabled === 'true');
      setSnuffyDispatchTime(Number(snuffy || 0));
      setResupplyCooldownUntil(Number(until || 0));
    };
    load();
  }, []);

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

  const onRequestResupply = async (
    aidBag: Record<string, number>,
    setAidBag: (bag: Record<string, number>) => void,
    setNotifications: Dispatch<SetStateAction<string[]>>,
    setCasualties: (casualties: Casualty[]) => void
  ) => {
    const now = Date.now();

    // Always fetch latest disabled/count/snuffy time from secure storage
    const [disabledStr, snuffyStr, countStr] = await Promise.all([
      window.electronAPI.getItem('resupplyDisabled'),
      window.electronAPI.getItem('snuffyDispatchTime'),
      window.electronAPI.getItem('resupplyCount'),
    ]);
    const isDisabled = disabledStr === 'true';
    const lastSnuffy = Number(snuffyStr || 0);
    const count = Number(countStr || 0);

    if (isDisabled) {
      setNotifications((prev: string[]) => [
        "No further resupplies available. PVT Snuffy is out of commission.",
        ...prev
      ]);
      return;
    }

    if (now - lastSnuffy < 120000) {
      setNotifications((prev: string[]) => [
        "No one is available to retrieve supplies. Try again later.",
        ...prev
      ]);
      return;
    }

    setSnuffyDispatchTime(now);
    await window.electronAPI.setItem('snuffyDispatchTime', String(now));
    setNotifications((prev: string[]) => [
      "You have sent PVT Snuffy to find some supplies...",
      ...prev
    ]);

    setTimeout(async () => {
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
      await window.electronAPI.setItem("aidBag", JSON.stringify(updatedBag));

      const newCount = count + 1;
      setResupplyCount(newCount);
      await window.electronAPI.setItem('resupplyCount', String(newCount));

      let arrivalNotes = Object.entries(resupplyItems).map(
        ([item, qty]) => `${qty} x ${item} has arrived and was added to the aid bag.`
      );

      if (newCount > MAX_RESUPPLIES) {
        setResupplyDisabled(true);
        await window.electronAPI.setItem('resupplyDisabled', 'true');
        arrivalNotes.unshift("No further resupplies available. PVT Snuffy is out of commission.");
      }

      setNotifications((prev: string[]) => [
        ...arrivalNotes,
        ...prev
      ]);
    }, 8000);
  };

  return {
    resupplyCount,
    setResupplyCount,
    resupplyDisabled,
    setResupplyDisabled,
    resupplyCooldown,
    setResupplyCooldown,
    snuffyDispatchTime,
    setSnuffyDispatchTime,
    resupplyCooldownUntil,
    setResupplyCooldownUntil,
    onRequestResupply,
  };
}