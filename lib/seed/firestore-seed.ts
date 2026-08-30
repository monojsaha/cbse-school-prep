/**
 * Firestore seed runner — run once to populate a fresh project.
 * Usage: npx ts-node -P tsconfig.json lib/seed/firestore-seed.ts
 *
 * Requires GOOGLE_APPLICATION_CREDENTIALS or FIREBASE_SERVICE_ACCOUNT_KEY env var.
 */
import { initializeApp, cert, getApps } from "firebase-admin/app";
import { getFirestore, Timestamp } from "firebase-admin/firestore";
import * as path from "path";
import * as fs from "fs";

// ---- init admin ----
function getAdminApp() {
  if (getApps().length) return getApps()[0];
  const keyJson = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
  if (keyJson) {
    return initializeApp({ credential: cert(JSON.parse(keyJson)) });
  }
  const keyPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;
  if (keyPath && fs.existsSync(keyPath)) {
    return initializeApp({ credential: cert(require(path.resolve(keyPath))) });
  }
  throw new Error("Set FIREBASE_SERVICE_ACCOUNT_KEY or GOOGLE_APPLICATION_CREDENTIALS");
}

const app = getAdminApp();
const db  = getFirestore(app);

async function upsert(col: string, id: string, data: Record<string, unknown>) {
  await db.collection(col).doc(id).set(data, { merge: true });
}

