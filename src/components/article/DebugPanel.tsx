import { useStore } from "@/store";

export default function DebugPanel() {
  const { state, act } = useStore();

  return (
    <div className="debug-panel">
      <div className="debug-header">
        <span>🔧 调试信息</span>
        <button className="btn-close-x" onClick={() => act.hideDebug()}>×</button>
      </div>
      <pre className="debug-pre">{state.debugContent}</pre>
    </div>
  );
}
