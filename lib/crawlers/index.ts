import { crawlHatena } from "./hatena";
import { crawlHackerNews } from "./hackernews";
import { crawlPublickey } from "./publickey";
import { pruneOldArticles } from "@/lib/news/cleanup";
import {
  logCrawlResult,
  persistArticles,
  type CrawlResult,
  type CrawlableArticle,
  type SourceKey,
} from "./shared";

const crawlers: Record<SourceKey, () => Promise<CrawlableArticle[]>> = {
  hatena: crawlHatena,
  hackernews: crawlHackerNews,
  publickey: crawlPublickey,
};

export async function crawlAllSources(targets?: SourceKey[]): Promise<CrawlResult[]> {
  const sourceKeys = targets?.length ? targets : (Object.keys(crawlers) as SourceKey[]);
  const results: CrawlResult[] = [];

  for (const sourceKey of sourceKeys) {
    const startedAt = new Date();

    try {
      const items = await crawlers[sourceKey]();
      const persisted = await persistArticles(items);
      const result: CrawlResult = {
        source: sourceKey,
        fetched: items.length,
        created: persisted.created,
        skipped: persisted.skipped,
      };

      await logCrawlResult(result, startedAt, new Date());
      results.push(result);
    } catch (error) {
      const result: CrawlResult = {
        source: sourceKey,
        fetched: 0,
        created: 0,
        skipped: 0,
        error: error instanceof Error ? error.message : "Unknown error",
      };

      await logCrawlResult(result, startedAt, new Date());
      results.push(result);
    }
  }

  await pruneOldArticles();
  return results;
}

export type { CrawlResult, SourceKey } from "./shared";
