import { prisma } from "@/lib/prisma";
import { fetchThumbnailUrl } from "@/lib/news/thumbnail";
import { translateTitle } from "@/lib/news/translate";

export type SourceKey = "hatena" | "hackernews" | "publickey";

export type CrawlableArticle = {
  sourceKey: SourceKey;
  sourceArticleId?: string | null;
  title: string;
  url: string;
  author?: string | null;
  summary?: string | null;
  score?: number | null;
  tags?: string[] | null;
  publishedAt?: Date | null;
};

export type CrawlResult = {
  source: SourceKey;
  fetched: number;
  created: number;
  skipped: number;
  error?: string;
};

export const SOURCE_DEFINITIONS: Record<
  SourceKey,
  { name: string; baseUrl: string; description: string }
> = {
  hatena: {
    name: "Hatena Bookmark Tech",
    baseUrl: "https://b.hatena.ne.jp",
    description: "はてなブックマークのテクノロジー人気エントリー",
  },
  hackernews: {
    name: "Hacker News",
    baseUrl: "https://news.ycombinator.com",
    description: "Hacker News top stories",
  },
  publickey: {
    name: "Publickey",
    baseUrl: "https://www.publickey1.jp",
    description: "Publickey の Atom フィード",
  },
};

export async function ensureSource(sourceKey: SourceKey) {
  const source = SOURCE_DEFINITIONS[sourceKey];

  return prisma.source.upsert({
    where: { key: sourceKey },
    update: source,
    create: {
      key: sourceKey,
      ...source,
    },
  });
}

function canonicalizeUrl(rawUrl: string) {
  try {
    const url = new URL(rawUrl);
    url.hash = "";
    const blockedParams = [
      "utm_source",
      "utm_medium",
      "utm_campaign",
      "utm_term",
      "utm_content",
      "fbclid",
      "gclid",
      "ref",
      "ref_src",
    ];
    blockedParams.forEach((key) => url.searchParams.delete(key));

    const pathname = url.pathname.replace(/\/+$/, "");
    url.pathname = pathname || "/";
    url.searchParams.sort();
    return url.toString();
  } catch {
    return rawUrl;
  }
}

function fingerprintTitle(title: string) {
  return title
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

async function resolveThumbnail(url: string, existingThumbnailUrl: string | null) {
  if (existingThumbnailUrl) {
    return {
      thumbnailUrl: existingThumbnailUrl,
      thumbnailFetchedAt: new Date(),
    };
  }

  const thumbnailUrl = await fetchThumbnailUrl(url);
  return {
    thumbnailUrl,
    thumbnailFetchedAt: new Date(),
  };
}

async function resolveTranslatedTitle(title: string, existingTranslatedTitle: string | null) {
  if (existingTranslatedTitle) {
    return existingTranslatedTitle;
  }

  return translateTitle(title);
}

export async function persistArticles(items: CrawlableArticle[]): Promise<{
  created: number;
  skipped: number;
}> {
  let created = 0;
  let skipped = 0;

  for (const item of items) {
    const source = await ensureSource(item.sourceKey);
    const canonicalUrl = canonicalizeUrl(item.url);
    const titleFingerprint = fingerprintTitle(item.title);

    const conditions: Array<
      | { url: string }
      | { canonicalUrl: string }
      | { sourceId: string; sourceArticleId: string }
      | { titleFingerprint: string; publishedAt: Date | null }
    > = [{ url: item.url }, { canonicalUrl }];

    if (item.sourceArticleId) {
      conditions.push({
        sourceId: source.id,
        sourceArticleId: item.sourceArticleId,
      });
    }

    if (item.publishedAt) {
      conditions.push({
        titleFingerprint,
        publishedAt: item.publishedAt,
      });
    }

    const existing = await prisma.article.findFirst({
      where: {
        OR: conditions,
      },
      select: {
        id: true,
        thumbnailUrl: true,
        translatedTitle: true,
      },
    });

    const [thumbnail, translatedTitle] = await Promise.all([
      resolveThumbnail(item.url, existing?.thumbnailUrl ?? null),
      resolveTranslatedTitle(item.title, existing?.translatedTitle ?? null),
    ]);

    if (existing) {
      skipped += 1;
      await prisma.article.update({
        where: { id: existing.id },
        data: {
          title: item.title,
          translatedTitle,
          canonicalUrl,
          titleFingerprint,
          url: item.url,
          author: item.author ?? null,
          summary: item.summary ?? null,
          score: item.score ?? null,
          tags: item.tags?.join(", ") ?? null,
          thumbnailUrl: thumbnail.thumbnailUrl,
          thumbnailFetchedAt: thumbnail.thumbnailFetchedAt,
          publishedAt: item.publishedAt ?? null,
          fetchedAt: new Date(),
        },
      });
      continue;
    }

    await prisma.article.create({
      data: {
        sourceId: source.id,
        sourceArticleId: item.sourceArticleId ?? null,
        title: item.title,
        translatedTitle,
        canonicalUrl,
        titleFingerprint,
        url: item.url,
        author: item.author ?? null,
        summary: item.summary ?? null,
        score: item.score ?? null,
        tags: item.tags?.join(", ") ?? null,
        thumbnailUrl: thumbnail.thumbnailUrl,
        thumbnailFetchedAt: thumbnail.thumbnailFetchedAt,
        publishedAt: item.publishedAt ?? null,
      },
    });

    created += 1;
  }

  return { created, skipped };
}

export async function logCrawlResult(result: CrawlResult, startedAt: Date, finishedAt: Date) {
  const source = await ensureSource(result.source);

  await prisma.crawlLog.create({
    data: {
      sourceId: source.id,
      fetched: result.fetched,
      created: result.created,
      skipped: result.skipped,
      error: result.error ?? null,
      startedAt,
      finishedAt,
    },
  });
}

export function normalizeText(value?: string | null, maxLength = 220): string | null {
  if (!value) return null;

  const compact = value
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .trim();

  if (!compact) return null;
  return compact.length > maxLength ? `${compact.slice(0, maxLength - 1)}...` : compact;
}
