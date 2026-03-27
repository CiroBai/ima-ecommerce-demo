import { NextRequest, NextResponse } from "next/server";
import {
  getProductList,
  findModelVersion,
  extractModelParams,
  createTask,
  pollTaskOnce,
  uploadImageToCdn,
} from "@/lib/ima-api";

export const runtime = "nodejs";
export const maxDuration = 60; // Vercel hobby limit

export async function POST(req: NextRequest) {
  const apiKey = process.env.IMA_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "IMA_API_KEY not configured" }, { status: 500 });
  }

  try {
    const body = await req.json();
    const {
      prompt,
      modelId = "doubao-seedream-4.5",
      taskType = "text_to_image",
      inputImages = [],
      extraParams = {},
    } = body;

    if (!prompt) {
      return NextResponse.json({ error: "prompt is required" }, { status: 400 });
    }

    // Get product list and find model
    const tree = await getProductList(apiKey, taskType);
    const node = findModelVersion(tree, modelId);
    if (!node) {
      return NextResponse.json({ error: `Model ${modelId} not found` }, { status: 400 });
    }

    const modelParams = extractModelParams(node);

    // Create task
    const taskId = await createTask({
      apiKey,
      taskType,
      modelParams,
      prompt,
      inputImages,
      extraParams,
    });

    return NextResponse.json({ taskId, modelName: modelParams.model_name });
  } catch (error) {
    console.error("Generate error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Generation failed" },
      { status: 500 }
    );
  }
}
