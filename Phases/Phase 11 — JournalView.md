# Phase 11 — JournalView

> Дата: 2026-04-13
> Статус: ✅ Complete
> 0 type errors, 226 tests passing
> Предыдущая: [[Phase 10 — WeekView]]

## Цель
Daily reflection panel: free-form notes + mood indicator + habits summary с auto-save.

## Новые файлы
| Файл | Назначение |
|------|-----------|
| `src/utils/journal.ts` | 7 pure functions |
| `src/hooks/useJournalEntry.ts` | Dexie composite hook + saveContent/saveMood |
| `src/views/JournalView.tsx` | Main view assembler |
| `src/components/journal/JournalNav.tsx` | Day navigation ← date → [today] |
| `src/components/journal/JournalHabitsBar.tsx` | Habits completion summary |
| `src/components/journal/JournalMoodPicker.tsx` | 5-level ASCII mood selector |
| `src/components/journal/JournalMeta.tsx` | Word count + save state indicator |
| `src/components/journal/JournalEditor.tsx` | Textarea с debounced auto-save |
| `test/journal.test.ts` | 26 Vitest unit tests |

## Изменённые файлы
| Файл | Что добавлено |
|------|-------------|
| `src/types/index.ts` | MoodLevel, MOOD_CHARS, JournalEntry, SaveState, JournalHabitItem, JournalViewData, ViewName + 'journal' |
| `src/db/schema.ts` | v3 — notes table (id, date, createdAt, updatedAt) |
| `src/stores/useUIStore.ts` | journalDate, setJournalDate, resetJournalToToday |
| `src/styles/globals.css` | CSS для всех journal компонентов |
| `src/app/App.tsx` | JournalView route + hotkey 'j' |
| `src/components/layout/Sidebar.tsx` | journal nav item |
| `src/i18n/locales/en.json` | nav.journal |
| `src/i18n/locales/ru.json` | nav.journal |

## Types
- MoodLevel — 0 | 1 | 2 | 3 | 4 | 5
- MOOD_CHARS — Record<MoodLevel, string>: · ▁ ▃ ▅ ▇ █
- JournalEntry — id, date, content, mood, createdAt, updatedAt
- SaveState — idle | dirty | saving | saved | error
- JournalHabitItem — id, name, symbol, isCompleted
- JournalViewData — entry, habits, counts, dateLabel, isToday, isFuture

## DB Schema — v3
```
.version(3).stores({
  habits:      'id, createdAt, archivedAt, sortOrder',
  completions: 'id, habitId, date, [habitId+date]',
  tasks:       'id, date, scope, weekKey, done, [scope+date], sortOrder',
  notes:       'id, date, createdAt, updatedAt',
})
```

## Utils (src/utils/journal.ts)
- getJournalDateLabel(date) → "Mon, 13 Apr 2026"
- getPrevJournalDate(date) → YYYY-MM-DD previous day
- getNextJournalDate(date) → YYYY-MM-DD next day
- isJournalDateFuture(date, today) → boolean
- countWords(text) → number
- createJournalEntry(date, content, mood) → Omit<JournalEntry, 'id'>
- updateJournalEntry(existing, patch) → JournalEntry

## Компоненты
- [[JournalView]] — assembler: Nav + HabitsBar + MoodPicker + Editor
- [[JournalNav]] — ← / dateLabel / → / [today]
- [[JournalHabitsBar]] — read-only habits summary с ASCII bar
- [[JournalMoodPicker]] — 5 кнопок [ 1 ] [ 2 ] [ 3 ] [▶4◀] [ 5 ], клик toggle off
- [[JournalMeta]] — words: N + [● saved HH:mm]
- [[JournalEditor]] — textarea, debounce 500ms, flush-on-unmount

## Архитектурные решения
- Auto-save: useCallback + useRef, debounce 500ms
- Native textarea — без markdown/rich text
- Dexie upsert: если entry есть → update, иначе → add
- useEffect только для локальной UI state sync (не для fetch)
- Mood 0 = not set, 1-5 = levels

## Тесты
26 unit tests в journal.test.ts

## Горячие клавиши
- j — перейти в JournalView

## Связи
- Использует [[useUIStore]] из [[Phase 0 — Foundation]]
- Использует [[useCompletions]] и [[useActiveHabits]] из [[Phase 1 — Local Data Layer]]
- Показывает habits summary из [[Phase 2 — Habits View]]
- Навигация: между [[Phase 10 — WeekView]] и [[Phase 5 — Stats View]]
- DB v3 расширяет схему после [[Phase 9 — TasksView]] (v2)
- После Phase 11: [[Phase 12 — HomeView Update + EN-Only + Help Rework]]
