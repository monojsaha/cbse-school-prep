/**
 * Typed Firestore helpers — thin wrappers around the Firebase SDK.
 * All reads/writes go through these so the rest of the app stays
 * decoupled from Firebase specifics.
 */
import {
  collection, doc, getDoc, getDocs, setDoc, updateDoc, addDoc,
  query, where, orderBy, limit, deleteDoc, serverTimestamp,
  type DocumentData, type QueryConstraint, Timestamp,
} from "firebase/firestore";
import { db } from "./client";
import type {
  Profile, Question, Chapter, Topic, Subject,
  VocabularyWord, StudentWord, WritingPrompt,
  WritingSubmission, QuestionAttempt, StudentMastery,
  Achievement, StudentAchievement, LearningRecommendation,
} from "@/types";

// ─── Collection names ─────────────────────────────────────────────────────────
export const COL = {
  BOARDS:            "boards",
  CLASSES:           "classes",
  SUBJECTS:          "subjects",
  CHAPTERS:          "chapters",
  TOPICS:            "topics",
  QUESTIONS:         "questions",
  QUESTION_OPTIONS:  "question_options",
  QUESTION_HINTS:    "question_hints",
  PROFILES:          "profiles",
  QUESTION_ATTEMPTS: "question_attempts",
  STUDENT_MASTERY:   "student_mastery",
  STUDENT_MISTAKES:  "student_mistakes",
  WRITING_PROMPTS:   "writing_prompts",
  WRITING_SUBMISSIONS: "writing_submissions",
  VOCAB_WORDS:       "vocabulary_words",
  STUDENT_WORDS:     "student_words",
  VOCAB_ATTEMPTS:    "vocabulary_attempts",
  STUDY_SESSIONS:    "study_sessions",
  ACHIEVEMENTS:      "achievements",
  STUDENT_ACHIEVEMENTS: "student_achievements",
  DAILY_CHALLENGES:  "daily_challenges",
  RECOMMENDATIONS:   "learning_recommendations",
} as const;

// ─── Generic helpers ──────────────────────────────────────────────────────────

export async function getDocument<T>(colName: string, id: string): Promise<T | null> {
  const snap = await getDoc(doc(db, colName, id));
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() } as T;
}

export async function queryDocuments<T>(
  colName: string,
  constraints: QueryConstraint[]
): Promise<T[]> {
  const q = query(collection(db, colName), ...constraints);
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as T));
}

export async function setDocument(colName: string, id: string, data: DocumentData) {
  await setDoc(doc(db, colName, id), { ...data, updatedAt: serverTimestamp() });
}

export async function addDocument(colName: string, data: DocumentData): Promise<string> {
  const ref = await addDoc(collection(db, colName), {
    ...data,
    createdAt: serverTimestamp(),
  });
  return ref.id;
}

export async function updateDocument(colName: string, id: string, data: Partial<DocumentData>) {
  await updateDoc(doc(db, colName, id), { ...data, updatedAt: serverTimestamp() });
}

export async function deleteDocument(colName: string, id: string) {
  await deleteDoc(doc(db, colName, id));
}

// ─── Domain-specific helpers ──────────────────────────────────────────────────

export async function getProfile(uid: string): Promise<Profile | null> {
  return getDocument<Profile>(COL.PROFILES, uid);
}

export async function upsertProfile(uid: string, data: Partial<Profile>) {
  const ref = doc(db, COL.PROFILES, uid);
  const snap = await getDoc(ref);
  if (snap.exists()) {
    await updateDoc(ref, { ...data, updatedAt: serverTimestamp() });
  } else {
    await setDoc(ref, { ...data, createdAt: serverTimestamp(), updatedAt: serverTimestamp() });
  }
}

export async function getSubjectsForClass(classId: string): Promise<Subject[]> {
  return queryDocuments<Subject>(COL.SUBJECTS, [where("classId", "==", classId)]);
}

export async function getChaptersForSubject(subjectId: string): Promise<Chapter[]> {
  const rows = await queryDocuments<Chapter>(COL.CHAPTERS, [
    where("subjectId", "==", subjectId),
  ]);
  return rows.sort((a, b) => (a.orderIndex ?? 0) - (b.orderIndex ?? 0));
}

export async function getTopicsForChapter(chapterId: string): Promise<Topic[]> {
  const rows = await queryDocuments<Topic>(COL.TOPICS, [
    where("chapterId", "==", chapterId),
  ]);
  return rows.sort((a, b) => (a.orderIndex ?? 0) - (b.orderIndex ?? 0));
}

export async function getQuestionsForTopic(
  topicId: string,
  count = 10
): Promise<Question[]> {
  const rows = await queryDocuments<Question>(COL.QUESTIONS, [
    where("topicId", "==", topicId),
    limit(count),
  ]);
  return rows.filter((q) => q.isPublished !== false);
}

export async function getStudentMastery(studentId: string): Promise<StudentMastery[]> {
  return queryDocuments<StudentMastery>(COL.STUDENT_MASTERY, [
    where("studentId", "==", studentId),
  ]);
}

export async function getDailyVocabWords(
  studentId: string,
  classId: string,
  count = 5
): Promise<VocabularyWord[]> {
  // Get words the student is reviewing or hasn't started
  const studentWords = await queryDocuments<StudentWord>(COL.STUDENT_WORDS, [
    where("studentId", "==", studentId),
    where("nextReviewAt", "<=", new Date().toISOString()),
    limit(count),
  ]);

  if (studentWords.length >= count) {
    const ids = studentWords.map((sw) => sw.wordId);
    const words: VocabularyWord[] = [];
    for (const id of ids) {
      const w = await getDocument<VocabularyWord>(COL.VOCAB_WORDS, id);
      if (w) words.push(w);
    }
    return words;
  }

  // Fill remaining with new words
  return queryDocuments<VocabularyWord>(COL.VOCAB_WORDS, [
    where("classId", "==", classId),
    limit(count),
  ]);
}

export async function getWritingPrompts(
  classId: string,
  writingType?: string
): Promise<WritingPrompt[]> {
  const rows = await queryDocuments<WritingPrompt>(COL.WRITING_PROMPTS, [
    where("classId", "==", classId),
    limit(20),
  ]);
  return rows.filter(
    (p) => p.isPublished !== false && (!writingType || p.writingType === writingType)
  );
}

export async function getRecommendations(studentId: string): Promise<LearningRecommendation[]> {
  return queryDocuments<LearningRecommendation>(COL.RECOMMENDATIONS, [
    where("studentId", "==", studentId),
    where("isCompleted", "==", false),
    orderBy("priority", "desc"),
    limit(5),
  ]);
}

export async function getAchievements(): Promise<Achievement[]> {
  return queryDocuments<Achievement>(COL.ACHIEVEMENTS, []);
}

export async function getStudentAchievements(studentId: string): Promise<StudentAchievement[]> {
  return queryDocuments<StudentAchievement>(COL.STUDENT_ACHIEVEMENTS, [
    where("studentId", "==", studentId),
  ]);
}

// Convert Firestore Timestamp to ISO string if needed
export function toISO(val: Timestamp | string | undefined): string {
  if (!val) return new Date().toISOString();
  if (typeof val === "string") return val;
  return val.toDate().toISOString();
}
