# habitd

terminal-style habit tracker. local-first. no accounts. no cloud.

---

## quick start

```bash
git clone https://github.com/Qv35t/habitd
cd habitd
pnpm install
pnpm dev
```

open http://localhost:5173

requires: Node.js 20+ · pnpm 10+

---

### one-click launchers

| File | OS | Run |
| :-- | :-- | :-- |
| `start.bat` | Windows | Double-click |
| `start.sh` | Linux / macOS | `./start.sh` |
| `start.mjs` | Any | `node start.mjs` |

**Linux/macOS:** `chmod +x start.sh && ./start.sh`
**Windows:** double-click `start.bat`

---

## what it is

habitd tracks daily habits in your browser.
data lives in IndexedDB on your machine — nothing leaves your device.

```
◆  morning run     ◌ ● ● ◌ ● ● ●   streak: 12d
●  read 20 pages   ● ● ● ● ● ◌ ●   streak: 5d
◌  no phone 1h     ◌ ◌ ● ◌ ● ◌ ◌   streak: 1d
```

---

## features

- daily habit tracking with 7-day dot grid
- calendar view — month overview with completion bars
- stats — 52-week heatmap, streaks, completion rates
- export / import — full JSON backup, Markdown report
- archived habits — soft delete with restore option
- zero configuration — works offline after `pnpm install`

---

## data

all data is stored in browser IndexedDB.
no server, no sync, no account required.

**backup your data:**
settings → data → [export json]

**restore:**
settings → data → [import json]

**full reset:**
settings → danger zone → [reset all data]

---

## views

| view | description |
| :-- | :-- |
| habits | main screen — toggle completions, add/edit/archive habits |
| calendar | month grid — day-by-day completion overview |
| stats | 52-week heatmap, streak records, per-habit completion rates |
| settings | export/import backup, manage archived habits, reset data |

---

## build

```bash
pnpm build      # compiles TypeScript + bundles → dist/
pnpm preview    # serves dist/ locally at http://localhost:4173
```

output is a static `dist/` folder — serve with any static host or `npx serve dist`.

---

## production

```bash
pnpm build && npx serve dist
```

**Linux:** `chmod +x start.sh && ./start.sh`
**Windows:** double-click `start.bat`
**macOS:** `chmod +x start.sh && ./start.sh`

All data stored locally in IndexedDB. No server, no cloud.

---

## development

```bash
pnpm dev            # dev server with HMR
pnpm type-check     # TypeScript strict check (0 errors required)
pnpm lint           # ESLint (0 warnings required)
pnpm test:run       # Vitest unit tests
pnpm test:ui        # Vitest with browser UI
pnpm test:coverage  # coverage report → coverage/
```

---

## stack

| layer | technology |
| :-- | :-- |
| framework | Vite 6 + React 19 |
| language | TypeScript 5 (strict) |
| styling | Tailwind CSS v4 + CSS tokens |
| font | JetBrains Mono (bundled via @fontsource) |
| local db | Dexie.js 4 (IndexedDB wrapper) |
| state | Zustand 5 |
| validation | Zod 4 |
| dates | date-fns 4 |
| testing | Vitest 3 |

---

## project structure

```
src/
├── app/          App.tsx — root layout
├── views/        HabitsView, CalendarView, StatsView, SettingsView
├── components/   habits/ · calendar/ · stats/ · settings/ · ui/ · layout/
├── db/           Dexie schema + singleton
├── engine/       streakEngine.ts — pure functions, fully tested
├── hooks/        Dexie reactive hooks (useLiveQuery)
├── schemas/      Zod validation schemas
├── stores/       Zustand UI state
├── types/        TypeScript interfaces
├── utils/        export.ts — JSON + Markdown export/import
└── styles/       tokens.css · reset.css · globals.css
```

---

## contributing

see [CONTRIBUTING.md](CONTRIBUTING.md)

---

## license

MIT — see [LICENSE](LICENSE)