async function seedAll() {
  console.log("Seeding Firestore…");

  // ── Board ──────────────────────────────────────────────────
  await upsert("boards", "icse", { id: "icse", name: "ICSE", code: "ICSE" });
  await upsert("boards", "cbse", { id: "cbse", name: "CBSE", code: "CBSE" });
  console.log("✓ boards");

  // ── Classes ────────────────────────────────────────────────
  for (const grade of [6, 7, 8, 9, 10]) {
    await upsert("classes", `class_${grade}`, {
      id: `class_${grade}`, boardId: "icse", name: `Class ${grade}`, grade,
    });
  }
  console.log("✓ classes");

  // ── Subjects ───────────────────────────────────────────────
  const subjects = [
    { id: "math_7",    classId: "class_7", name: "Mathematics", slug: "math",      color: "#3b82f6", icon: "📐" },
    { id: "phy_7",     classId: "class_7", name: "Physics",     slug: "physics",   color: "#7c3aed", icon: "⚡" },
    { id: "chem_7",    classId: "class_7", name: "Chemistry",   slug: "chemistry", color: "#10b981", icon: "🧪" },
    { id: "eng_7",     classId: "class_7", name: "English",     slug: "english",   color: "#f97316", icon: "✍️" },
  ];
  for (const s of subjects) await upsert("subjects", s.id, s);
  console.log("✓ subjects");

  // ── Math Chapters ──────────────────────────────────────────
  const mathChapters = [
    { id: "math7_ch1", subjectId: "math_7", name: "Integers",         orderIndex: 1 },
    { id: "math7_ch2", subjectId: "math_7", name: "Fractions",        orderIndex: 2 },
    { id: "math7_ch3", subjectId: "math_7", name: "Decimals",         orderIndex: 3 },
    { id: "math7_ch4", subjectId: "math_7", name: "Algebra",          orderIndex: 4 },
    { id: "math7_ch5", subjectId: "math_7", name: "Geometry",         orderIndex: 5 },
    { id: "math7_ch6", subjectId: "math_7", name: "Ratio & Proportion",orderIndex: 6 },
    { id: "math7_ch7", subjectId: "math_7", name: "Percentages",      orderIndex: 7 },
    { id: "math7_ch8", subjectId: "math_7", name: "Data Handling",    orderIndex: 8 },
  ];
  for (const c of mathChapters) await upsert("chapters", c.id, c);

  // ── Physics Chapters ───────────────────────────────────────
  const phyChapters = [
    { id: "phy7_ch1", subjectId: "phy_7", name: "Motion",              orderIndex: 1 },
    { id: "phy7_ch2", subjectId: "phy_7", name: "Force & Laws",        orderIndex: 2 },
    { id: "phy7_ch3", subjectId: "phy_7", name: "Light & Reflection",  orderIndex: 3 },
    { id: "phy7_ch4", subjectId: "phy_7", name: "Sound",               orderIndex: 4 },
    { id: "phy7_ch5", subjectId: "phy_7", name: "Electricity",         orderIndex: 5 },
  ];
  for (const c of phyChapters) await upsert("chapters", c.id, c);

  // ── Chemistry Chapters ─────────────────────────────────────
  const chemChapters = [
    { id: "chem7_ch1", subjectId: "chem_7", name: "Matter & Its States",  orderIndex: 1 },
    { id: "chem7_ch2", subjectId: "chem_7", name: "Atoms & Molecules",   orderIndex: 2 },
    { id: "chem7_ch3", subjectId: "chem_7", name: "Chemical Reactions",  orderIndex: 3 },
    { id: "chem7_ch4", subjectId: "chem_7", name: "Acids, Bases & Salts",orderIndex: 4 },
    { id: "chem7_ch5", subjectId: "chem_7", name: "Metals & Non-Metals", orderIndex: 5 },
  ];
  for (const c of chemChapters) await upsert("chapters", c.id, c);
  console.log("✓ chapters");

  // ── Topics ─────────────────────────────────────────────────
  const topics = [
    // Math
    { id: "t_int_ops",    chapterId: "math7_ch1", subjectId: "math_7", name: "Operations on Integers",    orderIndex: 1 },
    { id: "t_int_neg",    chapterId: "math7_ch1", subjectId: "math_7", name: "Negative Number Patterns",  orderIndex: 2 },
    { id: "t_frac_add",   chapterId: "math7_ch2", subjectId: "math_7", name: "Adding & Subtracting",      orderIndex: 1 },
    { id: "t_frac_mul",   chapterId: "math7_ch2", subjectId: "math_7", name: "Multiplying Fractions",     orderIndex: 2 },
    { id: "t_alg_exp",    chapterId: "math7_ch4", subjectId: "math_7", name: "Algebraic Expressions",     orderIndex: 1 },
    { id: "t_alg_eq",     chapterId: "math7_ch4", subjectId: "math_7", name: "Linear Equations",          orderIndex: 2 },
    { id: "t_geo_ang",    chapterId: "math7_ch5", subjectId: "math_7", name: "Angles",                    orderIndex: 1 },
    { id: "t_geo_tri",    chapterId: "math7_ch5", subjectId: "math_7", name: "Triangles",                 orderIndex: 2 },
    { id: "t_pct_basic",  chapterId: "math7_ch7", subjectId: "math_7", name: "Percentage Basics",         orderIndex: 1 },
    { id: "t_pct_profit", chapterId: "math7_ch7", subjectId: "math_7", name: "Profit & Loss",             orderIndex: 2 },
    // Physics
    { id: "t_motion1",    chapterId: "phy7_ch1", subjectId: "phy_7",  name: "Speed & Velocity",           orderIndex: 1 },
    { id: "t_motion2",    chapterId: "phy7_ch1", subjectId: "phy_7",  name: "Distance-Time Graphs",       orderIndex: 2 },
    { id: "t_force1",     chapterId: "phy7_ch2", subjectId: "phy_7",  name: "Newton's Laws",              orderIndex: 1 },
    { id: "t_light1",     chapterId: "phy7_ch3", subjectId: "phy_7",  name: "Laws of Reflection",         orderIndex: 1 },
    { id: "t_sound1",     chapterId: "phy7_ch4", subjectId: "phy_7",  name: "Properties of Sound",        orderIndex: 1 },
    // Chemistry
    { id: "t_matter1",    chapterId: "chem7_ch1", subjectId: "chem_7", name: "States of Matter",          orderIndex: 1 },
    { id: "t_atoms1",     chapterId: "chem7_ch2", subjectId: "chem_7", name: "Atomic Structure",          orderIndex: 1 },
    { id: "t_rxn1",       chapterId: "chem7_ch3", subjectId: "chem_7", name: "Types of Reactions",        orderIndex: 1 },
    { id: "t_acid1",      chapterId: "chem7_ch4", subjectId: "chem_7", name: "pH Scale & Indicators",     orderIndex: 1 },
    { id: "t_metal1",     chapterId: "chem7_ch5", subjectId: "chem_7", name: "Reactivity Series",         orderIndex: 1 },
  ];
  for (const t of topics) await upsert("topics", t.id, t);
  console.log("✓ topics");

  // ── Sample Questions ───────────────────────────────────────
  const questions = [
    // Math - Integers - Easy MCQ
    {
      id: "q_int_001",
      topicId: "t_int_ops", chapterId: "math7_ch1", subjectId: "math_7",
      boardId: "icse", classId: "class_7",
      questionType: "mcq", difficulty: "easy",
      questionText: "What is (-8) + (-5)?",
      options: [
        { id: "a", label: "A", text: "-13", isCorrect: true  },
        { id: "b", label: "B", text: "-3",  isCorrect: false },
        { id: "c", label: "C", text: "13",  isCorrect: false },
        { id: "d", label: "D", text: "3",   isCorrect: false },
      ],
      correctAnswer: "A",
      explanation: "(-8) + (-5) = -(8+5) = -13. When adding two negative numbers, add their absolute values and put a minus sign.",
      whyItWorks: "Negative numbers can be thought of as debts. If you owe ₹8 and borrow ₹5 more, you owe ₹13 total.",
      hints: [
        { orderIndex: 1, text: "Both numbers are negative." },
        { orderIndex: 2, text: "Adding two negatives: keep the minus and add the numbers." },
      ],
      skillTested: "Integer addition", estimatedSeconds: 30, isPublished: true,
      createdAt: new Date().toISOString(),
    },
    // Math - Integers - Medium MCQ
    {
      id: "q_int_002",
      topicId: "t_int_ops", chapterId: "math7_ch1", subjectId: "math_7",
      boardId: "icse", classId: "class_7",
      questionType: "mcq", difficulty: "medium",
      questionText: "What is (-4) × (-7) + 3 × (-2)?",
      options: [
        { id: "a", label: "A", text: "22",  isCorrect: true  },
        { id: "b", label: "B", text: "-22", isCorrect: false },
        { id: "c", label: "C", text: "34",  isCorrect: false },
        { id: "d", label: "D", text: "-34", isCorrect: false },
      ],
      correctAnswer: "A",
      explanation: "(-4)×(-7) = +28. 3×(-2) = -6. 28 + (-6) = 22.",
      whyItWorks: "Negative × Negative = Positive (same signs multiply to positive). Then apply BODMAS.",
      hints: [
        { orderIndex: 1, text: "Solve multiplication first (BODMAS)." },
        { orderIndex: 2, text: "Negative × Negative = Positive." },
        { orderIndex: 3, text: "28 + (-6) = 28 − 6." },
      ],
      skillTested: "BODMAS with integers", estimatedSeconds: 60, isPublished: true,
      createdAt: new Date().toISOString(),
    },
    // Math - Algebra - Easy MCQ
    {
      id: "q_alg_001",
      topicId: "t_alg_eq", chapterId: "math7_ch4", subjectId: "math_7",
      boardId: "icse", classId: "class_7",
      questionType: "numeric", difficulty: "easy",
      questionText: "Solve for x: 3x + 7 = 22",
      correctAnswer: "5",
      answerUnit: "",
      explanation: "3x = 22 − 7 = 15 → x = 15 ÷ 3 = 5.",
      whyItWorks: "We isolate x by doing the same operation on both sides of the equation.",
      hints: [
        { orderIndex: 1, text: "Move 7 to the right side: 3x = 22 − 7." },
        { orderIndex: 2, text: "Divide both sides by 3." },
      ],
      skillTested: "Linear equation", estimatedSeconds: 45, isPublished: true,
      createdAt: new Date().toISOString(),
    },
    // Physics - Motion - Medium MCQ
    {
      id: "q_phy_001",
      topicId: "t_motion1", chapterId: "phy7_ch1", subjectId: "phy_7",
      boardId: "icse", classId: "class_7",
      questionType: "numeric", difficulty: "medium",
      questionText: "A car travels 120 km in 2 hours. What is its average speed in km/h?",
      correctAnswer: "60",
      answerUnit: "km/h",
      explanation: "Speed = Distance ÷ Time = 120 km ÷ 2 h = 60 km/h.",
      whyItWorks: "Average speed is total distance divided by total time, regardless of how speed varied during the journey.",
      hints: [
        { orderIndex: 1, text: "Formula: Speed = Distance / Time." },
        { orderIndex: 2, text: "Distance = 120 km, Time = 2 h." },
      ],
      skillTested: "Speed calculation", estimatedSeconds: 45, isPublished: true,
      createdAt: new Date().toISOString(),
    },
    // Chemistry - Acids - MCQ
    {
      id: "q_chem_001",
      topicId: "t_acid1", chapterId: "chem7_ch4", subjectId: "chem_7",
      boardId: "icse", classId: "class_7",
      questionType: "mcq", difficulty: "easy",
      questionText: "Which of the following has a pH less than 7?",
      options: [
        { id: "a", label: "A", text: "Baking soda solution", isCorrect: false },
        { id: "b", label: "B", text: "Lemon juice",          isCorrect: true  },
        { id: "c", label: "C", text: "Pure water",           isCorrect: false },
        { id: "d", label: "D", text: "Milk of magnesia",     isCorrect: false },
      ],
      correctAnswer: "B",
      explanation: "Lemon juice is acidic (pH ≈ 2). Baking soda (pH ≈ 9) and milk of magnesia (pH ≈ 10) are basic. Pure water is neutral (pH = 7).",
      whyItWorks: "pH < 7 means acidic. Lemon juice contains citric acid, making it acidic.",
      hints: [
        { orderIndex: 1, text: "Acids have pH < 7, bases have pH > 7." },
        { orderIndex: 2, text: "Think about the taste — which tastes sour?" },
      ],
      skillTested: "pH scale identification", estimatedSeconds: 30, isPublished: true,
      createdAt: new Date().toISOString(),
    },
  ];
  for (const q of questions) await upsert("questions", q.id, q);
  console.log("✓ questions (5 samples — add more via admin panel)");

  // ── Vocabulary words ───────────────────────────────────────
  const vocab = [
    {
      id: "w_meticulous", word: "meticulous", pronunciation: "/mɪˈtɪk.jʊ.ləs/", partOfSpeech: "adjective",
      meaning: "Showing great attention to detail or correct behaviour.",
      simpleExplanation: "Being very very careful about every tiny detail.",
      exampleSentence: "She was meticulous in her revision, checking every answer twice.",
      synonyms: ["careful", "thorough", "precise", "painstaking"],
      antonyms: ["careless", "sloppy", "hasty"],
      difficultyLevel: "medium", classId: "class_7",
    },
    {
      id: "w_reluctant", word: "reluctant", pronunciation: "/rɪˈlʌk.tənt/", partOfSpeech: "adjective",
      meaning: "Unwilling and hesitant.",
      simpleExplanation: "When you don't really want to do something.",
      exampleSentence: "He was reluctant to admit he had made a mistake.",
      synonyms: ["unwilling", "hesitant", "loath", "disinclined"],
      antonyms: ["willing", "eager", "enthusiastic"],
      difficultyLevel: "easy", classId: "class_7",
    },
    {
      id: "w_vivid", word: "vivid", pronunciation: "/ˈvɪv.ɪd/", partOfSpeech: "adjective",
      meaning: "Producing clear, powerful images in the mind.",
      simpleExplanation: "Describing something in a way that feels very real and bright.",
      exampleSentence: "The author painted a vivid picture of the monsoon evening.",
      synonyms: ["bright", "striking", "graphic", "lifelike"],
      antonyms: ["dull", "faint", "vague"],
      difficultyLevel: "easy", classId: "class_7",
    },
    {
      id: "w_perseverance", word: "perseverance", pronunciation: "/ˌpɜː.sɪˈvɪər.əns/", partOfSpeech: "noun",
      meaning: "Continued effort to do or achieve something despite difficulties.",
      simpleExplanation: "Keeping going even when things are tough.",
      exampleSentence: "Her perseverance in solving difficult maths problems paid off.",
      synonyms: ["persistence", "determination", "tenacity", "grit"],
      antonyms: ["giving up", "laziness", "resignation"],
      difficultyLevel: "medium", classId: "class_7",
    },
    {
      id: "w_eloquent", word: "eloquent", pronunciation: "/ˈel.ə.kwənt/", partOfSpeech: "adjective",
      meaning: "Able to express ideas and feelings clearly and effectively.",
      simpleExplanation: "Speaking or writing in a very clear and persuasive way.",
      exampleSentence: "Her eloquent speech won first prize at the debate competition.",
      synonyms: ["articulate", "persuasive", "fluent", "expressive"],
      antonyms: ["inarticulate", "hesitant", "unclear"],
      difficultyLevel: "hard", classId: "class_7",
    },
    {
      id: "w_ambiguous", word: "ambiguous", pronunciation: "/æmˈbɪɡ.ju.əs/", partOfSpeech: "adjective",
      meaning: "Open to more than one interpretation; unclear.",
      simpleExplanation: "Something that could mean two different things at the same time.",
      exampleSentence: "The exam question was ambiguous and confused many students.",
      synonyms: ["unclear", "vague", "equivocal", "puzzling"],
      antonyms: ["clear", "definite", "precise", "unambiguous"],
      difficultyLevel: "hard", classId: "class_7",
    },
  ];
  for (const w of vocab) await upsert("vocab_words", w.id, w);
  console.log("✓ vocab_words (6 samples)");

  // ── Writing Prompts ────────────────────────────────────────
  const prompts = [
    {
      id: "wp_001", boardId: "icse", classId: "class_7",
      writingType: "story", title: "The Unexpected Discovery",
      topicText: "While cleaning the attic, a 12-year-old finds a locked wooden box with an old letter inside. Write a story about what the letter says and the adventure that follows.",
      minWords: 200, maxWords: 350, difficulty: "easy", isPublished: true,
    },
    {
      id: "wp_002", boardId: "icse", classId: "class_7",
      writingType: "essay", title: "Why Reading is More Powerful Than Screen Time",
      topicText: "Write a persuasive essay arguing that reading books gives young people advantages that screens cannot provide. Use at least 3 specific reasons with examples.",
      minWords: 250, maxWords: 400, difficulty: "medium", isPublished: true,
    },
    {
      id: "wp_003", boardId: "icse", classId: "class_7",
      writingType: "letter", title: "Letter to Your Future Self",
      topicText: "Write a letter to yourself 10 years from now. What do you hope you have achieved? What advice would you give? What do you most want to remember about being 12?",
      minWords: 180, maxWords: 300, difficulty: "easy", isPublished: true,
    },
    {
      id: "wp_004", boardId: "icse", classId: "class_7",
      writingType: "diary", title: "The Best Day That Never Happened",
      topicText: "Write a diary entry about a perfect imaginary day — one where everything you dreamed of actually came true. Use vivid details and emotional language.",
      minWords: 150, maxWords: 280, difficulty: "easy", isPublished: true,
    },
    {
      id: "wp_005", boardId: "icse", classId: "class_7",
      writingType: "essay", title: "The Most Important Quality for Success",
      topicText: "Is success mostly the result of talent, hard work, or luck? Choose one factor you believe is most important and defend your position with clear reasoning.",
      minWords: 280, maxWords: 450, difficulty: "hard", isPublished: true,
    },
  ];
  for (const p of prompts) await upsert("writing_prompts", p.id, p);
  console.log("✓ writing_prompts (5 samples)");

  // ── Achievements ───────────────────────────────────────────
  const achievements = [
    { id: "ach_first10",   name: "First Steps",       description: "Answer your first 10 questions",  icon: "🎯", conditionType: "questions_correct", threshold: 10  },
    { id: "ach_100q",      name: "Century Solver",    description: "Answer 100 questions correctly",   icon: "💯", conditionType: "questions_correct", threshold: 100 },
    { id: "ach_streak7",   name: "Week Warrior",      description: "Maintain a 7-day streak",          icon: "🔥", conditionType: "streak_days",       threshold: 7   },
    { id: "ach_streak30",  name: "Iron Will",         description: "Maintain a 30-day streak",         icon: "⚡", conditionType: "streak_days",       threshold: 30  },
    { id: "ach_wordwiz",   name: "Word Wizard",       description: "Master 50 vocabulary words",       icon: "📚", conditionType: "words_mastered",    threshold: 50  },
    { id: "ach_writer",    name: "Creative Writer",   description: "Submit 10 writing pieces",         icon: "✍️", conditionType: "writings_submitted", threshold: 10  },
    { id: "ach_grammarian",name: "Grammar Guardian",  description: "Score 100% on grammar in writing", icon: "📝", conditionType: "grammar_perfect",   threshold: 1   },
    { id: "ach_mathwiz",   name: "Math Explorer",     description: "Master 5 math topics",             icon: "📐", conditionType: "topics_mastered_math", threshold: 5 },
  ];
  for (const a of achievements) await upsert("achievements", a.id, a);
  console.log("✓ achievements");

  console.log("\n🎉 Seed complete! Your ScholarForge database is ready.");
  console.log("Next: set up Firestore security rules (see docs/database.md).");
}

seedAll().catch((e) => { console.error(e); process.exit(1); });
