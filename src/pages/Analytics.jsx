import DashboardLayout from '../layouts/DashboardLayout';
import useAnalytics from '../hooks/useAnalytics';
import useExpenses from '../hooks/useExpenses';
import useIncome from '../hooks/useIncome';
import FinancialSummary from '../components/analytics/FinancialSummary';
import MonthlyCashFlowChart from '../components/analytics/MonthlyCashFlowChart';
import ExpenseCategoryPieChart from '../components/analytics/ExpenseCategoryPieChart';
import IncomeCategoryPieChart from '../components/analytics/IncomeCategoryPieChart';
import MonthlyTrend from '../components/analytics/MonthlyTrend';
import RecentTransactions from '../components/analytics/RecentTransactions';
import CategoryBreakdown from '../components/analytics/CategoryBreakdown';
import AnalyticsEmptyState from '../components/analytics/AnalyticsEmptyState';
import GoalAnalytics from '../components/analytics/GoalAnalytics';

// ── Inner page — consumes all three contexts ───────────────────────────────

function AnalyticsInner() {
  const { analytics, loading } = useAnalytics();
  const { expenses }           = useExpenses();
  const { income }             = useIncome();

  const hasData     = expenses.length > 0 || income.length > 0;
  const hasExpenses = expenses.length > 0;
  const hasIncome   = income.length  > 0;

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white">Analytics</h1>
        <p className="mt-1 text-sm text-slate-500">
          Insights and trends across your income and expenses.
        </p>
      </div>

      {/* Empty state — no data at all */}
      {!hasData && !loading && (
        <AnalyticsEmptyState hasIncome={hasIncome} hasExpenses={hasExpenses} />
      )}

      {/* 1. Financial Summary — show as soon as any data exists */}
      {hasData && <FinancialSummary />}

      {/* Goal Analytics */}
      <GoalAnalytics />

      {/* 2. Monthly Cash Flow — both needed for meaningful bars */}
      {hasData && <MonthlyCashFlowChart />}

      {/* 3 & 4. Pie charts — side by side on lg */}
      {hasData && (
        <div className="grid gap-6 lg:grid-cols-2">
          <ExpenseCategoryPieChart />
          <IncomeCategoryPieChart />
        </div>
      )}

      {/* 5. Monthly Trend */}
      {hasData && <MonthlyTrend />}

      {/* 6. Bottom row: Category Breakdown + Recent Transactions */}
      {hasData && (
        <div className="grid gap-6 lg:grid-cols-2">
          <CategoryBreakdown />
          <RecentTransactions />
        </div>
      )}
    </div>
  );
}

// ── Page ───────────────────────────────────────────────────────────────────

/**
 * Analytics — protected analytics dashboard page.
 *
 * ExpenseContext, IncomeContext and AnalyticsContext are all provided by App.jsx.
 */
export default function Analytics() {
  return (
    <DashboardLayout>
      <AnalyticsInner />
    </DashboardLayout>
  );
}
