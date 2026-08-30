import { NextRequest, NextResponse } from "next/server";
import { getAIService } from "@/lib/ai/ai-service";

export async function POST(req: NextRequest) {
  try {
    const { text, prompt, writingType, classLevel = 7 } = await req.json();
    const ai = await getAIService();
    const result = await ai.evaluateWriting(text, prompt, writingType, classLevel);
    return NextResponse.json(result);
  } catch (err) {
    console.error("Writing eval error:", err);
    return NextResponse.json(
      { error: "Evaluation failed. Please try again." },
      { status: 500 }
    );
  }
}
