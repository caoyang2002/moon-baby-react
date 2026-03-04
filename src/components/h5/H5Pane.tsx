import { useState } from "react";
import { showToast } from "@/components/shared/Toast";

type ElemType = "heading" | "text" | "image" | "button" | "divider" | "space";

interface H5Element { id: string; type: ElemType; content: string; }

const ELEM_BUTTONS: { type: ElemType; icon: string; label: string }[] = [
  { type: "heading",  icon: "H", label: "标题" },
  { type: "text",     icon: "T", label: "文本" },
  { type: "image",    icon: "🖼", label: "图片" },
  { type: "button",   icon: "⬛", label: "按钮" },
  { type: "divider",  icon: "—", label: "分隔" },
  { type: "space",    icon: "⬜", label: "空白" },
];

function renderElem(el: H5Element) {
  switch (el.type) {
    case "heading":
      return <div key={el.id} style={{ fontSize: 16, fontWeight: 700, padding: "6px 12px", color: "#111" }}>{el.content}</div>;
    case "text":
      return <div key={el.id} style={{ fontSize: 12, padding: "4px 12px", color: "#555", lineHeight: 1.65 }}>{el.content}</div>;
    case "button":
      return <div key={el.id} style={{ padding: "6px 12px" }}>
        <div style={{ background: "#1677ff", color: "#fff", borderRadius: 6, padding: "7px 0", textAlign: "center", fontSize: 12, fontWeight: 600 }}>{el.content}</div>
      </div>;
    case "divider":
      return <div key={el.id} style={{ height: 1, background: "#eee", margin: "8px 12px" }} />;
    case "space":
      return <div key={el.id} style={{ height: 20 }} />;
    case "image":
      return <div key={el.id} style={{ padding: "6px 12px" }}>
        <div style={{ height: 80, background: "#f0f2f5", borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, color: "#bbb" }}>🖼</div>
      </div>;
    default:
      return null;
  }
}

