# Phase 10 — WeekView

> Дата: 2026-04-13
> Статус: ✅ Complete
> 0 type errors, 200 tests passing
> Предыдущая: [[Phase 9 — TasksView]]
> Следующая: [[Phase 11 — JournalView]]

## Цель
7-дневный rolling week dashboard: активные привычки как rows × Mon→Sun grid с inline completion toggles.

## Новые файлы
| Файл | Назначение |
|------|-----------|
| `src/utils/week.ts` | 8 pure week math functions |
| `src/hooks/useWeekData.ts` | Dexie composite hook (useLiveQuery) |
| `src/views/WeekView.tsx` | Main view assembler |
| `src/components/week/WeekGrid.tsx` | 7-col grid layout |
| `src/components/week/WeekCell.tsx` | Toggle cell (▓/░/·) |
| `src/components/week/WeekDayHeader.tsx` | Column header |
| `src/components/week/WeekHabitRow.tsx` | Habit row + streak badge |
| `src/components/week/WeekNav.tsx` | ← / → / [today] |
| `src/components/week/WeekSummaryBar.tsx` | X/Y · Z% [bar] |
| `test/week.test.ts` | 25 Vitest unit tests |

## Изменённые файлы
| Файл | Что добавлено |
|------|-------------|
| `src/types/index.ts` | WeekDay, WeekCellData, WeekViewData, ViewName + 'week' |
| `src/stores/useUIStore.ts` | weekOffset, setWeekOffset, resetWeekToToday |
| `src/styles/globals.css` | CSS для всех week компонентов |
| `src/app/App.tsx` | WeekView route + hotkey 'w' |
| `src/components/layout/Sidebar.tsx` | week nav item |
| `src/i18n/locales/en.json` | nav.week |
| `src/i18n/locales/ru.json` | nav.week |

## Types
- [[WeekDay]] — один столбец (Mon–Sun)
- [[WeekCellData]] — одна ячейка (habit × day)
- [[WeekViewData]] — полный возврат useWeekData

## Utils (src/utils/week.ts)
- getWeekReferenceDate(offset, today) → Monday YYYY-MM-DD
- getWeekDays(refDate, today) → 7 × WeekDay
- getWeekLabel(weekDays) → "Apr 14 – 20, 2026"
- getWeekBounds(refDate) → {weekStart, weekEnd}
- buildWeekCompletionMap(completions) → date → Set<habitId>
- isCellCompleted(map, habitId, date) → boolean
- calcWeekTotalPossible(habits, weekDays) → number
- calcWeekTotalCompleted(map, habits, weekDays) → number
- calcWeekCompletionRate(completed, possible) → 0-100

## Компоненты
- [[WeekView]] — main assembler: WeekNav + WeekGrid + WeekSummaryBar
- [[WeekGrid]] — grid-template-columns: 22ch repeat(7, 1fr) 5ch
- [[WeekCell]] — три состояния: ▓ completed, ░ not done, · future
- [[WeekNav]] — ← / weekLabel / → / [today]
- [[WeekSummaryBar]] — ASCII bar, 24 chars width

## Архитектурные решения
- Week starts Monday (ISO 8601)
- Cells вызывают toggleCompletion напрямую — без prop drilling
- useLiveQuery для всех Dexie чтений
- display: contents на week-habit-row для grid layout

## Тесты
25 unit tests в week.test.ts

## Горячие клавиши
- w — перейти в WeekView
- ← / → — навигация по неделям

## Связи
- Использует [[toggleCompletion]] из [[Phase 1 — Local Data Layer]]
- Использует [[calcCurrentStreak]] из [[Phase 3 — Streak Engine]]
- Использует [[useUIStore]] из [[Phase 0 — Foundation]]
- Навигация: между [[Phase 4 — Calendar View]] и [[Phase 5 — Stats View]]
- Расширяет [[Phase 9 — TasksView]] (после него)
