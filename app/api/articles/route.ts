import { NextResponse } from "next/server";
import { getArticleOverview } from "@/lib/news/repository";

export async function GET() {
  const overview = await getArticleOverview();

  return NextResponse.json({
    items: overview.groups,
    meta: {
      lastFetchedAt: overview.lastFetchedAt,
      lastFetchedAtLabel: overview.lastFetchedAtLabel,
      totalArticles: overview.totalArticles,
    },
  });
}
