// Re-export finance types from the main types barrel.
// F0 placed them in index.ts; this file provides a convenient import path.
export type {
  Transaction,
  FinCategory,
  Budget,
  FinancialGoal,
  BudgetStatus,
  MonthSummary,
  GoalProgress,
  BalanceResult,
  CategoryTotal,
  TopCategory,
  SparklineData,
} from './index';
