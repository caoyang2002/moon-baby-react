import { useStore } from "@/store";
import type { TabId } from "@/types";

interface SbItem  { id: string; icon: string; label: string }
interface SbSec   { label: string; items: SbItem[] }

const CFG: Record<TabId, SbSec[]> = {
  article: [
    { label: "内容工具", items: [
      { id: "history",   icon: "📚", label: "历史文章" },
      { id: "templates", icon: "📋", label: "文章模板" },
      { id: "title",     icon: "🔤", label: "标题优化" },
      { id: "text",      icon: "✏️", label: "正文排版" },
    ]},
    { label: "开发", items: [
      { id: "selector",  icon: "🔎", label: "测试选择器" },
    ]},
  ],
  graphic: [
    { label: "视图", items: [
      { id: "zoom",    icon: "🔍", label: "缩放" },
      { id: "border",  icon: "⬛", label: "边框" },
      { id: "bgcolor", icon: "🎨", label: "背景色" },
    ]},
    { label: "布局", items: [
      { id: "template", icon: "📋", label: "模板" },
      { id: "align",    icon: "⬛", label: "对齐" },
    ]},
  ],
  image: [
    { label: "编辑", items: [
      { id: "adjust",    icon: "🎚️", label: "调色" },
      { id: "crop",      icon: "✂️",  label: "裁剪" },
      { id: "watermark", icon: "💧", label: "水印" },
      { id: "compress",  icon: "📦", label: "压缩" },
    ]},
  ],
  gif: [
    { label: "动画", items: [
      { id: "anim",    icon: "🎞️", label: "动画类型" },
      { id: "speed",   icon: "⚡", label: "速度/时长" },
      { id: "loop",    icon: "🔁", label: "循环/触发" },
    ]},
    { label: "内容", items: [
      { id: "content", icon: "📝", label: "内容编辑" },
    ]},
  ],
  h5: [
    { label: "页面", items: [
      { id: "elements", icon: "🧩", label: "元素" },
      { id: "page",     icon: "🗂️", label: "页面设置" },
    ]},
  ],
  settings: [
    { label: "偏好", items: [
      { id: "general",  icon: "🔧", label: "通用" },
      { id: "format",   icon: "📄", label: "默认格式" },
      { id: "history",  icon: "📚", label: "历史记录" },
    ]},
    { label: "数据", items: [
      { id: "importexport", icon: "🔄", label: "导入/导出" },
      { id: "danger",       icon: "⚠️", label: "危险操作" },
    ]},
  ],
};

export default function Sidebar() {
  const { state, act } = useStore();
  const secs = CFG[state.activeTab] ?? [];
  return (
    <aside className="sidebar">
      {secs.map((sec, si) => (
        <div key={sec.label}>
          {si > 0 && <div className="sb-div" />}
          <div className="sb-sec">
            <div className="sb-lbl">{sec.label}</div>
            {sec.items.map(item => (
              <button key={item.id}
                className={`sb-btn${state.activeSideItem === item.id ? " active" : ""}`}
                onClick={() => act.setSide(item.id)}>
                <span className="sb-icon">{item.icon}</span>
                <span>{item.label}</span>
              </button>
            ))}
          </div>
        </div>
      ))}
    </aside>
  );
}
