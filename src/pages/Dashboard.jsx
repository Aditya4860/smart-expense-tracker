import { useState, useCallback, memo } from 'react';
import DashboardLayout from '../layouts/DashboardLayout';
import WelcomeCard from '../components/dashboard/WelcomeCard';
import SummaryCards from '../components/dashboard/SummaryCards';
import QuickActions from '../components/dashboard/QuickActions';
import BudgetOverviewWidget from '../components/dashboard/BudgetOverviewWidget';
import BudgetAlertWidget from '../components/dashboard/BudgetAlertWidget';
import BudgetProgressWidget from '../components/dashboard/BudgetProgressWidget';
import RecentTransactions from '../components/analytics/RecentTransactions';
import ExpenseModal from '../components/expenses/ExpenseModal';
import ExpenseForm from '../components/expenses/ExpenseForm';
import IncomeModal from '../components/income/IncomeModal';
import IncomeForm from '../components/income/IncomeForm';
import BudgetModal from '../components/budget/BudgetModal';
import BudgetForm from '../components/budget/BudgetForm';
import Card from '../components/ui/Card';
import useExpenses from '../hooks/useExpenses';
import useIncome from '../hooks/useIncome';
import useAnalytics from '../hooks/useAnalytics';
import useBudget from '../hooks/useBudget';
import { CATEGORY_MAP } from '../constants/expenseCategories';

// ── Formatter ──────────────────────────────────────────────────────────────

const amountFmt = new Intl.NumberFormat('en-IN', {
  style:                 'currency',
  currency:              'INR',
  maximumFractionDigits: 0,
});

// ── Widget: Top Spending Category ──────────────────────────────────────────

