import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useUIStore } from '@/stores/useUIStore';
import { getCurrencySymbol } from '@/utils/finance';
import { Modal } from '@/components/ui/Modal';
import type { FinancialGoal } from '@/types';

interface GoalFormData {
  name: string;
  targetAmount: number;
  currentAmount: number;
  deadline: string;
}

interface GoalFormProps {
  mode: 'add' | 'edit';
  goal?: FinancialGoal;
  onSave: (data: Omit<FinancialGoal, 'id' | 'status' | 'createdAt'>) => Promise<void>;
  onClose: () => void;
}

const EMPTY: GoalFormData = { name: '', targetAmount: 0, currentAmount: 0, deadline: '' };

export function GoalForm({ mode, goal, onSave, onClose }: GoalFormProps) {
  const { t } = useTranslation();
  const [form, setForm] = useState<GoalFormData>(
    goal
      ? { name: goal.name, targetAmount: goal.targetAmount, currentAmount: goal.currentAmount, deadline: goal.deadline ?? '' }
      : EMPTY,
  );
  const [errors, setErrors] = useState<Partial<Record<keyof GoalFormData, string>>>({});
  const [saving, setSaving] = useState(false);
  const localeLayout = useUIStore((s) => s.localeLayout);

  function validate(): boolean {
    const e: typeof errors = {};
    if (!form.name.trim()) e.name = 'name is required';
    if (form.name.length > 80) e.name = 'max 80 characters';
    if (form.targetAmount <= 0) e.targetAmount = 'must be > 0';
    if (form.currentAmount < 0) e.currentAmount = 'cannot be negative';
    if (form.currentAmount > form.targetAmount) e.currentAmount = 'cannot exceed target amount';
    if (form.deadline && !/^\d{4}-\d{2}-\d{2}$/.test(form.deadline)) {
      e.deadline = 'use YYYY-MM-DD format';
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    setSaving(true);
    try {
      await onSave({
        name: form.name.trim(),
        targetAmount: form.targetAmount,
        currentAmount: form.currentAmount,
        deadline: form.deadline || undefined,
      });
      onClose();
    } catch {
      // Error handled by caller
    } finally {
      setSaving(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Escape') onClose();
    if (e.key === 'Enter' && e.ctrlKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  }

  return (
    <Modal isOpen={true} onClose={onClose} title={mode === 'edit' ? t('finance.goals.edit') : t('finance.goals.add')}>
      <form className="goal-form" onSubmit={handleSubmit} onKeyDown={handleKeyDown}>
        {/* NAME */}
        <div className="goal-form__field">
          <label className="goal-form__label">{t('finance.goals.name')}</label>
          <input
            className={`goal-form__input ${errors.name ? 'goal-form__input--error' : ''}`}
            type="text"
            value={form.name}
            onChange={(e) => { setForm((f) => ({ ...f, name: e.target.value })); setErrors((er) => ({ ...er, name: undefined })); }}
            placeholder="e.g. Emergency fund"
            maxLength={80}
            autoFocus
          />
          {errors.name && <span className="goal-form__error">{errors.name}</span>}
        </div>

        {/* TARGET AMOUNT */}
        <div className="goal-form__field">
          <label className="goal-form__label">{t('finance.goals.target')}</label>
          <div className="goal-form__amount-wrap">
            <input
              className={`goal-form__input ${errors.targetAmount ? 'goal-form__input--error' : ''}`}
              type="number"
              min={1}
              step={1}
              value={form.targetAmount || ''}
              onChange={(e) => { setForm((f) => ({ ...f, targetAmount: parseFloat(e.target.value) || 0 })); setErrors((er) => ({ ...er, targetAmount: undefined })); }}
            />
            <span className="goal-form__currency">{getCurrencySymbol(localeLayout)}</span>
          </div>
          {errors.targetAmount && <span className="goal-form__error">{errors.targetAmount}</span>}
        </div>

        {/* CURRENT AMOUNT */}
        <div className="goal-form__field">
          <label className="goal-form__label">{t('finance.goals.current')}</label>
          <div className="goal-form__amount-wrap">
            <input
              className={`goal-form__input ${errors.currentAmount ? 'goal-form__input--error' : ''}`}
              type="number"
              min={0}
              step={1}
              value={form.currentAmount || ''}
              onChange={(e) => { setForm((f) => ({ ...f, currentAmount: parseFloat(e.target.value) || 0 })); setErrors((er) => ({ ...er, currentAmount: undefined })); }}
            />
            <span className="goal-form__currency">{getCurrencySymbol(localeLayout)}</span>
          </div>
          {errors.currentAmount && <span className="goal-form__error">{errors.currentAmount}</span>}
        </div>

        {/* DEADLINE */}
        <div className="goal-form__field">
          <label className="goal-form__label">{t('finance.goals.deadline')} <span className="goal-form__optional">(optional)</span></label>
          <input
            className={`goal-form__input ${errors.deadline ? 'goal-form__input--error' : ''}`}
            type="text"
            value={form.deadline}
            onChange={(e) => { setForm((f) => ({ ...f, deadline: e.target.value })); setErrors((er) => ({ ...er, deadline: undefined })); }}
            placeholder="YYYY-MM-DD"
            maxLength={10}
          />
          {errors.deadline && <span className="goal-form__error">{errors.deadline}</span>}
        </div>

        {/* ACTIONS */}
        <div className="goal-form__actions">
          <button className="btn-primary" type="submit" disabled={saving}>
            {saving ? `${t('common.save')}...` : t('common.save')}
          </button>
          <button className="btn-secondary" type="button" onClick={onClose}>
            {t('common.cancel')}
          </button>
          <span className="goal-form__hint">ctrl+enter to save</span>
        </div>
      </form>
    </Modal>
  );
}
