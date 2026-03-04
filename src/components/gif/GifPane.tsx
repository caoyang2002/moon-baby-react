import { useState, useEffect, useRef } from "react";
import { showToast } from "@/components/shared/Toast";
import { writePlain } from "@/core/clipboard";

type AnimType = "bounce" | "fade" | "rotate" | "scale" | "slide" | "shake";

const ANIM_STYLES: Record<AnimType, string> = {
  bounce:  "animation: yb-bounce var(--dur) ease-in-out infinite",
  fade:    "animation: yb-fade var(--dur) ease-in-out infinite",
  rotate:  "animation: yb-rotate var(--dur) linear infinite",
  scale:   "animation: yb-scale var(--dur) ease-in-out infinite",
  slide:   "animation: yb-slide var(--dur) ease-in-out infinite",
  shake:   "animation: yb-shake var(--dur) ease-in-out infinite",
};

const CSS_KEYFRAMES = `
@keyframes yb-bounce { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-18px)} }
@keyframes yb-fade   { 0%,100%{opacity:1} 50%{opacity:.15} }
@keyframes yb-rotate { to{transform:rotate(360deg)} }
@keyframes yb-scale  { 0%,100%{transform:scale(1)} 50%{transform:scale(1.35)} }
@keyframes yb-slide  { 0%,100%{transform:translateX(0)} 50%{transform:translateX(22px)} }
@keyframes yb-shake  { 0%,100%{transform:rotate(0)} 25%{transform:rotate(-12deg)} 75%{transform:rotate(12deg)} }
`;

const EMOJIS = ["🎉","🔥","💡","⚡","✨","🚀","❤️","🎯","🌟","💎","🎊","👏"];

export default function GifPane() {
  const [animType, setAnimType] = useState<AnimType>("bounce");
  const [speed, setSpeed]       = useState(1.0);
  const [loop, setLoop]         = useState(true);
  const [content, setContent]   = useState("🎉");
  const [playing, setPlaying]   = useState(true);
  const frameRef = useRef<HTMLDivElement>(null);

  const dur = `${(1 / speed).toFixed(2)}s`;
  const loopVal = loop ? "infinite" : "1";

  const animStyle = playing
    ? ANIM_STYLES[animType]
        .replace("var(--dur)", dur)
        .replace("infinite", loopVal)
    : "";

  // inject keyframes once
  useEffect(() => {
    const id = "yb-gif-keyframes";
    if (!document.getElementById(id)) {
      const style = document.createElement("style");
      style.id = id;
      style.textContent = CSS_KEYFRAMES;
      document.head.appendChild(style);
    }
  }, []);

  const handleExportCode = async () => {
    const code = `<style>${CSS_KEYFRAMES}</style>
<div style="display:inline-flex;align-items:center;justify-content:center;
width:120px;height:120px;background:#fff;border-radius:12px;
font-size:56px;${animStyle}">
${content}
</div>`;
    await writePlain(code);
    showToast("已复制动图代码");
  };

  const animLabels: { id: AnimType; label: string }[] = [
    { id: "bounce", label: "弹跳" },
    { id: "fade",   label: "淡入淡出" },
    { id: "rotate", label: "旋转" },
    { id: "scale",  label: "缩放" },
    { id: "slide",  label: "滑动" },
    { id: "shake",  label: "抖动" },
  ];

  return (
    <div className="pane active" id="pane-gif" style={{ flexDirection: "row" }}>
      {/* Preview */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
        <div className="gif-bg" style={{ flex: 1 }}>
          <div
            ref={frameRef}
            className="gif-frame"
            style={{ fontSize: 56, ...(playing ? { animation: `${animType === "rotate" ? "yb-rotate" : `yb-${animType}`} ${dur} ${animType === "rotate" ? "linear" : "ease-in-out"} ${loopVal}` } : {}) }}
          >
            {content}
          </div>
        </div>

        {/* Controls row */}
        <div style={{ padding: "10px 14px", background: "var(--surface)", borderTop: "1px solid var(--border)", display: "flex", alignItems: "center", gap: 8 }}>
          <button
            className={`btn btn-sm ${playing ? "btn-danger" : "btn-success"}`}
            onClick={() => setPlaying((p) => !p)}
          >
            {playing ? "⏸ 停止" : "▶ 播放"}
          </button>
          <button className="btn btn-primary btn-sm" onClick={handleExportCode}>
            复制代码
          </button>
        </div>
      </div>

      {/* Right panel */}
      <div style={{ width: 200, background: "var(--surface)", borderLeft: "1px solid var(--border)", padding: 12, overflowY: "auto", flexShrink: 0 }}>
        {/* Anim type */}
        <div className="sec-label" style={{ marginTop: 0 }}>动画类型</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 4, marginBottom: 10 }}>
          {animLabels.map(({ id, label }) => (
            <button
              key={id}
              className={`btn btn-sm ${animType === id ? "btn-primary" : "btn-ghost"}`}
              style={{ justifyContent: "center" }}
              onClick={() => setAnimType(id)}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Speed */}
        <div className="sec-label">速度</div>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "var(--text-2)", marginBottom: 3 }}>
          <span>慢</span>
          <span>{speed.toFixed(1)}x</span>
          <span>快</span>
        </div>
        <input
          type="range" min={0.2} max={3} step={0.1}
          value={speed}
          onChange={(e) => setSpeed(+e.target.value)}
          style={{ width: "100%", marginBottom: 10 }}
        />

        {/* Loop */}
        <div className="sec-label">循环</div>
        <label style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10, cursor: "pointer", fontSize: 12 }}>
          <input
            type="checkbox"
            className="toggle"
            checked={loop}
            onChange={(e) => setLoop(e.target.checked)}
          />
          循环播放
        </label>

        {/* Content */}
        <div className="sec-label">内容</div>
        <input
          className="input"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="文字或 Emoji"
          style={{ marginBottom: 8, fontSize: 11, padding: "4px 8px" }}
        />
        <div style={{ display: "flex", flexWrap: "wrap", gap: 3 }}>
          {EMOJIS.map((em) => (
            <button
              key={em}
              className="t-btn"
              style={{ fontSize: 16, width: 28, height: 28 }}
              onClick={() => setContent(em)}
              title={em}
            >
              {em}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
