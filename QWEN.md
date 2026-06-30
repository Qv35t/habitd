# AGENT.md — HABITD

> habitd — terminal-style habit tracker. local-first. no accounts. no cloud.
> Path: /mnt/c/project/Habit/habitd/
> Specs: /mnt/c/project/Habit_md/
> AI Model: qwen3-plus (Qwen3-235B-A22B via Alibaba Cloud Dashscope)

---

## MODEL DIRECTIVES

### Thinking Mode Control
- Для сложных задач (рефакторинг движков, архитектурные решения): используй `/think` или `enable_thinking: true`
- Для рутинных задач (генерация компонентов, i18n, CSS): используй `/no_think` или `enable_thinking: false`
- По умолчанию — non-thinking mode для скорости

### Function Calling
- Qwen3-plus поддерживает нативный tool calling (Hermes-style)
- При вызове инструментов — формат `<tool_call>{"name": ..., "arguments": ...}</tool_call>`
- Используй `tool_choice: "auto"` если не нужен принудительный вызов

### Context Window
- Нативный контекст: 32,768 токенов
- С YaRN расширением: до 131,072 токенов
- При работе с большими spec-файлами — передавай только нужные секции

### Output Format
- Структурированный вывод (JSON Schema) поддерживается нативно
- Используй `response_format: { type: "json_object" }` для валидируемых ответов

---

## PROJECT OVERVIEW

HABITD is a local-first habit tracker + finance tracker SPA with a terminal UI aesthetic.
All data is stored in the browser's IndexedDB via Dexie.js.
No backend, no auth, no cloud services of any kind.

---

## WORKING ENVIRONMENT

- OS: WSL2 Ubuntu 24.04
- Shell: Zsh + zinit
- Package manager: pnpm (NEVER use npm or yarn)
- Runtime: Node.js via nvm
- Editor: VS Code / Cursor

---

## TECH STACK

| Layer       | Package                         | Version   |
|-------------|--------------------------------|-----------|
| Framework   | vite + @vitejs/plugin-react    | ^6.0.0    |
| UI          | react + react-dom              | ^19.0.0   |
| Language    | typescript                     | ^5.0.0    |
| Styling     | tailwindcss + @tailwindcss/vite| ^4.0.0    |
| Font        | @fontsource/jetbrains-mono     | ^5.0.0    |
| Local DB    | dexie + dexie-react-hooks      | ^4.0.0    |
| State       | zustand                        | ^5.0.0    |
| Validation  | zod                            | ^4.0.0    |
| Dates       | date-fns                       | ^4.0.0    |
| Icons       | lucide-react                   | ^0.400.0  |
| ID gen      | nanoid                         | ^5.0.0    |
| i18n        | react-i18next                  | latest    |
| Testing     | vitest + @vitest/ui            | ^3.0.0    |
| Lint        | eslint                         | ^9.0.0    |
| Format      | prettier                       | ^3.0.0    |

---

## CRITICAL RULES

### ЗАПРЕЩЕНО (never do this):
- shadcn/ui, Material UI, Chakra UI, Ant Design — any UI libraries
- Framer Motion — CSS transitions only
- Supabase, Firebase, any backend or cloud service
- Google Fonts CDN — use @fontsource only (offline)
- `border-radius` > 2px on any element (except explicit exceptions)
- `box-shadow`, `blur`, `backdrop-filter`, glassmorphism
- Gradient backgrounds of any kind
- SSR, Server Components, Next.js
- Hardcode colors — use CSS custom properties from `tokens.css`
- Duplicate DB state in Zustand — Dexie is source of truth
- `npm` or `yarn` — pnpm only
- Recharts, Chart.js, or any chart library — ASCII only: `▁▂▃▄▅▆▇█`, `·░▒▓█`, `[████░░]`

### ОБЯЗАТЕЛЬНО (always do this):
- `strict: true` in tsconfig
- All imports use `@/` alias (maps to `src/`)
- CSS tokens from `src/styles/tokens.css` for all colors/spacing
- JetBrains Mono via `@fontsource/jetbrains-mono` (300 + 400 weights)
- Pure functions for all streak/stats/finance logic (zero side effects)
- Zod validation before every Dexie write
- `useLiveQuery` from dexie-react-hooks for reactive DB reads
- All UI text via react-i18next `t()` — no hardcoded strings

