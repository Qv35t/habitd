import { useLiveQuery } from 'dexie-react-hooks'
import { format, subDays } from 'date-fns'
import { db } from '@/db'
import { computeHabitStats } from '@/engine/streakEngine'
import { getMonthRange } from '@/utils/dateUtils'
import type { FinCategory } from '@/types'

export interface HomeHabitCard {
  id: string
  symbol: string
  name: string
  desc: string
  dots: boolean[]
  streak: number
  doneToday: boolean
}

export interface HomeData {
  doneToday: number
  totalActive: number
  bestStreak: number
  bestStreakHabitName: string
  habits: HomeHabitCard[]
  monthIncome: number
  monthExpense: number
  monthBalance: number
  monthTxCount: number
  monthIncomeTxs: { date: string; categoryName: string; amount: number }[]
  monthExpenseTxs: { date: string; categoryName: string; amount: number }[]
}

function getDayDots(todayIso: string, completionDates: Set<string>): boolean[] {
  const dots: boolean[] = []
  for (let i = 6; i >= 0; i--) {
    const d = subDays(new Date(todayIso), i)
    dots.push(completionDates.has(format(d, 'yyyy-MM-dd')))
  }
  return dots
}

export function useHomeData(): HomeData | undefined {
  const today = format(new Date(), 'yyyy-MM-dd')
  const month = format(new Date(), 'yyyy-MM')

  return useLiveQuery(async () => {
    const [habitsRaw, completionsRaw, transactions, categories] = await Promise.all([
      db.habits.where('archivedAt').equals('').sortBy('sortOrder'),
      db.completions.where('date').equals(today).toArray(),
      db.transactions.where('date').between(getMonthRange(month)[0], getMonthRange(month)[1], true, true).toArray(),
      db.finCategories.toArray(),
    ])

    const doneToday = completionsRaw.length
    const totalActive = habitsRaw.length
    const completedTodayIds = new Set(completionsRaw.map((c) => c.habitId))

    let bestStreak = 0
    let bestStreakHabitName = ''

    const habitCards: HomeHabitCard[] = []
    for (const h of habitsRaw.slice(0, 4)) {
      const allCompletions = await db.completions.where('habitId').equals(h.id).toArray()
      const dates = new Set(allCompletions.map((c) => c.date))
      const stats = computeHabitStats(h, allCompletions.map((c) => c.date), today)
      const doneTodayHabit = completedTodayIds.has(h.id)

      if (stats.currentStreak > bestStreak) {
        bestStreak = stats.currentStreak
        bestStreakHabitName = h.name
      }

      habitCards.push({
        id: h.id,
        symbol: h.symbol,
        name: h.name,
        desc: `${Math.round(stats.completionRate)}% · last 30d`,
        dots: getDayDots(today, dates),
        streak: stats.currentStreak,
        doneToday: doneTodayHabit,
      })
    }

    const catMap = new Map(categories.map((c: FinCategory) => [c.id, c.name]))
    let monthIncome = 0
    let monthExpense = 0
    const monthIncomeTxs: { date: string; categoryName: string; amount: number }[] = []
    const monthExpenseTxs: { date: string; categoryName: string; amount: number }[] = []

    for (const tx of transactions) {
      const categoryName = catMap.get(tx.categoryId) ?? '?'
      if (tx.type === 'income') {
        monthIncome += tx.amount
        monthIncomeTxs.push({ date: tx.date, categoryName, amount: tx.amount })
      } else {
        monthExpense += tx.amount
        monthExpenseTxs.push({ date: tx.date, categoryName, amount: tx.amount })
      }
    }

    monthIncomeTxs.sort((a, b) => b.date.localeCompare(a.date))
    monthExpenseTxs.sort((a, b) => b.date.localeCompare(a.date))

    return {
      doneToday,
      totalActive,
      bestStreak,
      bestStreakHabitName,
      habits: habitCards,
      monthIncome,
      monthExpense,
      monthBalance: monthIncome - monthExpense,
      monthTxCount: transactions.length,
      monthIncomeTxs: monthIncomeTxs.slice(0, 2),
      monthExpenseTxs: monthExpenseTxs.slice(0, 2),
    }
  })
}