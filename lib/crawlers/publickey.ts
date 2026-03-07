import Parser from "rss-parser";
import { normalizeText, type CrawlableArticle } from "./shared";

const FEED_URL = "https://www.publickey1.jp/atom.xml";
const parser = new Parser();

export async function crawlPublickey(): Promise<CrawlableArticle[]> {
  const feed = await parser.parseURL(FEED_URL);

  return (feed.items ?? [])
    .slice(0, 20)
    .map((item) => ({
      sourceKey: "publickey" as const,
      sourceArticleId: item.guid ?? item.id ?? item.link ?? null,
      title: item.title?.trim() ?? "Untitled",
      url: item.link ?? "",
      author: item.creator ?? item.author ?? null,
      summary: normalizeText(item.contentSnippet ?? item.content ?? item.summary ?? null),
      publishedAt: item.isoDate ? new Date(item.isoDate) : item.pubDate ? new Date(item.pubDate) : null,
      tags: item.categories?.filter(Boolean) ?? [],
    }))
    .filter((item) => item.url);
}
