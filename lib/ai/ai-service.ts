/**
 * AIService — provider-agnostic interface.
 * The concrete provider is selected via the AI_PROVIDER env var.
 * All methods are server-side only; never import this in Client Components.
 */

import type {
  Question,
  WritingEvaluation,
  VocabEvaluation,
  GeneratedQuestion,
  StudentStats,
} from "@/types";

export interface AIService {
  evaluateWriting(
    text: string,
    promptText: string,
    writingType: string,
    classLevel: number
  ): Promise<WritingEvaluation>;

  evaluateVocabSentence(
    word: string,
    meaning: string,
    sentence: string,
    classLevel: number
  ): Promise<VocabEvaluation>;

  explainAnswer(
    question: Question,
    correctAnswer: string,
    studentAnswer: string,
    classLevel: number
  ): Promise<string>;

  generateSimilarQuestion(question: Question): Promise<GeneratedQuestion>;

  generateWritingTopic(writingType: string, classLevel: number): Promise<string>;

  generateWeeklyReport(stats: StudentStats): Promise<string>;
}

// ─── Factory ──────────────────────────────────────────────────────────────────

export async function getAIService(): Promise<AIService> {
  const provider = process.env.AI_PROVIDER ?? "gemini";

  switch (provider) {
    case "gemini": {
      const { GeminiProvider } = await import("./providers/gemini");
      return new GeminiProvider();
    }
    case "anthropic": {
      const { AnthropicProvider } = await import("./providers/anthropic");
      return new AnthropicProvider();
    }
    case "openai": {
      const { OpenAIProvider } = await import("./providers/openai");
      return new OpenAIProvider();
    }
    default:
      throw new Error(`Unknown AI provider: ${provider}`);
  }
}
