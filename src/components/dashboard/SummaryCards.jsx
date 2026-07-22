import { memo, useMemo } from 'react';
import useAnalytics from '../../hooks/useAnalytics';
import useBudget from '../../hooks/useBudget';
import useGoals from '../../hooks/useGoals';
import { formatCurrency } from '../../utils/formatters';
import { computeBudgetStats } from '../../utils/budgetUtils';
import Card from '../ui/Card';


// ── Trend indicator ────────────────────────────────────────────────────────

function TrendArrow({ positive }) {
  return positive ? (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="h-3.5 w-3.5" aria-hidden="true">
      <path fillRule="evenodd" d="M8 14a.75.75 0 0 1-.75-.75V4.56L4.03 7.78a.75.75 0 0 1-1.06-1.06l4.5-4.5a.75.75 0 0 1 1.06 0l4.5 4.5a.75.75 0 1 1-1.06 1.06L8.75 4.56v8.69A.75.75 0 0 1 8 14Z" clipRule="evenodd" />
    </svg>
  ) : (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="h-3.5 w-3.5" aria-hidden="true">
      <path fillRule="evenodd" d="M8 2a.75.75 0 0 1 .75.75v8.69l3.22-3.22a.75.75 0 1 1 1.06 1.06l-4.5 4.5a.75.75 0 0 1-1.06 0l-4.5-4.5a.75.75 0 0 1 1.06-1.06l3.22 3.22V2.75A.75.75 0 0 1 8 2Z" clipRule="evenodd" />
    </svg>
  );
}

// ── Icons (module-level — never recreated) ─────────────────────────────────

const ICONS = {
  balance: (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5" aria-hidden="true">
      <path d="M1 4.25a3.733 3.733 0 0 1 2.25-.75h13.5c.844 0 1.623.279 2.25.75A2.25 2.25 0 0 0 16.75 2H3.25A2.25 2.25 0 0 0 1 4.25ZM1 7.25a3.733 3.733 0 0 1 2.25-.75h13.5c.844 0 1.623.279 2.25.75A2.25 2.25 0 0 0 16.75 5H3.25A2.25 2.25 0 0 0 1 7.25ZM7 8a1 1 0 0 1 1 1 2 2 0 1 0 4 0 1 1 0 0 1 1-1h3.75A2.25 2.25 0 0 1 19 10.25v5.5A2.25 2.25 0 0 1 16.75 18H3.25A2.25 2.25 0 0 1 1 15.75v-5.5A2.25 2.25 0 0 1 3.25 8H7Z" />
    </svg>
  ),
  income: (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5" aria-hidden="true">
      <path fillRule="evenodd" d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm.75-11.25a.75.75 0 0 0-1.5 0v2.5h-2.5a.75.75 0 0 0 0 1.5h2.5v2.5a.75.75 0 0 0 1.5 0v-2.5h2.5a.75.75 0 0 0 0-1.5h-2.5v-2.5Z" clipRule="evenodd" />
    </svg>
  ),
  expense: (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5" aria-hidden="true">
      <path fillRule="evenodd" d="M2.5 4A1.5 1.5 0 0 0 1 5.5V6h18v-.5A1.5 1.5 0 0 0 17.5 4h-15ZM19 8.5H1v6A1.5 1.5 0 0 0 2.5 16h15a1.5 1.5 0 0 0 1.5-1.5v-6ZM3 13.25a.75.75 0 0 1 .75-.75h1.5a.75.75 0 0 1 0 1.5h-1.5a.75.75 0 0 1-.75-.75Zm4.75-.75a.75.75 0 0 0 0 1.5h3.5a.75.75 0 0 0 0-1.5h-3.5Z" clipRule="evenodd" />
    </svg>
  ),
  savings: (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5" aria-hidden="true">
      <path fillRule="evenodd" d="M13.5 4.938a7 7 0 1 1-9.006 1.737c.202-.257.59-.218.793.039.278.352.594.672.943.954.332.269.786-.049.8-.476.067-2.134.48-3.96 1.074-5.026.167-.304.57-.283.726.033.154.31.264.639.348.98C9.55 2.283 11.39 2 13.5 2c.09 0 .18.003.268.007A5.5 5.5 0 1 0 9.5 9.5a.75.75 0 0 1 0 1.5A7 7 0 0 1 13.5 4.938Z" clipRule="evenodd" />
    </svg>
  ),
  budgetRemain: (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5" aria-hidden="true">
      <path fillRule="evenodd" d="M10 1a4.5 4.5 0 0 0-4.5 4.5V9H5a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-6a2 2 0 0 0-2-2h-.5V5.5A4.5 4.5 0 0 0 10 1Zm3 8V5.5a3 3 0 1 0-6 0V9h6Z" clipRule="evenodd" />
    </svg>
  ),
  utilization: (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5" aria-hidden="true">
      <path d="M15.5 2A1.5 1.5 0 0 0 14 3.5v13a1.5 1.5 0 0 0 3 0v-13A1.5 1.5 0 0 0 15.5 2ZM9.5 6A1.5 1.5 0 0 0 8 7.5v9A1.5 1.5 0 0 0 11 16.5v-9A1.5 1.5 0 0 0 9.5 6ZM3.5 10A1.5 1.5 0 0 0 2 11.5v5A1.5 1.5 0 0 0 5 16.5v-5A1.5 1.5 0 0 0 3.5 10Z" />
    </svg>
  ),
};

