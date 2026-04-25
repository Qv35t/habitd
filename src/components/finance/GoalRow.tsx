import { useTranslation } from 'react-i18next';
import { format, parseISO } from 'date-fns';
import { useUIStore } from '@/stores/useUIStore';
import { formatCurrency } from '@/utils/finance';
import { calcGoalProgress, renderProgressBar } from '@/engine/finEngine';
import type { FinancialGoal } from '@/types';

interface GoalRowProps {
  goal: FinancialGoal;
  today: string;
  onEdit: (goal: FinancialGoal) => void;
  onAddFunds: (goal: FinancialGoal) => void;
  onComplete: (id: string) => void;
  onCancel: (id: string) => void;
  onDelete: (id: string) => void;
}

function getStatusInfo(
  progress: ReturnType<typeof calcGoalProgress>,
  status: FinancialGoal['status'],
  t: (key: string) => string,
): { label: string; className: string } {
  if (status === 'completed' || progress.percent >= 100) {
    return { label: `★ ${t('finance.goals.completed')}`, className: 'goal-status-done' };
  }
  if (status === 'cancelled') {
    return { label: `✗ ${t('finance.goals.cancelled')}`, className: 'goal-status-cancel' };
  }
  if (!progress.onTrack) {
    return { label: `⚠ ${t('finance.goals.behind')}`, className: 'goal-status-behind' };
  }
  return { label: `${t('finance.goals.onTrack')} ✓`, className: 'goal-status-ok' };
}

export function GoalRow({ goal, today, onEdit, onAddFunds, onComplete, onCancel, onDelete }: GoalRowProps) {
  const { t } = useTranslation();
  const progress = calcGoalProgress(goal, today);
  const localeLayout = useUIStore((s) => s.localeLayout);
  const { label, className } = getStatusInfo(progress, goal.status, t);
  const isActive = goal.status === 'active';
  const isCompleted = goal.status === 'completed' || progress.percent >= 100;

  const deadlineLabel = goal.deadline
    ? `${t('finance.goals.deadline')}: ${format(parseISO(goal.deadline), 'MMM yyyy')}`
    : null;

  return (
    <div className={`goal-row ${!isActive ? 'goal-row--inactive' : ''}`}>
      <div className="goal-row__header">
        <div className="goal-row__title">
          <span className="goal-row__symbol">◆</span>
          <span className="goal-row__name">{goal.name}</span>
          <span className="goal-row__bar">
            {renderProgressBar(progress.percent)} {Math.round(progress.percent)}%
          </span>
        </div>

        {isActive && (
          <div className="goal-row__menu-wrap">
            <button
              className="goal-row__menu-btn"
              onClick={() => onEdit(goal)}
              aria-label="Goal actions"
            >
              [···]
            </button>
            <div className="goal-row__menu">
              <button className="goal-row__menu-item" onClick={() => onEdit(goal)}>
                [{t('finance.transactions.edit')}]
              </button>
              <button className="goal-row__menu-item" onClick={() => onAddFunds(goal)}>
                [{t('finance.goals.addFunds')}]
              </button>
              {!isCompleted && (
                <button className="goal-row__menu-item" onClick={() => onComplete(goal.id)}>
                  [{t('finance.goals.complete')}]
                </button>
              )}
              <button className="goal-row__menu-item" onClick={() => onCancel(goal.id)}>
                [{t('finance.goals.cancel')}]
              </button>
              <button className="goal-row__menu-item goal-row__menu-item--danger" onClick={() => onDelete(goal.id)}>
                [{t('finance.transactions.delete')}]
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="goal-row__meta">
        <span>
          {formatCurrency(goal.currentAmount, localeLayout)} / {formatCurrency(goal.targetAmount, localeLayout)}
        </span>
        {deadlineLabel && <span>{deadlineLabel}</span>}
        <span className={className}>{label}</span>
      </div>
    </div>
  );
}
