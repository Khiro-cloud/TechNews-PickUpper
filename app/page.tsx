import Link from "next/link";
import { SelectionBar } from "@/components/mail/selection-bar";
import { CrawlPanel } from "@/components/news/crawl-panel";
import { ArticleList } from "@/components/news/article-list";
import { NewsFilters } from "@/components/news/news-filters";
import { SOURCE_DEFINITIONS } from "@/lib/crawlers/shared";
import { getArticleOverview } from "@/lib/news/repository";

type HomeProps = {
  searchParams?: Promise<{
    q?: string;
    source?: string;
    sort?: "latest" | "score";
  }>;
};

export default async function Home({ searchParams }: HomeProps) {
  const params = (await searchParams) ?? {};
  const overview = await getArticleOverview({
    query: params.q,
    source: params.source,
    sort: params.sort,
  });

  const sourceOptions = Object.entries(SOURCE_DEFINITIONS).map(([key, value]) => ({
    key,
    name: value.name,
  }));

  return (
    <main className="rabbit-cursor mx-auto flex min-h-screen max-w-[1500px] flex-col gap-6 px-6 py-10">
      <header className="flex flex-col gap-5 rounded-[2rem] border border-black/5 bg-white/80 p-8 shadow-card backdrop-blur">
        <div className="flex flex-col gap-2">
          <p className="text-sm uppercase tracking-[0.3em] text-accent">Tech News Digest</p>
          <h1 className="text-4xl font-semibold tracking-tight text-ink">TechNews PickUpper</h1>
        </div>
        <div className="grid gap-3 rounded-[1.5rem] bg-paper/80 p-5 sm:grid-cols-[1fr_auto] sm:items-end">
          <div className="space-y-1">
            <p className="text-xs uppercase tracking-[0.2em] text-black/45">Last Fetch</p>
            <p className="text-lg font-medium text-ink">{overview.lastFetchedAtLabel}</p>
            <p className="text-sm text-black/60">現在表示中の記事数: {overview.totalArticles}件</p>
          </div>
          <div className="flex flex-wrap items-center gap-3 text-sm text-black/65">
            <span>はてブIT / Hacker News / Publickey</span>
            <span className="hidden h-1 w-1 rounded-full bg-black/30 sm:inline-block" />
            <Link className="font-medium text-accent underline-offset-4 hover:underline" href="/digest">
              メール作成ページへ
            </Link>
          </div>
        </div>
      </header>

      <NewsFilters
        defaultQuery={overview.filters.query}
        defaultSort={overview.filters.sort}
        defaultSource={overview.filters.source}
        sourceOptions={sourceOptions}
      />

      <CrawlPanel logs={overview.latestCrawlLogs} />
      <ArticleList groups={overview.groups} />
      <SelectionBar />
    </main>
  );
}
