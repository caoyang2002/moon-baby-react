import { STORAGE_KEYS } from "@/core/storage";

export interface Article {
  id: string; index: number; serial: string;
  title: string; url: string; date: string; imgSrc: string;
}
export interface ArticleFormats {
  docHTML: string; richHTML: string; plainText: string;
  markdown: string; json: string; containerHTML: string;
}
export type CopyFormat = "richHTML"|"containerHTML"|"plainText"|"markdown"|"json";
export interface ExtractSuccess {
  success: true; count: number; articles: Article[];
  source: "shadow"|"document"; formats: ArticleFormats;
}
export interface ExtractFailure { success: false; message: string; }
export type ExtractResult = ExtractSuccess | ExtractFailure;
export interface HistoryEntry {
  id: number; savedAt: string; count: number; url: string;
  articles: Article[]; formats: ArticleFormats;
}
export interface ShadowHostInfo {
  selector: string; tagName: string; classes: string;
  hasShadowRoot: boolean; articleCount: number;
}
export interface DebugInfo {
  url: string; shadowDOMHosts: ShadowHostInfo[];
  documentArticleCount: number; finalSource: string | null;
  articles: { id: string; serial: string; title: string }[];
}
export interface SelectorResult {
  success: boolean;
  count: number; sources: string[];
  samples: { tag: string; classes: string; text: string }[];
  error?: string;
}
export interface Settings {
  defaultFormat: CopyFormat; maxHistory: number;
  autoExtract: boolean; showDebugByDefault: boolean;
}
export type TabId = "article"|"graphic"|"image"|"gif"|"h5"|"settings";
export type Phase = "idle"|"loading"|"success"|"error";
export interface AppState {
  phase: Phase; statusText: string; articles: Article[];
  formats: ArticleFormats | null; errorMessage: string;
  debugVisible: boolean; debugContent: string;
  selectorResult: SelectorResult | null;
  activeTab: TabId; activeSideItem: string;
  settings: Settings; history: HistoryEntry[]; storageReady: boolean;
}

export type SelectorTestResult = {
  success: boolean; count: number; sources: string[];
  samples: { tag: string; classes: string; text: string }[];
  error?: string;
};


export interface StorageSchema {
  [STORAGE_KEYS.settings]?: Settings;
  [STORAGE_KEYS.history]?: HistoryEntry[];
  [k: string]: unknown;
}