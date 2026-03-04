(function () {
  "use strict";
  // 幂等保护：已注入则直接返回，防止重复 const 声明报错
  if (window.__ArticleExtractor) return;

  /**
   * core/extractor.js
   * ─────────────────
   * 数据提取层。
   *
   * ⚠️  此文件在 MAIN world 中执行（通过 chrome.scripting.executeScript world:'MAIN'）。
   *    MAIN world 与页面共享同一个 JS 环境，可以直接访问其他插件注入的 Shadow DOM。
   *    不要在此文件中调用任何 Chrome Extension API（chrome.*）。
   *
   * ┌─ 查找策略 ─────────────────────────────────────────────────────────────────┐
   * │  1. Shadow DOM 优先：遍历 SHADOW_HOST_SELECTORS，在 shadowRoot 中查找     │
   * │  2. 普通 DOM 兜底：直接在 document 上查找                                 │
   * └───────────────────────────────────────────────────────────────────────────┘
   *
   * 扩展指南：
   *   - 新 Shadow DOM 宿主  → SHADOW_HOST_SELECTORS 加一行
   *   - 新文章数据属性结构  → ARTICLE_SELECTORS 加一行
   *   - 新输出字段          → 只改 extractOne()
   */

  // ── 配置区 ────────────────────────────────────────────────────────────────────

  const SHADOW_HOST_SELECTORS = [
    // 微信公众号 MPA 助手插件 - 历史文章推荐弹窗宿主
    ".mpa-sc.history-article-recommend-dialog",
    // 兜底：所有 .mpa-sc 元素（逐一检查其 shadowRoot）
    ".mpa-sc",
  ];

  const ARTICLE_SELECTORS = [
    "[data-recommend-article-id]",
    ".selected-article-item",
  ];

  const CONTAINER_SELECTORS = [
    '[view-ref="selectedArticlesBox"]',
    ".selected-article-content",
    '[data-from="yb-recommend-list"]',
  ];

  const INJECTED_UI_SELECTORS = [
    ".selected-article-item-controls",
    ".selected-article-item-serial-number",
  ];

  // ── 查找层 ────────────────────────────────────────────────────────────────────

  function queryArticles(root) {
    for (const sel of ARTICLE_SELECTORS) {
      try {
        const els = Array.from(root.querySelectorAll(sel));
        if (els.length > 0) return els;
      } catch (_) {}
    }
    return [];
  }

  function queryContainer(root, firstEl) {
    for (const sel of CONTAINER_SELECTORS) {
      try {
        const c = firstEl.closest(sel);
        if (c) return c;
      } catch (_) {}
    }
    for (const sel of CONTAINER_SELECTORS) {
      try {
        const c = root.querySelector(sel);
        if (c) return c;
      } catch (_) {}
    }
    return (
      firstEl.parentElement?.parentElement || firstEl.parentElement || null
    );
  }

  /**
   * 遍历所有候选 Shadow DOM 宿主，返回第一个含有文章数据的结果。
   * 在 MAIN world 中运行，shadowRoot 不受隔离限制，直接可访问。
   */
  function findInShadowDOM() {
    const visited = new Set();

    for (const hostSel of SHADOW_HOST_SELECTORS) {
      let hosts;
      try {
        hosts = Array.from(document.querySelectorAll(hostSel));
      } catch (_) {
        continue;
      }

      for (const host of hosts) {
        if (visited.has(host)) continue;
        visited.add(host);

        const sr = host.shadowRoot;
        if (!sr) continue;

        const articleEls = queryArticles(sr);
        if (articleEls.length > 0) {
          return { host, shadowRoot: sr, articleEls };
        }
      }
    }
    return null;
  }

  function findInDocument() {
    const articleEls = queryArticles(document);
    return articleEls.length > 0 ? { root: document, articleEls } : null;
  }

  // ── 工具函数 ──────────────────────────────────────────────────────────────────

  function timestampToDate(ts) {
    if (!ts) return "";
    const n = parseInt(ts, 10);
    if (isNaN(n)) return "";
    return new Date(n * 1000).toLocaleDateString("zh-CN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
  }

  function attr(el, name) {
    return (el && el.getAttribute(name)) || "";
  }

  function queryText(root, selectors) {
    for (const sel of selectors) {
      try {
        const el = root.querySelector(sel);
        const text = el && el.textContent.trim();
        if (text) return text;
      } catch (_) {}
    }
    return "";
  }

  function queryHref(root, selectors) {
    for (const sel of selectors) {
      try {
        const el = root.querySelector(sel);
        if (!el) continue;
        const href = attr(el, "data-href") || attr(el, "href") || el.href || "";
        if (href && href !== "#" && !href.startsWith("javascript")) return href;
      } catch (_) {}
    }
    return "";
  }

  function querySrc(root, selectors) {
    for (const sel of selectors) {
      try {
        const el = root.querySelector(sel);
        const src = el && (el.src || attr(el, "src") || attr(el, "data-src"));
        if (src) return src;
      } catch (_) {}
    }
    return "";
  }

  // ── 单篇提取内核 ──────────────────────────────────────────────────────────────

  function extractOne(el, idx) {
    const title =
      attr(el, "data-recommend-article-title") ||
      queryText(el, [
        '[data-recommend-title="t"] span',
        '[data-recommend-title="t"]',
        "p a span",
        "h3",
        "h4",
        "a",
      ]);

    const url =
      attr(el, "data-recommend-article-content-url") ||
      queryHref(el, ["a[data-href]", "a[href]"]);

    const imgSrc =
      attr(el, "data-recommend-article-cover") ||
      querySrc(el, ['img[data-recommend-cover="t"]', "img"]);

    const date = timestampToDate(attr(el, "data-recommend-article-time"));

    const serialEl = el.querySelector(".selected-article-item-serial-number");
    const serial = (serialEl && serialEl.textContent.trim()) || String(idx + 1);

    return {
      id: attr(el, "data-recommend-article-id") || String(idx),
      index: idx + 1,
      serial,
      title: title || "未知标题",
      url: url || "",
      date,
      imgSrc,
    };
  }

  // ── 容器 HTML（去除插件控件后的干净结构）─────────────────────────────────────

  function buildContainerHTML(container) {
    if (!container) return "";
    const clone = container.cloneNode(true);
    INJECTED_UI_SELECTORS.forEach((sel) => {
      clone.querySelectorAll(sel).forEach((el) => el.remove());
    });
    return clone.outerHTML;
  }

  // ── 主函数 ────────────────────────────────────────────────────────────────────

  function extractArticles() {
    // 路径 1：Shadow DOM（MAIN world 可直接访问）
    const shadowResult = findInShadowDOM();
    if (shadowResult) {
      const { shadowRoot, articleEls, host } = shadowResult;
      return buildResult(articleEls, shadowRoot, "shadow", host.className);
    }

    // 路径 2：普通 document
    const docResult = findInDocument();
    if (docResult) {
      const { root, articleEls } = docResult;
      return buildResult(articleEls, root, "document", "document");
    }

    return {
      success: false,
      message: "未找到文章节点（Shadow DOM 和普通 DOM 均已检索）",
      debug: {
        url: window.location.href,
        shadowHostsTried: SHADOW_HOST_SELECTORS,
        articleSelectorsTried: ARTICLE_SELECTORS,
      },
    };
  }

  function buildResult(articleEls, root, source, sourceDesc) {
    const articles = articleEls
      .map((el, i) => extractOne(el, i))
      .filter((a) => a.title !== "未知标题" || a.url);

    if (articles.length === 0) {
      return {
        success: false,
        message: `在 ${sourceDesc} 中找到节点，但无法提取有效内容`,
      };
    }

    const container = queryContainer(root, articleEls[0]);
    const containerHTML = buildContainerHTML(container);

    return { success: true, articles, source, containerHTML };
  }

  // ── 调试 ──────────────────────────────────────────────────────────────────────

  function collectDebugInfo() {
    const info = {
      url: window.location.href,
      shadowDOMHosts: [],
      documentArticleCount: queryArticles(document).length,
      finalSource: null,
      articles: [],
    };

    const visited = new Set();
    for (const hostSel of SHADOW_HOST_SELECTORS) {
      try {
        Array.from(document.querySelectorAll(hostSel)).forEach((host) => {
          if (visited.has(host)) return;
          visited.add(host);
          const sr = host.shadowRoot;
          const count = sr ? queryArticles(sr).length : 0;
          info.shadowDOMHosts.push({
            selector: hostSel,
            tagName: host.tagName,
            classes: host.className,
            hasShadowRoot: !!sr,
            articleCount: count,
          });
        });
      } catch (_) {}
    }

    const result = extractArticles();
    if (result.success) {
      info.finalSource = result.source;
      info.articles = result.articles.map(({ id, serial, title }) => ({
        id,
        serial,
        title,
      }));
    }

    return info;
  }

  function testSelector(selector) {
    try {
      const allEls = [];
      const sources = [];

      const docEls = Array.from(document.querySelectorAll(selector));
      if (docEls.length) {
        allEls.push(...docEls);
        sources.push(`document (${docEls.length})`);
      }

      const visited = new Set();
      for (const hostSel of SHADOW_HOST_SELECTORS) {
        Array.from(document.querySelectorAll(hostSel)).forEach((host) => {
          if (visited.has(host) || !host.shadowRoot) return;
          visited.add(host);
          const els = Array.from(host.shadowRoot.querySelectorAll(selector));
          if (els.length) {
            allEls.push(...els);
            sources.push(
              `shadowRoot(${host.className.trim()}) → ${els.length} 个`,
            );
          }
        });
      }

      return {
        count: allEls.length,
        sources,
        samples: allEls.slice(0, 3).map((el) => ({
          tag: el.tagName,
          classes: el.className,
          text: el.textContent.trim().slice(0, 80),
        })),
      };
    } catch (e) {
      return { count: 0, sources: [], error: e.message };
    }
  }

  // ── 挂载到 window，供 MAIN world 内的消息桥使用 ───────────────────────────────
  window.__ArticleExtractor = {
    extractArticles,
    collectDebugInfo,
    testSelector,
  };
})();
