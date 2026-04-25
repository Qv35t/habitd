import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useUIStore } from '@/stores/useUIStore';
import { formatCurrency, getCurrencyPlaceholder } from '@/utils/finance';
import { Modal } from '@/components/ui/Modal';
import { calcGoalProgress, renderProgressBar } from '@/engine/finEngine';
import { addFundsToGoal } from '@/hooks/useFinancialGoals';
import type { FinancialGoal } from '@/types';

interface AddFundsModalProps {
  goal: FinancialGoal;
  onClose: () => void;
}

export function AddFundsModal({ goal, onClose }: AddFundsModalProps) {
  const { t } = useTranslation();
  const [amount, setAmount] = useState('');
  const [error, setError] = useState<string | null>(null);
  const localeLayout = useUIStore((s) => s.localeLayout);
  const progress = calcGoalProgress(goal, new Date().toISOString().slice(0, 10));
  const wouldComplete = goal.currentAmount + parseFloat(amount || '0') >= goal.targetAmount;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const num = parseFloat(amount);
    if (isNaN(num) || num <= 0) {
      setError('must be > 0');
      return;
    }
    setError(null);
    try {
      await addFundsToGoal(goal.id, num);
      onClose();
    } catch {
      setError('failed to add funds');
    }
  }

  return (
    <Modal isOpen={true} onClose={onClose} title={`${t('finance.goals.addFunds')}: ${goal.name}`}>
      <div className="add-funds-modal">
        <div className="add-funds__progress">
          <span className="add-funds__bar">{renderProgressBar(progress.percent)}</span>
          <span className="add-funds__pct">{Math.round(progress.percent)}%</span>
        </div>
        <div className="add-funds__amounts">
          <span>{t('finance.goals.current')}: {formatCurrency(goal.currentAmount, localeLayout)}</span>
          <span>{t('finance.goals.target')}: {formatCurrency(goal.targetAmount, localeLayout)}</span>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="add-funds__field">
            <label className="goal-form__label">{t('finance.transactions.amount')}</label>
            <div className="goal-form__amount-wrap">
              <input
                className={`goal-form__input ${error ? 'goal-form__input--error' : ''}`}
                type="number"
                min={1}
                step={1}
                value={amount}
                onChange={(e) => { setAmount(e.target.value); setError(null); }}
                placeholder={getCurrencyPlaceholder(localeLayout)}
                autoFocus
              />
            </div>
            {error && <span className="goal-form__error">{error}</span>}
          </div>

          {wouldComplete && (
            <div className="add-funds__complete">★ {t('finance.goals.completed')}!</div>
          )}

          <div className="goal-form__actions">
            <button className="btn-primary" type="submit">[+ {t('finance.goals.addFunds')}]</button>
            <button className="btn-secondary" type="button" onClick={onClose}>[{t('common.cancel')}]</button>
          </div>
        </form>
      </div>
    </Modal>
  );
}
