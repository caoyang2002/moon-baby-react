import {
  createContext, useContext, useReducer, useEffect,
  type ReactNode, type Dispatch,
} from "react";
import type {
  AppState, Article, ArticleFormats, CopyFormat,
  HistoryEntry, Settings, SelectorResult, TabId, Phase,
} from "@/types";
import { Storage, KEYS } from "@/core/storage";

// ── Defaults ──────────────────────────────────────────────────────────────────
export const DEFAULT_SETTINGS: Settings = {
  defaultFormat: "richHTML",
  maxHistory: 50,
  autoExtract: false,
  showDebugByDefault: false,
};

const INITIAL: AppState = {
  phase: "idle", statusText: "就绪",
  articles: [], formats: null, errorMessage: "",
  debugVisible: false, debugContent: "", selectorResult: null,
  activeTab: "article", activeSideItem: "history",
  settings: { ...DEFAULT_SETTINGS }, history: [], storageReady: false,
};

// ── Action types ──────────────────────────────────────────────────────────────
type Action =
  | { type: "LOADING";    text?: string }
  | { type: "SUCCESS";    text: string; articles: Article[]; formats: ArticleFormats }
  | { type: "ERROR";      msg: string }
  | { type: "IDLE";       text?: string }
  | { type: "SHOW_DEBUG"; content: string }
  | { type: "HIDE_DEBUG" }
  | { type: "SEL_RESULT"; result: SelectorResult | null }
  | { type: "SET_TAB";    tab: TabId }
  | { type: "SET_SIDE";   item: string }
  | { type: "SET_SETTINGS"; settings: Settings }
  | { type: "SET_HISTORY";  history: HistoryEntry[] }
  | { type: "STORAGE_READY"; settings: Settings; history: HistoryEntry[] }
  | { type: "LOAD_HISTORY";  entry: HistoryEntry };

// ── Reducer ───────────────────────────────────────────────────────────────────
function reducer(s: AppState, a: Action): AppState {
  switch (a.type) {
    case "LOADING":
      return { ...s, phase: "loading", statusText: a.text ?? "处理中...", errorMessage: "" };
    case "SUCCESS":
      return { ...s, phase: "success", statusText: a.text, articles: a.articles, formats: a.formats };
    case "ERROR":
      return { ...s, phase: "error", statusText: a.msg, errorMessage: a.msg };
    case "IDLE":
      return { ...s, phase: "idle", statusText: a.text ?? "就绪" };
    case "SHOW_DEBUG":
      return { ...s, debugVisible: true, debugContent: a.content };
    case "HIDE_DEBUG":
      return { ...s, debugVisible: false };
    case "SEL_RESULT":
      return { ...s, selectorResult: a.result };
    case "SET_TAB":
      // reset sideItem to default when switching tabs
      return { ...s, activeTab: a.tab, activeSideItem: getDefaultSide(a.tab) };
    case "SET_SIDE":
      return { ...s, activeSideItem: a.item };
    case "SET_SETTINGS":
      return { ...s, settings: a.settings };
    case "SET_HISTORY":
      return { ...s, history: a.history };
    case "STORAGE_READY":
      return { ...s, storageReady: true, settings: a.settings, history: a.history };
    case "LOAD_HISTORY":
      return {
        ...s,
        articles: a.entry.articles, formats: a.entry.formats,
        phase: "success" as Phase,
        statusText: `✅ 已加载 ${a.entry.count} 篇（${a.entry.savedAt}）`,
      };
    default: return s;
  }
}

function getDefaultSide(tab: TabId): string {
  const map: Record<TabId, string> = {
    article: "history", graphic: "zoom", image: "adjust",
    gif: "anim", h5: "elements", settings: "general",
  };
  return map[tab];
}

// ── Context ───────────────────────────────────────────────────────────────────
interface Ctx {
  state: AppState;
  dispatch: Dispatch<Action>;
  act: Actions;
}

const Cx = createContext<Ctx | null>(null);

export function useStore() {
  const c = useContext(Cx);
  if (!c) throw new Error("useStore outside StoreProvider");
  return c;
}

