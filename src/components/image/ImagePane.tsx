import { useState, useRef } from "react";
import { showToast } from "@/components/shared/Toast";

interface Filters { brightness: number; contrast: number; saturate: number; }
type CropRatio = "1:1" | "4:3" | "16:9" | "free";

export default function ImagePane() {
  const [imgSrc, setImgSrc]       = useState<string | null>(null);
  const [filters, setFilters]     = useState<Filters>({ brightness: 100, contrast: 100, saturate: 100 });
  const [cropRatio, setCropRatio] = useState<CropRatio>("free");
  const [watermark, setWatermark] = useState("");
  const [wmPos, setWmPos]         = useState("bottom-right");
  const fileRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const handleUpload = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => setImgSrc(e.target?.result as string);
    reader.readAsDataURL(file);
  };

  const filterStyle = `brightness(${filters.brightness}%) contrast(${filters.contrast}%) saturate(${filters.saturate}%)`;

  const handleExport = async () => {
    if (!imgSrc) return;
    const a = document.createElement("a");
    a.href = imgSrc;
    a.download = "edited-image.png";
    a.click();
    showToast("已导出图片");
  };

  const cropLabels: CropRatio[] = ["1:1", "4:3", "16:9", "free"];

  return (
    <div className="pane active" id="pane-image" style={{ flexDirection: "row" }}>
      {/* Image area */}
      <div
        className="image-area"
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          const f = e.dataTransfer.files[0];
          if (f?.type.startsWith("image/")) handleUpload(f);
        }}
      >
        {imgSrc ? (
          <img
            src={imgSrc}
            alt="edit"
            style={{
              maxWidth: "100%",
              maxHeight: "100%",
              objectFit: "contain",
              filter: filterStyle,
              position: "relative",
            }}
          />
        ) : (
          <div className="empty" style={{ color: "rgba(255,255,255,.35)" }}>
            <div className="empty-icon" style={{ fontSize: 48 }}>🖼️</div>
            <div className="empty-title" style={{ color: "rgba(255,255,255,.5)" }}>
              拖拽图片到此处
            </div>
            <div className="empty-desc" style={{ color: "rgba(255,255,255,.3)" }}>
              或点击下方按钮上传
            </div>
            <button
              className="btn btn-ghost btn-sm"
              style={{ marginTop: 8, color: "rgba(255,255,255,.6)", borderColor: "rgba(255,255,255,.2)" }}
              onClick={() => fileRef.current?.click()}
            >
              上传图片
            </button>
          </div>
        )}
        {watermark && imgSrc && (
          <div style={{
            position: "absolute",
            [wmPos.includes("bottom") ? "bottom" : "top"]: 12,
            [wmPos.includes("right") ? "right" : "left"]: 12,
            color: "rgba(255,255,255,.7)",
            fontSize: 13,
            fontWeight: 600,
            textShadow: "0 1px 3px rgba(0,0,0,.6)",
            pointerEvents: "none",
          }}>
            {watermark}
          </div>
        )}
        <canvas ref={canvasRef} style={{ display: "none" }} />
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          style={{ display: "none" }}
          onChange={(e) => { const f = e.target.files?.[0]; if (f) handleUpload(f); }}
        />
      </div>

      {/* Props panel */}
      <div className="image-props">
        {/* Upload */}
        <button
          className="btn btn-primary btn-sm"
          style={{ width: "100%", justifyContent: "center", marginBottom: 4 }}
          onClick={() => fileRef.current?.click()}
        >
          上传图片
        </button>
        <button
          className="btn btn-success btn-sm"
          style={{ width: "100%", justifyContent: "center" }}
          onClick={handleExport}
          disabled={!imgSrc}
        >
          导出图片
        </button>

        {/* Filters */}
        <div className="sec-label">调色</div>
        {([
          { key: "brightness", label: "亮度" },
          { key: "contrast",   label: "对比度" },
          { key: "saturate",   label: "饱和度" },
        ] as { key: keyof Filters; label: string }[]).map(({ key, label }) => (
          <div key={key} style={{ marginBottom: 8 }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "var(--text-2)", marginBottom: 3 }}>
              <span>{label}</span>
              <span>{filters[key]}%</span>
            </div>
            <input
              type="range" min={0} max={200}
              value={filters[key]}
              onChange={(e) => setFilters((f) => ({ ...f, [key]: +e.target.value }))}
              style={{ width: "100%", cursor: "pointer" }}
            />
          </div>
        ))}
        <button
          className="btn btn-ghost btn-sm"
          style={{ width: "100%", justifyContent: "center", marginBottom: 8 }}
          onClick={() => setFilters({ brightness: 100, contrast: 100, saturate: 100 })}
        >
          重置调色
        </button>

        {/* Crop ratio */}
        <div className="sec-label">裁剪比例</div>
        <div style={{ display: "flex", gap: 3, flexWrap: "wrap", marginBottom: 8 }}>
          {cropLabels.map((r) => (
            <button
              key={r}
              className={`btn btn-sm ${cropRatio === r ? "btn-primary" : "btn-ghost"}`}
              style={{ padding: "2px 7px", fontSize: 10 }}
              onClick={() => setCropRatio(r)}
            >
              {r}
            </button>
          ))}
        </div>

        {/* Watermark */}
        <div className="sec-label">水印</div>
        <input
          className="input"
          type="text"
          placeholder="水印文字"
          value={watermark}
          onChange={(e) => setWatermark(e.target.value)}
          style={{ marginBottom: 6, fontSize: 11, padding: "4px 8px" }}
        />
        <select
          className="select"
          value={wmPos}
          onChange={(e) => setWmPos(e.target.value)}
          style={{ width: "100%" }}
        >
          <option value="top-left">左上</option>
          <option value="top-right">右上</option>
          <option value="bottom-left">左下</option>
          <option value="bottom-right">右下</option>
        </select>
      </div>
    </div>
  );
}
