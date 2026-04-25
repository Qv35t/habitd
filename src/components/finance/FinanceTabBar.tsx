import { useTranslation } from 'react-i18next';
import { useUIStore, type FinanceTab } from '@/stores/useUIStore';

/** Tab bar for switching between finance sub-sections. */
export function FinanceTabBar() {
  const { t } = useTranslation();
  const financeTab = useUIStore((s) => s.financeTab);
  const setFinanceTab = useUIStore((s) => s.setFinanceTab);

  return (
    <div className="fin-tabbar" role="tablist" aria-label="Finance sections">
      {(['overview', 'transactions', 'budgets', 'goals', 'analytics'] as FinanceTab[]).map((tabId) => (
        <button
          key={tabId}
          role="tab"
          aria-selected={financeTab === tabId}
          aria-controls={`fin-panel-${tabId}`}
          className={`fin-tabbar__tab ${financeTab === tabId ? 'fin-tabbar__tab--active' : ''}`}
          onClick={() => setFinanceTab(tabId)}
        >
          {financeTab === tabId ? `[${t(`finance.tabs.${tabId}`)}]` : ` ${t(`finance.tabs.${tabId}`)} `}
        </button>
      ))}
    </div>
  );
}
