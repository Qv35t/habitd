import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { format } from 'date-fns'
import { useLiveQuery } from 'dexie-react-hooks'
import { useUIStore, type FinanceTab } from '@/stores/useUIStore'
import { useHotkeys } from '@/hooks/useHotkeys'
import { db } from '@/db'
import { calcBalance } from '@/engine/finEngine'
import { getMonthRange } from '@/utils/dateUtils'
import { formatCurrency } from '@/utils/finance'
import { TransactionList } from '@/components/finance/TransactionList'
import { GoalsList } from '@/components/finance/GoalsList'
import { BudgetEditor } from '@/components/finance/BudgetEditor'
import { CategoryManager } from '@/components/finance/CategoryManager'
import { AnalyticsTab } from '@/components/finance/AnalyticsTab'
import type { Transaction } from '@/types'

const TABS: FinanceTab[] = ['overview', 'transactions', 'budgets', 'goals', 'analytics']

export function FinanceView() {
  const { t } = useTranslation()
  const financeTab = useUIStore((s) => s.financeTab)
  const setFinanceTab = useUIStore((s) => s.setFinanceTab)

  useHotkeys({
    '1': () => setFinanceTab('overview'),
    '2': () => setFinanceTab('transactions'),
    '3': () => setFinanceTab('budgets'),
    '4': () => setFinanceTab('goals'),
    '5': () => setFinanceTab('analytics'),
  }, [setFinanceTab])

  const todayStr = format(new Date(), 'yyyy-MM')
  const [year, m] = todayStr.split('-').map(Number)
  const monthLabel = format(new Date(year, m - 1, 1), 'MMM yyyy').toUpperCase()

  return (
    <div className="finance-view">
      {/* Headline */}
      <div className="headline">
        <div className="date">LEDGER · {monthLabel}</div>
        <h1>finance · <span className="accent">ledger</span></h1>
        <div className="sub">income pressed in teal, expense pressed in orange. balance is the overprint.</div>
      </div>

      {/* Tabs + add button row */}
      <div className="section-head">
        <h2>{t(`finance.tabs.${financeTab}`)}</h2>
        <div className="right">
          {TABS.map((tabId) => (
            <button
              key={tabId}
              className={`pill ${financeTab === tabId ? 'active' : ''}`}
              onClick={() => setFinanceTab(tabId)}
            >
              {t(`finance.tabs.${tabId}`)}
            </button>
          ))}
          <button
            className="pill primary"
            onClick={() => {
              setFinanceTab('transactions')
            }}
          >
            + {t('finance.transactions.add')}
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="finance-view__content">
        {financeTab === 'overview' && <FinanceOverview />}
        {financeTab === 'transactions' && <TransactionList />}
        {financeTab === 'budgets' && (
          <div className="finance-main-full">
            <BudgetEditor month={todayStr} />
            <div className="fin-divider" />
            <CategoryManager />
          </div>
        )}
        {financeTab === 'goals' && <GoalsList />}
        {financeTab === 'analytics' && <AnalyticsTab />}
      </div>
    </div>
  )
}

function FinanceOverview() {
  const { t } = useTranslation()
  const localeLayout = useUIStore((s) => s.localeLayout)
  const todayStr = format(new Date(), 'yyyy-MM')

  const rawTransactions = useLiveQuery<Transaction[]>(
    () => db.transactions.toArray(),
    [],
  )
  const transactions = useMemo(() => rawTransactions ?? [], [rawTransactions])

  const [from, to] = getMonthRange(todayStr)
  const summary = useMemo(() => calcBalance(transactions, from, to), [transactions, from, to])

  const txCount = useMemo(() => {
    return transactions.filter((tx) => tx.date >= from && tx.date <= to).length
  }, [transactions, from, to])

  const recentTxs = useMemo(() => {
    return transactions
      .filter((tx) => tx.date >= from && tx.date <= to)
      .sort((a, b) => b.date.localeCompare(a.date))
      .slice(0, 10)
  }, [transactions, from, to])

  const balanceSign = summary.balance >= 0 ? '+' : ''
  const balanceClass = summary.balance >= 0 ? 'fin-ok' : 'fin-danger'

  const maxVal = Math.max(summary.income, summary.expense, 1)
  const incomeBarWidth = Math.round((summary.income / maxVal) * 100)
  const expenseBarWidth = Math.round((summary.expense / maxVal) * 100)

  return (
    <>
      {/* Three stat cards */}
      <div className="fin-stat-cards">
        <div className="fin-stat-card income">
          <div className="fin-stat-card__label">INCOME</div>
          <div className="fin-stat-card__value">+{formatCurrency(summary.income, localeLayout)}</div>
          <div className="fin-stat-card__bar">
            <div className="fin-stat-card__bar-fill" style={{ width: `${incomeBarWidth}%` }} />
          </div>
          <div className="fin-stat-card__trend up">↗ +{Math.round(summary.savingsRate)}%</div>
        </div>
        <div className="fin-stat-card expense">
          <div className="fin-stat-card__label">EXPENSE</div>
          <div className="fin-stat-card__value">−{formatCurrency(summary.expense, localeLayout)}</div>
          <div className="fin-stat-card__bar">
            <div className="fin-stat-card__bar-fill" style={{ width: `${expenseBarWidth}%` }} />
          </div>
          <div className="fin-stat-card__trend down">↘ {Math.round(100 - summary.savingsRate)}%</div>
        </div>
        <div className="fin-stat-card balance">
          <div className="fin-stat-card__label">BALANCE</div>
          <div className={`fin-stat-card__value ${balanceClass}`}>{balanceSign}{formatCurrency(summary.balance, localeLayout)}</div>
          <div className="fin-stat-card__bar">
            <div className="fin-stat-card__bar-fill" style={{ width: `${Math.min(100, Math.abs(summary.balance) / Math.max(maxVal, 1) * 100)}%` }} />
          </div>
          <div className="fin-stat-card__trend up">tx: {txCount}</div>
        </div>
      </div>

      {/* Recent transactions */}
      <div className="section-head" style={{ marginTop: 'var(--sp-6)' }}>
        <h2>recent transactions</h2>
      </div>
      <div className="fin-tx-card">
        <div className="fin-tx-card__header">
          <span>{todayStr.replace('-', ' ')} · {txCount} tx</span>
          <span className="fin-tx-card__total">{balanceSign}{formatCurrency(summary.balance, localeLayout)}</span>
        </div>
        <div className="fin-tx-card__body">
          {recentTxs.length === 0 ? (
            <div className="fin-tx-card__empty">{t('finance.transactions.empty')}</div>
          ) : (
            recentTxs.map((tx) => (
              <div key={tx.id} className="fin-tx-row">
                <span className="fin-tx-row__date">{tx.date.slice(5)}</span>
                <span className="fin-tx-row__symbol">{tx.type === 'income' ? '▸' : '●'}</span>
                <span className="fin-tx-row__name">{tx.note || t(`finance.tabs.${tx.type}`)}</span>
                <span className={`fin-tx-row__amount ${tx.type === 'income' ? 'in' : 'out'}`}>
                  {tx.type === 'income' ? '+' : '−'}{formatCurrency(tx.amount, localeLayout)}
                </span>
                <span className="fin-tx-row__cat">{tx.categoryId.slice(0, 3).toUpperCase()}</span>
              </div>
            ))
          )}
        </div>
      </div>
    </>
  )
}
