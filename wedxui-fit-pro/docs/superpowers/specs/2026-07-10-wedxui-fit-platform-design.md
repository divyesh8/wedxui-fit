# WEDXUI Fit — Platform Architecture & Phase 1 Design

**Date:** 2026-07-10
**Status:** Active — umbrella architecture + Phase 1 scope
**Codebase:** `wedxui-fit-pro/` (Next.js app). The root-level `index.html` static site is the v0 prototype and is kept as reference only; all new work happens in `wedxui-fit-pro`.

---

## 1. Vision Recap

WEDXUI Fit is an AI-powered, gamified fitness platform for Gen Z with a AAA-game-dashboard feel: cyberpunk/anime aesthetic, dark glassmorphism UI, neon accents, XP/levels/quests, an original AI coach, workout planning, an exercise library, fitness calculators, progress tracking, challenges, and (later) community features.

This document is the **umbrella architecture**. The platform is too large for one spec, so it is decomposed into sub-projects (§7); each later phase gets its own spec → plan → implementation cycle.

## 2. Architecture Decision: Modular Monolith on Next.js

The product spec lists NestJS as a separate backend. **Decision: start as a modular monolith inside Next.js** and extract to NestJS only when real-time/community load demands it.

Rationale:
- One deploy target (Vercel) and one TypeScript codebase — dramatically lower operational cost while the product finds its shape.
- Next.js App Router route handlers give us REST endpoints today; the business logic lives in a transport-agnostic **service layer** (`src/server/services/*`), so extraction to NestJS later is a move, not a rewrite.
- WebSockets (live coaching, guild chat) is on the future roadmap, not Phase 1. When it arrives, those services lift out into a NestJS/Socket.IO service that shares the Prisma schema.

Rules that keep the monolith modular:
- Route handlers (`src/app/api/**`) do parsing/auth only, then call a service. No business logic in handlers.
- Services never import React or Next primitives. Pure TS + Prisma.
- Client components never import Prisma. Data flows through API routes (or Server Components) only.
- Zod schemas in `src/lib/validations/*` are shared by client forms (React Hook Form resolvers) and API input validation — one source of truth.

## 3. Data Layer

- **PostgreSQL + Prisma.** Schema already exists at `prisma/schema.prisma` and covers: auth (Auth.js tables), user profile (physical stats, goals, equipment, lifestyle, gamification counters), settings, exercise library, workout plans → days → exercises, workout/exercise/set logs, progress entries (weight, measurements, macros, photos), achievements, challenges, coach messages, notifications, quotes.
- **Hosting:** Neon or Supabase Postgres (both fine; `DATABASE_URL` in `.env`). No DB is provisioned yet — the app deliberately runs **client-first** (Zustand + localStorage persistence) until Phase 6 (auth), so every feature is demoable without infrastructure.
- **Migration path:** when the DB lands, the localStorage-backed stores become a cache/optimistic layer over TanStack Query hooks hitting the API routes; the store interfaces are designed so components don't change.
- Indexing is already in place on hot paths (`progress_entries(userId, date)`, `notifications(userId, isRead)`, `coach_messages(userId, createdAt)`).

## 4. Frontend Architecture

- **Framework:** Next.js 14 App Router, TypeScript strict, Tailwind CSS with custom design tokens, Framer Motion for micro-interactions, GSAP for hero/scroll choreography, React Three Fiber for 3D accents, Recharts for analytics, Radix primitives under local `ui/` components (shadcn pattern), Zustand for client state, React Hook Form + Zod for forms.
- **Route groups:**
  - `/` — animated marketing/landing page (hero particles, AI coach teaser, workouts, tools, gamification showcase).
  - `/dashboard/**` — the app: overview, workouts, exercises, tools, progress, challenges, profile, onboarding.
  - `/api/**` — REST route handlers (Phase 6+).
- **State:** three Zustand stores exist (`auth`, `workout-session`, `ui`). Phase 1 adds a **`profile` store** (onboarding answers + gamification state, persisted) — the single source the dashboard reads.
- **Folder structure** (already in place, empty dirs are intentional slots):

