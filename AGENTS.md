# AGENTS.md — habitd

Local-first habit + finance tracker SPA. No backend, no auth. All data in IndexedDB via Dexie.js.

## Commands

```bash
pnpm dev              # Vite dev server → localhost:5173
pnpm build            # tsc -b && vite build → dist/
pnpm type-check       # tsc --noEmit (must pass 0 errors)
pnpm lint             # eslint src --max-warnings 0
pnpm test:run         # vitest run (CI mode, use this to verify)
pnpm test             # vitest (watch mode)
pnpm format           # prettier --write src
```

CI order: **typecheck → lint → test → build**. Run `pnpm type-check && pnpm lint && pnpm test:run` before committing.

Single test file: `pnpm test:run -- test/streakEngine.test.ts`

## Stack & Key Libraries

React 19 · Vite · TypeScript (strict) · Tailwind CSS v4 · Dexie 4 · Zustand 5 · Zod 4 · react-i18next · date-fns · nanoid · lucide-react · @fontsource/jetbrains-mono

## Architecture

- **All imports use `@/` alias** (maps to `src/`). Never use relative paths across modules.
- **Dexie is source of truth** — never duplicate DB state in Zustand. Zustand is UI state only (`activeView`, `selectedDate`, `lang`, `theme`).
- **useLiveQuery** for reactive DB reads. Pattern: `useLiveQuery(() => db.transactions.where(...).toArray(), [deps])`
- **Every Dexie write must be preceded by Zod validation** (schemas in `src/schemas/`).
- **All UI text via `t()`** from react-i18next. Never hardcode strings.
- **Pure functions** for all streak/stats/finance logic — zero side effects, fully testable.
- **CSS tokens from `src/styles/tokens.css`** — never hardcode colors. Use CSS custom properties.

## Engine Files (pure, no I/O)

- `src/engine/streakEngine.ts` — streaks, heatmap, completion rate
- `src/engine/finEngine.ts` — balance, budget status, goal progress, sparkline

## Database

IndexedDB singleton: `import { db } from '@/db'` (schema in `src/db/schema.ts`)

8 tables across 4 schema versions:
- habits, completions (v1)
- tasks (v2)
- notes/journal (v3)
- transactions, finCategories, budgets, financialGoals (v4)

Default finance categories are seeded on v4 migration (`src/db/migrations/seedDefaultCategories.ts`).

## Tests

- Framework: Vitest with jsdom environment
- Setup: `test/setup.ts` — polyfills IndexedDB via `fake-indexeddb/auto`
- Test files: `test/*.test.ts` (16 files covering engine, schema, export, DB operations)
- Run single test: `pnpm test:run -- test/filename.test.ts`

## Prettier Config

No semicolons, single quotes, 100 char width, ES5 trailing commas, 2-space tabs.

## ESLint

Flat config (`eslint.config.js`). Key rules: `no-console: warn`, unused vars with `_` prefix ignored.

## TypeScript

`strict: true`, `noUnusedLocals: true`. tsconfig uses project references (`tsconfig.app.json` + `tsconfig.node.json`). Target ES2022.

## Project Structure

```
src/
  app/          — App.tsx root
  views/        — one file per view (Home, Habits, Calendar, Stats, Week, Tasks, Journal, Finance, Help, Settings)
  components/   — layout/, habits/, calendar/, stats/, finance/, ui/
  db/           — schema.ts, index.ts, migrations/
  engine/       — streakEngine.ts, finEngine.ts (pure functions)
  hooks/        — useHabits, useCompletions, useTransactions, etc.
  i18n/         — locales/en.json, ru.json + GLOSSARY.md
  schemas/      — Zod schemas (index.ts for habits, finance.ts for finance)
  stores/       — useUIStore.ts (Zustand — UI state only)
  styles/       — tokens.css, reset.css, globals.css
  types/        — index.ts (all TypeScript interfaces)
  utils/        — export.ts, currency.ts
test/           — all test files
```

## Design Rules

- **Terminal aesthetic**: black bg, JetBrains Mono, ASCII visualizations (`▁▂▃▄▅▆▇█`, `·░▒▓█`, `[████░░]`)
- **No UI libraries** (no shadcn, MUI, Chakra, Ant)
- **No Framer Motion** — CSS transitions only
- **No gradients, box-shadow, or border-radius > 2px** (except explicit exceptions in finance)
- **No Google Fonts CDN** — use @fontsource only (offline)
- **No SSR/Server Components/Next.js**
- **No Recharts/Chart.js** — ASCII sparklines and bars only

## i18n

Two locales: `en.json` and `ru.json` in `src/i18n/locales/`. Term mapping in `GLOSSARY.md`. Language stored in Zustand `useUIStore.lang`.

## View Names

`'home' | 'habits' | 'calendar' | 'week' | 'journal' | 'stats' | 'tasks' | 'finance' | 'help' | 'settings'`
