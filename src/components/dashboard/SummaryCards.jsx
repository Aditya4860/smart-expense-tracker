import { memo, useMemo } from 'react';
import useExpenses from '../../hooks/useExpenses';
import useIncome from '../../hooks/useIncome';
import Card from '../ui/Card';

// ── Formatters ─────────────────────────────────────────────────────────────

const amountFmt = new Intl.NumberFormat('en-IN', {
  style:                 'currency',
  currency:              'INR',
  maximumFractionDigits: 0,
});

// ── Icons (stable module-level constants) ─────────────────────────────────

const ICONS = {
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
  balance: (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5" aria-hidden="true">
      <path d="M1 4.25a3.733 3.733 0 0 1 2.25-.75h13.5c.844 0 1.623.279 2.25.75A2.25 2.25 0 0 0 16.75 2H3.25A2.25 2.25 0 0 0 1 4.25ZM1 7.25a3.733 3.733 0 0 1 2.25-.75h13.5c.844 0 1.623.279 2.25.75A2.25 2.25 0 0 0 16.75 5H3.25A2.25 2.25 0 0 0 1 7.25ZM7 8a1 1 0 0 1 1 1 2 2 0 1 0 4 0 1 1 0 0 1 1-1h3.75A2.25 2.25 0 0 1 19 10.25v5.5A2.25 2.25 0 0 1 16.75 18H3.25A2.25 2.25 0 0 1 1 15.75v-5.5A2.25 2.25 0 0 1 3.25 8H7Z" />
    </svg>
  ),
  savings: (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5" aria-hidden="true">
      <path fillRule="evenodd" d="M13.5 4.938a7 7 0 1 1-9.006 1.737c.202-.257.59-.218.793.039.278.352.594.672.943.954.332.269.786-.049.8-.476.067-2.134.48-3.96 1.074-5.026.167-.304.57-.283.726.033.154.31.264.639.348.98C9.55 2.283 11.39 2 13.5 2c.09 0 .18.003.268.007A5.5 5.5 0 1 0 9.5 9.5a.75.75 0 0 1 0 1.5A7 7 0 0 1 13.5 4.938Z" clipRule="evenodd" />
    </svg>
  ),
};

// ── Main component ─────────────────────────────────────────────────────────

/**
 * SummaryCards — four financial overview cards.
 *
 * Cards:
 *   1. Total Income    — live from IncomeContext
 *   2. Total Expenses  — live from ExpenseContext
 *   3. Net Balance     — income minus expenses
 *   4. Savings Rate    — percentage of income saved
 *
 * All values update immediately whenever income or expenses change.
 * No mock data, no static values.
 */
const SummaryCards = memo(function SummaryCards() {
  const { summary: expenseSummary } = useExpenses();
  const { summary: incomeSummary  } = useIncome();

  const totalIncome   = incomeSummary.total;
  const totalExpenses = expenseSummary.total;
  const expenseCount  = expenseSummary.count;
  const incomeCount   = incomeSummary.count;

  const cards = useMemo(() => {
    const netBalance  = totalIncome - totalExpenses;
    const savingsPct  = totalIncome > 0
      ? Math.max(0, Math.min(100, Math.round((netBalance / totalIncome) * 100)))
      : 0;
    const expensePct  = totalIncome > 0
      ? Math.max(0, Math.min(100, Math.round((totalExpenses / totalIncome) * 100)))
      : 0;
    const incomePct   = totalIncome > 0 ? 100 : 0;

    return [
      {
        id:       'summary-income',
        label:    'Total Income',
        value:    amountFmt.format(totalIncome),
        change:   incomeCount === 0
          ? 'No income recorded yet'
          : `${incomeCount} ${incomeCount === 1 ? 'record' : 'records'} logged`,
        positive: true,
        progress: incomePct,
        icon:     ICONS.income,
        iconBg:   'bg-success-500/15',
        iconText: 'text-success-400',
        valueCls: 'text-success-400',
      },
      {
        id:       'summary-expense',
        label:    'Total Expenses',
        value:    amountFmt.format(totalExpenses),
        change:   expenseCount === 0
          ? 'No expenses yet'
          : `${expenseCount} ${expenseCount === 1 ? 'expense' : 'expenses'} logged`,
        positive: totalExpenses === 0,
        progress: expensePct,
        icon:     ICONS.expense,
        iconBg:   'bg-danger-500/15',
        iconText: 'text-danger-400',
        valueCls: 'text-danger-400',
      },
      {
        id:       'summary-balance',
        label:    'Net Balance',
        value:    amountFmt.format(netBalance),
        change:   netBalance >= 0 ? 'You are in surplus' : 'You are in deficit',
        positive: netBalance >= 0,
        progress: netBalance >= 0 ? Math.min(100, savingsPct) : 0,
        icon:     ICONS.balance,
        iconBg:   'bg-primary-500/15',
        iconText: 'text-primary-400',
        valueCls: netBalance >= 0 ? 'text-white' : 'text-danger-400',
      },
      {
        id:       'summary-savings',
        label:    'Savings Rate',
        value:    `${savingsPct}%`,
        change:   savingsPct >= 30
          ? 'Excellent! 🏆'
          : savingsPct >= 20
          ? 'Great job! 🎉'
          : savingsPct > 0
          ? 'Keep going!'
          : totalIncome === 0
          ? 'Add income to calculate'
          : 'Over budget',
        positive: savingsPct >= 20,
        progress: savingsPct,
        icon:     ICONS.savings,
        iconBg:   'bg-accent-500/15',
        iconText: 'text-accent-400',
        valueCls: 'text-accent-400',
      },
    ];
  }, [totalIncome, totalExpenses, incomeCount, expenseCount]);

  return (
    <section aria-label="Financial summary" className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
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
              <p className={`mt-1 text-xs font-medium ${card.positive ? 'text-success-400' : 'text-danger-400'}`}>
                {card.change}
              </p>
            </div>
            <div className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl ${card.iconBg} ${card.iconText}`}>
              {card.icon}
            </div>
          </div>

          {/* Progress bar */}
          <div className="mt-4" aria-hidden="true">
            <div className="h-1 w-full overflow-hidden rounded-full bg-surface-700">
              <div
                className="h-full rounded-full bg-gradient-brand transition-all duration-700"
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
