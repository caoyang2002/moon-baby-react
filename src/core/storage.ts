/**
 * chrome.storage.local adapter — falls back to localStorage in dev
 */
const hasChromeStorage =
  typeof chrome !== "undefined" && !!chrome.storage?.local;

export const Storage = {
  async get<T>(key: string): Promise<T | null> {
    if (hasChromeStorage) {
      return new Promise(r =>
        chrome.storage.local.get(key, res => r((res[key] as T) ?? null))
      );
    }
    try { return JSON.parse(localStorage.getItem(key) ?? "null") as T; }
    catch { return null; }
  },
  async set<T>(key: string, value: T): Promise<void> {
    if (hasChromeStorage) {
      return new Promise(r => chrome.storage.local.set({ [key]: value }, r));
    }
    try { localStorage.setItem(key, JSON.stringify(value)); } catch {}
  },
   async getAll<T = Record<string, unknown>>(keys: string[]): Promise<T> {
    if (hasChromeStorage) {
      return new Promise((resolve) => {
        chrome.storage.local.get(keys, (items) => {
          resolve(items as T);
        });
      });
    }
    
    const out: Record<string, unknown> = {};
    keys.forEach(k => {
      try { 
        out[k] = JSON.parse(localStorage.getItem(k) ?? "null"); 
      } catch {}
    });
    return out as T;
  },
  async setAll(obj: Record<string, unknown>): Promise<void> {
    if (hasChromeStorage) {
      return new Promise(r => chrome.storage.local.set(obj, r));
    }
    Object.entries(obj).forEach(([k, v]) => {
      try { localStorage.setItem(k, JSON.stringify(v)); } catch {}
    });
  },
  async clear(): Promise<void> {
    if (hasChromeStorage) {
      return new Promise(r => chrome.storage.local.clear(r));
    }
    localStorage.clear();
  },
};

export const STORAGE_KEYS = {
  settings: "yb_settings",
  history:  "yb_history",
} as const;


export const KEYS = {
  settings: "yb_settings",
  history:  "yb_history",
} as const;

