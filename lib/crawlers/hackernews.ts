import { normalizeText, type CrawlableArticle } from "./shared";

const TOP_STORIES_URL = "https://hacker-news.firebaseio.com/v0/topstories.json";
const ITEM_URL = "https://hacker-news.firebaseio.com/v0/item";

type HackerNewsItem = {
  id: number;
  by?: string;
  score?: number;
  time?: number;
  title?: string;
  text?: string;
  type?: string;
  url?: string;
};

async function fetchJson<T>(url: string): Promise<T> {
  const response = await fetch(url, {
    headers: {
      "User-Agent": "tech-news-digest/0.1",
    },
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch ${url}: ${response.status}`);
  }

  return response.json() as Promise<T>;
}

export async function crawlHackerNews(): Promise<CrawlableArticle[]> {
  const ids = await fetchJson<number[]>(TOP_STORIES_URL);
  const items = await Promise.all(
    ids.slice(0, 20).map((id) => fetchJson<HackerNewsItem>(`${ITEM_URL}/${id}.json`)),
  );

  return items
    .filter((item) => item.type === "story" && item.title)
    .map((item) => ({
      sourceKey: "hackernews" as const,
      sourceArticleId: String(item.id),
      title: item.title?.trim() ?? "Untitled",
      url: item.url ?? `https://news.ycombinator.com/item?id=${item.id}`,
      author: item.by ?? null,
      summary: normalizeText(item.text ?? null),
      publishedAt: item.time ? new Date(item.time * 1000) : null,
      score: item.score ?? null,
      tags: ["Top Stories"],
    }));
}
