import { useState } from "react";
import { showToast } from "@/components/shared/Toast";
import { writeRich } from "@/core/clipboard";

type Tool = "select" | "text" | "image" | "divider";

const SAMPLE_CARDS = [
  { serial: "1", title: "如何写出让读者一读就停不下来的公众号推文", date: "2024-01-15" },
  { serial: "2", title: "微信生态流量密码：内容创作者的增长策略全解析", date: "2024-01-20" },
  { serial: "3", title: "2024 年公众号运营趋势报告：数据说话", date: "2024-01-25" },
];

export default function GraphicPane() {
  const [activeTool, setActiveTool] = useState<Tool>("select");
  const [zoom, setZoom]             = useState(100);
  const [showBorder, setShowBorder] = useState(true);
  const [bgColor, setBgColor]       = useState("#f4f6f9");

  const tools: { id: Tool; icon: string; label: string }[] = [
    { id: "select",  icon: "↖",  label: "选择" },
    { id: "text",    icon: "T",  label: "文字" },
    { id: "image",   icon: "🖼", label: "图片" },
    { id: "divider", icon: "—",  label: "分隔" },
  ];

  const handleCopyHTML = async () => {
    const html = document.getElementById("graphic-inner")?.innerHTML ?? "";
    await writeRich(html, "图文内容");
    showToast("已复制图文 HTML");
  };

  const handleExport = () => {
    const inner = document.getElementById("graphic-inner")?.innerHTML ?? "";
    const doc = `<!DOCTYPE html><html lang="zh-CN"><head><meta charset="UTF-8">
<style>body{margin:0;padding:24px;background:#f4f6f9;font-family:system-ui}</style>
</head><body>${inner}</body></html>`;
    const a = document.createElement("a");
    a.href = "data:text/html;charset=utf-8," + encodeURIComponent(doc);
    a.download = "graphic-export.html";
    a.click();
    showToast("已导出 HTML 文件");
  };

  return (
    <div className="pane active" id="pane-graphic">
      {/* Toolbar */}
      <div className="g-toolbar">
        {tools.map((t) => (
          <button
            key={t.id}
            className={`t-btn${activeTool === t.id ? " active" : ""}`}
            title={t.label}
            onClick={() => setActiveTool(t.id)}
          >
            {t.icon}
          </button>
        ))}
        <div className="t-div" />
        <button className="t-btn" title="缩小" onClick={() => setZoom((z) => Math.max(50, z - 10))}>−</button>
        <span style={{ fontSize: 11, color: "var(--text-2)", minWidth: 36, textAlign: "center" }}>{zoom}%</span>
        <button className="t-btn" title="放大" onClick={() => setZoom((z) => Math.min(200, z + 10))}>+</button>
        <button className="t-btn" title="重置缩放" onClick={() => setZoom(100)}>⊙</button>
        <div className="t-div" />
        <button
          className={`t-btn${showBorder ? " active" : ""}`}
          title="显示边框"
          onClick={() => setShowBorder((b) => !b)}
        >⬛</button>
        <label title="背景色" style={{ display: "flex", alignItems: "center", gap: 3, cursor: "pointer" }}>
          <span className="t-btn" style={{ fontSize: 10 }}>🎨</span>
          <input
            type="color"
            value={bgColor}
            onChange={(e) => setBgColor(e.target.value)}
            style={{ width: 0, height: 0, opacity: 0, position: "absolute" }}
          />
        </label>
        <div style={{ flex: 1 }} />
        <button className="btn btn-ghost btn-sm" onClick={handleCopyHTML}>复制 HTML</button>
        <button className="btn btn-primary btn-sm" onClick={handleExport}>导出</button>
      </div>

      {/* Canvas */}
      <div className="graphic-canvas" style={{ background: bgColor }}>
        <div
          id="graphic-inner"
          style={{
            transform: `scale(${zoom / 100})`,
            transformOrigin: "top center",
            maxWidth: 520,
            margin: "0 auto",
          }}
        >
          {SAMPLE_CARDS.map((c) => (
            <div
              key={c.serial}
              style={{
                background: "#fff",
                borderRadius: 10,
                padding: "14px 16px",
                marginBottom: 12,
                boxShadow: "0 1px 4px rgba(0,0,0,.06)",
                border: showBorder ? "1px solid #e8eaed" : "none",
                cursor: activeTool === "select" ? "pointer" : "crosshair",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                <span style={{ background: "#1677ff", color: "#fff", fontSize: 10, fontWeight: 700, padding: "1px 8px", borderRadius: 10 }}>
                  No.{c.serial}
                </span>
                <span style={{ fontSize: 11, color: "#9ca3af" }}>{c.date}</span>
              </div>
              <div style={{ fontSize: 14, fontWeight: 600, color: "#111", lineHeight: 1.55 }}>{c.title}</div>
              <div style={{ marginTop: 8, fontSize: 12, color: "#1677ff" }}>阅读原文 →</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
