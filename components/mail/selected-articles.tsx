"use client";

import { removeSelectedArticleId } from "@/lib/mail/selection";
import type { NormalizedArticle } from "@/lib/news/types";

type SelectedArticlesProps = {
  articles: NormalizedArticle[];
};

export function SelectedArticles({ articles }: SelectedArticlesProps) {
  return (
    <section className="rounded-[1.75rem] border border-black/5 bg-white/85 p-6 shadow-card backdrop-blur">
      <div className="mb-4 flex items-end justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-black/50">Articles</p>
          <h2 className="mt-1 text-xl font-semibold tracking-tight">下書きに含める記事</h2>
        </div>
        <p className="text-sm text-black/55">{articles.length}件</p>
      </div>

      {articles.length === 0 ? (
        <div className="rounded-2xl bg-paper px-4 py-5 text-sm text-black/60">記事が選択されていません。</div>
      ) : (
        <div className="grid gap-3">
          {articles.map((article) => (
            <article className="rounded-2xl border border-black/5 bg-[#fffdf9] p-4" key={article.id}>
              <div className="flex items-start gap-3">
                <div className="h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-paper">
                  {article.thumbnailUrl ? (
                    <img
                      alt={article.title}
                      className="h-full w-full object-cover"
                      loading="lazy"
                      referrerPolicy="no-referrer"
                      src={article.thumbnailUrl}
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-[linear-gradient(135deg,#d7f3ef_0%,#f6f1e8_100%)] text-[9px] uppercase tracking-[0.14em] text-black/40">
                      No Image
                    </div>
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2 text-[11px] uppercase tracking-[0.18em] text-black/45">
                    <span>{article.source.name}</span>
                    <span>{article.publishedAtLabel}</span>
                  </div>
                  <h3 className="mt-1 line-clamp-2 text-sm font-semibold leading-6 text-ink">
                    {article.title}
                  </h3>
                  <p className="mt-1 line-clamp-2 text-xs leading-5 text-black/65">
                    {article.summary ?? "要約はまだありません。"}
                  </p>
                </div>

                <button
                  className="rounded-full border border-black/10 px-3 py-1 text-xs font-medium text-black/65"
                  onClick={() => {
                    removeSelectedArticleId(article.id);
                  }}
                  type="button"
                >
                  外す
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
