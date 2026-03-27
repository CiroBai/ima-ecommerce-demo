import { NextRequest, NextResponse } from "next/server";
import { pollTaskOnce } from "@/lib/ima-api";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const apiKey = process.env.IMA_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "IMA_API_KEY not configured" }, { status: 500 });
  }

  try {
    const { taskId } = await req.json();
    if (!taskId) {
      return NextResponse.json({ error: "taskId is required" }, { status: 400 });
    }

    const result = await pollTaskOnce(apiKey, taskId);
    return NextResponse.json(result);
  } catch (error) {
    console.error("Poll error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Poll failed" },
      { status: 500 }
    );
  }
}
