import { SOURCE_DEFINITIONS } from "@/lib/crawlers/shared";
import { prisma } from "@/lib/prisma";
import type { ArticleGroup, ArticleOverview, CrawlLogSummary, NormalizedArticle } from "./types";

type OverviewFilters = {
  query?: string;
  source?: string;
  sort?: "latest" | "score";
};

const SOURCE_ORDER = Object.keys(SOURCE_DEFINITIONS);

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
  return [...items].sort((left, right) => {
    return SOURCE_ORDER.indexOf(left.sourceKey) - SOURCE_ORDER.indexOf(right.sourceKey);
  });
}

export async function getArticleOverview(filters: OverviewFilters = {}): Promise<ArticleOverview> {
  const query = normalizeQuery(filters.query);
  const source = filters.source?.trim() ?? "";
  const sort = filters.sort === "score" ? "score" : "latest";

  try {
    const articles = await prisma.article.findMany({
      include: {
        source: true,
      },
      where: {
        ...(source ? { source: { key: source } } : {}),
        ...(query
          ? {
              OR: [
                { title: { contains: query } },
                { translatedTitle: { contains: query } },
                { summary: { contains: query } },
              ],
            }
          : {}),
      },
      orderBy:
        sort === "score"
          ? [{ score: "desc" }, { publishedAt: "desc" }, { createdAt: "desc" }]
          : [{ publishedAt: "desc" }, { createdAt: "desc" }],
      take: 120,
    });

    const normalized: NormalizedArticle[] = articles.map((article) => ({
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

    const groupsMap = new Map<string, ArticleGroup>();
    for (const article of normalized) {
      const existing = groupsMap.get(article.source.key);
      if (existing) {
        existing.articles.push(article);
      } else {
        groupsMap.set(article.source.key, {
          sourceKey: article.source.key,
          sourceName: article.source.name,
          articles: [article],
        });
      }
    }

    const latestFetched = articles.reduce<Date | null>((latest, article) => {
      if (!latest) return article.fetchedAt;
      return article.fetchedAt > latest ? article.fetchedAt : latest;
    }, null);

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

    const groups = sortBySourceOrder(Array.from(groupsMap.values()));

    return {
      groups,
      lastFetchedAt: latestFetched?.toISOString() ?? null,
      lastFetchedAtLabel: formatDateTime(latestFetched),
      totalArticles: normalized.length,
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
