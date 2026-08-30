import { NextRequest, NextResponse } from "next/server";
import { getAIService } from "@/lib/ai/ai-service";

export async function POST(req: NextRequest) {
  try {
    const stats = await req.json();
    const ai = await getAIService();
    const report = await ai.generateWeeklyReport(stats);
    return NextResponse.json({ report });
  } catch (err) {
    console.error("Weekly report error:", err);
    return NextResponse.json({ report: null });
  }
}
