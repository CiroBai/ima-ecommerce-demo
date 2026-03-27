import { NextRequest, NextResponse } from "next/server";
import { uploadImageToCdn } from "@/lib/ima-api";

export const runtime = "nodejs";
export const maxDuration = 30;

export async function POST(req: NextRequest) {
  const apiKey = process.env.IMA_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "IMA_API_KEY not configured" }, { status: 500 });
  }

  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Validate file type
    if (!file.type.startsWith("image/")) {
      return NextResponse.json({ error: "Only image files are allowed" }, { status: 400 });
    }

    // Validate file size (20MB max)
    if (file.size > 20 * 1024 * 1024) {
      return NextResponse.json({ error: "File too large (max 20MB)" }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const imageBytes = new Uint8Array(arrayBuffer);

    const cdnUrl = await uploadImageToCdn(imageBytes, file.type, apiKey);

    return NextResponse.json({ url: cdnUrl, filename: file.name, size: file.size });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Upload failed" },
      { status: 500 }
    );
  }
}
