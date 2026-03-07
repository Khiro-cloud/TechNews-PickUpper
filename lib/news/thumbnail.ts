const META_PATTERNS = [
  /<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["'][^>]*>/i,
  /<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image["'][^>]*>/i,
  /<meta[^>]+name=["']twitter:image["'][^>]+content=["']([^"']+)["'][^>]*>/i,
  /<meta[^>]+content=["']([^"']+)["'][^>]+name=["']twitter:image["'][^>]*>/i,
];

function absoluteUrl(candidate: string, articleUrl: string) {
  try {
    return new URL(candidate, articleUrl).toString();
  } catch {
    return null;
  }
}

function extractImageUrl(html: string, articleUrl: string) {
  for (const pattern of META_PATTERNS) {
    const match = html.match(pattern);
    const value = match?.[1]?.trim();
    if (!value) continue;

    const normalized = absoluteUrl(value, articleUrl);
    if (normalized) return normalized;
  }

  return null;
}

export async function fetchThumbnailUrl(articleUrl: string): Promise<string | null> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8000);

  try {
    const response = await fetch(articleUrl, {
      signal: controller.signal,
      headers: {
        "User-Agent": "tech-news-digest/0.1",
      },
      cache: "no-store",
    });

    if (!response.ok) {
      return null;
    }

    const contentType = response.headers.get("content-type") ?? "";
    if (!contentType.includes("text/html")) {
      return null;
    }

    const html = await response.text();
    return extractImageUrl(html, articleUrl);
  } catch {
    return null;
  } finally {
    clearTimeout(timeout);
  }
}