---

## QWEN3-PLUS BEHAVIOUR RULES

- Перед началом фазы: прочитай полностью AGENT.md — это единственный источник архитектурной правды
- Если задача > 200 строк кода — включи thinking mode (`/think`)
- Если задача — генерация компонента по готовому шаблону — используй non-thinking mode (`/no_think`)
- При работе с engine-функциями: возвращай только чистые TypeScript-функции, без импортов React
- При генерации i18n-ключей: сверяйся с `src/i18n/locales/en.json` — не дублируй существующие ключи
- Форматируй все JSON-ответы через `response_format: json_object` при работе в пайплайне n8n
- Многоходовые диалоги поддерживаются нативно — не сбрасывай контекст между подзадачами фазы

---

## PROJECT STRUCTURE

```

habitd/
├── src/
│   ├── app/
│   │   └── App.tsx                   \# Root: layout shell + view router
│   ├── views/
│   │   ├── HomeView.tsx
│   │   ├── HabitsView.tsx
│   │   ├── CalendarView.tsx
│   │   ├── StatsView.tsx
│   │   ├── TasksView.tsx
│   │   ├── WeekView.tsx
│   │   ├── JournalView.tsx
│   │   ├── FinanceView.tsx           \# Finance module root (tabs: overview/transactions/goals)
│   │   ├── HelpView.tsx              \# Phase 9: standalone help section
│   │   └── SettingsView.tsx
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Sidebar.tsx           \# Terminal nav, 200px, left
│   │   │   └── StatusBar.tsx         \# Bottom bar — context-aware per activeView
│   │   ├── habits/
│   │   │   ├── HabitRow.tsx
│   │   │   ├── HabitForm.tsx
│   │   │   ├── HabitDots.tsx         \# 7-day ◌/● toggles
│   │   │   └── HabitList.tsx
│   │   ├── calendar/
│   │   │   ├── MonthGrid.tsx
│   │   │   └── DayCell.tsx
│   │   ├── stats/
│   │   │   ├── HeatmapGrid.tsx       \# 52-week ASCII heatmap ·░▒▓█
│   │   │   ├── StreakCard.tsx
│   │   │   └── CompletionBar.tsx     \# [████░░░░] 62%
│   │   ├── finance/
│   │   │   ├── TransactionList.tsx
│   │   │   ├── TransactionRow.tsx
│   │   │   ├── TransactionForm.tsx   \# Modal: date, amount, type, category, note
│   │   │   ├── MonthOverview.tsx
│   │   │   ├── BalanceSummary.tsx    \# income/expense/balance ASCII bars
│   │   │   ├── BudgetProgress.tsx    \# per-category budget bars ✓ ⚠ ✗
│   │   │   ├── BudgetEditor.tsx      \# inline limit editing
│   │   │   ├── CategoryManager.tsx   \# CRUD for user categories
│   │   │   ├── TopCategoriesBar.tsx
│   │   │   ├── SparklineRow.tsx      \# 30-day ▁▂▃▄▅▆▇█
│   │   │   ├── GoalsList.tsx
│   │   │   ├── GoalRow.tsx           \# ASCII progress + on track/behind
│   │   │   ├── GoalForm.tsx
│   │   │   ├── SpendingHeatmap.tsx   \# 52-week spending heatmap ·░▒▓█
│   │   │   ├── MonthlyTrendTable.tsx \# month-by-month income/expense table
│   │   │   └── YearSummaryCards.tsx
│   │   └── ui/                       \# Custom primitives — NO external lib
│   │       ├── Input.tsx
│   │       ├── Button.tsx
│   │       ├── Modal.tsx
│   │       ├── Select.tsx
│   │       └── Divider.tsx
│   ├── db/
│   │   ├── schema.ts                 \# Dexie HabitDB v2: habits+completions+finance tables
│   │   ├── index.ts                  \# export { db }
│   │   └── migrations/
│   │       └── seedDefaultCategories.ts
│   ├── engine/
│   │   ├── streakEngine.ts           \# Pure functions: streaks, heatmap, completionRate
│   │   └── finEngine.ts              \# Pure functions: balance, budget, goals, sparkline
│   ├── hooks/
│   │   ├── useHabits.ts
│   │   ├── useCompletions.ts
│   │   ├── useTransactions.ts        \# CRUD + useLiveQuery by month/range
│   │   ├── useFinCategories.ts       \# categories CRUD, protected defaults
│   │   ├── useBudgets.ts             \# upsertBudget, copyFromPrevMonth
│   │   └── useFinancialGoals.ts      \# goals CRUD + addFunds
│   ├── i18n/
│   │   ├── GLOSSARY.md               \# EN→RU term map (50+ terms)
│   │   └── locales/
│   │       ├── en.json
│   │       └── ru.json
│   ├── schemas/
│   │   ├── index.ts                  \# Zod: HabitCreateSchema, CompletionSchema
│   │   └── finance.ts                \# Zod: TransactionCreateSchema, BudgetSchema, FinancialGoalSchema
│   ├── stores/
│   │   └── useUIStore.ts             \# activeView, selectedDate, lang, theme, modals
│   ├── styles/
│   │   ├── tokens.css                \# ALL CSS custom properties — source of truth
│   │   ├── reset.css
│   │   └── globals.css
│   ├── types/
│   │   └── index.ts                  \# Habit, Completion, Transaction, FinCategory,
│   │                                 \# Budget, FinancialGoal, ViewName, FinanceTab
│   └── utils/
│       ├── export.ts                 \# JSON/Markdown + finance CSV export
│       └── currency.ts               \# formatCurrency(amount, lang): RU ₽ / EN \$
├── test/
│   ├── streakEngine.test.ts
│   ├── schema.test.ts
│   ├── export.test.ts
│   ├── finEngine.test.ts
│   ├── finSchema.test.ts
│   └── finExport.test.ts
├── vite.config.ts
├── tailwind.config.ts
├── tsconfig.json + tsconfig.app.json + tsconfig.node.json
├── vitest.config.ts
├── .eslintrc.json
├── prettier.config.js
└── package.json

```