// ── Main component ─────────────────────────────────────────────────────────

/**
 * SummaryCards — six live financial stat cards.
 *
 * Cards: Net Balance · Total Income · Total Expenses · Savings Rate ·
 *        Budget Remaining · Budget Utilization
 *
 * Reads analytics from AnalyticsContext and budget data from BudgetContext.
 * No calculations are duplicated — only context values are consumed.
 */
const SummaryCards = memo(function SummaryCards() {
  const { analytics } = useAnalytics();
  const { budgets }   = useBudget();
  const { goals }     = useGoals();

  const {
    netBalance, totalIncome, totalExpense,
    savingsRate, incomeCount, expenseCount,
  } = analytics;

  const budgetStats = useMemo(() => computeBudgetStats(budgets), [budgets]);
  
  const goalStats = useMemo(() => {
    const totalGoals = goals.length;
    const completedGoals = goals.filter(g => (Number(g.currentAmount) || 0) >= (Number(g.targetAmount) || 0)).length;
    const totalTarget = goals.reduce((s, g) => s + (Number(g.targetAmount) || 0), 0);
    const totalSaved = goals.reduce((s, g) => s + (Number(g.currentAmount) || 0), 0);
    const overallProgress = totalTarget > 0 ? parseFloat(((totalSaved / totalTarget) * 100).toFixed(1)) : 0;
    return { totalGoals, completedGoals, overallProgress };
  }, [goals]);

  const cards = useMemo(() => {
    const expensePct = totalIncome > 0
      ? Math.max(0, Math.min(100, Math.round((totalExpense / totalIncome) * 100)))
      : 0;

    const budgetUtilClamped = Math.min(100, budgetStats.utilization);
    const budgetUtilColour  = budgetStats.utilization > 90
      ? 'text-danger-400'
      : budgetStats.utilization > 70
        ? 'text-yellow-400'
        : 'text-success-400';
    const budgetUtilBarCls  = budgetStats.utilization > 90
      ? 'bg-danger-500'
      : budgetStats.utilization > 70
        ? 'bg-yellow-500'
        : 'bg-success-500';

    return [
      {
        id:       'sc-balance',
        label:    'Net Balance',
        value:    formatCurrency(netBalance),
        sub:      netBalance >= 0 ? 'Surplus this period' : 'Deficit this period',
        positive: netBalance >= 0,
        progress: Math.max(0, Math.min(100, savingsRate)),
        barCls:   'bg-gradient-brand',
        icon:     ICONS.balance,
        iconBg:   'bg-primary-500/15',
        iconText: 'text-primary-400',
        valueCls: netBalance >= 0 ? 'text-white' : 'text-danger-400',
      },
      {
        id:       'sc-income',
        label:    'Total Income',
        value:    formatCurrency(totalIncome),
        sub:      `${incomeCount} ${incomeCount === 1 ? 'record' : 'records'} logged`,
        positive: true,
        progress: 100,
        barCls:   'bg-success-500',
        icon:     ICONS.income,
        iconBg:   'bg-success-500/15',
        iconText: 'text-success-400',
        valueCls: 'text-success-400',
      },
      {
        id:       'sc-expense',
        label:    'Total Expenses',
        value:    formatCurrency(totalExpense),
        sub:      `${expenseCount} ${expenseCount === 1 ? 'expense' : 'expenses'} logged`,
        positive: totalExpense === 0,
        progress: expensePct,
        barCls:   'bg-danger-500',
        icon:     ICONS.expense,
        iconBg:   'bg-danger-500/15',
        iconText: 'text-danger-400',
        valueCls: 'text-danger-400',
      },
      {
        id:       'sc-rate',
        label:    'Savings Rate',
        value:    `${savingsRate}%`,
        sub:      savingsRate >= 30
          ? 'Excellent! 🏆'
          : savingsRate >= 20
          ? 'Great job! 🎉'
          : savingsRate > 0
          ? 'Keep it up!'
          : totalIncome === 0
          ? 'Add income to track'
          : 'Over budget',
        positive: savingsRate >= 20,
        progress: Math.max(0, savingsRate),
        barCls:   'bg-accent-500',
        icon:     ICONS.savings,
        iconBg:   'bg-accent-500/15',
        iconText: 'text-accent-400',
        valueCls: 'text-accent-400',
      },
      {
        id:       'sc-budget-remain',
        label:    'Budget Remaining',
        value:    budgetStats.hasBudgets
          ? (budgetStats.totalRemain >= 0
              ? formatCurrency(budgetStats.totalRemain)
              : `−${formatCurrency(Math.abs(budgetStats.totalRemain))}`)
          : '—',
        sub:      budgetStats.hasBudgets
          ? (budgetStats.totalRemain >= 0 ? 'Still available' : 'Over budget')
          : 'No budgets set',
        positive: budgetStats.totalRemain >= 0,
        progress: budgetStats.hasBudgets ? Math.max(0, 100 - budgetUtilClamped) : 0,
        barCls:   budgetStats.totalRemain >= 0 ? 'bg-success-500' : 'bg-danger-500',
        icon:     ICONS.budgetRemain,
        iconBg:   budgetStats.totalRemain >= 0 ? 'bg-success-500/15' : 'bg-danger-500/15',
        iconText: budgetStats.totalRemain >= 0 ? 'text-success-400' : 'text-danger-400',
        valueCls: budgetStats.totalRemain >= 0 ? 'text-success-400' : 'text-danger-400',
      },
      {
        id:       'sc-budget-util',
        label:    'Budget Utilization',
        value:    budgetStats.hasBudgets ? `${budgetStats.utilization}%` : '—',
        sub:      budgetStats.hasBudgets
          ? (budgetStats.utilization <= 70
              ? 'On track 🎯'
              : budgetStats.utilization <= 90
              ? 'High usage ⚡'
              : 'Over budget ⚠️')
          : 'Set budgets to track',
        positive: budgetStats.utilization <= 70,
        progress: budgetUtilClamped,
        barCls:   budgetUtilBarCls,
        icon:     ICONS.utilization,
        iconBg:   budgetStats.utilization <= 70
          ? 'bg-success-500/15'
          : budgetStats.utilization <= 90
          ? 'bg-yellow-500/15'
          : 'bg-danger-500/15',
        iconText: budgetUtilColour,
        valueCls: budgetUtilColour,
      },
      {
        id:       'sc-goal-progress',
        label:    'Goal Progress',
        value:    `${goalStats.overallProgress}%`,
        sub:      goalStats.totalGoals > 0 ? (goalStats.overallProgress >= 100 ? 'All goals reached!' : 'Keep saving') : 'No goals set',
        positive: goalStats.overallProgress >= 50,
        progress: goalStats.overallProgress,
        barCls:   goalStats.overallProgress >= 50 ? 'bg-success-500' : 'bg-primary-500',
        icon:     ICONS.savings,
        iconBg:   goalStats.overallProgress >= 50 ? 'bg-success-500/15' : 'bg-primary-500/15',
        iconText: goalStats.overallProgress >= 50 ? 'text-success-400' : 'text-primary-400',
        valueCls: goalStats.overallProgress >= 50 ? 'text-success-400' : 'text-primary-400',
      },
      {
        id:       'sc-goal-completed',
        label:    'Completed Goals',
        value:    `${goalStats.completedGoals} / ${goalStats.totalGoals}`,
        sub:      goalStats.totalGoals > 0 ? (goalStats.completedGoals === goalStats.totalGoals ? 'Amazing job!' : 'Working on it') : '—',
        positive: goalStats.completedGoals > 0,
        progress: goalStats.totalGoals > 0 ? (goalStats.completedGoals / goalStats.totalGoals) * 100 : 0,
        barCls:   'bg-indigo-500',
        icon:     (
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5" aria-hidden="true">
            <path d="M3.5 2.75a.75.75 0 0 0-1.5 0v14.5a.75.75 0 0 0 1.5 0v-4.392l1.657-.348a6.449 6.449 0 0 1 4.271.572 7.948 7.948 0 0 0 5.965.524l2.078-.64A.75.75 0 0 0 18 12.25v-8.5a.75.75 0 0 0-.904-.734l-2.38.501a7.25 7.25 0 0 1-4.186-.363l-.502-.2a8.75 8.75 0 0 0-5.053-.439l-1.475.31V2.75Z" />
          </svg>
        ),
        iconBg:   'bg-indigo-500/15',
        iconText: 'text-indigo-400',
        valueCls: 'text-indigo-400',
      },
    ];
  }, [
    netBalance, totalIncome, totalExpense, savingsRate,
    incomeCount, expenseCount, budgetStats, goalStats,
  ]);

  return (
    <section aria-label="Financial summary" className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-8">
      {cards.map(card => (
        <Card
          key={card.id}
          id={card.id}
          padding="md"
          hover
          className="flex flex-col justify-between"
        >
          {/* Label + icon */}
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-xs font-medium uppercase tracking-wider text-slate-500">
                {card.label}
              </p>
              <p className={`mt-2.5 text-2xl font-bold tracking-tight tabular-nums ${card.valueCls}`}>
                {card.value}
              </p>
              <div className={`mt-1 flex items-center gap-1 text-xs font-medium ${card.positive ? 'text-success-400' : 'text-danger-400'}`}>
                <TrendArrow positive={card.positive} />
                {card.sub}
              </div>
            </div>
            <div className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl ${card.iconBg} ${card.iconText}`}>
              {card.icon}
            </div>
          </div>

          {/* Progress bar */}
          <div className="mt-4" aria-hidden="true">
            <div className="h-1 w-full overflow-hidden rounded-full bg-surface-700">
              <div
                className={`h-full rounded-full transition-all duration-700 ${card.barCls}`}
                style={{ width: `${card.progress}%` }}
              />
            </div>
            <p className="mt-1 text-right text-[10px] text-slate-600">{card.progress}%</p>
          </div>
        </Card>
      ))}
    </section>
  );
});

export default SummaryCards;
