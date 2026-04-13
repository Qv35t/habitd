# habitd — Project Index

## Описание
Локальный трекер привычек. React 19 + Dexie.js + Tailwind.

## Текущая фаза
v1.0.0 — Bugfix & Polish complete

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
| Phase 12 | HomeView + EN-Only + Help | ✅ Complete |
| BF | Bugfix & Polish v1.0.0 | ✅ Complete |

## Компоненты
- [[HomeView]] — dashboard with 3 nav groups (core/extended/utility)
- [[HomeNavItem]] — nav button with key, label, desc
- [[HelpPanel]] — keyboard shortcuts + User Guide
- [[Sidebar]] — nav with separators (8 items)
- [[WeekView]] — 7-day grid view (×2.5 scale)
- [[WeekGrid]] — main grid (55ch × 7 × 12ch, cells 70px)
- [[WeekCell]] — habit×day intersection cell
- [[JournalView]] — daily journal notes + mood + habits summary
- [[JournalEditor]] — textarea with debounced auto-save
- [[JournalMoodPicker]] — 5-level ASCII mood selector
- [[JournalHabitsBar]] — read-only habits completion summary
- [[JournalNav]] — day navigation
- [[JournalMeta]] — word count + save state indicator
- [[TasksView]] — daily + weekly task manager
- [[DateNav]] — day navigation for tasks
- [[TaskCounters]] — DONE/LEFT/TOTAL + progress bar
- [[DailyTaskList]] — filtered daily tasks
- [[WeeklyTaskList]] — weekly tasks
- [[StatusBar]] — bottom bar with __APP_VERSION__

## Последние решения
- Week starts Monday (ISO 8601)
- Cells call toggleCompletion directly (no prop drilling)
- Auto-save через debounce 500ms, native textarea
- Dexie v3 — notes table
- Phase 12: RU locale удалён → EN only
- Phase 12: HomeView 3 группы навигации (core/extended/utility)
- Phase 12: HelpPanel User Guide (8 секций)
- Phase 12: ActiveView включает week + journal
- BF: WeekView × 2.5 (крупные ячейки, шире колонки)
- BF: JournalView isLoading fixed (entry undefined → null)
- BF: saveContent/saveMood try/catch
- BF: Версия v1.0.0 через __APP_VERSION__ define
- BF: Хоткеи n/e/d в HabitsView

## Теги
#project #react #dexie #habitd #homeview #helppanel #tasks #weekview #journalview #v1.0.0
