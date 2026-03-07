"use client";

import Link from "next/link";
import { useSelection } from "./use-selection";

export function SelectionBar() {
  const selectedArticleIds = useSelection();

  return (
    <aside className="sticky bottom-6 rounded-[1.75rem] border border-black/5 bg-ink px-6 py-4 text-white shadow-card">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-white/60">Selection</p>
          <p className="text-sm text-white/85">選択中の記事: {selectedArticleIds.length}件</p>
        </div>
        <Link className="rounded-full bg-accent px-4 py-2 text-sm font-medium text-white" href="/digest">
          メール作成へ
        </Link>
      </div>
    </aside>
  );
}
