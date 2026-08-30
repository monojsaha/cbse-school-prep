# ScholarForge

**Learn. Solve. Write. Grow.**

A production-quality EdTech web application for ICSE/CBSE students, combining:

- **Practice Engine** — Maths, Physics, Chemistry problem-solving with hints and AI explanations
- **Writing Studio** — Creative writing coaching with 6-dimension rubric and AI feedback
- **Word Explorer** — Vocabulary building with spaced-repetition and AI sentence evaluation
- **Progress Tracking** — Mastery charts, streak calendar, XP system and achievements
- **Admin Portal** — Content management for questions, prompts and vocabulary

---

## Tech Stack

| Layer | Choice |
|---|---|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS 3 |
| Database | Firebase Firestore |
| Auth | Firebase Auth (email/password) |
| AI | Google Gemini 1.5 Flash (provider-agnostic) |
| Charts | Recharts |
| Icons | lucide-react |
| Deployment | Vercel |

---

## Local Setup

### Prerequisites

- Node.js 20+
- A Firebase project (free Spark plan works)
- A Google AI Studio API key (free tier)

### 1. Clone and install

```bash
git clone https://github.com/monojsaha/cbse-school-prep.git
cd cbse-school-prep
npm install
```

### 2. Configure environment

```bash
cp .env.example .env.local
```

Fill in `.env.local`:

```env
# Firebase Client (from Project Settings → Web app)
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=

# Firebase Admin (from Service Accounts → Generate new private key)
# Paste the JSON content as a single-line string
FIREBASE_SERVICE_ACCOUNT_KEY={"type":"service_account",...}

# AI Provider
AI_PROVIDER=gemini
GOOGLE_AI_API_KEY=
```

### 3. Seed Firestore

```bash
npx ts-node -P tsconfig.json lib/seed/firestore-seed.ts
```

This creates boards, classes, subjects, chapters, topics, sample questions, vocabulary words, writing prompts, and achievements.

### 4. Deploy Firestore Security Rules

In the Firebase console or via CLI:

```bash
npm install -g firebase-tools
firebase login
firebase deploy --only firestore:rules
```

The rules file is at `firestore.rules`.

### 5. Run the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Project Structure

```
app/
  (auth)/         # Login, signup, onboarding
  (app)/          # Protected student app
    dashboard/    # Home with XP, subjects, daily plan
    practice/     # Maths/Physics/Chemistry problem solving
    writing/      # Writing Studio
    vocabulary/   # Word Explorer
    progress/     # Charts and stats
    profile/      # Student profile
  admin/          # Admin content management portal
  api/ai/         # Server-side AI routes (explain, evaluate-writing, evaluate-vocab, weekly-report)

components/
  ui/             # Button, Card, Badge, Input, etc.
  layout/         # Navigation sidebar/bottom bar
  dashboard/      # Dashboard widgets
  practice/       # Question cards, hint system, solution panel
  writing/        # Writing editor, rubric, feedback
  vocabulary/     # Word card, sentence evaluator, word bank
  progress/       # Mastery chart, weekly report
  gamification/   # XP bar, streak badge, badge display

lib/
  firebase/       # Client, admin, and Firestore helpers
  ai/             # AIService interface + Gemini/Claude/OpenAI providers
  auth/           # Auth context and hooks
  seed/           # Firestore seed script
  utils.ts        # XP, mastery, spaced repetition, formatting

types/index.ts    # All TypeScript interfaces
```

---

## AI Provider

The app uses a provider-agnostic `AIService` interface. Switch providers by changing `AI_PROVIDER` in `.env.local`:

| Value | Model |
|---|---|
| `gemini` (default) | `gemini-1.5-flash` |
| `anthropic` | `claude-sonnet-4-6` |
| `openai` | `gpt-4o-mini` |

All AI calls are server-side only — API keys are never exposed to the browser.

---

## Gamification

| Event | XP |
|---|---|
| Easy question | +5 |
| Medium question | +10 |
| Hard question | +15 |
| Challenge question | +25 |
| Each hint used | −1 |
| Vocabulary sentence | +10 |
| Writing submission | +15 |
| Daily challenge | +30 |
| 7-day streak bonus | +50 |

**Level formula:** Level `n` requires `n × (n+1) × 50` cumulative XP.

---

## Scripts

```bash
npm run dev       # Start dev server
npm run build     # Production build
npm run typecheck # TypeScript check (npx tsc --noEmit)
npm test          # Run unit tests
```

---

## Deployment (Vercel)

1. Push to GitHub
2. Import the repo in Vercel
3. Add all environment variables from `.env.local`
4. Deploy — Vercel auto-detects Next.js

---

## License

MIT
