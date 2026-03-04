import type { Article } from "@/types";

export default function ArticleList({ articles }: { articles: Article[] }) {
  if (!articles.length) {
    return (
      <div className="empty">
        <div className="empty-icon">📄</div>
        <div className="empty-title">暂无文章</div>
        <div className="empty-desc">
          在公众号编辑页打开历史文章推荐<br />然后点击「提取」
        </div>
      </div>
    );
  }

  return (
    <div>
      {articles.map((a) => (
        <div key={a.id} className="article-item">
          {a.imgSrc ? (
            <img
              className="article-thumb"
              src={a.imgSrc}
              alt={a.title}
              onError={(e) => ((e.target as HTMLImageElement).style.display = "none")}
            />
          ) : (
            <div className="article-thumb-ph">No.{a.serial}</div>
          )}
          <div className="article-info">
            <div className="article-title-row">
              <span className="serial-tag">{a.serial}</span>
              <a
                className="article-title"
                href={a.url}
                target="_blank"
                rel="noreferrer"
                title={a.title}
              >
                {a.title}
              </a>
            </div>
            {a.date && <div className="article-date">{a.date}</div>}
          </div>
        </div>
      ))}
    </div>
  );
}