// ── Action helpers ────────────────────────────────────────────────────────────
interface Actions {
  setLoading: (text?: string) => void;
  setSuccess:  (text: string, articles: Article[], formats: ArticleFormats) => void;
  setError:    (msg: string) => void;
  setIdle:     (text?: string) => void;
  showDebug:   (content: string) => void;
  hideDebug:   () => void;
  setSelectorResult: (r: SelectorResult | null) => void;
  setTab:  (tab: TabId) => void;
  setSide: (item: string) => void;
  updateSettings: (patch: Partial<Settings>) => Promise<void>;
  resetSettings:  () => Promise<void>;
  saveToHistory:  (articles: Article[], formats: ArticleFormats, url: string) => Promise<void>;
  deleteHistory:  (id: number) => Promise<void>;
  clearHistory:   () => Promise<void>;
  loadHistory:    (entry: HistoryEntry) => void;
  exportData:     () => string;
  importData:     (json: string) => Promise<void>;
  clearAllData:   () => Promise<void>;
  getDefaultFormat: () => CopyFormat;
}

function makeActions(state: AppState, dispatch: Dispatch<Action>): Actions {
  return {
    setLoading: (text?) => dispatch({ type: "LOADING", text }),
    setSuccess:  (text, articles, formats) => dispatch({ type: "SUCCESS", text, articles, formats }),
    setError:    (msg)  => dispatch({ type: "ERROR", msg }),
    setIdle:     (text?)=> dispatch({ type: "IDLE", text }),
    showDebug:   (content) => dispatch({ type: "SHOW_DEBUG", content }),
    hideDebug:   ()    => dispatch({ type: "HIDE_DEBUG" }),
    setSelectorResult: (result) => dispatch({ type: "SEL_RESULT", result }),
    setTab:  (tab)  => dispatch({ type: "SET_TAB", tab }),
    setSide: (item) => dispatch({ type: "SET_SIDE", item }),

    async updateSettings(patch) {
      const next = { ...state.settings, ...patch };
      dispatch({ type: "SET_SETTINGS", settings: next });
      await Storage.set(KEYS.settings, next);
    },
    async resetSettings() {
      dispatch({ type: "SET_SETTINGS", settings: { ...DEFAULT_SETTINGS } });
      await Storage.set(KEYS.settings, DEFAULT_SETTINGS);
    },
    async saveToHistory(articles, formats, url) {
      const entry: HistoryEntry = {
        id: Date.now(), savedAt: new Date().toLocaleString("zh-CN"),
        count: articles.length, url, articles: [...articles], formats,
      };
      const next = [entry, ...state.history].slice(0, state.settings.maxHistory);
      dispatch({ type: "SET_HISTORY", history: next });
      await Storage.set(KEYS.history, next);
    },
    async deleteHistory(id) {
      const next = state.history.filter(h => h.id !== id);
      dispatch({ type: "SET_HISTORY", history: next });
      await Storage.set(KEYS.history, next);
    },
    async clearHistory() {
      dispatch({ type: "SET_HISTORY", history: [] });
      await Storage.set(KEYS.history, []);
    },
    loadHistory: (entry) => dispatch({ type: "LOAD_HISTORY", entry }),

    exportData: () => JSON.stringify({
      _version: "0.0.4", _exportedAt: new Date().toISOString(),
      settings: state.settings, history: state.history,
    }, null, 2),

    async importData(jsonStr) {
      let data: { settings?: Partial<Settings>; history?: HistoryEntry[] };
      try { data = JSON.parse(jsonStr); }
      catch { throw new Error("JSON 格式无效"); }
      const settings: Settings = { ...DEFAULT_SETTINGS, ...(data.settings ?? {}) };
      const history: HistoryEntry[] = Array.isArray(data.history) ? data.history : [];
      dispatch({ type: "SET_SETTINGS", settings });
      dispatch({ type: "SET_HISTORY",  history });
      await Storage.setAll({ [KEYS.settings]: settings, [KEYS.history]: history });
    },

    async clearAllData() {
      await Storage.clear();
      dispatch({ type: "SET_SETTINGS", settings: { ...DEFAULT_SETTINGS } });
      dispatch({ type: "SET_HISTORY",  history: [] });
    },

    getDefaultFormat: () => state.settings.defaultFormat,
  };
}

// ── Provider ──────────────────────────────────────────────────────────────────
export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, INITIAL);

  useEffect(() => {
    (async () => {
      const saved = await Storage.getAll([KEYS.settings, KEYS.history]);
      dispatch({
        type: "STORAGE_READY",
        settings: { ...DEFAULT_SETTINGS, ...((saved[KEYS.settings] ?? {}) as Partial<Settings>) },
        history:  (saved[KEYS.history] as HistoryEntry[]) ?? [],
      });
    })();
  }, []);

  const act = makeActions(state, dispatch);

  return <Cx.Provider value={{ state, dispatch, act }}>{children}</Cx.Provider>;
}
