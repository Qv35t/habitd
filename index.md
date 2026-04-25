# habitd — Project Index

## Описание
Локальный трекер привычек. React 19 + Dexie.js + Tailwind.

## Текущая фаза
v1.1.0 — Finance Module + i18n RU + Workspace 1720×900

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
| P9-BF | BugFix & i18n Completion | ✅ Complete |
| P9-T11 | Workspace 1720×900 | ✅ Complete |
| Fix-01 | Workspace Dimensions Fix | ✅ Complete |

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
- [[FinanceView]] — finance hub with tab bar (overview/transactions/budgets/goals/analytics)
- [[FinanceTabBar]] — flex tab navigation with space-evenly layout
- [[MonthOverview]] — reactive month dashboard (balance, budgets, top cats, sparkline)
- [[BalanceSummary]] — income vs expense ASCII bar chart
- [[BudgetProgress]] — per-category budget status bars with indicators
- [[BudgetEditor]] — editable budget rows per category
- [[BudgetEditorRow]] — single editable budget line with Zod validation
- [[TopCategoriesBar]] — top N expense ASCII bars
- [[CategoryManager]] — CRUD UI for transaction categories
- [[TransactionList]] — filtered/sorted transaction list with month nav
- [[TransactionRow]] — single row with context menu (edit/delete)
- [[TransactionForm]] — add/edit transaction modal
- [[GoalsList]] — goals lifecycle container (active/completed, modals)
- [[GoalRow]] — goal row with progress bar and status badge
- [[GoalForm]] — add/edit goal modal
- [[AddFundsModal]] — modal for adding funds to goal
- [[SpendingHeatmap]] — annual ASCII heatmap (·░▒▓█)
- [[MonthlyTrendTable]] — 12-month income/expense table
- [[AnalyticsTab]] — year analytics orchestrator
- [[CategoryTrendChart]] — 12-month category sparklines
- [[YearSummaryCards]] — year-level summary cards
- [[MonthNav]] — prev/next month navigation
- [[SparklineRow]] — 30-day mini sparkline with stats
- [[HelpView]] — two-column hotkey reference (Habits/Calendar/Stats vs Finance)

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
- P9-BF: Finance i18n — 22 компонента переведены на t()
- P9-BF: HelpView двухколоночный layout
- P9-T11: --content-w-habits/calendar = 1720px, --workspace-h = 900px
- Fix-01: --working-w = calc(100vw - sidebar), --half-w = / 2
- Fix-01: HelpView CSS — grid 1fr 1fr, заголовок центрирован
- Fix-01: FinanceView tabbar — justify-content: space-evenly

## Теги
#project #react #dexie #habitd #homeview #helppanel #tasks #weekview #journalview #finance #i18n #v1.1.0

## Finance Module
### Engine
- [[finEngine]] — pure computation engine (28 functions, zero I/O)
### Hooks
- [[useFinCategories]] — category CRUD with live Dexie queries
- [[useTransactions]] — transaction CRUD + year/month filtering
- [[useFinancialGoals]] — goal CRUD operations
- [[useBudgets]] — budget management with prev-month copy
### Schemas
- [[FinanceSchemas]] — Zod schemas (backup + create + validation)
### Types
- [[FinanceTypes]] — Transaction, FinCategory, Budget, FinancialGoal + derived types
### Utils
- [[FinanceUtils]] — formatCurrency, renderAsciiBar, formatMonthLabel
- [[CurrencyUtils]] — locale-aware currency settings
- [[DateUtils]] — getMonthRange, date comparisons
### Styles
- [[FinanceCSS]] — finance-specific styles (tabbar, heatmap, sparkline, bars)
- [[HelpViewCSS]] — two-column grid layout for HelpView
