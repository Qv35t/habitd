# habitd — Project Index

## Описание
Локальный трекер привычек. React 19 + Dexie.js + Tailwind.

## Текущая фаза
Phase 11 — JournalView

## Прогресс по фазам
| Фаза | Название | Статус |
|------|----------|--------|
| Phase 0 | Foundation | ✅ Complete |
| Phase 1 | Local Data Layer | ✅ Complete |
| Phase 2 | Habits View | ✅ Complete |
| Phase 3 | Streak Engine | ✅ Complete |
| Phase 4 | Calendar View | ✅ Complete |
| Phase 5 | Stats View | ✅ Complete |
| Phase 6 | Settings & Export | ✅ Complete |
| Phase 7 | GitHub & Distribution | ✅ Complete |
| Phase 8 | Polish + i18n | ✅ Complete |
| Phase 9 | TasksView | ✅ Complete |
| Phase 10 | WeekView | ✅ Complete |
| Phase 11 | JournalView | ✅ Complete |

## Компоненты
- [[WeekView]] — 7-day grid view
- [[JournalView]] — daily journal notes + mood + habits summary
- [[JournalEditor]] — textarea with debounced auto-save
- [[JournalMoodPicker]] — 5-level ASCII mood selector
- [[JournalHabitsBar]] — read-only habits completion summary
- [[JournalNav]] — day navigation
- [[JournalMeta]] — word count + save state indicator

## Последние решения
- Week starts Monday (ISO 8601)
- Cells call toggleCompletion directly (no prop drilling)
- Auto-save через debounce 500ms, native textarea
- Dexie v3 — notes table

## Теги
#project #react #dexie #habitd #weekview #journalview
