// src/utils/storage.ts

// Define constants for your localStorage keys to avoid typos
export const LOCAL_STORAGE_KEYS = {
  CASUALTIES: 'casualties',
  REVEALED_INDEXES: 'revealedIndexes',
  PHASE: 'phase',
  AID_BAG: 'aidBag',
  PACKING_END_TIME: 'packingEndTime',
  BRIEF_END_TIME: 'briefEndTime',
  TRIAGE_END_TIME: 'triageEndTime',
  SCENARIO_TIME_LIMIT: 'scenarioTimeLimit',
  CASUALTY_COUNT: 'casualtyCount',
  AUTO_REVEAL: 'autoReveal',
  NOTIFICATIONS: 'notifications',
  USED_INJURY_KEYS: 'usedInjuryKeys',
  PENALTY_POINTS: 'penaltyPoints',
  RESUPPLY_COUNT: 'resupplyCount',
  RESUPPLY_DISABLED: 'resupplyDisabled',
  SNUFFY_DISPATCH_TIME: 'snuffyDispatchTime',
  RESUPPLY_COOLDOWN_UNTIL: 'resupplyCooldownUntil',
  PACK_DURATION: 'packDuration',
  BRIEF_DURATION: 'briefDuration',
  TRIAGE_LIMIT: 'triageLimit',
  SCENARIO_END_TIME: 'scenarioEndTime',
};
  
  function safeGetItem<T>(key: string, defaultValue: T): T {
    try {
      const item = localStorage.getItem(key);
      if (item === null) {
        return defaultValue;
      }
      return JSON.parse(item) as T;
    } catch (error) {
      console.warn(`Error reading localStorage key "${key}":`, error);
      return defaultValue;
    }
  }
  
  function safeSetItem<T>(key: string, value: T): void {
    try {
      const stringifiedValue = JSON.stringify(value);
      localStorage.setItem(key, stringifiedValue);
    } catch (error) {
      console.warn(`Error setting localStorage key "${key}":`, error);
    }
  }
  
function safeRemoveItem(key: string): void {
  try {
    localStorage.removeItem(key);
  } catch (error) {
    console.warn(`Error removing localStorage key "${key}":`, error);
  }
}
  
  // You might not need a safe clear, but if you do, be mindful of its broad impact
  function clearAllAppData(): void {
      // A more targeted clear if you only want to remove app-specific data
      Object.values(LOCAL_STORAGE_KEYS).forEach(key => {
          try {
              localStorage.removeItem(key);
          } catch (error) {
              console.warn(`Error removing localStorage key "${key}" during clear:`, error);
          }
      });
      // Or if you truly mean to clear everything:
      // try {
      //   localStorage.clear();
      // } catch (error) {
      //   console.warn(`Error clearing localStorage:`, error);
      // }
  }
  
  
  export const storage = {
    get: safeGetItem,
    set: safeSetItem,
    remove: safeRemoveItem,
    clearAppData: clearAllAppData, // Or a more general clear if needed
    KEYS: LOCAL_STORAGE_KEYS,
  };