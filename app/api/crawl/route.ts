import { NextRequest, NextResponse } from "next/server";
import { crawlAllSources, type SourceKey } from "@/lib/crawlers";

const VALID_SOURCES: SourceKey[] = ["hatena", "hackernews", "publickey"];

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}));
  const requestedSources = Array.isArray(body.sources)
    ? body.sources.filter(
        (source: unknown): source is SourceKey =>
          typeof source === "string" && VALID_SOURCES.includes(source as SourceKey),
      )
    : undefined;

  const results = await crawlAllSources(requestedSources);

  return NextResponse.json({
    ok: true,
    results,
  });
}
