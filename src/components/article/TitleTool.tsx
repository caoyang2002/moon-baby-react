import { useStore } from "@/store";
import { showToast } from "@/components/shared/Toast";

export default function HistoryList() {
  const { state, act } = useStore();

  if (!state.storageReady) {
    return <div className="empty"><span className="spinner" />加载中…</div>;
  }

  if (!state.history.length) {
    return (
      <div className="empty" style={{ flex: 1 }}>
        <div className="empty-icon">📚</div>
        <div className="empty-title">暂无历史记录</div>
        <div className="empty-desc">提取文章后点击 💾 保存到这里</div>
      </div>
    );
  }

  return (
    <div className="scroll">
      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 8 }}>
        <button
          className="btn btn-ghost btn-sm"
          style={{ color: "var(--red)" }}
          onClick={async () => {
            if (confirm("确定清空所有历史记录？")) {
              await act.clearHistory();
              showToast("已清空历史记录");
            }
          }}
        >
          清空
        </button>
      </div>
      {state.history.map((entry) => (
        <div key={entry.id} className="history-item" onClick={() => act.loadHistory(entry)}>
          <div className="history-meta">
            <div style={{ fontSize: 12, fontWeight: 600, color: "var(--text-1)", marginBottom: 2 }}>
              {entry.savedAt}
            </div>
            <div className="history-url" title={entry.url}>
              {entry.url || "（无 URL）"}
            </div>
          </div>
          <span className="history-count">{entry.count} 篇</span>
          <button
            className="btn btn-ghost btn-sm"
            style={{ padding: "2px 6px", fontSize: 11 }}
            onClick={(e) => {
              e.stopPropagation();
              act.deleteHistory(entry.id);
            }}
          >
            ✕
          </button>
        </div>
      ))}
    </div>
  );
}
