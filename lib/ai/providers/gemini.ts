/**
 * Google Gemini provider (gemini-1.5-flash — free tier).
 * All prompts are carefully constrained to Class 7 level.
 */

import type { AIService } from "../ai-service";
import type {
  Question,
  WritingEvaluation,
  VocabEvaluation,
  GeneratedQuestion,
  StudentStats,
} from "@/types";

const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent";

async function callGemini(prompt: string): Promise<string> {
  const key = process.env.GOOGLE_AI_API_KEY;
  if (!key) throw new Error("GOOGLE_AI_API_KEY is not set");

  const res = await fetch(`${GEMINI_API_URL}?key=${key}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { temperature: 0.7, maxOutputTokens: 1024 },
      safetySettings: [
        { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_MEDIUM_AND_ABOVE" },
        { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_MEDIUM_AND_ABOVE" },
      ],
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Gemini API error ${res.status}: ${err}`);
  }

  const data = await res.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
}

function parseJSON<T>(text: string): T {
  // Extract JSON from markdown code blocks if present
  const match = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  const raw = match ? match[1] : text;
  return JSON.parse(raw.trim());
}

export class GeminiProvider implements AIService {
  async evaluateWriting(
    text: string,
    promptText: string,
    writingType: string,
    classLevel: number
  ): Promise<WritingEvaluation> {
    const prompt = `
You are an experienced English teacher evaluating a Class ${classLevel} student's writing.
The student was asked to write: "${promptText}" (Type: ${writingType})

STUDENT'S WRITING:
---
${text}
---

Evaluate the writing and return ONLY a JSON object (no markdown) in this exact format:
{
  "scores": {
    "content": <0-25>,
    "structure": <0-20>,
    "grammar": <0-20>,
    "vocabulary": <0-15>,
    "creativity": <0-10>,
    "style": <0-10>,
    "total": <sum of above>
  },
  "feedback": {
    "strengths": ["<strength 1>", "<strength 2>"],
    "improvements": ["<area 1>", "<area 2>"],
    "grammarCorrections": [
      {"original": "<wrong>", "suggested": "<correct>", "explanation": "<why>"}
    ],
    "wordSuggestions": [
      {"original": "<bland word>", "alternatives": ["<better>", "<better2>"], "reason": "<why>"}
    ],
    "sentenceImprovements": [
      {"original": "<weak sentence>", "improved": "<better>", "why": "<reason>"}
    ],
    "overallComment": "<2-3 encouraging sentences for a Class ${classLevel} student>"
  }
}

Be specific, constructive, and age-appropriate. Do NOT rewrite the essay.
Keep corrections limited to the most important issues (max 3 each).
`;

    const raw = await callGemini(prompt);
    return parseJSON<WritingEvaluation>(raw);
  }

  async evaluateVocabSentence(
    word: string,
    meaning: string,
    sentence: string,
    classLevel: number
  ): Promise<VocabEvaluation> {
    const prompt = `
You are an English vocabulary teacher for Class ${classLevel} students.
Word: "${word}" — Meaning: "${meaning}"
Student's sentence: "${sentence}"

Evaluate and return ONLY JSON:
{
  "score": <0-100>,
  "isCorrect": <true/false>,
  "meaningCorrect": <true/false>,
  "grammarCorrect": <true/false>,
  "contextCorrect": <true/false>,
  "feedback": "<1-2 sentences of feedback>",
  "suggestion": "<optional improved sentence if needed>"
}

Score breakdown: meaning correctness 40%, grammar 20%, context 20%, sentence quality 10%, originality 10%.
`;
    const raw = await callGemini(prompt);
    return parseJSON<VocabEvaluation>(raw);
  }

  async explainAnswer(
    question: Question,
    correctAnswer: string,
    studentAnswer: string,
    classLevel: number
  ): Promise<string> {
    const prompt = `
You are a friendly tutor explaining to a Class ${classLevel} student (age 12-13).
Question: "${question.questionText}"
Correct answer: "${correctAnswer}"${question.answerUnit ? " " + question.answerUnit : ""}
Student answered: "${studentAnswer}" (${studentAnswer === correctAnswer ? "CORRECT" : "INCORRECT"})

Write a clear, step-by-step explanation (max 150 words) that:
1. Confirms or corrects the student's answer
2. Shows the working/reasoning
3. Highlights the most common mistake students make
4. Ends with a "Why this works:" insight

Use simple language appropriate for a 12-year-old. Be encouraging.
`;
    return callGemini(prompt);
  }

  async generateSimilarQuestion(question: Question): Promise<GeneratedQuestion> {
    const prompt = `
Generate a similar Class 7 question to test the same concept as:
"${question.questionText}" (Type: ${question.questionType}, Difficulty: ${question.difficulty})

Return ONLY JSON:
{
  "questionText": "<new question with different numbers/context>",
  "correctAnswer": "<answer>",
  "answerUnit": "<unit if applicable>",
  "explanation": "<step-by-step solution>",
  "options": [
    {"label": "A", "text": "<option>", "isCorrect": false},
    {"label": "B", "text": "<answer>", "isCorrect": true},
    {"label": "C", "text": "<option>", "isCorrect": false},
    {"label": "D", "text": "<option>", "isCorrect": false}
  ]
}

Only include "options" if the original was MCQ. Ensure the answer is mathematically/scientifically correct.
`;
    const raw = await callGemini(prompt);
    return parseJSON<GeneratedQuestion>(raw);
  }

  async generateWritingTopic(writingType: string, classLevel: number): Promise<string> {
    const prompt = `
Generate ONE creative and original writing topic for a Class ${classLevel} student (age 12-13).
Writing type: ${writingType}

Requirements:
- Age-appropriate and engaging
- Encourages imagination and personal reflection
- Not repetitive or clichéd
- 1-2 sentences maximum

Return ONLY the topic text, no quotes, no explanation.
`;
    return (await callGemini(prompt)).trim();
  }

  async generateWeeklyReport(stats: StudentStats): Promise<string> {
    const prompt = `
Write a brief, encouraging weekly learning report for a Class 7 student named ${stats.name}.

Stats this week:
- Study time: ${stats.weekMinutes} minutes
- Problems solved: ${stats.questionsAttempted}
- Accuracy: ${stats.accuracy}%
- New words learned: ${stats.newWords}
- Writing exercises: ${stats.writingCount}
${stats.biggestImprovement ? `- Biggest improvement: ${stats.biggestImprovement.topic} (${stats.biggestImprovement.before}% → ${stats.biggestImprovement.after}%)` : ""}
- Topics needing attention: ${stats.weakTopics.join(", ") || "None identified"}

Write 4-5 sentences that:
1. Celebrate what went well
2. Note the most important area to focus on next week
3. Give one specific, actionable recommendation
4. End on an encouraging note

Use simple, warm language appropriate for a 12-13 year old student.
`;
    return callGemini(prompt);
  }
}
