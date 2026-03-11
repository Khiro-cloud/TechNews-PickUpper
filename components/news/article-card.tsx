"use client";

import type { NormalizedArticle } from "@/lib/news/types";
import { toggleSelectedArticleId } from "@/lib/mail/selection";
import { useSelection } from "@/components/mail/use-selection";

type ArticleCardProps = {
  article: NormalizedArticle;
};

export function ArticleCard({ article }: ArticleCardProps) {
  const selectedArticleIds = useSelection();
  const isSelected = selectedArticleIds.includes(article.id);

  return (
    <article className="max-w-full rounded-[1.25rem] border border-black/5 bg-[#fffdf9] p-4">
      <div className="flex items-start gap-4">
        <div className="h-[72px] w-[72px] shrink-0 overflow-hidden rounded-2xl bg-paper">
          {article.thumbnailUrl ? (
            <img
              alt={article.title}
              className="h-full w-full object-cover"
              loading="lazy"
              referrerPolicy="no-referrer"
              src={article.thumbnailUrl}
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-[linear-gradient(135deg,#d7f3ef_0%,#f6f1e8_100%)] text-[10px] font-medium uppercase tracking-[0.18em] text-black/45">
              No Image
            </div>
          )}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1 break-words text-[11px] uppercase tracking-[0.18em] text-black/45 [overflow-wrap:anywhere]">
            <span>{article.publishedAtLabel}</span>
            {article.author ? <span className="break-all">{article.author}</span> : null}
            {article.score ? <span className="shrink-0">score {article.score}</span> : null}
          </div>

          <h3 className="mt-2 line-clamp-3 break-words text-[17px] font-semibold leading-6 text-ink [overflow-wrap:anywhere]">
            <a className="block max-w-full hover:underline [overflow-wrap:anywhere]" href={article.url} rel="noreferrer" target="_blank">
              {article.title}
            </a>
          </h3>

          {article.originalTitle !== article.title ? (
            <p className="mt-1 line-clamp-2 break-words text-xs text-black/45 [overflow-wrap:anywhere]">
              {article.originalTitle}
            </p>
          ) : null}

          <p className="mt-2 line-clamp-3 break-words text-sm leading-6 text-black/70 [overflow-wrap:anywhere]">
            {article.summary ?? "要約はまだありません。"}
          </p>

          <div className="mt-3">
            <button
              className={`rounded-full px-4 py-2 text-sm font-medium ${
                isSelected ? "bg-ink text-white" : "bg-accent text-white"
              }`}
              onClick={() => {
                toggleSelectedArticleId(article.id);
              }}
              type="button"
            >
              {isSelected ? "追加済み" : "メールに追加"}
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}
