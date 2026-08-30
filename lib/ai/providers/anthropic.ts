/**
 * Anthropic Claude provider (claude-sonnet-4-6).
 * Implements the same AIService interface as GeminiProvider.
 */
import type { AIService } from "../ai-service";
import type {
  Question, WritingEvaluation, VocabEvaluation,
  GeneratedQuestion, StudentStats,
} from "@/types";

async function callClaude(prompt: string, maxTokens = 1024): Promise<string> {
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) throw new Error("ANTHROPIC_API_KEY is not set");

  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "x-api-key": key,
      "anthropic-version": "2023-06-01",
      "content-type": "application/json",
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-6",
      max_tokens: maxTokens,
      messages: [{ role: "user", content: prompt }],
    }),
  });

  if (!res.ok) throw new Error(`Anthropic error ${res.status}: ${await res.text()}`);
  const data = await res.json();
  return data.content[0].text;
}

function parseJSON<T>(text: string): T {
  const match = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  return JSON.parse((match ? match[1] : text).trim());
}

// The prompts are identical to GeminiProvider — only the HTTP call differs.
export class AnthropicProvider implements AIService {
  async evaluateWriting(text: string, promptText: string, writingType: string, classLevel: number): Promise<WritingEvaluation> {
    const raw = await callClaude(`You are an English teacher for Class ${classLevel}. Evaluate this ${writingType} writing written for the prompt "${promptText}":\n---\n${text}\n---\nReturn ONLY a JSON object with keys: scores{content(0-25),structure(0-20),grammar(0-20),vocabulary(0-15),creativity(0-10),style(0-10),total} and feedback{strengths[],improvements[],grammarCorrections[{original,suggested,explanation}],wordSuggestions[{original,alternatives[],reason}],sentenceImprovements[{original,improved,why}],overallComment}. Max 3 items per array. Be encouraging.`);
    return parseJSON<WritingEvaluation>(raw);
  }
  async evaluateVocabSentence(word: string, meaning: string, sentence: string, classLevel: number): Promise<VocabEvaluation> {
    const raw = await callClaude(`Class ${classLevel} vocab eval. Word: "${word}" (${meaning}). Sentence: "${sentence}". Return JSON: {score(0-100),isCorrect,meaningCorrect,grammarCorrect,contextCorrect,feedback,suggestion?}`);
    return parseJSON<VocabEvaluation>(raw);
  }
  async explainAnswer(q: Question, correct: string, student: string, classLevel: number): Promise<string> {
    return callClaude(`Explain to a Class ${classLevel} student (12 yrs): Q: "${q.questionText}" Correct: "${correct}" Student said: "${student}". Step-by-step, 150 words max, encouraging.`);
  }
  async generateSimilarQuestion(q: Question): Promise<GeneratedQuestion> {
    const raw = await callClaude(`Generate a similar Class 7 question to: "${q.questionText}" (${q.questionType}). Return JSON: {questionText,correctAnswer,answerUnit?,explanation,options?[{label,text,isCorrect}]}`);
    return parseJSON<GeneratedQuestion>(raw);
  }
  async generateWritingTopic(writingType: string, classLevel: number): Promise<string> {
    return (await callClaude(`Give ONE creative ${writingType} topic for Class ${classLevel} student, age 12-13. Just the topic text, no quotes.`)).trim();
  }
  async generateWeeklyReport(stats: StudentStats): Promise<string> {
    return callClaude(`Write 4-5 encouraging sentences weekly report for Class 7 student ${stats.name}: ${stats.weekMinutes}min studied, ${stats.questionsAttempted} problems (${stats.accuracy}% accuracy), ${stats.newWords} new words, weak in: ${stats.weakTopics.join(", ")}.`);
  }
}
