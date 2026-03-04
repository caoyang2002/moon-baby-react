import { useState } from "react";
import { Bridge } from "@/core/bridge";
import { useStore } from "@/store";
import type { SelectorResult, SelectorTestResult } from "@/types";

export default function SelectorTool() {
  const { act } = useStore();
  const [selector, setSelector] = useState("[data-recommend-article-id]");
  const [result, setResult] = useState<SelectorTestResult | null>(null);
  const [loading, setLoading] = useState(false);

  const run = async () => {
    if (!selector.trim()) return;
    setLoading(true);
    setResult(null);
    try {
      const r = await Bridge.testSelector(selector.trim());
      
      // 将 SelectorResult 转换为 SelectorTestResult
      const testResult: SelectorTestResult = {
        success: r.success ?? true,  // 如果 success 不存在，默认为 true
        count: r.count,
        sources: r.sources || [],
        samples: r.samples || [],
        error: r.error
      };
      
      setResult(testResult);
      act.setSelectorResult(testResult);
    } catch (err) {
      const errorResult: SelectorTestResult = { 
        success: false,
        count: 0, 
        sources: [], 
        samples: [],
        error: (err as Error).message 
      };
      setResult(errorResult);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="scroll">
      <div style={{ marginBottom: 12 }}>
        <div style={{ display: "flex", gap: 6 }}>
          <input
            className="input input-mono"
            type="text"
            placeholder="CSS 选择器，如 [data-recommend-article-id]"
            value={selector}
            onChange={(e) => setSelector(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && run()}
            style={{ fontSize: 11 }}
          />
          <button className="btn btn-ghost btn-sm" onClick={run} disabled={loading}>
            {loading ? <span className="spinner" /> : "测试"}
          </button>
        </div>

        {result && (
          <div className="sel-result">
            {result.error ? (
              <span style={{ color: "#dc2626" }}>
                ❌ 选择器错误：{result.error}
              </span>
            ) : result.count > 0 ? (
              <>
                <span style={{ color: "#059669" }}>
                  ✅ 共找到 {result.count} 个元素
                </span>
                {result.sources?.map((s, i) => (
                  <div key={i} className="sel-source">📍 {s}</div>
                ))}
                {result.samples?.map((s, i) => (
                  <div key={i} className="sel-sample">
                    &lt;{s.tag}&gt; {s.text.slice(0, 60)}
                  </div>
                ))}
              </>
            ) : (
              <span style={{ color: "#d97706" }}>
                ⚠️ 未找到匹配元素（document + Shadow DOM 均已检索）
              </span>
            )}
          </div>
        )}
      </div>

      <div style={{ padding: "10px", background: "var(--surface-2)", borderRadius: "var(--r)", fontSize: 11, color: "var(--text-2)", lineHeight: 1.7 }}>
        <div style={{ fontWeight: 600, marginBottom: 4 }}>常用选择器</div>
        {[
          "[data-recommend-article-id]",
          ".selected-article-item",
          ".mpa-sc",
          '[view-ref="selectedArticlesBox"]',
        ].map((sel) => (
          <div
            key={sel}
            style={{ fontFamily: "monospace", cursor: "pointer", color: "var(--accent)", padding: "2px 0" }}
            onClick={() => setSelector(sel)}
          >
            {sel}
          </div>
        ))}
      </div>
    </div>
  );
}