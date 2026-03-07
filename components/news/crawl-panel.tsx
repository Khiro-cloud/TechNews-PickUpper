"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type CrawlPanelProps = {
  logs: Array<{
    sourceKey: string;
    sourceName: string;
    fetched: number;
    created: number;
    skipped: number;
    error: string | null;
    finishedAtLabel: string;
  }>;
};

export function CrawlPanel({ logs }: CrawlPanelProps) {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);

  const triggerCrawl = async (source?: string) => {
    setLoading(source ?? "all");

    try {
      await fetch("/api/crawl", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(source ? { sources: [source] } : {}),
      });

      router.refresh();
    } finally {
      setLoading(null);
    }
  };

  return (
    <section className="rounded-[1.5rem] border border-black/5 bg-white/85 p-5 shadow-card backdrop-blur">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-black/45">Crawl</p>
          <h2 className="mt-1 text-xl font-semibold tracking-tight text-ink">クロール運用</h2>
        </div>
        <div className="flex gap-3">
          <button
            className="rounded-full bg-accent px-4 py-2 text-sm font-medium text-white"
            disabled={Boolean(loading)}
            onClick={() => {
              void triggerCrawl();
            }}
            type="button"
          >
            {loading === "all" ? "更新中..." : "全ソース更新"}
          </button>
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {logs.map((log) => (
          <article className="rounded-2xl border border-black/5 bg-[#fffdf9] p-4" key={log.sourceKey}>
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="text-base font-semibold text-ink">{log.sourceName}</h3>
                <p className="mt-1 text-xs text-black/45">{log.finishedAtLabel}</p>
              </div>
              <button
                className="rounded-full border border-black/10 px-3 py-1 text-xs font-medium text-black/70"
                disabled={Boolean(loading)}
                onClick={() => {
                  void triggerCrawl(log.sourceKey);
                }}
                type="button"
              >
                {loading === log.sourceKey ? "更新中..." : "更新"}
              </button>
            </div>

            <dl className="mt-4 grid grid-cols-3 gap-2 text-sm text-black/70">
              <div className="rounded-xl bg-paper px-3 py-2">
                <dt className="text-[11px] uppercase tracking-[0.18em] text-black/45">Fetched</dt>
                <dd className="mt-1 font-medium">{log.fetched}</dd>
              </div>
              <div className="rounded-xl bg-paper px-3 py-2">
                <dt className="text-[11px] uppercase tracking-[0.18em] text-black/45">Created</dt>
                <dd className="mt-1 font-medium">{log.created}</dd>
              </div>
              <div className="rounded-xl bg-paper px-3 py-2">
                <dt className="text-[11px] uppercase tracking-[0.18em] text-black/45">Skipped</dt>
                <dd className="mt-1 font-medium">{log.skipped}</dd>
              </div>
            </dl>

            {log.error ? <p className="mt-3 text-sm text-red-700">{log.error}</p> : null}
          </article>
        ))}
      </div>
    </section>
  );
}
