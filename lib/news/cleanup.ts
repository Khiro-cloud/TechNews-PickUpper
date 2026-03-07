import { prisma } from "@/lib/prisma";

const DEFAULT_RETENTION_DAYS = 30;

function getRetentionDays() {
  const raw = process.env.ARTICLE_RETENTION_DAYS;
  const parsed = raw ? Number(raw) : DEFAULT_RETENTION_DAYS;

  if (!Number.isFinite(parsed) || parsed < 1) {
    return DEFAULT_RETENTION_DAYS;
  }

  return Math.floor(parsed);
}

export async function pruneOldArticles() {
  const retentionDays = getRetentionDays();
  const threshold = new Date();
  threshold.setDate(threshold.getDate() - retentionDays);

  const result = await prisma.article.deleteMany({
    where: {
      OR: [
        {
          publishedAt: {
            lt: threshold,
          },
        },
        {
          publishedAt: null,
          createdAt: {
            lt: threshold,
          },
        },
      ],
    },
  });

  return {
    deleted: result.count,
    retentionDays,
    threshold: threshold.toISOString(),
  };
}
