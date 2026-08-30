import { NextRequest, NextResponse } from "next/server";
import { getAIService } from "@/lib/ai/ai-service";

export async function POST(req: NextRequest) {
  try {
    const { word, meaning, sentence, classLevel = 7 } = await req.json();
    const ai = await getAIService();
    const result = await ai.evaluateVocabSentence(word, meaning, sentence, classLevel);
    return NextResponse.json(result);
  } catch (err) {
    console.error("Vocab eval error:", err);
    // Return a graceful fallback so the UI never crashes
    return NextResponse.json({
      score: 50,
      isCorrect: false,
      meaningCorrect: false,
      grammarCorrect: true,
      contextCorrect: false,
      feedback: "Could not evaluate at this time. Please try again.",
    });
  }
}