---

## DATA MODEL

### Habits (v1 — unchanged)

```typescript
interface Habit {
  id: string           // nanoid()
  name: string
  symbol: string       // '●' | '◆' | '✦' | '▪' | '○' | '◇' | '⬡'
  accentChar: string   // 'dim' | 'bright'
  createdAt: string    // 'YYYY-MM-DD'
  archivedAt?: string  // soft delete
  sortOrder: number
}

interface Completion {
  id: string
  habitId: string      // FK → Habit.id
  date: string         // 'YYYY-MM-DD'
}
```


### Finance (v2 — new tables)

```typescript
interface Transaction {
  id: string
  date: string         // 'YYYY-MM-DD'
  amount: number       // always positive
  type: 'income' | 'expense'
  categoryId: string   // FK → FinCategory.id
  note?: string        // max 200 chars
  tags?: string[]
  createdAt: string    // ISO timestamp
}

interface FinCategory {
  id: string
  name: string
  type: 'income' | 'expense' | 'both'
  symbol: string       // '▸' | '◆' | '●' | etc.
  color: 'dim' | 'bright' | 'accent'
  isDefault: boolean   // system categories cannot be deleted
  sortOrder: number
}

interface Budget {
  id: string
  categoryId: string   // FK → FinCategory.id
  month: string        // 'YYYY-MM'
  limitAmount: number
}

interface FinancialGoal {
  id: string
  name: string
  targetAmount: number
  currentAmount: number
  deadline?: string    // 'YYYY-MM-DD'
  categoryTag?: string
  status: 'active' | 'completed' | 'cancelled'
  createdAt: string
}
```


### Dexie Schema

```typescript
// version(1) — habits + completions (unchanged)
// version(2) — adds finance tables
this.version(2).stores({
  habits:         'id, createdAt, archivedAt, sortOrder',
  completions:    'id, habitId, date, [habitId+date]',
  transactions:   'id, date, type, categoryId, createdAt, [type+date]',
  finCategories:  'id, type, sortOrder',
  budgets:        'id, categoryId, month, [categoryId+month]',
  financialGoals: 'id, status, createdAt',
})
```


