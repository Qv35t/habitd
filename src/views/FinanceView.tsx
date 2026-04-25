import { useTranslation } from 'react-i18next';
import { useUIStore } from '@/stores/useUIStore';
import { useHotkeys } from '@/hooks/useHotkeys';
import { FinanceTabBar } from '@/components/finance/FinanceTabBar';
import { TransactionList } from '@/components/finance/TransactionList';
import { GoalsList } from '@/components/finance/GoalsList';
import { MonthOverview } from '@/components/finance/MonthOverview';
import { BudgetEditor } from '@/components/finance/BudgetEditor';
import { CategoryManager } from '@/components/finance/CategoryManager';
import { AnalyticsTab } from '@/components/finance/AnalyticsTab';

export function FinanceView() {
  const { t } = useTranslation();
  const financeTab = useUIStore((s) => s.financeTab);
  const setFinanceTab = useUIStore((s) => s.setFinanceTab);

  // Local hotkeys for Finance tabs
  useHotkeys({
    '1': () => setFinanceTab('overview'),
    '2': () => setFinanceTab('transactions'),
    '3': () => setFinanceTab('budgets'),
    '4': () => setFinanceTab('goals'),
    '5': () => setFinanceTab('analytics'),
  }, [setFinanceTab]);

  return (
    <div className="finance-view">
      <div className="finance-view__header">
        <span className="section-label">– {t('finance.title')}</span>
      </div>

      <FinanceTabBar />

      <div className="finance-view__content">
        {financeTab === 'overview' && (
          <div className="finance-layout">
            <div className="finance-main">
              <MonthOverview />
            </div>
            <div className="finance-sidebar" />
          </div>
        )}
        {financeTab === 'transactions' && (
          <div className="finance-transactions-layout">
            <div className="finance-main">
              <TransactionList />
            </div>
            <div className="finance-filters" />
          </div>
        )}
        {financeTab === 'budgets' && (
          <div className="finance-layout">
            <div className="finance-main">
              <BudgetsTab />
            </div>
            <div className="finance-sidebar" />
          </div>
        )}
        {financeTab === 'goals' && (
          <div className="finance-goals-layout">
            <GoalsList />
          </div>
        )}
        {financeTab === 'analytics' && (
          <div className="finance-layout">
            <div className="finance-main">
              <AnalyticsTab />
            </div>
            <div className="finance-sidebar" />
          </div>
        )}
      </div>
    </div>
  );
}

function BudgetsTab() {
  return (
    <div className="budgets-tab">
      <BudgetEditor month={new Date().toISOString().slice(0, 7)} />
      <hr className="fin-divider" />
      <CategoryManager />
    </div>
  );
}
