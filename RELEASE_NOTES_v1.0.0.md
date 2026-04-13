# Release v1.0.0 — First Stable Release

> **habitd** — terminal-style habit tracker. local-first. no accounts. no cloud.

This is the first stable release of habitd, combining Phase 12 (HomeView + EN-Only + Help Rework) and a comprehensive Bugfix & Polish pass.

## What's New

### 🏠 HomeView — Redesigned Dashboard
- **7 sections organized in 3 groups** for intuitive navigation:
  - **Core**: habits, calendar, stats
  - **Extended**: tasks, week, journal
  - **Utility**: settings
- Visual grouping with labeled sections and color-coded hotkeys
- Keyboard shortcuts: `[t]` tasks, `[v]` week, `[j]` journal

### 📋 New Views (from previous phases, now polished)
- **TasksView** — daily + weekly task manager with counters and progress bars
- **WeekView** — 7-day Mon→Sun completion grid with inline toggles (now ×2.5 scale!)
- **JournalView** — daily notes with mood tracking (1-5 ASCII mood picker), habit summary, and auto-save

### ⌨️ Keyboard Shortcuts
| Key | Action |
|:---:|--------|
| `g` | Go home |
| `h` | Habits view |
| `c` | Calendar view |
| `s` | Stats view |
| `t` | Tasks view |
| `v` | Week view |
| `j` | Journal view |
| `,` | Settings |
| `n` | New habit (in HabitsView) |
| `e` | Edit selected habit (in HabitsView) |
| `d` | Delete selected habit (in HabitsView) |
| `?` | Toggle help panel |

### 🆕 Help Panel — User Guide
- Full keyboard shortcuts reference
- **User Guide section** — one-line description for each of the 8 views
- Wider panel (420→500px) with scrollable content

### 🌐 English-Only Localization
- Simplified codebase by removing Russian locale
- All hardcoded strings migrated to i18n system
- Cleaner, more maintainable codebase

## Bug Fixes

- **JournalView loading** — Fixed black screen / infinite loading caused by incorrect `undefined` guard
- **WeekView scaling** — Increased to ×2.5 for better readability (70px cells, 55ch habit column)
- **saveContent / saveMood** — Added error handling with try/catch
- **WeekNav** — Fixed invalid button variant
- **Task components** — All Russian strings translated to English via i18n

## Improvements

- **StatusBar** — Version now reads `__APP_VERSION__` from build config (v1.0.0)
- **Sidebar** — Added home navigation, visual separators between groups (8 items total)
- **CSS tokens** — Added `--font-size-lg` (16px) and `--font-size-xl` (20px)
- **JournalView** — Added IndexedDB recovery hint for loading state
- **Pre-existing fixes** — WeekNav variant, schemas z.enum params, WeekGrid unused import

## Technical Details

- **Version**: `0.0.0` → `1.0.0`
- **226 tests** passing across 8 test files
- **0 type errors**, **0 lint warnings**
- Clean build with Vite 6

### Stack
| Layer | Technology |
|:--|:--|
| Framework | Vite 6 + React 19 |
| Language | TypeScript 5 (strict) |
| Styling | Tailwind CSS v4 + CSS tokens |
| Font | JetBrains Mono |
| Local DB | Dexie.js 4 (IndexedDB) |
| State | Zustand 5 |
| i18n | react-i18next (EN only) |
| Testing | Vitest 3 |

## Installation

```bash
git clone https://github.com/Qv35t/habitd
cd habitd
pnpm install
pnpm dev
```

Open http://localhost:5173

## Full Changelog

```
5fbb0dd..fdb02c4  main

Files changed: 35
Insertions: +377
Deletions: -302
```

35 files changed across src/, styles, i18n, views, components, hooks, and stores.

---

**habitd v1.0.0** — your habits, your data, your machine. 🖥️
