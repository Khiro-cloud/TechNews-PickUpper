import Parser from "rss-parser";
import { normalizeText, type CrawlableArticle } from "./shared";

const FEED_URL = "https://b.hatena.ne.jp/hotentry/it.rss";
const parser = new Parser();

export async function crawlHatena(): Promise<CrawlableArticle[]> {
  const feed = await parser.parseURL(FEED_URL);

  return (feed.items ?? [])
    .slice(0, 20)
    .map((item) => ({
      sourceKey: "hatena" as const,
      sourceArticleId: item.guid ?? item.link ?? null,
      title: item.title?.trim() ?? "Untitled",
      url: item.link ?? "",
      author: item.creator ?? item.author ?? null,
      summary: normalizeText(item.contentSnippet ?? item.content ?? item.summary ?? null),
      publishedAt: item.isoDate ? new Date(item.isoDate) : item.pubDate ? new Date(item.pubDate) : null,
      tags: item.categories?.filter(Boolean) ?? [],
    }))
    .filter((item) => item.url);
}
