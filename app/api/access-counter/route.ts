import { NextResponse } from "next/server";
import { getAccessCounter, incrementAccessCounter } from "@/lib/access-counter";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const counter = await getAccessCounter();
    return NextResponse.json(counter, {
      headers: {
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    console.error("Failed to read access counter.", error);
    return NextResponse.json({ error: "Failed to read access counter." }, { status: 500 });
  }
}

export async function POST() {
  try {
    const counter = await incrementAccessCounter();
    return NextResponse.json(counter, {
      headers: {
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    console.error("Failed to update access counter.", error);
    return NextResponse.json({ error: "Failed to update access counter." }, { status: 500 });
  }
}
