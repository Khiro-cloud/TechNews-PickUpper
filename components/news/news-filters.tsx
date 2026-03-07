"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";

type NewsFiltersProps = {
  sourceOptions: Array<{ key: string; name: string }>;
  defaultQuery: string;
  defaultSource: string;
  defaultSort: "latest" | "score";
};

export function NewsFilters({
  sourceOptions,
  defaultQuery,
  defaultSource,
  defaultSort,
}: NewsFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const updateParams = (updates: Record<string, string>) => {
    const params = new URLSearchParams(searchParams.toString());

    Object.entries(updates).forEach(([key, value]) => {
      if (!value) {
        params.delete(key);
      } else {
        params.set(key, value);
      }
    });

    startTransition(() => {
      router.push(`/?${params.toString()}`);
    });
  };

  return (
    <section className="rounded-[1.5rem] border border-black/5 bg-white/85 p-5 shadow-card backdrop-blur">
      <div className="grid gap-4 lg:grid-cols-[1.2fr_0.7fr_0.6fr_auto] lg:items-end">
        <label className="grid gap-2 text-sm">
          <span className="text-xs uppercase tracking-[0.2em] text-black/45">Search</span>
          <input
            className="rounded-2xl border border-black/8 bg-paper px-4 py-3 outline-none"
            defaultValue={defaultQuery}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                updateParams({ q: event.currentTarget.value, page: "" });
              }
            }}
            placeholder="タイトル・要約で検索"
            type="text"
          />
        </label>

        <label className="grid gap-2 text-sm">
          <span className="text-xs uppercase tracking-[0.2em] text-black/45">Source</span>
          <select
            className="rounded-2xl border border-black/8 bg-paper px-4 py-3 outline-none"
            defaultValue={defaultSource}
            onChange={(event) => {
              updateParams({ source: event.target.value });
            }}
          >
            <option value="">すべて</option>
            {sourceOptions.map((source) => (
              <option key={source.key} value={source.key}>
                {source.name}
              </option>
            ))}
          </select>
        </label>

        <label className="grid gap-2 text-sm">
          <span className="text-xs uppercase tracking-[0.2em] text-black/45">Sort</span>
          <select
            className="rounded-2xl border border-black/8 bg-paper px-4 py-3 outline-none"
            defaultValue={defaultSort}
            onChange={(event) => {
              updateParams({ sort: event.target.value });
            }}
          >
            <option value="latest">新着順</option>
            <option value="score">スコア順</option>
          </select>
        </label>

        <div className="flex gap-3">
          <button
            className="rounded-full border border-black/10 px-4 py-3 text-sm font-medium text-black/70"
            onClick={() => {
              updateParams({ q: "", source: "", sort: "latest" });
            }}
            type="button"
          >
            リセット
          </button>
          <div className="self-center text-xs text-black/45">{isPending ? "更新中..." : "反映済み"}</div>
        </div>
      </div>
    </section>
  );
}