export default function H5Pane() {
  const [elems, setElems]         = useState<H5Element[]>([
    { id: "1", type: "heading", content: "精选文章推荐" },
    { id: "2", type: "text",    content: "这里是副标题文案，简洁有力地描述本次内容主题。" },
    { id: "3", type: "divider", content: "" },
  ]);
  const [pageTitle, setPageTitle] = useState("精选文章推荐");
  const [bgColor, setBgColor]     = useState("#ffffff");
  const [themeColor, setThemeColor] = useState("#1677ff");

  const addElem = (type: ElemType) => {
    const defaults: Record<ElemType, string> = {
      heading: "标题文字",
      text:    "正文内容，在此输入您的文案。",
      image:   "",
      button:  "立即查看",
      divider: "",
      space:   "",
    };
    setElems((prev) => [
      ...prev,
      { id: Date.now().toString(), type, content: defaults[type] },
    ]);
  };

  const removeElem = (id: string) => setElems((prev) => prev.filter((e) => e.id !== id));

  const handleExport = () => {
    const body = elems.map((el) => {
      switch (el.type) {
        case "heading":  return `<h2 style="padding:6px 12px;font-size:16px;font-weight:700">${el.content}</h2>`;
        case "text":     return `<p style="padding:4px 12px;font-size:12px;color:#555;line-height:1.65">${el.content}</p>`;
        case "button":   return `<div style="padding:6px 12px"><div style="background:${themeColor};color:#fff;border-radius:6px;padding:7px;text-align:center;font-size:12px;font-weight:600">${el.content}</div></div>`;
        case "divider":  return `<hr style="height:1px;border:none;background:#eee;margin:8px 12px"/>`;
        case "space":    return `<div style="height:20px"></div>`;
        default:         return "";
      }
    }).join("\n");

    const html = `<!DOCTYPE html><html lang="zh-CN"><head><meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${pageTitle}</title>
<style>body{margin:0;padding:0;background:${bgColor};font-family:system-ui}</style>
</head><body>${body}</body></html>`;

    const a = document.createElement("a");
    a.href = "data:text/html;charset=utf-8," + encodeURIComponent(html);
    a.download = "h5-export.html";
    a.click();
    showToast("已导出 H5 文件");
  };

  return (
    <div className="pane active" id="pane-h5" style={{ flexDirection: "row" }}>
      {/* Phone preview */}
      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", background: "var(--bg)" }}>
        <div className="h5-phone">
          <div className="h5-screen" style={{ background: bgColor }}>
            {/* Status bar */}
            <div style={{ background: themeColor, padding: "6px 10px", display: "flex", justifyContent: "space-between", alignItems: "center", flexShrink: 0 }}>
              <span style={{ fontSize: 9, color: "#fff", fontWeight: 700 }}>{pageTitle}</span>
              <span style={{ fontSize: 9, color: "rgba(255,255,255,.7)" }}>12:00</span>
            </div>
            {/* Page body */}
            <div style={{ flex: 1, overflowY: "auto", padding: "4px 0" }}>
              {elems.map((el) => (
                <div key={el.id} style={{ position: "relative" }} className="h5-elem-wrap">
                  {renderElem(el)}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Right panel */}
      <div style={{ width: 210, background: "var(--surface)", borderLeft: "1px solid var(--border)", padding: 12, overflowY: "auto", flexShrink: 0 }}>
        {/* Add elements */}
        <div className="sec-label" style={{ marginTop: 0 }}>添加元素</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 4, marginBottom: 10 }}>
          {ELEM_BUTTONS.map(({ type, icon, label }) => (
            <button
              key={type}
              className="h5-el"
              style={{ flexDirection: "column", gap: 3, padding: "6px 4px", justifyContent: "center", fontSize: 11 }}
              onClick={() => addElem(type)}
            >
              <span style={{ fontSize: 16 }}>{icon}</span>
              {label}
            </button>
          ))}
        </div>

        {/* Elements list */}
        <div className="sec-label">元素列表</div>
        {elems.length === 0 ? (
          <div style={{ fontSize: 11, color: "var(--text-3)", textAlign: "center", padding: "8px 0" }}>暂无元素</div>
        ) : (
          <div style={{ marginBottom: 10 }}>
            {elems.map((el) => (
              <div key={el.id} style={{ display: "flex", alignItems: "center", gap: 6, padding: "4px 6px", border: "1px solid var(--border)", borderRadius: "var(--r)", marginBottom: 3, background: "var(--surface-2)", fontSize: 11 }}>
                <span style={{ flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", color: "var(--text-2)" }}>
                  {el.type} {el.content ? `— ${el.content.slice(0, 10)}` : ""}
                </span>
                <button
                  className="t-btn"
                  style={{ width: 20, height: 20, fontSize: 10, color: "var(--red)" }}
                  onClick={() => removeElem(el.id)}
                >✕</button>
              </div>
            ))}
          </div>
        )}

        {/* Page settings */}
        <div className="sec-label">页面设置</div>
        <div style={{ marginBottom: 6 }}>
          <div style={{ fontSize: 11, color: "var(--text-2)", marginBottom: 3 }}>页面标题</div>
          <input className="input" value={pageTitle} onChange={(e) => setPageTitle(e.target.value)} style={{ fontSize: 11, padding: "4px 8px" }} />
        </div>
        <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
          <label style={{ flex: 1, fontSize: 11, color: "var(--text-2)" }}>
            背景色<br />
            <input type="color" value={bgColor} onChange={(e) => setBgColor(e.target.value)} style={{ width: "100%", height: 28, cursor: "pointer", borderRadius: 4 }} />
          </label>
          <label style={{ flex: 1, fontSize: 11, color: "var(--text-2)" }}>
            主题色<br />
            <input type="color" value={themeColor} onChange={(e) => setThemeColor(e.target.value)} style={{ width: "100%", height: 28, cursor: "pointer", borderRadius: 4 }} />
          </label>
        </div>

        {/* Actions */}
        <button className="btn btn-ghost btn-sm" style={{ width: "100%", justifyContent: "center", marginBottom: 4 }} onClick={() => setElems([])}>
          清空元素
        </button>
        <button className="btn btn-primary btn-sm" style={{ width: "100%", justifyContent: "center" }} onClick={handleExport}>
          导出 H5
        </button>
      </div>
    </div>
  );
}
