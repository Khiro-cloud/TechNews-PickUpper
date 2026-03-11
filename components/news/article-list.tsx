import type { ArticleGroup } from "@/lib/news/types";
import { ArticleCard } from "./article-card";

type ArticleListProps = {
  groups: ArticleGroup[];
};

export function ArticleList({ groups }: ArticleListProps) {
  if (groups.length === 0) {
    return (
      <section className="rounded-[1.75rem] border border-dashed border-black/10 bg-white/60 p-10 text-center text-sm text-black/60">
        条件に一致する記事がありません。検索条件を見直すか、クロールを更新してください。
      </section>
    );
  }

  return (
    <section className="grid gap-6 md:grid-cols-2 xl:grid-cols-3 xl:auto-rows-fr">
      {groups.map((group) => (
        <section
          className="flex min-h-[560px] flex-col overflow-hidden rounded-[2rem] border border-black/5 bg-white/80 p-6 shadow-card backdrop-blur xl:h-[78vh] xl:max-h-[960px]"
          key={group.sourceKey}
        >
          <div className="mb-5 flex items-end justify-between gap-4 border-b border-black/8 pb-4">
            <div className="min-w-0">
              <p className="text-xs uppercase tracking-[0.25em] text-accent">Source</p>
              <h2 className="mt-1 break-words text-2xl font-semibold tracking-tight text-ink [overflow-wrap:anywhere]">
                {group.sourceName}
              </h2>
            </div>
            <p className="text-sm text-black/50">{group.articles.length}件</p>
          </div>

          <div className="grid gap-3 overflow-y-auto overflow-x-hidden pr-1">
            {group.articles.map((article) => (
              <ArticleCard article={article} key={article.id} />
            ))}
          </div>
        </section>
      ))}
    </section>
  );
}
