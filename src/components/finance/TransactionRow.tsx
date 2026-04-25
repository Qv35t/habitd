import { useState, useRef, useEffect } from 'react';
import { format, parseISO } from 'date-fns';
import { useTranslation } from 'react-i18next';
import { useUIStore } from '@/stores/useUIStore';
import { formatCurrency } from '@/utils/finance';
import type { Transaction, FinCategory } from '@/types';

interface TransactionRowProps {
  tx: Transaction;
  category: FinCategory | undefined;
  onEdit: (tx: Transaction) => void;
  onDelete: (id: string) => void;
}

export function TransactionRow({ tx, category, onEdit, onDelete }: TransactionRowProps) {
  const { t } = useTranslation();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const localeLayout = useUIStore((s) => s.localeLayout);

  // Close menu on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    if (menuOpen) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [menuOpen]);

  const dateStr = format(parseISO(tx.date), 'dd MMM');
  const symbol = category?.symbol ?? '·';
  const catName = category?.name ?? '—';
  const sign = tx.type === 'income' ? '+' : '-';
  const amountStr = `${sign} ${formatCurrency(tx.amount, localeLayout)}`;
  const amountClass = tx.type === 'income' ? 'tx-income' : 'tx-expense';

  function handleContextMenu(e: React.MouseEvent) {
    e.preventDefault();
    setMenuOpen(true);
  }

  return (
    <div
      className="tx-row"
      onContextMenu={handleContextMenu}
      role="row"
      aria-label={`${catName} ${amountStr}`}
    >
      <span className="tx-date">{dateStr}</span>

      <span className="tx-category">
        <span className="tx-symbol">{symbol}</span>
        <span className="tx-catname">{catName}</span>
      </span>

      <span className={`tx-amount ${amountClass}`}>{amountStr}</span>

      <span className="tx-note">{tx.note ?? ''}</span>

      <div className="tx-menu-wrap" ref={menuRef}>
        <button
          className="tx-menu-btn"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Transaction actions"
        >
          [···]
        </button>

        {menuOpen && (
          <div className="tx-context-menu" role="menu">
            <button
              className="tx-context-item"
              role="menuitem"
              onClick={() => { onEdit(tx); setMenuOpen(false); }}
            >
              {t('finance.transactions.edit')}
            </button>
            <button
              className="tx-context-item tx-context-item--danger"
              role="menuitem"
              onClick={() => { onDelete(tx.id); setMenuOpen(false); }}
            >
              {t('finance.transactions.delete')}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
