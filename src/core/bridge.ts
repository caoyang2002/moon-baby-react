/**
 * bridge.ts — Popup → MAIN world communication
 *
 * Uses chrome.scripting.executeScript({ world: "MAIN" }) to inject
 * extractor.js + formatter.js into the page's MAIN world, bypassing
 * ISOLATED world's inability to pierce other extensions' Shadow DOMs.
 */
import type {
  Article, ArticleFormats, ExtractResult, DebugInfo, SelectorResult,
} from "@/types";

const MAIN_FILES = ["core/extractor.js", "core/formatter.js"];

async function getTabId(): Promise<number> {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab?.id) throw new Error("无法获取当前 Tab ID");
  return tab.id;
}

async function ensureReady(tabId: number) {
  const [check] = await chrome.scripting.executeScript({
    target: { tabId }, world: "MAIN",
    func: () =>
      typeof (window as unknown as Record<string,unknown>).__ArticleExtractor !== "undefined",
  });
  if (!check?.result) {
    for (const file of MAIN_FILES) {
      await chrome.scripting.executeScript({ target: { tabId }, world: "MAIN", files: [file] });
    }
  }
}

async function execMain<T>(fn: (...a: unknown[]) => T, args: unknown[] = []): Promise<T> {
  const tabId = await getTabId();
  await ensureReady(tabId);
  const results = await chrome.scripting.executeScript({
    target: { tabId }, world: "MAIN",
    func: fn as () => T,  
    args: args as [],  // 类型断言为 []
  });
  return results[0]?.result as T;
}

export const Bridge = {
  async extract(): Promise<ExtractResult> {
    type RawExtract = { success: boolean; message?: string; articles?: Article[]; containerHTML?: string; source?: string };
    const raw = await execMain(() =>
      (window as unknown as { __ArticleExtractor: { extractArticles: () => unknown } })
        .__ArticleExtractor.extractArticles()
    ) as RawExtract;

    if (!raw?.success) return { success: false, message: raw?.message ?? "提取失败" };

    const formats = await execMain(
      (articles: unknown, containerHTML: unknown) => {
        const F = (window as unknown as { __ArticleFormatter: {
          toDocHTML:(a:unknown)=>string; toRichHTML:(a:unknown)=>string;
          toPlainText:(a:unknown)=>string; toMarkdown:(a:unknown)=>string; toJSON:(a:unknown)=>string;
        }})
        .__ArticleFormatter;
        return {
          docHTML: F.toDocHTML(articles), richHTML: F.toRichHTML(articles),
          plainText: F.toPlainText(articles), markdown: F.toMarkdown(articles),
          json: F.toJSON(articles), containerHTML: (containerHTML as string) || "",
        };
      },
      [raw.articles, raw.containerHTML]
    ) as ArticleFormats;

    return {
      success: true, count: raw.articles!.length,
      articles: raw.articles!, source: (raw.source as "shadow"|"document") ?? "document",
      formats,
    };
  },

  async debug(): Promise<{ success: true; debug: DebugInfo }> {
    const debug = await execMain(() =>
      (window as unknown as { __ArticleExtractor: { collectDebugInfo: () => DebugInfo } })
        .__ArticleExtractor.collectDebugInfo()
    );
    return { success: true, debug };
  },

  async testSelector(selector: string): Promise<SelectorResult> {
    return execMain(
      (sel: unknown) =>
        (window as unknown as { __ArticleExtractor: { testSelector:(s:string)=>SelectorResult } })
          .__ArticleExtractor.testSelector(sel as string),
      [selector]
    );
  },

  async forceReload(): Promise<void> {
    const tabId = await getTabId();
    for (const file of MAIN_FILES) {
      await chrome.scripting.executeScript({ target: { tabId }, world: "MAIN", files: [file] });
    }
  },
};
