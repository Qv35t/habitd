# HABITD — Глоссарий терминов (EN → RU)

Автогенерирован: 2026-04-14
Источник: Phase 0–12 кодовая база + Phase 9 Finance Polish

## Finance Module

| Term (EN)        | Context             | File                    | RU Translation     | Notes                    |
|------------------|---------------------|-------------------------|--------------------|--------------------------|
| income           | Transaction.type    | types/index.ts          | доход              | противоп. expense        |
| expense          | Transaction.type    | types/index.ts          | расход             | противоп. income         |
| balance          | MonthSummary        | engine/finEngine.ts     | баланс             | income - expense         |
| savings rate     | MonthSummary        | engine/finEngine.ts     | норма сбережений   | %                        |
| overview         | FinanceTab          | stores/useUIStore.ts    | обзор              | первый таб Finance       |
| transactions     | FinanceTab          | stores/useUIStore.ts    | транзакции         |                          |
| budgets          | FinanceTab          | stores/useUIStore.ts    | бюджеты            |                          |
| goals            | FinanceTab          | stores/useUIStore.ts    | цели               |                          |
| analytics        | FinanceTab          | stores/useUIStore.ts    | аналитика          |                          |
| budget           | Budget interface    | types/index.ts          | бюджет             |                          |
| limit            | Budget.limitAmount  | types/index.ts          | лимит              |                          |
| spent            | BudgetStatus.spent  | engine/finEngine.ts     | потрачено          |                          |
| remaining        | BudgetStatus        | engine/finEngine.ts     | остаток            | limit - spent            |
| overBudget       | BudgetStatus        | engine/finEngine.ts     | превышен           | spent > limit            |
| warning          | BudgetStatus        | engine/finEngine.ts     | предупреждение     | usage >= 80%             |
| on track         | GoalProgress        | engine/finEngine.ts     | в срок             |                          |
| behind           | GoalProgress        | engine/finEngine.ts     | отстаёт            |                          |
| completed        | FinancialGoal.status| types/index.ts          | выполнено          |                          |
| cancelled        | FinancialGoal.status| types/index.ts          | отменено           |                          |
| active           | FinancialGoal.status| types/index.ts          | активная           |                          |
| deadline         | FinancialGoal       | types/index.ts          | дедлайн            |                          |
| target           | FinancialGoal       | types/index.ts          | цель               | targetAmount             |
| current          | FinancialGoal       | types/index.ts          | накоплено          | currentAmount            |
| progress         | GoalRow             | components/finance/     | прогресс           |                          |
| add funds        | GoalRow action      | components/finance/     | пополнить          |                          |
| category         | FinCategory         | types/index.ts          | категория          |                          |
| note             | Transaction.note    | types/index.ts          | заметка            |                          |
| amount           | Transaction.amount  | types/index.ts          | сумма              |                          |
| date             | Transaction.date    | types/index.ts          | дата               |                          |
| type             | Transaction.type    | types/index.ts          | тип                | income/expense           |
| tags             | Transaction.tags    | types/index.ts          | теги               | optional                 |
| symbol           | FinCategory.symbol  | types/index.ts          | символ             | single char              |
| color            | FinCategory.color   | types/index.ts          | цвет               | dim/bright/accent        |
| default          | FinCategory.isDefault| types/index.ts         | системная          | cannot delete            |
| custom           | FinCategory         | components/finance/     | пользовательская   | can delete               |
| cannot delete    | CategoryManager     | components/finance/     | нельзя удалить     | has transactions         |
| copy from prev   | BudgetEditor        | components/finance/     | копировать из прошлого месяца |              |
| set limit        | BudgetEditor        | components/finance/     | задать лимит       |                          |
| clear limit      | BudgetEditor        | components/finance/     | очистить лимит     |                          |
| no limit         | BudgetProgress      | components/finance/     | лимит не задан     |                          |
| heatmap          | SpendingHeatmap     | components/finance/     | тепловая карта     |                          |
| trend            | MonthlyTrendTable   | components/finance/     | тренд              |                          |
| top categories   | TopCategoriesBar    | components/finance/     | топ категорий      |                          |
| year summary     | YearSummaryCards    | components/finance/     | итоги года         |                          |
| sparkline        | SparklineRow        | components/finance/     | спарклайн          | 30d                      |
| best month       | YearSummaryCards    | components/finance/     | лучший месяц       |                          |
| worst month      | YearSummaryCards    | components/finance/     | худший месяц       |                          |
| avg savings      | YearSummaryCards    | components/finance/     | средние сбережения |                          |
| export CSV       | SettingsView        | views/SettingsView.tsx  | экспорт CSV        |                          |
| import JSON      | SettingsView        | views/SettingsView.tsx  | импорт JSON        |                          |
| Markdown report  | SettingsView        | views/SettingsView.tsx  | отчёт Markdown     |                          |

