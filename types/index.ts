// ─── Curriculum ───────────────────────────────────────────────────────────────

export interface Board {
  id: string;
  name: string;
  code: string; // ICSE | CBSE | STATE
}

export interface Class {
  id: string;
  boardId: string;
  name: string;
  grade: number;
}

export interface Subject {
  id: string;
  classId: string;
  name: string;
  slug: string; // mathematics | physics | chemistry | writing | vocabulary
  color: string;
  icon: string;
}

export interface Chapter {
  id: string;
  subjectId: string;
  name: string;
  orderIndex: number;
}

export interface Topic {
  id: string;
  chapterId: string;
  name: string;
  orderIndex: number;
}

// ─── Questions ─────────────────────────────────────────────────────────────────

export type QuestionType =
  | "mcq"
  | "numeric"
  | "short_answer"
  | "true_false"
  | "fill_blank"
  | "assertion_reason";

export type Difficulty = "easy" | "medium" | "hard" | "challenge";

export interface QuestionOption {
  id: string;
  label: string; // A | B | C | D
  text: string;
  isCorrect: boolean;
}

export interface QuestionHint {
  id: string;
  orderIndex: number;
  text: string;
}

export interface Question {
  id: string;
  topicId: string;
  boardId: string;
  classId: string;
  subjectId: string;
  questionType: QuestionType;
  difficulty: Difficulty;
  questionText: string;
  imageUrl?: string;
  correctAnswer: string;
  answerUnit?: string;
  explanation: string;
  whyItWorks: string;
  skillTested: string;
  estimatedSeconds: number;
  commonMistake?: string;
  isPublished: boolean;
  options?: QuestionOption[];
  hints?: QuestionHint[];
}

// ─── Student / Auth ──────────────────────────────────────────────────────────

export type UserRole = "student" | "admin";

export interface Profile {
  id: string; // = auth uid
  name: string;
  classId: string;
  boardId: string;
  school?: string;
  learningGoal?: string;
  dailyStudyMinutes: number;
  parentEmail?: string;
  xpTotal: number;
  currentStreak: number;
  longestStreak: number;
  lastActiveDate?: string; // ISO date
  role: UserRole;
  createdAt: string;
}

// ─── Attempts & Mastery ──────────────────────────────────────────────────────

export interface QuestionAttempt {
  id: string;
  studentId: string;
  questionId: string;
  sessionId?: string;
  answerGiven: string;
  isCorrect: boolean;
  hintsUsed: number;
  timeSeconds: number;
  xpEarned: number;
  attemptedAt: string;
}

export type MasteryLevel =
  | "needs_work"   // 0–39
  | "developing"   // 40–59
  | "good"         // 60–79
  | "strong"       // 80–89
  | "mastered";    // 90–100

export interface StudentMastery {
  studentId: string;
  topicId: string;
  attempts: number;
  correct: number;
  masteryPct: number;
  masteryLevel: MasteryLevel;
  lastPracticedAt: string;
}

export interface StudentMistake {
  studentId: string;
  topicId: string;
  pattern: string;
  count: number;
  lastSeenAt: string;
}

// ─── Writing Module ─────────────────────────────────────────────────────────

export type WritingType =
  | "story"
  | "narrative"
  | "descriptive"
  | "picture_composition"
  | "essay"
  | "diary"
  | "informal_letter"
  | "formal_letter"
  | "article"
  | "speech"
  | "dialogue"
  | "continuation";

export interface WritingPrompt {
  id: string;
  boardId: string;
  classId: string;
  writingType: WritingType;
  title: string;
  topicText: string;
  minWords: number;
  maxWords: number;
  difficulty: Difficulty;
  isPublished: boolean;
}

export interface WritingRubric {
  content: number;    // /25
  structure: number;  // /20
  grammar: number;    // /20
  vocabulary: number; // /15
  creativity: number; // /10
  style: number;      // /10
  total: number;      // /100
}

export interface GrammarCorrection {
  original: string;
  suggested: string;
  explanation: string;
}

export interface WordSuggestion {
  original: string;
  alternatives: string[];
  reason: string;
}

export interface WritingFeedback {
  id: string;
  submissionId: string;
  strengths: string[];
  improvements: string[];
  grammarCorrections: GrammarCorrection[];
  wordSuggestions: WordSuggestion[];
  sentenceImprovements: Array<{ original: string; improved: string; why: string }>;
  overallComment: string;
}

export interface WritingSubmission {
  id: string;
  studentId: string;
  promptId: string;
  draftNumber: number;
  content: string;
  wordCount: number;
  submittedAt: string;
  scores: WritingRubric;
  feedback?: WritingFeedback;
}

// ─── Vocabulary Module ───────────────────────────────────────────────────────

export type WordState = "learning" | "reviewing" | "mastered";

export interface VocabularyWord {
  id: string;
  word: string;
  pronunciation: string;
  partOfSpeech: string;
  meaning: string;
  simpleExplanation: string;
  exampleSentence: string;
  synonyms: string[];
  antonyms: string[];
  difficultyLevel: Difficulty;
  classId: string;
}

export interface StudentWord {
  studentId: string;
  wordId: string;
  state: WordState;
  intervalDays: number;
  easeFactor: number;
  nextReviewAt: string;
  totalAttempts: number;
  correctUses: number;
}

export type VocabChallengeType =
  | "choose_meaning"
  | "fill_blank"
  | "choose_synonym"
  | "choose_antonym"
  | "write_sentence"
  | "find_wrong_usage";

export interface VocabEvaluation {
  score: number; // 0-100
  isCorrect: boolean;
  meaningCorrect: boolean;
  grammarCorrect: boolean;
  contextCorrect: boolean;
  feedback: string;
  suggestion?: string;
}

// ─── Gamification ────────────────────────────────────────────────────────────

export interface StudySession {
  id: string;
  studentId: string;
  startedAt: string;
  endedAt?: string;
  subjectId?: string;
  questionsAttempted: number;
  questionsCorrect: number;
  xpEarned: number;
  sessionType: "practice" | "challenge" | "revision" | "quick_test";
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  conditionType: string;
  threshold: number;
}

export interface StudentAchievement {
  studentId: string;
  achievementId: string;
  earnedAt: string;
  achievement?: Achievement;
}

export interface LearningRecommendation {
  id: string;
  studentId: string;
  topicId: string;
  reason: string;
  priority: number;
  createdAt: string;
  isCompleted: boolean;
}

// ─── AI Service ──────────────────────────────────────────────────────────────

export interface WritingEvaluation {
  scores: WritingRubric;
  feedback: Omit<WritingFeedback, "id" | "submissionId">;
}

export interface GeneratedQuestion {
  questionText: string;
  correctAnswer: string;
  answerUnit?: string;
  explanation: string;
  options?: { label: string; text: string; isCorrect: boolean }[];
}

export interface StudentStats {
  name: string;
  weekMinutes: number;
  questionsAttempted: number;
  accuracy: number;
  newWords: number;
  writingCount: number;
  biggestImprovement?: { topic: string; before: number; after: number };
  weakTopics: string[];
}

// ─── UI Helpers ──────────────────────────────────────────────────────────────

export interface NavItem {
  label: string;
  href: string;
  icon: string;
}

export type SubjectSlug = "mathematics" | "physics" | "chemistry";