### ViewName \& FinanceTab

```typescript
export type ViewName =
  | 'home' | 'habits' | 'calendar' | 'stats'
  | 'tasks' | 'journal' | 'finance' | 'settings' | 'help'

export type FinanceTab = 'overview' | 'transactions' | 'goals'
```


---

## STATE STRATEGY

- **Dexie** — source of truth for all persistent data (habits + finance)
- **Zustand** — UI state only: `activeView`, `selectedDate`, `lang`, `theme`, modal flags
- **useLiveQuery** — reactive bridge from Dexie to React components
- Never store habits/completions/transactions in Zustand
- Finance `activeTab` and `activeMonth` can live in Zustand as UI state

```typescript
// Pattern: reactive DB read
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '@/db'

export function useTransactionsByMonth(month: string) {
  const [from, to] = getMonthRange(month)
  return useLiveQuery(
    () => db.transactions.where('date').between(from, to, true, true).reverse().toArray(),
    [month]
  )
}
```


---

## ENGINE RULES

### streakEngine.ts — Habits

```typescript
calcCurrentStreak(completedDates: string[], today: string): number
calcLongestStreak(completedDates: string[]): number
calcCompletionRate(completedDates: string[], days: number, today: string): number
calcHeatmap(completions: { date: string }[]): Record<string, number>
computeHabitStats(habit: Habit, completedDates: string[], today: string): HabitStats
computeGlobalStats(habitsWithDates: { habit: Habit; dates: string[] }[], today: string): StatsData
```


### finEngine.ts — Finance

```typescript
calcBalance(txs: Transaction[], from: string, to: string): { income, expense, balance, savingsRate }
calcByCategory(txs: Transaction[], type: 'income' | 'expense'): Array<{ categoryId, total, txCount }>
calcBudgetStatus(txs: Transaction[], budgets: Budget[], month: string): BudgetStatus[]
calcGoalProgress(goal: FinancialGoal, today: string): { percent, remaining, onTrack }
calcSpendingHeatmap(txs: Transaction[], year: number): Record<string, number>
calcTopCategories(txs: Transaction[], n: number): TopCategory[]
calcMovingAverage(txs: Transaction[], days: number, today: string): number
calcSparkline(dailyAmounts: number[]): string   // returns ▁▂▃▄▅▆▇█ string
```

All engine functions: pure, zero-I/O, deterministic, covered by unit tests.

---

## DESIGN SYSTEM

### Terminal Layout

```
┌──────────────────────────────────────────────────────┐
│  sidebar (200px)    │  main content (max 900px)      │
│                     │                                │
│  – nav              │  – finance                     │
│                     │                                │
│  -  finance         │  [overview] [transactions] [goals]
│    settings         │                                │
│    help             │  income   [████████████░░░░] 12 400 ₽
│                     │  expense  [████████░░░░░░░░]  9 200 ₽
│                     │  balance  +3 200 ₽   26%      │
├─────────────────────┴────────────────────────────────┤
│  finance  -   balance: +3 200 ₽  -   apr 2026  -   tx: 24
└──────────────────────────────────────────────────────┘
```


### CSS Tokens (do not hardcode, always use vars)

```css
--bg-base: #000000        --text-primary: #e8e8e8
--bg-panel: #080808       --text-secondary: #888888
--bg-control: #0f0f0f     --text-muted: #444444
--bg-hover: #111111       --text-label: #aaaaaa
--border-subtle: #1a1a1a  --accent-red: #884444
--border-default: #2a2a2a --accent-red-bg: #3a1a1a
--border-active: #555555
--font-mono: 'JetBrains Mono', 'Courier New', monospace
--sidebar-w: 200px        --content-max: 900px
--statusbar-h: 28px
```


### Finance-specific CSS utility classes

```css
.fin-income  { color: var(--text-primary); }    /* white — income */
.fin-expense { color: var(--text-secondary); }  /* grey — expense */
.fin-danger  { color: #884444; }                /* red — overbudget */
.fin-ok      { color: #448844; }                /* green — on track */
```