const TopSpendingCategory = memo(function TopSpendingCategory({ analytics }) {
  const top = analytics.topExpenseCategories[0];
  const cat = top ? (CATEGORY_MAP[top.category] ?? { name: top.category, icon: '📦', bg: 'bg-slate-500/15', color: 'text-slate-400' }) : null;

  return (
    <Card padding="md" className="flex flex-col gap-3">
      <p className="text-xs font-medium uppercase tracking-wider text-slate-500">
        Top Spending Category
      </p>
      {cat ? (
        <>
          <div className="flex items-center gap-3">
            <div className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl text-lg ${cat.bg} ${cat.color}`} aria-hidden="true">
              {cat.icon}
            </div>
            <div className="min-w-0">
              <p className="text-base font-semibold text-white truncate">{cat.name}</p>
              <p className="text-xs text-slate-500">{top.count} {top.count === 1 ? 'transaction' : 'transactions'}</p>
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-xl font-bold tabular-nums text-danger-400">{amountFmt.format(top.total)}</span>
            <span className="text-xs text-slate-500">{top.share}% of spend</span>
          </div>
          <div className="h-1 w-full overflow-hidden rounded-full bg-surface-700" aria-hidden="true">
            <div className="h-full rounded-full bg-danger-500/60" style={{ width: `${top.share}%` }} />
          </div>
        </>
      ) : (
        <p className="text-sm text-slate-600 py-4 text-center">No expense data yet.</p>
      )}
    </Card>
  );
});

// ── Widget: Highest Income Source ──────────────────────────────────────────

const HighestIncomeSource = memo(function HighestIncomeSource({ analytics }) {
  const top = analytics.topIncomeSources[0];

  return (
    <Card padding="md" className="flex flex-col gap-3">
      <p className="text-xs font-medium uppercase tracking-wider text-slate-500">
        Highest Income Source
      </p>
      {top ? (
        <>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-success-500/15 text-xl" aria-hidden="true">
              💰
            </div>
            <div className="min-w-0">
              <p className="text-base font-semibold text-white truncate">{top.source}</p>
              <p className="text-xs text-slate-500">{top.count} {top.count === 1 ? 'record' : 'records'}</p>
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-xl font-bold tabular-nums text-success-400">{amountFmt.format(top.total)}</span>
            <span className="text-xs text-slate-500">{top.share}% of income</span>
          </div>
          <div className="h-1 w-full overflow-hidden rounded-full bg-surface-700" aria-hidden="true">
            <div className="h-full rounded-full bg-success-500/60" style={{ width: `${top.share}%` }} />
          </div>
        </>
      ) : (
        <p className="text-sm text-slate-600 py-4 text-center">No income data yet.</p>
      )}
    </Card>
  );
});

// ── Widget: Monthly Net Savings ────────────────────────────────────────────

const MonthlyNetSavings = memo(function MonthlyNetSavings({ analytics }) {
  const now       = new Date();
  const ymNow     = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  const thisMonth = analytics.monthlyTotals.find(m => m.month === ymNow);
  const netSav    = thisMonth ? thisMonth.balance : 0;
  const isPos     = netSav >= 0;

  return (
    <Card padding="md" className="flex flex-col gap-3">
      <p className="text-xs font-medium uppercase tracking-wider text-slate-500">
        This Month's Net Savings
      </p>
      <div className="flex items-center gap-3">
        <div className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl ${isPos ? 'bg-primary-500/15' : 'bg-danger-500/15'}`} aria-hidden="true">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={`h-5 w-5 ${isPos ? 'text-primary-400' : 'text-danger-400'}`} aria-hidden="true">
            {isPos
              ? <path fillRule="evenodd" d="M10 17a.75.75 0 0 1-.75-.75V5.612L5.29 9.77a.75.75 0 0 1-1.08-1.04l5.25-5.5a.75.75 0 0 1 1.08 0l5.25 5.5a.75.75 0 1 1-1.08 1.04l-3.96-4.158V16.25A.75.75 0 0 1 10 17Z" clipRule="evenodd" />
              : <path fillRule="evenodd" d="M10 3a.75.75 0 0 1 .75.75v8.69l3.22-3.22a.75.75 0 1 1 1.06 1.06l-4.5 4.5a.75.75 0 0 1-1.06 0l-4.5-4.5a.75.75 0 0 1 1.06-1.06l3.22 3.22V3.75A.75.75 0 0 1 10 3Z" clipRule="evenodd" />
            }
          </svg>
        </div>
        <div className="min-w-0">
          <p className={`text-2xl font-bold tabular-nums ${isPos ? 'text-white' : 'text-danger-400'}`}>
            {amountFmt.format(Math.abs(netSav))}
          </p>
          <p className="text-xs text-slate-500">{isPos ? 'Saved this month' : 'Over budget this month'}</p>
        </div>
      </div>
      {thisMonth && (
        <div className="grid grid-cols-2 gap-2 pt-1">
          <div className="rounded-lg bg-success-500/10 px-3 py-1.5">
            <p className="text-[10px] text-slate-500">Income</p>
            <p className="text-sm font-semibold tabular-nums text-success-400">{amountFmt.format(thisMonth.income)}</p>
          </div>
          <div className="rounded-lg bg-danger-500/10 px-3 py-1.5">
            <p className="text-[10px] text-slate-500">Expenses</p>
            <p className="text-sm font-semibold tabular-nums text-danger-400">{amountFmt.format(thisMonth.expense)}</p>
          </div>
        </div>
      )}
    </Card>
  );
});

// ── Inner page ─────────────────────────────────────────────────────────────

function DashboardInner() {
  const { addExpense } = useExpenses();
  const { addIncome  } = useIncome();
  const { analytics  } = useAnalytics();
  const { addBudget  } = useBudget();

  const [expenseOpen,  setExpenseOpen]  = useState(false);
  const [incomeOpen,   setIncomeOpen]   = useState(false);
  const [budgetOpen,   setBudgetOpen]   = useState(false);
  const [savingExp,    setSavingExp]    = useState(false);
  const [savingInc,    setSavingInc]    = useState(false);
  const [savingBud,    setSavingBud]    = useState(false);

  const handleAddExpense = useCallback((values) => {
    setSavingExp(true);
    addExpense(values);
    setSavingExp(false);
    setExpenseOpen(false);
  }, [addExpense]);

  const handleAddIncome = useCallback((values) => {
    setSavingInc(true);
    addIncome(values);
    setSavingInc(false);
    setIncomeOpen(false);
  }, [addIncome]);

  const handleAddBudget = useCallback((values) => {
    setSavingBud(true);
    addBudget({ ...values, spent: 0 });
    setSavingBud(false);
    setBudgetOpen(false);
  }, [addBudget]);

  return (
    <>
      <div className="space-y-6">

        {/* Greeting + financial health + budget alerts badge */}
        <WelcomeCard />

        {/* Six KPI cards (4 financial + 2 budget) */}
        <SummaryCards />

        {/* Seven shortcut buttons */}
        <QuickActions
          onAddExpense={() => setExpenseOpen(true)}
          onAddIncome={() => setIncomeOpen(true)}
          onAddBudget={() => setBudgetOpen(true)}
        />

        {/* Widgets row — 3 small analytics cards */}
        <div className="grid gap-4 sm:grid-cols-3">
          <TopSpendingCategory analytics={analytics} />
          <HighestIncomeSource analytics={analytics} />
          <MonthlyNetSavings   analytics={analytics} />
        </div>

        {/* Budget intelligence row */}
        <div className="grid gap-4 lg:grid-cols-3">
          <BudgetOverviewWidget />
          <BudgetProgressWidget />
          <BudgetAlertWidget />
        </div>

        {/* Bottom row — recent transactions */}
        <RecentTransactions />
      </div>

      {/* ── Modals ─────────────────────────────────────────────────────── */}
      <ExpenseModal isOpen={expenseOpen} onClose={() => setExpenseOpen(false)} title="Add Expense">
        <ExpenseForm onSubmit={handleAddExpense} onCancel={() => setExpenseOpen(false)} loading={savingExp} />
      </ExpenseModal>

      <IncomeModal isOpen={incomeOpen} onClose={() => setIncomeOpen(false)} title="Add Income">
        <IncomeForm onSubmit={handleAddIncome} onCancel={() => setIncomeOpen(false)} loading={savingInc} />
      </IncomeModal>

      <BudgetModal isOpen={budgetOpen} onClose={() => setBudgetOpen(false)} title="Add Budget">
        <BudgetForm onSubmit={handleAddBudget} onCancel={() => setBudgetOpen(false)} loading={savingBud} />
      </BudgetModal>
    </>
  );
}

// ── Page ───────────────────────────────────────────────────────────────────

/**
 * Dashboard — authenticated landing page.
 *
 * Contexts (ExpenseContext, IncomeContext, AnalyticsContext, BudgetContext)
 * are provided by App.jsx above the route tree.
 */
export default function Dashboard() {
  return (
    <DashboardLayout>
      <DashboardInner />
    </DashboardLayout>
  );
}