```
src/
├── app/                  # routes (landing, dashboard/*, api/*)
├── components/
│   ├── ui/               # design-system primitives (button, card, input…)
│   ├── landing/          # landing page sections
│   ├── layout/           # dashboard shell (sidebar, header)
│   ├── onboarding/       # Phase 1: wizard steps
│   └── <feature>/        # workouts/, exercises/, gamification/, ai-coach/…
├── data/                 # static seed data (exercise library, quotes)
├── hooks/                # shared hooks
├── lib/                  # utils, calculators, validations, plan generator
├── server/               # (Phase 6+) services, auth config
├── store/                # Zustand stores
└── types/                # shared TS types
```

## 5. Design System

Tokens from `DESIGN.md` (v0) carry over: bg `#0a0a0f`, neon purple `#b026ff`, electric blue `#00d4ff`, lime `#ccff00`, glass surfaces (3% white + blur + 8% border), 16px card radius, glow shadows. Implemented as Tailwind theme extensions (`wed-*` color scale) + `globals.css` utilities. Typography: Inter/system stack, oversized bold headlines. Motion language: fade-in-on-scroll, 3D card tilt, count-up numbers, confetti/XP burst on completion.

## 6. Security & Quality Baseline

- Zod validation on every API input; Prisma parameterization prevents injection; bcrypt for credential hashing; Auth.js session strategy JWT; role field (`USER`/`ADMIN`/`COACH`) for RBAC; rate limiting middleware when API layer lands.
- Quality gates per phase: `tsc --noEmit` and `next build` must pass; visual verification of changed flows in the browser; no `any` leakage in new code.

## 7. Phased Roadmap (maps to product spec's 17 steps)

| Phase | Scope | Status |
|---|---|---|
| 1. Architecture plan | this document | ✅ this doc |
| 2. Database design | `prisma/schema.prisma` | ✅ exists, reviewed |
| 3. Folder structure | scalable App Router layout | ✅ exists |
| 4–5. UI components + design system | `ui/` primitives, tokens | ✅ exists, extend as needed |
| — Get app running | install, typecheck, build, visual verify | 🔄 this session |
| 7. Onboarding | multi-step wizard → personalized plan (client-first) | 🔄 this session |
| 8. Dashboard | overview page with stats/charts | ✅ v1 exists, iterate |
| 9. Workouts | plans, active session logging | ✅ v1 exists, iterate |
| 10. Calculators | BMI/BMR/TDEE/macro/1RM/timers | ✅ v1 exists |
| 11. Progress tracking | entries + charts | ✅ v1 exists |
| 12. Gamification | XP/levels/ranks/achievements | ✅ v1 core in utils/store |
| 6. Auth + DB | Auth.js v5 + Prisma adapter + provisioned Postgres; API layer | ⏭ next session (own spec) |
| 13. AI coach | rule-based v1 → LLM-backed chat (own spec) | ⏭ future |
| 14. Community | profiles, friends, leaderboards (own spec) | ⏭ future |
| 15–17. Perf, tests, docs | continuous per phase | 🔄 ongoing |

**Phase ordering note:** auth (spec step 6) is deliberately deferred until after the client-first experience is complete, because it requires provisioning a database (a user decision: Neon vs Supabase account) and everything before it is fully demoable without accounts.

## 8. Phase 1 Scope (this session)

1. Dependencies installed; `tsc --noEmit` and `next build` green.
2. Onboarding wizard at `/dashboard/onboarding`: collects name, age, gender, height, weight, body-fat %, goal, experience, equipment, available days, session duration, target muscles, sleep, diet, injuries/medical notes → generates a personalized weekly plan (split chosen from goal + days + equipment via `lib/plan-generator.ts`) → persists profile in a new `profile` Zustand store → dashboard reflects it.
3. Visual verification of landing page, dashboard, and onboarding in the browser.

## 9. Error Handling & Testing Posture

- Client: form-level Zod validation with inline errors; toasts for action feedback; error boundaries on dashboard routes.
- Plan generator: pure function, deterministic given inputs — unit-testable; edge cases (0 equipment, 1 day/week) return safe defaults rather than empty plans.
- Testing infra (Vitest + Playwright) lands with the auth phase when there is server logic worth covering; until then, verification is typecheck + build + browser walkthrough.
