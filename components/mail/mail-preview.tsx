"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { clearSelectedArticleIds } from "@/lib/mail/selection";
import type { NormalizedArticle } from "@/lib/news/types";
import { useSelection } from "./use-selection";
import { SelectedArticles } from "./selected-articles";

type DraftResponse = {
  subject: string;
  body: string;
};

type ArticlesResponse = {
  items: Array<{
    articles: NormalizedArticle[];
  }>;
};

export function MailPreview() {
  const selectedArticleIds = useSelection();
  const [draft, setDraft] = useState<DraftResponse>({ subject: "", body: "" });
  const [articles, setArticles] = useState<NormalizedArticle[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const run = async () => {
      if (selectedArticleIds.length === 0) {
        setDraft({ subject: "", body: "" });
        setArticles([]);
        return;
      }

      setLoading(true);

      try {
        const [mailResponse, articlesResponse] = await Promise.all([
          fetch("/api/mail", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ articleIds: selectedArticleIds }),
          }),
          fetch("/api/articles"),
        ]);

        const nextDraft = (await mailResponse.json()) as DraftResponse;
        const articlePayload = (await articlesResponse.json()) as ArticlesResponse;
        const allArticles = articlePayload.items.flatMap((group) => group.articles);
        const orderedArticles = selectedArticleIds
          .map((articleId) => allArticles.find((article) => article.id === articleId))
          .filter((article): article is NormalizedArticle => Boolean(article));

        setDraft(nextDraft);
        setArticles(orderedArticles);
      } finally {
        setLoading(false);
      }
    };

    void run();
  }, [selectedArticleIds]);

  const mailtoHref = useMemo(() => {
    const subject = encodeURIComponent(draft.subject);
    const body = encodeURIComponent(draft.body);
    return `mailto:?subject=${subject}&body=${body}`;
  }, [draft.body, draft.subject]);

  return (
    <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
      <SelectedArticles articles={articles} />

      <section className="rounded-[1.75rem] border border-black/5 bg-white/85 p-6 shadow-card backdrop-blur">
        <div className="mb-5 flex items-center justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-black/50">Draft</p>
            <p className="mt-1 text-sm text-black/65">{selectedArticleIds.length}件を下書きに含めます</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <button
              className="rounded-full border border-black/10 px-4 py-2 text-sm font-medium text-black/70"
              onClick={() => {
                clearSelectedArticleIds();
              }}
              type="button"
            >
              選択をクリア
            </button>
            <button
              className="rounded-full bg-accent px-4 py-2 text-sm font-medium text-white"
              onClick={async () => {
                await navigator.clipboard.writeText(`件名: ${draft.subject}\n\n${draft.body}`);
              }}
              type="button"
            >
              下書きをコピー
            </button>
          </div>
        </div>

        {selectedArticleIds.length === 0 ? (
          <div className="rounded-2xl bg-paper px-5 py-6 text-sm text-black/60">
            先にトップ画面で記事を選択してください。{" "}
            <Link className="text-accent hover:underline" href="/">
              一覧へ戻る
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-black/50">Subject</p>
              <input
                className="mt-2 w-full rounded-2xl border border-black/8 bg-paper px-4 py-3 text-sm outline-none"
                onChange={(event) => {
                  setDraft((current) => ({ ...current, subject: event.target.value }));
                }}
                type="text"
                value={loading ? "生成中..." : draft.subject}
              />
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-black/50">Body</p>
              <textarea
                className="mt-2 min-h-[360px] w-full rounded-2xl border border-black/8 bg-paper px-4 py-4 text-sm leading-6 text-black/75 outline-none"
                onChange={(event) => {
                  setDraft((current) => ({ ...current, body: event.target.value }));
                }}
                value={loading ? "メール本文を生成しています..." : draft.body}
              />
            </div>
            <div className="flex flex-wrap gap-3">
              <a className="rounded-full bg-ink px-4 py-2 text-sm font-medium text-white" href={mailtoHref}>
                メーラー起動
              </a>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
