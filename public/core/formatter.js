(function () {
  "use strict";
  // 幂等保护：已注入则直接返回，防止重复 const 声明报错
  if (window.__ArticleFormatter) return;

  /**
   * core/formatter.js
   * ─────────────────
   * 格式化层：将提取到的文章数据转换为各种输出格式。
   * 无副作用，输入数据、输出字符串。
   *
   * 扩展指南：
   *   - 新输出格式 → 新增一个 toXxx(articles) 函数并在底部导出
   *   - 修改卡片样式 → 只改 toCardHTML() 中的模板字符串
   *   - 修改纯文本格式 → 只改 toPlainText()
   */

  // ── 卡片 HTML ─────────────────────────────────────────────────────────────────

  /**
   * 生成单张文章卡片的 HTML 片段
   * @param {import('./extractor').ArticleItem} article
   * @returns {string}
   */
  function articleCard(article) {
    const { serial, title, url, date, imgSrc } = article;

    const coverHtml = imgSrc
      ? `<a href="${url}" target="_blank" style="flex-shrink:0;display:block;">
      <img src="${imgSrc}" width="88" height="88"
      style="object-fit:cover;border-radius:6px;display:block;"
      onerror="this.closest('a').style.display='none'">
      </a>`
      : "";

    const dateHtml = date
      ? `<span style="color:#9ca3af;font-size:11px;">${date}</span>`
      : "";

    return `<div style="
    display:flex;gap:14px;align-items:flex-start;
    padding:14px 16px;background:#fff;
    border-radius:10px;margin-bottom:12px;
    box-shadow:0 1px 4px rgba(0,0,0,.06),0 0 0 1px rgba(0,0,0,.04);">
    ${coverHtml}
    <div style="flex:1;min-width:0;">
    <div style="display:flex;align-items:center;gap:8px;margin-bottom:7px;">
    <span style="background:#1677ff;color:#fff;padding:1px 8px;
    border-radius:10px;font-size:11px;font-weight:600;
    letter-spacing:.3px;">No.${serial}</span>
    ${dateHtml}
    </div>
    <div style="font-size:14px;font-weight:600;line-height:1.55;
    margin-bottom:8px;word-break:break-all;">
    <a href="${url}" target="_blank"
    style="color:#111;text-decoration:none;">${title}</a>
    </div>
    <a href="${url}" target="_blank"
    style="font-size:12px;color:#1677ff;text-decoration:none;">
    阅读原文 →
    </a>
    </div>
    </div>`;
  }

  /**
   * 生成完整的独立 HTML 文档（可直接在浏览器打开）
   * @param {import('./extractor').ArticleItem[]} articles
   * @returns {string}
   */
  function toDocHTML(articles) {
    const cards = articles.map(articleCard).join("\n");
    return `<!DOCTYPE html>
    <html lang="zh-CN">
    <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width,initial-scale=1">
    <title>文章列表（${articles.length} 篇）</title>
    <style>
    body { margin:0; padding:24px 16px;
    font-family:-apple-system,BlinkMacSystemFont,'PingFang SC','Microsoft YaHei',sans-serif;
    background:#f4f6f9; }
    .wrap { max-width:600px; margin:0 auto; }
    h2 { margin:0 0 18px; font-size:18px; color:#111; }
    </style>
    </head>
    <body>
    <div class="wrap">
    <h2>📚 文章列表（共 ${articles.length} 篇）</h2>
    ${cards}
    </div>
    </body>
    </html>`;
  }

  /**
   * 生成富文本片段（直接粘贴到支持富文本的编辑器）
   * @param {import('./extractor').ArticleItem[]} articles
   * @returns {string}
   */
  function toRichHTML(articles) {
    return articles.map(articleCard).join("\n");
  }

  // ── 纯文本 ────────────────────────────────────────────────────────────────────

  /**
   * 生成 Markdown 风格的纯文本列表
   * @param {import('./extractor').ArticleItem[]} articles
   * @returns {string}
   */
  function toMarkdown(articles) {
    return articles
      .map((a) => {
        const date = a.date ? `  *(${a.date})*` : "";
        return `${a.serial}. [${a.title}](${a.url})${date}`;
      })
      .join("\n");
  }

  /**
   * 生成普通纯文本列表
   * @param {import('./extractor').ArticleItem[]} articles
   * @returns {string}
   */
  function toPlainText(articles) {
    return articles
      .map(
        (a) =>
          `${a.serial}. ${a.title}\n   链接：${a.url}${a.date ? `\n   日期：${a.date}` : ""}`,
      )
      .join("\n\n");
  }

  /**
   * 生成 JSON 字符串
   * @param {import('./extractor').ArticleItem[]} articles
   * @returns {string}
   */
  function toJSON(articles) {
    return JSON.stringify(
      articles.map(({ id, serial, title, url, date, imgSrc }) => ({
        id,
        serial,
        title,
        url,
        date,
        imgSrc,
      })),
      null,
      2,
    );
  }

  // ── 容器 HTML（原始结构，去除插件控件）────────────────────────────────────────

  /**
   * 克隆容器元素并移除插件注入的 UI 节点，返回干净的 outerHTML。
   * 若容器为 null，返回空字符串。
   *
   * @param {Element|null} containerEl
   * @param {string[]}     uiSelectors  - 需要移除的选择器列表
   * @returns {string}
   */
  function toContainerHTML(containerEl, uiSelectors = []) {
    if (!containerEl) return "";
    const clone = containerEl.cloneNode(true);
    uiSelectors.forEach((sel) => {
      clone.querySelectorAll(sel).forEach((el) => el.remove());
    });
    return clone.outerHTML;
  }

  // 导出
  window.__ArticleFormatter = {
    toDocHTML,
    toRichHTML,
    toMarkdown,
    toPlainText,
    toJSON,
    toContainerHTML,
  };
})();
