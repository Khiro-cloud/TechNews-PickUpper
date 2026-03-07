export type NormalizedArticle = {
  id: string;
  title: string;
  originalTitle: string;
  url: string;
  summary: string | null;
  author: string | null;
  score: number | null;
  thumbnailUrl: string | null;
  publishedAt: string | null;
  publishedAtLabel: string;
  source: {
    key: string;
    name: string;
  };
};

export type ArticleGroup = {
  sourceKey: string;
  sourceName: string;
  articles: NormalizedArticle[];
};

export type CrawlLogSummary = {
  sourceKey: string;
  sourceName: string;
  fetched: number;
  created: number;
  skipped: number;
  error: string | null;
  finishedAtLabel: string;
};

export type ArticleOverview = {
  groups: ArticleGroup[];
  lastFetchedAt: string | null;
  lastFetchedAtLabel: string;
  totalArticles: number;
  latestCrawlLogs: CrawlLogSummary[];
  filters: {
    query: string;
    source: string;
    sort: "latest" | "score";
  };
};
