import { useState } from 'react'
import type { HabitStatsRow, StatsPeriod } from '@/types'
import { CompletionBar } from './CompletionBar'

type SortCol = 'name' | 'currentStreak' | 'longestStreak' | 'completionRate' | 'total'

interface StatsTableProps {
  rows: HabitStatsRow[]
  period: StatsPeriod
}

/**
 * Per-habit statistics table with sortable columns.
 * Uses div role="table" (not HTML table element) for monospace grid alignment.
 */
export function StatsTable({ rows }: StatsTableProps) {
  const [sort, setSort] = useState<{ col: SortCol; dir: 'asc' | 'desc' }>({
    col: 'currentStreak',
    dir: 'desc',
  })

  const sorted = [...rows].sort((a, b) => {
    let aVal: number | string
    let bVal: number | string
    switch (sort.col) {
      case 'name':
        aVal = a.habit.name
        bVal = b.habit.name
        break
      case 'currentStreak':
        aVal = a.currentStreak
        bVal = b.currentStreak
        break
      case 'longestStreak':
        aVal = a.longestStreak
        bVal = b.longestStreak
        break
      case 'completionRate':
        aVal = a.completionRate
        bVal = b.completionRate
        break
      case 'total':
        aVal = a.totalCompletions
        bVal = b.totalCompletions
        break
    }
    if (typeof aVal === 'string' && typeof bVal === 'string') {
      return sort.dir === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal)
    }
    return sort.dir === 'asc'
      ? (aVal as number) - (bVal as number)
      : (bVal as number) - (aVal as number)
  })

  const handleSort = (col: SortCol) => {
    if (sort.col === col) {
      setSort({ col, dir: sort.dir === 'asc' ? 'desc' : 'asc' })
    } else {
      setSort({ col, dir: 'desc' })
    }
  }

  const sortIndicator = (col: SortCol) => {
    if (sort.col !== col) return ''
    return sort.dir === 'asc' ? ' ▲' : ' ▼'
  }

  if (sorted.length === 0) {
    return (
      <div className="stats-table-empty">
        no habits match the current filter
      </div>
    )
  }

  return (
    <div className="stats-table" role="table" aria-label="Habit statistics">
      {/* Header */}
      <div className="stats-table__header" role="row">
        <button className="stats-table__col stats-table__col--symbol" role="columnheader">
          sym
        </button>
        <button
          className="stats-table__col stats-table__col--name"
          role="columnheader"
          onClick={() => handleSort('name')}
        >
          name{sortIndicator('name')}
        </button>
        <button
          className="stats-table__col stats-table__col--streak"
          role="columnheader"
          onClick={() => handleSort('currentStreak')}
        >
          cur{sortIndicator('currentStreak')}
        </button>
        <button
          className="stats-table__col stats-table__col--streak"
          role="columnheader"
          onClick={() => handleSort('longestStreak')}
        >
          max{sortIndicator('longestStreak')}
        </button>
        <button
          className="stats-table__col stats-table__col--rate"
          role="columnheader"
          onClick={() => handleSort('completionRate')}
        >
          rate{sortIndicator('completionRate')}
        </button>
        <button
          className="stats-table__col stats-table__col--total"
          role="columnheader"
          onClick={() => handleSort('total')}
        >
          total{sortIndicator('total')}
        </button>
      </div>

      {/* Rows */}
      {sorted.map((row) => {
        const isArchived = row.habit.archivedAt && row.habit.archivedAt !== ''
        return (
          <div
            key={row.habit.id}
            className={`stats-table__row ${isArchived ? 'stats-table__row--archived' : ''}`}
            role="row"
          >
            <div className="stats-table__cell stats-table__col--symbol">
              {row.habit.symbol}
            </div>
            <div className="stats-table__cell stats-table__col--name">
              {row.habit.name}
            </div>
            <div className="stats-table__cell stats-table__col--streak">
              {row.currentStreak > 0 ? `${row.currentStreak}d` : '–'}
            </div>
            <div className="stats-table__cell stats-table__col--streak">
              {row.longestStreak}d
            </div>
            <div className="stats-table__cell stats-table__col--rate">
              <CompletionBar
                value={row.completionRate}
                width={6}
                showLabel={false}
              />
              <span className="stats-table__rate-pct">
                {row.completionRate.toFixed(0)}%
              </span>
            </div>
            <div className="stats-table__cell stats-table__col--total">
              {row.totalCompletions}
            </div>
          </div>
        )
      })}
    </div>
  )
}