### ASCII Visualization Patterns

```
Progress bar:  [████████░░░░░░░░] 52%
Sparkline:     ▁▂▁▄▃▂▁▅▂▃▁▂▄▃▁▂▁▃▄▂   (▁▂▃▄▅▆▇█)
Heatmap:       · ░ ▒ ▓ █            (5 intensity levels)
Budget status: ✓ on track / ⚠ >80% / ✗ overbudget
Goal status:   on track ✓ / ⚠ behind / ★ completed
```


### Component Patterns

| Element | Style |
| :-- | :-- |
| Section header | `– Habits` — dash prefix, `var(--text-muted)`, uppercase |
| Active nav | `• habits` — bullet, `var(--text-primary)` |
| Inactive nav | `  calendar` — 2-space indent, `var(--text-muted)` |
| Primary button | Flat, `border: 1px solid var(--border-default)`, no radius |
| Danger button | `border-color: #3a1a1a`, `color: #884444` |
| Input | `border: 1px solid var(--border-default)`, bg `var(--bg-control)` |
| Modal | `border: 1px solid var(--border-default)`, bg `var(--bg-panel)` |
| Completion dot | `◌` empty / `●` done — text symbol, not emoji |
| Finance tabs | `[overview] [transactions] [goals]` — flat, no radius |


---

## KEY WORKFLOWS

### Habit CRUD

1. Validate with Zod (`HabitCreateSchema`)
2. Write to `db.habits`
3. `useLiveQuery` auto-refreshes — no manual sync needed

### Toggle Completion

1. Check: `db.completions.where('[habitId+date]').equals([habitId, date])`
2. If exists → delete; if not → add
3. Dexie reactivity propagates automatically

### Transaction CRUD

1. Validate with Zod (`TransactionCreateSchema`) — amount > 0, valid categoryId
2. Write to `db.transactions`
3. `useTransactionsByMonth` auto-refreshes via useLiveQuery

### Budget Upsert

```typescript
// Insert or update — [categoryId+month] compound index ensures uniqueness
await db.budgets.where('[categoryId+month]').equals([categoryId, month]).first()
  ? db.budgets.update(existing.id, { limitAmount })
  : db.budgets.add({ id: nanoid(), categoryId, month, limitAmount })
```


### Goal Progress Logic

```typescript
// on track = actual% >= expected% * 0.9
const expectedPercent = ((daysTotal - daysLeft) / daysTotal) * 100
onTrack = percent >= expectedPercent * 0.9
```


### Export / Restore

```typescript
exportToJSON()                      // full habitd backup → Blob → download
importFromJSON(file: File)          // restore all tables
exportToMarkdown(habits)            // habit report
exportTransactionsCSV(month?)       // date,type,amount,category,note → .csv
exportFinanceJSON()                 // finance_backup.json: tx + categories + budgets + goals
exportMonthReport(month: string)    // Markdown: balance, budgets, top categories
```


### i18n Pattern

```typescript
// Always use t() — never hardcode UI strings
import { useTranslation } from 'react-i18next'
const { t } = useTranslation()
// t('finance.overview.balance'), t('nav.habits'), etc.

// Language toggle stored in Zustand → useUIStore.lang: 'en' | 'ru'
// Currency: formatCurrency(amount, lang) → '3 200 ₽' or '$3,200'
```


---

## DEFAULT FINANCE CATEGORIES (seeded at v2 migration)

| Name | Type | Symbol | isDefault |
| :-- | :-- | :-- | :-- |
| Зарплата | income | ▸ | true |
| Фриланс | income | ◆ | true |
| Еда | expense | ● | true |
| Транспорт | expense | ◌ | true |
| Жильё | expense | ▪ | true |
| Здоровье | expense | ◇ | true |
| Развлечения | expense | ⬡ | true |
| Прочее | both | · | true |

User-created categories: `isDefault: false` — can be deleted only if no transactions linked.

---

## COMMANDS

