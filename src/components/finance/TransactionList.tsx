import { useState, useMemo } from 'react';
import { format } from 'date-fns';
import { useTranslation } from 'react-i18next';
import { useUIStore } from '@/stores/useUIStore';
import { formatCurrency } from '@/utils/finance';
import { MonthNav } from './MonthNav';
import { TransactionRow } from './TransactionRow';
import { TransactionForm } from './TransactionForm';
import { useTransactionsByMonth, deleteTransaction, getCurrentMonth } from '@/hooks/useTransactions';
import { useCategories } from '@/hooks/useFinCategories';
import { calcBalance } from '@/engine/finEngine';
import { getMonthRange } from '@/utils/dateUtils';
import type { Transaction } from '@/types';

type FilterType = 'all' | 'income' | 'expense';
type SortKey = 'date' | 'amount';

export function TransactionList() {
  const { t } = useTranslation();
  const [month, setMonth] = useState(getCurrentMonth());
  const [filter, setFilter] = useState<FilterType>('all');
  const [sortKey, setSortKey] = useState<SortKey>('date');
  const [sortDesc, setSortDesc] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [editTx, setEditTx] = useState<Transaction | null>(null);
  const localeLayout = useUIStore((s) => s.localeLayout);

  const transactions = useTransactionsByMonth(month);
  const categories = useCategories();

  // Category map: id → FinCategory
  const categoryMap = useMemo(() => {
    const map = new Map<string, NonNullable<typeof categories>[number]>();
    (categories ?? []).forEach((c) => map.set(c.id, c));
    return map;
  }, [categories]);

  // Filter + sort
  const filtered = useMemo(() => {
    let list = transactions ?? [];
    if (filter !== 'all') list = list.filter((tx) => tx.type === filter);
    return [...list].sort((a, b) => {
      let cmp = 0;
      if (sortKey === 'date') cmp = a.date.localeCompare(b.date);
      if (sortKey === 'amount') cmp = a.amount - b.amount;
      return sortDesc ? -cmp : cmp;
    });
  }, [transactions, filter, sortKey, sortDesc]);

  // Summary via finEngine
  const summary = useMemo(() => {
    const [from, to] = getMonthRange(month);
    return calcBalance(transactions ?? [], from, to);
  }, [transactions, month]);

  function handleEdit(tx: Transaction) {
    setEditTx(tx);
    setFormOpen(true);
  }

  async function handleDelete(id: string) {
    if (window.confirm('delete this transaction?')) {
      await deleteTransaction(id);
    }
  }

  function handleAddNew() {
    setEditTx(null);
    setFormOpen(true);
  }

  function handleFormClose() {
    setFormOpen(false);
    setEditTx(null);
  }

  function toggleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDesc(!sortDesc);
    } else {
      setSortKey(key);
      setSortDesc(true);
    }
  }

  return (
    <div className="tx-list">
      {/* Header */}
      <div className="tx-list__header">
        <span className="section-label">– {t('finance.transactions.title')}</span>
        <div className="tx-list__controls">
          <MonthNav month={month} onChange={setMonth} />
          <button className="btn-add" onClick={handleAddNew} aria-label={t('finance.transactions.add')}>
            [+ {t('finance.transactions.add')}]
          </button>
        </div>
      </div>

      {/* Filter tabs + Sort */}
      <div className="tx-list__filters">
        <div className="tx-filter-tabs">
          {(
            [
              { key: 'all' as FilterType, label: t('finance.transactions.all') },
              { key: 'income' as FilterType, label: t('finance.transactions.type.income') },
              { key: 'expense' as FilterType, label: t('finance.transactions.type.expense') },
            ] as { key: FilterType; label: string }[]
          ).map(({ key: f, label }) => (
            <button
              key={f}
              className={`tx-filter-tab ${filter === f ? 'active' : ''}`}
              onClick={() => setFilter(f)}
            >
              [{label}]
            </button>
          ))}
        </div>

        <div className="tx-sort">
          <span className="tx-sort__label">{t('finance.transactions.sortBy')}:</span>
          <button
            className={`tx-sort__btn ${sortKey === 'date' ? 'active' : ''}`}
            onClick={() => toggleSort('date')}
          >
            {t('finance.transactions.date')} {sortKey === 'date' ? (sortDesc ? '▾' : '▴') : ''}
          </button>
          <button
            className={`tx-sort__btn ${sortKey === 'amount' ? 'active' : ''}`}
            onClick={() => toggleSort('amount')}
          >
            {t('finance.transactions.amount')} {sortKey === 'amount' ? (sortDesc ? '▾' : '▴') : ''}
          </button>
        </div>
      </div>

      {/* Transaction rows */}
      <div className="tx-list__body" role="table" aria-label="Transactions">
        {filtered.length === 0 ? (
          <div className="tx-list__empty">
            {t('finance.transactions.empty')} for {format(new Date(`${month}-01`), 'MMM yyyy')}
            {filter !== 'all' && ` (filter: ${filter})`}
          </div>
        ) : (
          filtered.map((tx) => (
            <TransactionRow
              key={tx.id}
              tx={tx}
              category={categoryMap.get(tx.categoryId)}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))
        )}
      </div>

      {/* Footer summary */}
      <div className="tx-list__footer">
        <div className="tx-summary">
          <span className={`tx-summary__balance ${summary.balance >= 0 ? 'positive' : 'negative'}`}>
            balance: {summary.balance >= 0 ? '+' : ''}{formatCurrency(summary.balance, localeLayout)}
          </span>
          <span className="tx-summary__sep">·</span>
          <span className="tx-summary__income">income: {formatCurrency(summary.income, localeLayout)}</span>
          <span className="tx-summary__sep">·</span>
          <span className="tx-summary__expense">expense: {formatCurrency(summary.expense, localeLayout)}</span>
          <span className="tx-summary__sep">·</span>
          <span className="tx-summary__count">tx: {filtered.length}</span>
        </div>
      </div>

      {/* Modal Form */}
      <TransactionForm
        isOpen={formOpen}
        onClose={handleFormClose}
        editTx={editTx}
      />
    </div>
  );
}
