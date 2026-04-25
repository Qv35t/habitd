import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { format } from 'date-fns';
import { GoalRow } from './GoalRow';
import { GoalForm } from './GoalForm';
import { AddFundsModal } from './AddFundsModal';
import {
  useActiveGoals,
  useCompletedGoals,
  addGoal,
  updateGoal,
  deleteGoal,
  completeGoal,
  cancelGoal,
} from '@/hooks/useFinancialGoals';
import type { FinancialGoal } from '@/types';

export function GoalsList() {
  const { t } = useTranslation();
  const activeGoals = useActiveGoals() ?? [];
  const completedGoals = useCompletedGoals() ?? [];
  const today = format(new Date(), 'yyyy-MM-dd');

  const [showCompleted, setShowCompleted] = useState(false);
  const [formMode, setFormMode] = useState<'add' | 'edit' | null>(null);
  const [editTarget, setEditTarget] = useState<FinancialGoal | null>(null);
  const [fundsTarget, setFundsTarget] = useState<FinancialGoal | null>(null);

  // ─── Handlers ────────────────────────────────────────────────────

  function handleAddNew() {
    setEditTarget(null);
    setFormMode('add');
  }

  function handleEdit(goal: FinancialGoal) {
    setEditTarget(goal);
    setFormMode('edit');
  }

  function handleAddFunds(goal: FinancialGoal) {
    setFundsTarget(goal);
  }

  async function handleSave(data: Omit<FinancialGoal, 'id' | 'status' | 'createdAt'>) {
    if (formMode === 'edit' && editTarget) {
      await updateGoal(editTarget.id, data);
    } else {
      await addGoal(data);
    }
    setFormMode(null);
    setEditTarget(null);
  }

  function handleCloseForm() {
    setFormMode(null);
    setEditTarget(null);
  }

  return (
    <div className="goals-list">
      <div className="goals-list__header">
        <span className="section-label">{"– " + t('finance.goals.title')}</span>
        <button className="btn-add" onClick={handleAddNew}>{"[+ " + t('finance.goals.add') + ']'}</button>
      </div>

      {/* Active goals */}
      {activeGoals.length === 0 ? (
        <div className="goals-list__empty">
          <p className="text-muted">{t('finance.goals.empty')}</p>
          <p className="text-muted">track your savings and big purchases</p>
        </div>
      ) : (
        <div className="goals-list__body">
          {activeGoals.map((goal) => (
            <GoalRow
              key={goal.id}
              goal={goal}
              today={today}
              onEdit={handleEdit}
              onAddFunds={handleAddFunds}
              onComplete={completeGoal}
              onCancel={cancelGoal}
              onDelete={deleteGoal}
            />
          ))}
        </div>
      )}

      {/* Completed goals section */}
      {completedGoals.length > 0 && (
        <div className="goals-list__completed">
          <button
            className="goals-list__completed-toggle"
            onClick={() => setShowCompleted(!showCompleted)}
          >
            {showCompleted ? '▾' : '▸'} completed goals [{completedGoals.length}]
          </button>
          {showCompleted && (
            <div className="goals-list__completed-body">
              {completedGoals.map((goal) => (
                <GoalRow
                  key={goal.id}
                  goal={goal}
                  today={today}
                  onEdit={handleEdit}
                  onAddFunds={handleAddFunds}
                  onComplete={completeGoal}
                  onCancel={cancelGoal}
                  onDelete={deleteGoal}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Modals */}
      {formMode && (
        <GoalForm
          mode={formMode}
          goal={editTarget ?? undefined}
          onSave={handleSave}
          onClose={handleCloseForm}
        />
      )}

      {fundsTarget && (
        <AddFundsModal
          goal={fundsTarget}
          onClose={() => setFundsTarget(null)}
        />
      )}
    </div>
  );
}