```bash
pnpm dev              # start dev server → http://localhost:5173
pnpm build            # tsc -b && vite build → dist/
pnpm preview          # serve dist/ locally
pnpm type-check       # tsc --noEmit (0 errors required)
pnpm lint             # eslint src --max-warnings 0
pnpm format           # prettier --write src
pnpm test             # vitest (watch)
pnpm test:run         # vitest run (CI mode)
pnpm test:ui          # vitest --ui
pnpm test:coverage    # vitest run --coverage
```


---

## PHASE STATUS

### Habit Tracker (Phases 0–8)

| Phase | Name | Status |
| :-- | :-- | :-- |
| 0 | Foundation | ✅ Done |
| 1 | Local Data Layer | ✅ Done |
| 2 | Habits View | ✅ Done |
| 3 | Streak Engine | ✅ Done |
| 4 | Calendar View | ✅ Done |
| 5 | Stats View | ✅ Done |
| 6 | Settings \& Export | ✅ Done |
| 7 | GitHub \& CI | ✅ Done |
| 8 | Polish | ✅ Done |

### Extended Views (Phases 9–11)

| Phase | Name | Status |
| :-- | :-- | :-- |
| 9 | TasksView | ✅ Done |
| 10 | WeekView | ✅ Done |
| 11 | JournalView | ✅ Done |

### Finance Module (Roadmap v2.0)

| Phase | Name | Status |
| :-- | :-- | :-- |
| F0 | DB Schema Extension | ✅ Done |
| F1 | Finance Engine | ✅ Done |
| F2 | FinanceView + Navigation | ✅ Done |
| F3 | Transactions CRUD | ✅ Done |
| F4 | Monthly Overview \& Charts | ✅ Done |
| F5 | Budget Management | ✅ Done |
| F6 | Financial Goals | ✅ Done |
| F7 | Annual Analytics \& Heatmap | ✅ Done |
| F8 | Export / Import | ✅ Done |

### Finance Polish \& i18n (Phase 9 — Active)

| Task | Name | Status |
| :-- | :-- | :-- |
| Task 1 | GLOSSARY.md (term audit) | 🔄 Active |
| Task 2 | ru.json full translation | 🔄 Active |
| Task 3 | Settings: LocaleLayout switcher | 🔄 Active |
| Task 4 | currency.ts (RU ₽ / EN \$) | 🔄 Active |
| Task 5 | Apply currency in Finance | ⏳ Pending |
| Task 6 | Layout 1920×1080 for Finance | ⏳ Pending |
| Task 7 | HelpView as nav section | ⏳ Pending |
| Task 8 | Finance keyboard shortcuts | ⏳ Pending |
| Task 9 | HelpView content (Finance + keys) | ⏳ Pending |
| Task 10 | HomeView: add finance + help | ⏳ Pending |


---

## SPEC FILES REFERENCE

| File | Covers |
| :-- | :-- |
| `HABITD_F0_SPEC.md` | Phase 0: Foundation scaffold |
| `HABITD_F1_SPEC.md` | Phase 1: Local Data Layer |
| `HABITD_F2_SPEC.md` | Phase 2: Habits View |
| `HABITD_F3_SPEC.md` | Phase 3: Streak Engine |
| `HABITD_F4_SPEC.md` | Phase 4: Calendar View |
| `HABITD_F5_SPEC.md` | Phase 5: Stats View |
| `HABITD_F6_SPEC.md` | Phase 6: Settings \& Export |
| `HABITD_F7_SPEC.md` | Phase 7: GitHub \& CI |
| `HABITD_F8_SPEC.md` | Phase 8: Polish (i18n, themes, DnD) |
| `HABITD_PHASE9_SPEC.md` | Phase 9: TasksView |
| `HABIITD_PHASE10_WeekView.md` | Phase 10: WeekView |
| `HABITD_PHASE11_JournalView.md` | Phase 11: JournalView |
| `HABITD_Roadmap_2.md` | Finance Module Roadmap v2.0 (F0–F8) |
| `HABITD_PHASE9_FINANCE_POLISH_LOCALIZATION_SPEC.md` | Finance Polish + i18n (active) |

All spec files located at: `/mnt/c/project/Habit_md/`

