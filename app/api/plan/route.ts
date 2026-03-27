import { NextRequest, NextResponse } from "next/server";
import { buildAmazonPlan } from "@/lib/amazon-planner";

export async function POST(req: NextRequest) {
  try {
    const { category, productName } = await req.json();

    if (!category) {
      return NextResponse.json({ error: "category is required" }, { status: 400 });
    }

    const plan = buildAmazonPlan(category, productName || "product");
    return NextResponse.json(plan);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Plan failed" },
      { status: 500 }
    );
  }
}
