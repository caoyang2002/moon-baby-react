import { useRef } from "react";
import { useStore, DEFAULT_SETTINGS } from "@/store";
import { showToast } from "@/components/shared/Toast";
import type { CopyFormat } from "@/types";

export default function SettingsPane() {
  const { state, act } = useStore();
  const importRef = useRef<HTMLInputElement>(null);
  const side = state.activeSideItem;

  return (
    <div className="pane active" id="pane-settings">
      <div className="pane-hd">
        <div className="pane-hd-l">
          <span className="pane-title">
            {side === "general"  ? "通用设置"
            : side === "format"  ? "默认格式"
            : side === "history" ? "历史记录"
            : side === "importexport" ? "导入 / 导出"
            : "危险操作"}
          </span>
        </div>
      </div>

      <div className="scroll">
        {/* ── General ────────────────────────────────────────── */}
        {(side === "general" || !side) && (
          <div className="card">
            <div className="card-title">通用</div>
            <div className="setting-row">
              <div>
                <div className="setting-label">自动提取</div>
                <div className="setting-desc">打开插件时自动执行提取</div>
              </div>
              <input
                type="checkbox"
                className="toggle"
                checked={state.settings.autoExtract}
                onChange={(e) =>
                  act.updateSettings({ autoExtract: e.target.checked })
                }
              />
            </div>
            <div className="setting-row">
              <div>
                <div className="setting-label">默认显示调试面板</div>
                <div className="setting-desc">每次打开自动展开调试信息</div>
              </div>
              <input
                type="checkbox"
                className="toggle"
                checked={state.settings.showDebugByDefault}
                onChange={(e) =>
                  act.updateSettings({ showDebugByDefault: e.target.checked })
                }
              />
            </div>
            <div className="setting-row">
              <div>
                <div className="setting-label">重置所有设置</div>
                <div className="setting-desc">恢复出厂默认值</div>
              </div>
              <button
                className="btn btn-ghost btn-sm"
                onClick={async () => {
                  await act.resetSettings();
                  showToast("设置已重置");
                }}
              >
                重置
              </button>
            </div>
          </div>
        )}

        {/* ── Format ─────────────────────────────────────────── */}
        {side === "format" && (
          <div className="card">
            <div className="card-title">默认复制格式</div>
            {(
              [
                { value: "richHTML",       label: "富文本卡片",      desc: "粘贴到支持富文本的编辑器，带样式" },
                { value: "containerHTML",  label: "原始容器 HTML",   desc: "原始 DOM 结构，适合二次编辑" },
                { value: "plainText",      label: "纯文本",          desc: "序号 + 标题 + 链接，无格式" },
                { value: "markdown",       label: "Markdown",        desc: "Markdown 链接列表格式" },
                { value: "json",           label: "JSON",            desc: "结构化数据，适合开发使用" },
              ] as { value: CopyFormat; label: string; desc: string }[]
            ).map(({ value, label, desc }) => (
              <div key={value} className="setting-row">
                <div>
                  <div className="setting-label">{label}</div>
                  <div className="setting-desc">{desc}</div>
                </div>
                <input
                  type="radio"
                  name="defaultFormat"
                  checked={state.settings.defaultFormat === value}
                  onChange={() => act.updateSettings({ defaultFormat: value })}
                  style={{ cursor: "pointer", accentColor: "var(--accent)" }}
                />
              </div>
            ))}
          </div>
        )}

        {/* ── History settings ───────────────────────────────── */}
        {side === "history" && (
          <div className="card">
            <div className="card-title">历史记录</div>
            <div className="setting-row">
              <div>
                <div className="setting-label">最大保存条数</div>
                <div className="setting-desc">超出后自动删除最旧记录</div>
              </div>
              <select
                className="select"
                value={state.settings.maxHistory}
                onChange={(e) =>
                  act.updateSettings({ maxHistory: +e.target.value })
                }
              >
                {[10, 20, 50, 100].map((n) => (
                  <option key={n} value={n}>{n} 条</option>
                ))}
              </select>
            </div>
            <div className="setting-row">
              <div>
                <div className="setting-label">当前记录数</div>
              </div>
              <span style={{ fontSize: 12, color: "var(--text-2)" }}>
                {state.history.length} 条
              </span>
            </div>
            <div className="setting-row">
              <div>
                <div className="setting-label">清空历史记录</div>
                <div className="setting-desc">删除所有已保存的历史</div>
              </div>
              <button
                className="btn btn-ghost btn-sm"
                style={{ color: "var(--red)" }}
                onClick={async () => {
                  if (confirm("确认清空所有历史记录？")) {
                    await act.clearHistory();
                    showToast("历史记录已清空");
                  }
                }}
              >
                清空
              </button>
            </div>
          </div>
        )}

        {/* ── Import / Export ────────────────────────────────── */}
        {side === "importexport" && (
          <>
            <div className="card">
              <div className="card-title">导出数据</div>
              <div className="setting-row">
                <div>
                  <div className="setting-label">导出所有数据</div>
                  <div className="setting-desc">包含设置和历史记录，保存为 JSON</div>
                </div>
                <button
                  className="btn btn-primary btn-sm"
                  onClick={() => {
                    const data = act.exportData();
                    const a = document.createElement("a");
                    a.href = "data:application/json;charset=utf-8," + encodeURIComponent(data);
                    a.download = `yb-backup-${new Date().toISOString().slice(0, 10)}.json`;
                    a.click();
                    showToast("数据已导出");
                  }}
                >
                  导出
                </button>
              </div>
            </div>

            <div className="card">
              <div className="card-title">导入数据</div>
              <div className="setting-row">
                <div>
                  <div className="setting-label">从备份文件导入</div>
                  <div className="setting-desc">将覆盖当前设置和历史记录</div>
                </div>
                <button
                  className="btn btn-ghost btn-sm"
                  onClick={() => importRef.current?.click()}
                >
                  选择文件
                </button>
              </div>
              <input
                ref={importRef}
                type="file"
                accept=".json,application/json"
                style={{ display: "none" }}
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  const text = await file.text();
                  try {
                    await act.importData(text);
                    showToast("数据导入成功");
                  } catch (err) {
                    showToast("导入失败：" + (err as Error).message);
                  }
                  e.target.value = "";
                }}
              />
            </div>
          </>
        )}

        {/* ── Danger ─────────────────────────────────────────── */}
        {side === "danger" && (
          <div className="card" style={{ borderColor: "var(--red)" }}>
            <div className="card-title" style={{ color: "var(--red)" }}>危险操作</div>
            <div className="setting-row">
              <div>
                <div className="setting-label">清除所有数据</div>
                <div className="setting-desc">删除设置、历史记录等全部本地数据，不可恢复</div>
              </div>
              <button
                className="btn btn-danger btn-sm"
                onClick={async () => {
                  if (confirm("确认清除所有本地数据？此操作不可恢复！")) {
                    await act.clearAllData();
                    showToast("所有数据已清除");
                  }
                }}
              >
                清除全部
              </button>
            </div>
          </div>
        )}

        {/* Default view */}
        {!["general","format","history","importexport","danger"].includes(side) && (
          <div className="empty" style={{ height: "auto", padding: "40px 0" }}>
            <div className="empty-icon">⚙️</div>
            <div className="empty-title">请从左侧选择设置项</div>
          </div>
        )}
      </div>
    </div>
  );
}