---

## ASSISTANT BEHAVIOR

When working in this repo:

- Read `CLAUDE.md` first — it is the single source of architectural truth
- Check `src/types/index.ts` before creating any new types
- Check `src/i18n/locales/en.json` before adding any new UI string
- Use `@/` import alias, never relative paths for cross-module imports
- Keep components single-purpose — split if >150 lines
- New views → `src/views/`, new primitives → `src/components/ui/`
- New finance components → `src/components/finance/`
- Every Dexie write must be preceded by Zod validation
- Every UI string must go through `t()` — never hardcode
- Test engine functions before building UI that depends on them
- Before any Finance work: run `grep -rn "TODO\|stub\|FIXME" src/` to find blockers
- Commit scope: one phase or one feature cluster per commit

---

## ERROR MEMORY PROTOCOL

### Purpose

When Qwen Code encounters an error during implementation, it must not guess or
apply a single fix blindly. Instead, it follows a structured three-phase loop:
discover all candidate solutions, apply the best one, and permanently record the
lesson so the same mistake is never made twice.

### Phase 1 — Error Triage

When any error is detected (TypeScript compile error, test failure, runtime
exception, lint violation):

1. **Classify** the error by type:
    - `TYPE` — TypeScript type mismatch or missing type
    - `LOGIC` — incorrect algorithm output or broken edge case
    - `IMPORT` — missing or wrong module reference
    - `SCHEMA` — Zod validation failure
    - `DB` — Dexie query or migration issue
    - `STYLE` — Tailwind class conflict or broken token reference
    - `TEST` — failing assertion in Vitest
2. **Extract** the minimal reproduction context:
    - File path + line number
    - Error message verbatim
    - Affected function / component name
3. **Do not patch in isolation.** Collect all candidates before touching code.

### Phase 2 — Solution Enumeration

Before writing a single line of fix code, enumerate at least **two candidate
solutions** for every non-trivial error. Format:

```
[CANDIDATE A] — description of approach, why it works, side effects
[CANDIDATE B] — description of approach, why it works, side effects
[SELECTED]    — chosen candidate + reason (performance / correctness / minimal diff)
```

Selection criteria (in priority order):

1. Correctness — does it fully eliminate the root cause?
2. Minimal diff — fewest changed lines for lowest regression risk.
3. Consistency — matches existing patterns in the codebase.
4. Testability — does it remain unit-testable?

Apply only the selected candidate.

### Phase 3 — Memory Commit

After every fix, append a record to the internal session memory. The record
must follow this schema:

```
ERROR_MEMORY {
  id:        <short-uuid or incremental index>
  date:      <ISO date>
  file:      <relative path>
  type:      <TYPE | LOGIC | IMPORT | SCHEMA | DB | STYLE | TEST>
  symptom:   <one-line error description>
  root:      <one-line root cause>
  fix:       <one-line description of applied solution>
  prevent:   <rule to avoid this error class in the future>
}
```

Example:

```
ERROR_MEMORY {
  id:       001
  date:     2026-04-11
  file:     src/engine/streakEngine.ts
  type:     LOGIC
  symptom:  calculateCurrentStreak returns 0 when today has a completion
  root:     Comparison used strict UTC midnight vs local date string
  fix:      Normalize all dates to YYYY-MM-DD via date-fns/format before compare
  prevent:  Always pass dates through formatISO(date, {representation:'date'})
            before any streak or calendar computation
}
```


### Memory Application Rules

Before writing new code in any session, Qwen Code must:

- Scan committed `ERROR_MEMORY` entries relevant to the current file or domain.
- If a matching `prevent` rule exists, apply it **proactively** — not after
another failure.
- Never repeat a fix that already has a logged `ERROR_MEMORY` entry for the
same `root` cause.


### Constraints

- Do not create `ERROR_MEMORY` entries for trivial typos fixed inline.
- One entry per unique root cause, not per occurrence.
- `prevent` must be an actionable rule, not a vague observation.
- If the same root cause recurs despite an existing entry, escalate by adding
a corresponding unit test to `test/` that guards against regression.

---

## DOCUMENTATION \& FILE OWNERSHIP

