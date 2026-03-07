import { NextRequest, NextResponse } from "next/server";
import { generateMailDraft } from "@/lib/mail/generate-draft";

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}));
  const articleIds = Array.isArray(body.articleIds) ? body.articleIds : [];

  const draft = await generateMailDraft(articleIds);

  return NextResponse.json(draft);
}
