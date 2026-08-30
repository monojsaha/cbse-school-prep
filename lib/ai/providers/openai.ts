/**
 * OpenAI provider (gpt-4o-mini) — cost-efficient fallback.
 */
import type { AIService } from "../ai-service";
import type { Question, WritingEvaluation, VocabEvaluation, GeneratedQuestion, StudentStats } from "@/types";

async function callOpenAI(prompt: string): Promise<string> {
  const key = process.env.OPENAI_API_KEY;
  if (!key) throw new Error("OPENAI_API_KEY is not set");
  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 1024,
    }),
  });
  if (!res.ok) throw new Error(`OpenAI error ${res.status}`);
  const data = await res.json();
  return data.choices[0].message.content;
}

function parseJSON<T>(text: string): T {
  const match = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  return JSON.parse((match ? match[1] : text).trim());
}

export class OpenAIProvider implements AIService {
  async evaluateWriting(text: string, promptText: string, writingType: string, classLevel: number): Promise<WritingEvaluation> {
    const raw = await callOpenAI(`Class ${classLevel} English teacher. Evaluate ${writingType} for prompt "${promptText}":\n${text}\nReturn JSON: {scores:{content(0-25),structure(0-20),grammar(0-20),vocabulary(0-15),creativity(0-10),style(0-10),total},feedback:{strengths[],improvements[],grammarCorrections[{original,suggested,explanation}],wordSuggestions[{original,alternatives[],reason}],sentenceImprovements[{original,improved,why}],overallComment}}`);
    return parseJSON<WritingEvaluation>(raw);
  }
  async evaluateVocabSentence(word: string, meaning: string, sentence: string, classLevel: number): Promise<VocabEvaluation> {
    const raw = await callOpenAI(`Class ${classLevel} vocab. Word: "${word}" (${meaning}). Sentence: "${sentence}". JSON: {score,isCorrect,meaningCorrect,grammarCorrect,contextCorrect,feedback,suggestion?}`);
    return parseJSON<VocabEvaluation>(raw);
  }
  async explainAnswer(q: Question, correct: string, student: string, classLevel: number): Promise<string> {
    return callOpenAI(`Explain to Class ${classLevel} student: Q "${q.questionText}". Correct: "${correct}". Student: "${student}". 150 words, step-by-step, encouraging.`);
  }
  async generateSimilarQuestion(q: Question): Promise<GeneratedQuestion> {
    const raw = await callOpenAI(`Similar Class 7 question to: "${q.questionText}" (${q.questionType}). JSON: {questionText,correctAnswer,answerUnit?,explanation,options?[{label,text,isCorrect}]}`);
    return parseJSON<GeneratedQuestion>(raw);
  }
  async generateWritingTopic(writingType: string, classLevel: number): Promise<string> {
    return (await callOpenAI(`One creative ${writingType} topic for Class ${classLevel} student age 12-13. Topic only.`)).trim();
  }
  async generateWeeklyReport(stats: StudentStats): Promise<string> {
    return callOpenAI(`4-5 sentence weekly report for Class 7 student ${stats.name}: ${stats.weekMinutes}min, ${stats.questionsAttempted} problems (${stats.accuracy}%), ${stats.newWords} words, weak: ${stats.weakTopics.join(", ")}.`);
  }
}
