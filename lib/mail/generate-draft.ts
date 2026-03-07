import { prisma } from "@/lib/prisma";

export async function generateMailDraft(articleIds: string[]) {
  const articles = articleIds.length
    ? await prisma.article.findMany({
        where: {
          id: {
            in: articleIds,
          },
        },
        include: {
          source: true,
        },
      })
    : [];

  const orderedArticles = articleIds
    .map((articleId) => articles.find((article) => article.id === articleId))
    .filter((article): article is NonNullable<typeof article> => Boolean(article));

  const subject =
    orderedArticles.length > 0
      ? `本日のテックニュース共有 (${orderedArticles.length}件)`
      : "本日のテックニュース共有";

  const lines = [
    "気になった記事を共有します。",
    "",
    ...orderedArticles.flatMap((article) => [
      `- [${article.source.name}] ${article.translatedTitle ?? article.title}`,
      `  ${article.url}`,
      article.summary ? `  ${article.summary}` : "",
      "",
    ]),
  ];

  return {
    subject,
    body: lines.join("\n").trim(),
  };
}