## Nav & Settings

| Term (EN)     | RU            | Context              |
|---------------|---------------|----------------------|
| home          | главная       | ViewName, nav        |
| habits        | привычки      | ViewName, nav        |
| calendar      | календарь     | ViewName, nav        |
| week          | неделя        | ViewName, nav        |
| journal       | журнал        | ViewName, nav        |
| stats         | статистика    | ViewName, nav        |
| tasks         | задачи        | ViewName, nav        |
| finance       | финансы       | ViewName, nav        |
| settings      | настройки     | ViewName, nav        |
| help          | помощь        | ViewName, nav        |
| theme         | тема          | SettingsView         |
| layout        | раскладка     | SettingsView         |
| layoutDesc    | язык интерфейса, формат дат и валюта | SettingsView |
| export        | экспорт       | SettingsView         |
| import        | импорт        | SettingsView         |
| reset         | сброс данных  | SettingsView         |
| danger zone   | опасная зона  | SettingsView         |
| data          | данные        | SettingsView         |
| archive       | архив         | SettingsView         |

## Habits

| Term (EN)     | RU            | Context              |
|---------------|---------------|----------------------|
| add habit     | добавить привычку | HabitsView        |
| edit          | изменить      | HabitsView           |
| delete        | удалить       | HabitsView           |
| archive       | в архив       | HabitsView           |
| today         | сегодня       | HabitsView           |
| no habits yet | привычек пока нет | HabitsView       |
| streak        | серия         | streakEngine.ts      |
| current streak| текущая серия | types/index.ts       |
| longest streak| самая длинная серия | types/index.ts |
| completion rate | процент     | types/index.ts       |

## Calendar

| Term (EN)     | RU            | Context              |
|---------------|---------------|----------------------|
| month         | месяц         | CalendarView         |
| prev month    | предыдущий    | CalendarView         |
| next month    | следующий     | CalendarView         |
| done          | выполнено     | CalendarView         |
| future date   | будущая дата  | CalendarView         |
| loading       | загрузка      | CalendarView         |

## Stats

| Term (EN)     | RU            | Context              |
|---------------|---------------|----------------------|
| summary       | сводка        | StatsView            |
| activity      | активность    | StatsView            |
| top streaks   | лучшие серии  | StatsView            |
| 52 weeks      | 52 недели     | StatsView            |
| less          | меньше        | StatsView            |
| more          | больше        | StatsView            |
| active        | активные      | StatsView filter     |
| archived      | архив         | StatsView filter     |
| all           | все           | StatsView filter     |

## Tasks

| Term (EN)     | RU            | Context              |
|---------------|---------------|----------------------|
| daily tasks   | ежедневные    | TasksView            |
| weekly tasks  | еженедельные  | TasksView            |
| done          | выполнено     | TasksView            |
| left          | осталось      | TasksView            |
| total         | всего         | TasksView            |
| no tasks      | нет задач     | TasksView            |

## Journal

| Term (EN)     | RU            | Context              |
|---------------|---------------|----------------------|
| content       | содержимое    | JournalView          |
| mood          | настроение    | JournalView          |
| auto-save     | авто-сохранение | JournalView        |
| saved         | сохранено     | JournalView          |
| saving        | сохранение    | JournalView          |
| dirty         | изменено      | JournalView          |
| word count    | кол-во слов   | JournalView          |

## Week

| Term (EN)     | RU            | Context              |
|---------------|---------------|----------------------|
| week          | неделя        | WeekView             |
| mon–sun       | пн–вс         | WeekView             |
| today         | сегодня       | WeekView             |
| streak badge  | значок серии  | WeekView             |

## Help

| Term (EN)     | RU            | Context              |
|---------------|---------------|----------------------|
| navigation    | навигация     | HelpView             |
| actions       | действия      | HelpView             |
| hotkeys       | горячие клавиши | HelpView           |
| user guide    | руководство   | HelpView             |
| sections      | разделы       | HelpView             |

## Common

| Term (EN)     | RU            | Context              |
|---------------|---------------|----------------------|
| confirm       | подтвердить   | common               |
| cancel        | отмена        | common               |
| save          | сохранить     | common               |
| close         | закрыть       | common               |
| loading       | загрузка      | common               |
| error         | ошибка        | common               |
