import { SOURCE_DEFINITIONS } from "@/lib/crawlers/shared";
import { prisma } from "@/lib/prisma";
import type { ArticleGroup, ArticleOverview, CrawlLogSummary, NormalizedArticle } from "./types";

type OverviewFilters = {
  query?: string;
  source?: string;
  sort?: "latest" | "score";
};

const SOURCE_ORDER = Object.keys(SOURCE_DEFINITIONS);
const PER_SOURCE_LIMIT = 40;

function formatPublishedAt(date: Date | null): string {
  if (!date) {
    return "日時未設定";
  }

  return new Intl.DateTimeFormat("ja-JP", {
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function formatDateTime(date: Date | null): string {
  if (!date) {
    return "未取得";
  }

  return new Intl.DateTimeFormat("ja-JP", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).format(date);
}

function normalizeQuery(query?: string) {
  return query?.trim() ?? "";
}

function sortBySourceOrder<T extends { sourceKey: string }>(items: T[]) {
  return [...items].sort((left, right) => SOURCE_ORDER.indexOf(left.sourceKey) - SOURCE_ORDER.indexOf(right.sourceKey));
}

function normalizeArticles(
  articles: Array<{
    id: string;
    title: string;
    translatedTitle: string | null;
    url: string;
    summary: string | null;
    author: string | null;
    score: number | null;
    thumbnailUrl: string | null;
    publishedAt: Date | null;
    source: {
      key: string;
      name: string;
    };
  }>,
): NormalizedArticle[] {
  return articles.map((article) => ({
    id: article.id,
    title: article.translatedTitle ?? article.title,
    originalTitle: article.title,
    url: article.url,
    summary: article.summary,
    author: article.author,
    score: article.score,
    thumbnailUrl: article.thumbnailUrl,
    publishedAt: article.publishedAt?.toISOString() ?? null,
    publishedAtLabel: formatPublishedAt(article.publishedAt),
    source: {
      key: article.source.key,
      name: article.source.name,
    },
  }));
}

export async function getArticleOverview(filters: OverviewFilters = {}): Promise<ArticleOverview> {
  const query = normalizeQuery(filters.query);
  const source = filters.source?.trim() ?? "";
  const sort = filters.sort === "score" ? "score" : "latest";

  try {
    const whereClause = {
      ...(query
        ? {
            OR: [{ title: { contains: query } }, { translatedTitle: { contains: query } }, { summary: { contains: query } }],
          }
        : {}),
    };

    const sourceKeys = source ? [source] : SOURCE_ORDER;
    const groups: ArticleGroup[] = [];
    let totalArticles = 0;
    let latestFetchedAt: Date | null = null;

    for (const sourceKey of sourceKeys) {
      const articles = await prisma.article.findMany({
        include: {
          source: true,
        },
        where: {
          source: { key: sourceKey },
          ...whereClause,
        },
        orderBy:
          sort === "score"
            ? [{ score: "desc" }, { publishedAt: "desc" }, { createdAt: "desc" }]
            : [{ publishedAt: "desc" }, { createdAt: "desc" }],
        take: PER_SOURCE_LIMIT,
      });

      if (articles.length === 0) {
        continue;
      }

      const normalized = normalizeArticles(articles);
      groups.push({
        sourceKey,
        sourceName: articles[0].source.name,
        articles: normalized,
      });
      totalArticles += normalized.length;

      const sourceLatestFetched = articles.reduce<Date | null>((latest, article) => {
        if (!latest) return article.fetchedAt;
        return article.fetchedAt > latest ? article.fetchedAt : latest;
      }, null);

      if (sourceLatestFetched && (!latestFetchedAt || sourceLatestFetched > latestFetchedAt)) {
        latestFetchedAt = sourceLatestFetched;
      }
    }

    const latestLogsRaw = await prisma.crawlLog.findMany({
      include: {
        source: true,
      },
      orderBy: [{ finishedAt: "desc" }],
      take: 12,
    });

    const seenSources = new Set<string>();
    const latestCrawlLogs: CrawlLogSummary[] = [];
    for (const log of latestLogsRaw) {
      if (seenSources.has(log.source.key)) continue;
      seenSources.add(log.source.key);
      latestCrawlLogs.push({
        sourceKey: log.source.key,
        sourceName: log.source.name,
        fetched: log.fetched,
        created: log.created,
        skipped: log.skipped,
        error: log.error,
        finishedAtLabel: formatDateTime(log.finishedAt),
      });
    }

    return {
      groups: sortBySourceOrder(groups),
      lastFetchedAt: latestFetchedAt?.toISOString() ?? null,
      lastFetchedAtLabel: formatDateTime(latestFetchedAt),
      totalArticles,
      latestCrawlLogs: sortBySourceOrder(latestCrawlLogs),
      filters: {
        query,
        source,
        sort,
      },
    };
  } catch (error) {
    console.warn("Failed to load articles. Returning an empty list.", error);
    return {
      groups: [],
      lastFetchedAt: null,
      lastFetchedAtLabel: "未取得",
      totalArticles: 0,
      latestCrawlLogs: [],
      filters: {
        query,
        source,
        sort,
      },
    };
  }
}
