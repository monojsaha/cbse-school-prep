import { NextRequest, NextResponse } from "next/server";
import { getAIService } from "@/lib/ai/ai-service";
import type { Question } from "@/types";

export async function POST(req: NextRequest) {
  try {
    const { question, correctAnswer, studentAnswer, classLevel = 7 } = await req.json() as {
      question: Question;
      correctAnswer: string;
      studentAnswer: string;
      classLevel?: number;
    };

    const ai = await getAIService();
    const explanation = await ai.explainAnswer(question, correctAnswer, studentAnswer, classLevel);

    return NextResponse.json({ explanation });
  } catch (err) {
    console.error("AI explain error:", err);
    return NextResponse.json({ explanation: "" }, { status: 200 }); // fail gracefully
  }
}
