import { useStore } from "@/store";
import type { TabId } from "@/types";

const TABS: { id: TabId; icon: string; label: string }[] = [
  { id: "article",  icon: "📝", label: "文章编辑" },
  { id: "graphic",  icon: "🖼️", label: "图文编辑" },
  { id: "image",    icon: "🎨", label: "图片编辑" },
  { id: "gif",      icon: "✨", label: "动图编辑" },
  { id: "h5",       icon: "📱", label: "H5 编辑"  },
  { id: "settings", icon: "⚙️", label: "设置"     },
];

interface Props { onDebug: () => void; onReload: () => void; }

export default function TopNav({ onDebug, onReload }: Props) {
  const { state, act } = useStore();
  return (
    <nav className="nav">
      <div className="nav-brand">
        <div className="nav-logo">🌙</div>
        <span className="nav-name">月贝编辑器</span>
      </div>
      <div className="nav-tabs">
        {TABS.map(t => (
          <button key={t.id}
            className={`nav-tab${state.activeTab === t.id ? " active" : ""}`}
            onClick={() => act.setTab(t.id)}>
            {t.icon} {t.label}
          </button>
        ))}
      </div>
      <div className="nav-acts">
        <button className="nav-icon-btn" title="调试"     onClick={onDebug}>🔧</button>
        <button className="nav-icon-btn" title="刷新脚本" onClick={onReload}>🔄</button>
      </div>
    </nav>
  );
}
