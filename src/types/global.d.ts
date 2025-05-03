export {};

declare global {
  interface Window {
    electronAPI: {
      getItem: (key: string) => Promise<string | null>;
      setItem: (key: string, value: string | null) => Promise<void>;
    };
  }
}