### Spec files are product artifacts

Spec files in `/mnt/c/project/Habit_md/` = single source of truth per phase.
Non-technical stakeholders read them to understand what was built.

**Rules for any spec file change:**

- Keep language precise and implementation-agnostic where possible.
- Sync phase status in this file (`## PHASE STATUS`) immediately after a phase
completes — never let status drift from code reality.
- If a feature ships or is removed, update the spec first, then the code.
- Never fabricate or round benchmark/test numbers — use real `vitest --coverage` output.
- Adding a new phase → add its spec file row to `## SPEC FILES REFERENCE`.


### Single source of truth rule

| What | Canonical location | Never edit in |
| :-- | :-- | :-- |
| All CSS custom properties | `src/styles/tokens.css` | Component files inline |
| Type definitions | `src/types/index.ts` | Ad-hoc per-component interfaces |
| i18n strings | `src/i18n/locales/en.json` + `ru.json` | Component JSX directly |
| Zod schemas | `src/schemas/index.ts` + `finance.ts` | Inline in hooks or components |
| Engine logic | `src/engine/streakEngine.ts` + `finEngine.ts` | Components or hooks |
| DB schema | `src/db/schema.ts` | Any other file |

When a canonical file changes, propagate the update everywhere it is consumed
before closing the task.

### Agent integrity rules

- Benchmark and coverage numbers must come from real runs. Never estimate.
- `prevent` rules in `ERROR_MEMORY` entries must be actionable, not vague.
- Phase status must reflect actual code state — not aspirational.
- Before declaring a phase complete: `pnpm test:run` must pass with 0 failures
and `pnpm type-check` must emit 0 errors.
- Commit scope: one phase or one feature cluster per commit. Never bundle
unrelated changes.

---

## CAVEMAN PROJECT CONTEXT

> Secondary project. Path: separate repo. Agent rule file: `CLAUDE.md` (caveman).
> Reference this section when asked to work on the caveman codebase.

Caveman is a Claude Code plugin + multi-agent skill that compresses AI responses
into caveman-style prose (~65–75% token reduction, full technical accuracy).

### File ownership (caveman repo)

| File | What it controls |
| :-- | :-- |
| `skills/caveman/SKILL.md` | Core caveman behavior — **only file to edit for behavior changes** |
| `rules/caveman-activate.md` | Always-on auto-activation rule — **edit here, never in agent copies** |
| `skills/caveman-commit/SKILL.md` | Commit message behavior (independent skill) |
| `skills/caveman-review/SKILL.md` | Code review behavior (independent skill) |
| `caveman-compress/SKILL.md` | Compress sub-skill behavior |

### Auto-synced files — do NOT edit directly

CI overwrites these on every push to main. Edits will be lost:
`.clinerules/caveman.md`, `.github/copilot-instructions.md`,
`.cursor/rules/caveman.mdc`, `.windsurf/rules/caveman.md`,
all `plugins/` and `.cursor/skills/` SKILL.md copies, `caveman.skill` ZIP.

### Hook rules (caveman)

- All hook files must **silent-fail** on filesystem errors — never block session start.
- Any flag file write must go through `safeWriteFlag()` in `caveman-config.js`.
Direct `fs.writeFileSync` on predictable paths reopens symlink-clobber attack surface.
- Hooks must respect `CLAUDE_CONFIG_DIR` env var — never hardcode `~/.claude`.
- `hooks/package.json` pins `{"type": "commonjs"}` — required, do not remove.


### Key agent rules (caveman)

- Edit `skills/caveman/SKILL.md` for behavior changes. Never touch synced copies.
- Edit `rules/caveman-activate.md` for auto-activation changes. Never touch agent-specific copies.
- README is the most important user-facing file — optimize for non-technical readers.
- Preserve caveman voice in README: "Brain still big." "Cost go down forever." Intentional brand.
- Benchmark numbers come from real runs in `benchmarks/`. Never fabricate or round.
- After PR merge, wait for CI workflow to complete before declaring release done.
- Eval delta = **skill vs terse** (not skill vs baseline) — baseline comparison is misleading.

```

