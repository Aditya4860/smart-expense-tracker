import { memo, useMemo } from 'react';
import useExpenses from '../../hooks/useExpenses';
import Card from '../ui/Card';

// ── Formatter ──────────────────────────────────────────────────────────────

const amountFmt = new Intl.NumberFormat('en-IN', {
  style:                 'currency',
  currency:              'INR',
  maximumFractionDigits: 0,
});

// ── Icons (stable module-level constants) ─────────────────────────────────

const ICONS = {
  wallet: (
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
};

// Static monthly income — replace when income module is built
const MONTHLY_INCOME = 45_000;

// ── Main component ─────────────────────────────────────────────────────────

/**
 * SummaryCards — four financial overview cards driven by live ExpenseContext data.
 *
 * Cards:
 *   1. Net Savings       — income minus total expenses
 *   2. Monthly Income    — static placeholder (₹45,000)
 *   3. Total Expenses    — sum of all recorded expenses
 *   4. Savings Rate      — percentage of income saved
 *
 * All values update automatically whenever an expense is added, edited, or deleted.
 */
const SummaryCards = memo(function SummaryCards() {
  const { summary } = useExpenses();
  const { total: totalExpenses, count } = summary;

  const cards = useMemo(() => {
    const netSavings  = MONTHLY_INCOME - totalExpenses;
    const savingsPct  = Math.max(0, Math.min(100, Math.round((netSavings  / MONTHLY_INCOME) * 100)));
    const expensePct  = Math.max(0, Math.min(100, Math.round((totalExpenses / MONTHLY_INCOME) * 100)));

    return [
      {
        id:       'summary-savings',
        label:    'Net Savings',
        value:    amountFmt.format(netSavings),
        change:   `${savingsPct}% of income saved`,
        positive: netSavings >= 0,
        progress: savingsPct,
        icon:     ICONS.wallet,
        iconBg:   'bg-primary-500/15',
        iconText: 'text-primary-400',
        valueCls: netSavings >= 0 ? 'text-white' : 'text-danger-400',
      },
      {
        id:       'summary-income',
        label:    'Monthly Income',
        value:    amountFmt.format(MONTHLY_INCOME),
        change:   'Add income module to update',
        positive: true,
        progress: 100,
        icon:     ICONS.income,
        iconBg:   'bg-success-500/15',
        iconText: 'text-success-400',
        valueCls: 'text-success-400',
      },
      {
        id:       'summary-expense',
        label:    'Total Expenses',
        value:    amountFmt.format(totalExpenses),
        change:   `${count} ${count === 1 ? 'expense' : 'expenses'} logged`,
        positive: totalExpenses === 0,
        progress: expensePct,
        icon:     ICONS.expense,
        iconBg:   'bg-danger-500/15',
        iconText: 'text-danger-400',
        valueCls: 'text-danger-400',
      },
      {
        id:       'summary-rate',
        label:    'Savings Rate',
        value:    `${savingsPct}%`,
        change:   savingsPct >= 30
          ? 'Excellent! 🏆'
          : savingsPct >= 20
          ? 'Great job! 🎉'
          : savingsPct > 0
          ? 'Keep going!'
          : 'Over budget',
        positive: savingsPct >= 20,
        progress: savingsPct,
        icon:     ICONS.savings,
        iconBg:   'bg-accent-500/15',
        iconText: 'text-accent-400',
        valueCls: 'text-accent-400',
      },
    ];
  }, [totalExpenses, count]);

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
