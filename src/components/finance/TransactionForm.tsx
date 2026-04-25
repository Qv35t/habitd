import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { useTranslation } from 'react-i18next';
import { useUIStore } from '@/stores/useUIStore';
import { getCurrencyPlaceholder, getCurrencySymbol } from '@/utils/finance';
import { Modal } from '@/components/ui/Modal';
import { useCategories } from '@/hooks/useFinCategories';
import { addTransaction, updateTransaction } from '@/hooks/useTransactions';
import type { Transaction } from '@/types';

interface TransactionFormProps {
  isOpen: boolean;
  onClose: () => void;
  editTx?: Transaction | null;
}

interface FormState {
  date: string;
  type: 'income' | 'expense';
  amount: string;
  categoryId: string;
  note: string;
}

const EMPTY_FORM: FormState = {
  date: format(new Date(), 'yyyy-MM-dd'),
  type: 'expense',
  amount: '',
  categoryId: '',
  note: '',
};

export function TransactionForm({ isOpen, onClose, editTx }: TransactionFormProps) {
  const { t } = useTranslation();
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});
  const [saving, setSaving] = useState(false);
  const localeLayout = useUIStore((s) => s.localeLayout);

  const categories = useCategories();

  // Fill form on open
  useEffect(() => {
    if (!isOpen) return;
    if (editTx) {
      setForm({
        date: editTx.date,
        type: editTx.type,
        amount: String(editTx.amount),
        categoryId: editTx.categoryId,
        note: editTx.note ?? '',
      });
    } else {
      setForm(EMPTY_FORM);
    }
    setErrors({});
  }, [isOpen, editTx]);

  // Filter categories by current type
  const filteredCategories = (categories ?? []).filter(
    (c) => c.type === form.type || c.type === 'both',
  );

  function handleTypeChange(type: 'income' | 'expense') {
    setForm((f) => {
      const validCatIds = (categories ?? [])
        .filter((c) => c.type === type || c.type === 'both')
        .map((c) => c.id);
      return {
        ...f,
        type,
        categoryId: validCatIds.includes(f.categoryId) ? f.categoryId : '',
      };
    });
  }

  function validate(): boolean {
    const newErrors: typeof errors = {};

    if (!/^\d{4}-\d{2}-\d{2}$/.test(form.date)) {
      newErrors.date = 'format: YYYY-MM-DD';
    }

    const amountNum = parseFloat(form.amount);
    if (isNaN(amountNum) || amountNum <= 0) {
      newErrors.amount = 'must be > 0';
    }

    if (!form.categoryId) {
      newErrors.categoryId = 'select a category';
    }

    if (form.note.length > 200) {
      newErrors.note = 'max 200 chars';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  async function handleSave() {
    if (!validate()) return;
    setSaving(true);

    try {
      const payload = {
        date: form.date,
        type: form.type,
        amount: parseFloat(form.amount),
        categoryId: form.categoryId,
        note: form.note.trim() || undefined,
      };

      if (editTx) {
        await updateTransaction(editTx.id, payload);
      } else {
        await addTransaction(payload);
      }
      onClose();
    } catch {
      // Error handled by caller — show generic validation hint
      setErrors({ amount: 'validation failed — check input' });
    } finally {
      setSaving(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Escape') onClose();
    if (e.key === 'Enter' && e.ctrlKey) handleSave();
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={editTx ? t('finance.transactions.edit') : t('finance.transactions.add')}>
      <div className="tx-form" onKeyDown={handleKeyDown}>

        {/* DATE */}
        <div className="tx-form__field">
          <label className="tx-form__label">{t('finance.transactions.date')}</label>
          <input
            className={`tx-form__input ${errors.date ? 'tx-form__input--error' : ''}`}
            type="text"
            value={form.date}
            onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
            placeholder="YYYY-MM-DD"
            maxLength={10}
          />
          {errors.date && <span className="tx-form__error">{errors.date}</span>}
        </div>

        {/* TYPE TOGGLE */}
        <div className="tx-form__field">
          <label className="tx-form__label">{t('finance.transactions.type')}</label>
          <div className="tx-form__toggle">
            <button
              className={`tx-form__toggle-btn ${form.type === 'income' ? 'active' : ''}`}
              onClick={() => handleTypeChange('income')}
              type="button"
            >
              [{t('finance.transactions.type.income')}]
            </button>
            <button
              className={`tx-form__toggle-btn ${form.type === 'expense' ? 'active' : ''}`}
              onClick={() => handleTypeChange('expense')}
              type="button"
            >
              [{t('finance.transactions.type.expense')}]
            </button>
          </div>
        </div>

        {/* AMOUNT */}
        <div className="tx-form__field">
          <label className="tx-form__label">{t('finance.transactions.amount')}</label>
          <div className="tx-form__amount-wrap">
            <input
              className={`tx-form__input ${errors.amount ? 'tx-form__input--error' : ''}`}
              type="number"
              min="0.01"
              step="0.01"
              value={form.amount}
              onChange={(e) => setForm((f) => ({ ...f, amount: e.target.value }))}
              placeholder={getCurrencyPlaceholder(localeLayout)}
              autoFocus={!editTx}
            />
            <span className="tx-form__currency">{getCurrencySymbol(localeLayout)}</span>
          </div>
          {errors.amount && <span className="tx-form__error">{errors.amount}</span>}
        </div>

        {/* CATEGORY */}
        <div className="tx-form__field">
          <label className="tx-form__label">{t('finance.transactions.category')}</label>
          <select
            className={`tx-form__input ${errors.categoryId ? 'tx-form__input--error' : ''}`}
            value={form.categoryId}
            onChange={(e) => setForm((f) => ({ ...f, categoryId: e.target.value }))}
          >
            <option value="">— {t('finance.transactions.category')} —</option>
            {filteredCategories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.symbol} {c.name}
              </option>
            ))}
          </select>
          {errors.categoryId && <span className="tx-form__error">{errors.categoryId}</span>}
        </div>

        {/* NOTE */}
        <div className="tx-form__field">
          <label className="tx-form__label">{t('finance.transactions.note')}</label>
          <textarea
            className={`tx-form__textarea ${errors.note ? 'tx-form__input--error' : ''}`}
            value={form.note}
            onChange={(e) => setForm((f) => ({ ...f, note: e.target.value }))}
            placeholder="optional, max 200 chars"
            maxLength={200}
            rows={2}
          />
          <span className="tx-form__hint">{form.note.length}/200</span>
          {errors.note && <span className="tx-form__error">{errors.note}</span>}
        </div>

        {/* ACTIONS */}
        <div className="tx-form__actions">
          <button
            className="btn-primary"
            onClick={handleSave}
            disabled={saving}
            type="button"
          >
            {saving ? `${t('common.save')}...` : t('finance.transactions.save')}
          </button>
          <button
            className="btn-secondary"
            onClick={onClose}
            type="button"
          >
            {t('finance.transactions.cancel')}
          </button>
          <span className="tx-form__hint-key">ctrl+enter to save</span>
        </div>
      </div>
    </Modal>
  );
}
