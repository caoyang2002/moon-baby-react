import { useState, useEffect } from "react";
import { useStore } from "@/store";
import { Bridge } from "@/core/bridge";
import { writeRich, writePlain } from "@/core/clipboard";
import { toast } from "@/components/shared/Toast";
import type { CopyFormat } from "@/types";
import ArticleList from "./ArticleList";
import DebugPanel from "./DebugPanel";
import SelectorTool from "./SelectorTool";
import HistoryList from "./HistoryList";
import TemplateTool from "./TemplateTool";
import TitleTool from "./TitleTool";
import TextTool from "./TextTool";

export default function ArticlePane() {
  const { state, act } = useStore();
  const [fmt, setFmt] = useState<CopyFormat>(state.settings.defaultFormat);

  useEffect(() => setFmt(state.settings.defaultFormat), [state.settings.defaultFormat]);

  // ── handlers ──────────────────────────────────────────────────────────────
  const handleExtract = async () => {
    act.setLoading("提取中...");
    try {
      const r = await Bridge.extract();
      if (r.success) act.setSuccess(`✅ 找到 ${r.count} 篇文章`, r.articles, r.formats);
      else act.setError("❌ " + (r.message || "提取失败"));
    } catch (e) { act.setError("❌ " + (e as Error).message); }
  };

  const handleCopy = async () => {
    const { formats } = state;
    if (!formats) return;
    act.setLoading("复制中...");
    try {
      let mode: "rich"|"plain";
      if      (fmt === "plainText")     { await writePlain(formats.plainText);     mode = "plain"; }
      else if (fmt === "markdown")      { await writePlain(formats.markdown);       mode = "plain"; }
      else if (fmt === "json")          { await writePlain(formats.json);           mode = "plain"; }
      else if (fmt === "containerHTML") { mode = await writeRich(formats.containerHTML, formats.plainText); }
      else                             { mode = await writeRich(formats.richHTML,       formats.plainText); }
      const label = mode === "rich" ? "富文本" : "纯文本";
      act.setIdle(`✅ 已复制 ${label}！`);
      toast(`✅ 已复制 ${label}`);
      setTimeout(() => act.setIdle("就绪"), 2500);
    } catch (e) { act.setError("❌ 复制失败：" + (e as Error).message); }
  };

  const handleSave = async () => {
    if (!state.articles.length || !state.formats) return;
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    await act.saveToHistory(state.articles, state.formats, tab?.url ?? "");
    toast("💾 已保存到历史记录");
  };

  const handleDebug = async () => {
    act.setLoading("获取调试信息...");
    try {
      const r = await Bridge.debug();
      const d = r.debug;
      let txt = `URL: ${d.url}\n\n─── Shadow DOM ───\n`;
      if (d.shadowDOMHosts.length) {
        d.shadowDOMHosts.forEach(h => {
          const s = h.hasShadowRoot
            ? (h.articleCount > 0 ? `✅ ${h.articleCount} 篇` : "⚠️ 无文章")
            : "❌ 无 shadowRoot";
          txt += `  ${h.classes}\n  └─ ${s}\n`;
        });
      } else txt += `  未找到宿主\n`;
      txt += `\n─── 普通 DOM ───\n  节点数: ${d.documentArticleCount}\n`;
      txt += `\n─── 来源 ───\n  ${d.finalSource ? (d.finalSource === "shadow" ? "✅ Shadow DOM" : "✅ 普通 DOM") : "❌ 未找到"}\n`;
      if (d.articles.length) { txt += `\n─── 文章 ───\n`; d.articles.forEach(a => { txt += `  [${a.serial}] ${a.title}\n`; }); }
      act.showDebug(txt);
      act.setIdle("就绪");
    } catch (e) { act.setError("❌ " + (e as Error).message); }
  };

  const handleReload = async () => {
    act.setLoading("重新注入脚本...");
    try {
      await Bridge.forceReload();
      act.setIdle("✅ 脚本已刷新");
      toast("✅ 脚本已刷新");
      setTimeout(() => act.setIdle("就绪"), 1500);
    } catch (e) { act.setError("❌ " + (e as Error).message); }
  };

  // expose debug/reload for TopNav buttons
  useEffect(() => {
    (window as unknown as Record<string, unknown>).__ybDebug  = handleDebug;
    (window as unknown as Record<string, unknown>).__ybReload = handleReload;
  });

  const side = state.activeSideItem;
  const titles: Record<string, string> = {
    history: "历史文章推荐", templates: "文章模板",
    title: "标题优化", text: "正文排版", selector: "选择器测试",
  };

  const renderBody = () => {
    if (side === "selector")  return <SelectorTool />;
    if (side === "history")   return <HistoryList />;
    if (side === "templates") return <TemplateTool />;
    if (side === "title")     return <TitleTool />;
    if (side === "text")      return <TextTool />;
    // default: article list
    if (state.phase === "loading") return (
      <div className="empty"><span className="spinner" />提取中…</div>
    );
    if (state.phase === "error") return (
      <div style={{padding:"12px",background:"#fef2f2",borderRadius:"8px",color:"#b91c1c",fontSize:"12px"}}>
        {state.errorMessage}
      </div>
    );
    return <ArticleList articles={state.articles} />;
  };

  return (
    <div className="pane on">
      <div className="ph">
        <div className="phl">
          <span className="pane-title">{titles[side] ?? "文章编辑"}</span>
          <div className={`status ${state.phase}`}>
            <span className="status-dot" />{state.statusText}
          </div>
        </div>
        <div className="phr">
          <select className="sel" value={fmt} onChange={e => setFmt(e.target.value as CopyFormat)}>
            <option value="richHTML">富文本卡片</option>
            <option value="containerHTML">原始容器 HTML</option>
            <option value="plainText">纯文本</option>
            <option value="markdown">Markdown</option>
            <option value="json">JSON</option>
          </select>
          <button className="btn primary sm" onClick={handleExtract}>🔍 提取</button>
          <button className="btn success sm" onClick={handleCopy} disabled={!state.formats}>
            📋 复制 <span className="badge">{state.articles.length}</span>
          </button>
          <button className="btn ghost sm" onClick={handleSave}
            disabled={!state.articles.length} title="保存到历史">💾</button>
        </div>
      </div>

      <div className="scroll" style={{display:"flex",flexDirection:"column"}}>
        {renderBody()}
      </div>

      {state.debugVisible && <DebugPanel />}

      <div className="pf">
        <span style={{fontSize:"11px",color:"var(--t3)"}}>
          {state.articles.length ? `共 ${state.articles.length} 篇文章` : "等待操作…"}
        </span>
        <span style={{fontSize:"10px",color:"var(--bd)",fontWeight:700,letterSpacing:".5px"}}>
          v0.0.4
        </span>
      </div>
    </div>
  );
}
