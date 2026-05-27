# PhD Planner

A production-quality research management platform for PhD students. Built with Next.js 14 (App Router), TypeScript, Tailwind CSS, Supabase, and Claude AI.

## Features

- **Dashboard** — Overview of upcoming deadlines, recent wins, quick actions, and win streak
- **Paper Pipeline** — Kanban board tracking papers from Idea → Writing → Submitted → Under Review → Published/Rejected
- **Literature Tracker** — Reading list with status filters, tags, notes, and arXiv/DOI links
- **Experiment Log** — Table tracking hypotheses, methods, outcomes, and status
- **Deadlines** — Color-coded countdown timers for conferences, grants, and thesis milestones
- **Advisor Hub** — Meeting notes with agendas, action items, and AI-drafted weekly updates
- **Deep Work Planner** — Weekly calendar-style focus block planner with daily goals
- **Wins & Rejections** — Two-tab log to celebrate wins and normalize rejections
- **Idea Backburner** — Masonry-grid sticky notes for quick research idea capture

## AI Features (Claude-powered)

- **Summarize a paper abstract** → key contributions, gaps, relevance, methodology (claude-haiku-4-5-20251001)
- **Draft advisor weekly update** → polished email from raw notes (claude-sonnet-4-6)
- **Build a hypothesis** → testable hypothesis with variables from a vague idea (claude-haiku-4-5-20251001)
- **Suggest deadlines** → realistic timeline with milestones (claude-haiku-4-5-20251001)

## Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS (dark academic palette: navy/slate background, amber/gold accents)
- **Database + Auth:** Supabase (PostgreSQL with Row Level Security)
- **AI:** Anthropic Claude API (`@anthropic-ai/sdk`)

## Getting Started

### 1. Clone and install

```bash
cd phd-planner
npm install
```

### 2. Set up Supabase

1. Create a project at [supabase.com](https://supabase.com)
2. Run the migration SQL in the Supabase SQL editor: `supabase/migrations/001_initial_schema.sql`
3. In Supabase → Authentication → Settings: optionally disable email confirmation for local dev

### 3. Configure environment variables

```bash
cp .env.example .env.local
```

Fill in `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
ANTHROPIC_API_KEY=sk-ant-your-key-here
```

### 4. Run locally

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

## Project Structure

```
phd-planner/
├── app/
│   ├── (auth)/              # Login and signup pages
│   ├── (dashboard)/         # Protected pages with sidebar layout
│   │   ├── dashboard/       # Main overview
│   │   ├── papers/          # Paper Pipeline (Kanban)
│   │   ├── literature/      # Literature Tracker
│   │   ├── experiments/     # Experiment Log
│   │   ├── deadlines/       # Deadlines with countdown
│   │   ├── advisor/         # Advisor Hub + meeting notes
│   │   ├── planner/         # Deep Work Planner (weekly calendar)
│   │   ├── wins/            # Wins & Rejections log
│   │   └── ideas/           # Idea Backburner
│   └── api/ai/              # Unified Claude AI endpoint
├── components/              # Reusable UI + domain components
├── lib/
│   ├── supabase.ts          # Supabase client (browser + server)
│   └── claude.ts            # Anthropic API wrapper
└── supabase/migrations/     # Database schema
```

## AI API

The `/api/ai` endpoint accepts POST requests with an `action` parameter:

| Action | Description | Model |
|--------|-------------|-------|
| `summarize_paper` | Summarize abstract with key contributions and gaps | claude-haiku-4-5-20251001 |
| `draft_advisor_update` | Turn raw weekly notes into a polished advisor email | claude-sonnet-4-6 |
| `build_hypothesis` | Convert a vague idea into a testable hypothesis | claude-haiku-4-5-20251001 |
| `suggest_deadline` | Suggest a realistic deadline with intermediate milestones | claude-haiku-4-5-20251001 |

Example:
```json
POST /api/ai
{
  "action": "summarize_paper",
  "abstract": "We propose..."
}
```

## Deployment

Deploy to Vercel (recommended):

1. Push to GitHub
2. Import at [vercel.com](https://vercel.com)
3. Add environment variables in Vercel dashboard
4. Deploy
