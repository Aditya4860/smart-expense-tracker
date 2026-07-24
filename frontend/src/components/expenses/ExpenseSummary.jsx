import { memo, useMemo } from 'react';
import useExpenses from '../../hooks/useExpenses';
import { formatCurrency } from '../../utils/formatters';
import StatCard from '../ui/StatCard';

// ── Icons (stable module-level constants) ─────────────────────────────────

const ICONS = {
  total: (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5" aria-hidden="true">
      <path fillRule="evenodd" d="M2.5 4A1.5 1.5 0 0 0 1 5.5V6h18v-.5A1.5 1.5 0 0 0 17.5 4h-15ZM19 8.5H1v6A1.5 1.5 0 0 0 2.5 16h15a1.5 1.5 0 0 0 1.5-1.5v-6ZM3 13.25a.75.75 0 0 1 .75-.75h1.5a.75.75 0 0 1 0 1.5h-1.5a.75.75 0 0 1-.75-.75Zm4.75-.75a.75.75 0 0 0 0 1.5h3.5a.75.75 0 0 0 0-1.5h-3.5Z" clipRule="evenodd" />
    </svg>
  ),
  count: (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5" aria-hidden="true">
      <path fillRule="evenodd" d="M6 4.75A.75.75 0 0 1 6.75 4h10.5a.75.75 0 0 1 0 1.5H6.75A.75.75 0 0 1 6 4.75ZM6 10a.75.75 0 0 1 .75-.75h10.5a.75.75 0 0 1 0 1.5H6.75A.75.75 0 0 1 6 10Zm0 5.25a.75.75 0 0 1 .75-.75h10.5a.75.75 0 0 1 0 1.5H6.75a.75.75 0 0 1-.75-.75ZM1.99 4.75a1 1 0 0 1 1-1H3a1 1 0 0 1 1 1v.01a1 1 0 0 1-1 1h-.01a1 1 0 0 1-1-1v-.01ZM1.99 15.25a1 1 0 0 1 1-1H3a1 1 0 0 1 1 1v.01a1 1 0 0 1-1 1h-.01a1 1 0 0 1-1-1v-.01ZM1.99 10a1 1 0 0 1 1-1H3a1 1 0 0 1 1 1v.01a1 1 0 0 1-1 1h-.01a1 1 0 0 1-1-1V10Z" clipRule="evenodd" />
    </svg>
  ),
  largest: (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5" aria-hidden="true">
      <path fillRule="evenodd" d="M10 17a.75.75 0 0 1-.75-.75V5.612L5.29 9.77a.75.75 0 0 1-1.08-1.04l5.25-5.5a.75.75 0 0 1 1.08 0l5.25 5.5a.75.75 0 1 1-1.08 1.04l-3.96-4.158V16.25A.75.75 0 0 1 10 17Z" clipRule="evenodd" />
    </svg>
  ),
  average: (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5" aria-hidden="true">
      <path d="M15.5 2A1.5 1.5 0 0 0 14 3.5v13a1.5 1.5 0 0 0 3 0v-13A1.5 1.5 0 0 0 15.5 2ZM9.5 6A1.5 1.5 0 0 0 8 7.5v9A1.5 1.5 0 0 0 11 16.5v-9A1.5 1.5 0 0 0 9.5 6ZM3.5 10A1.5 1.5 0 0 0 2 11.5v5A1.5 1.5 0 0 0 5 16.5v-5A1.5 1.5 0 0 0 3.5 10Z" />
    </svg>
  ),
};

// ── Main component ─────────────────────────────────────────────────────────

/**
 * ExpenseSummary — four stat cards driven by live ExpenseContext data.
 *
 * Displays: Total Expenses · Number of Expenses · Largest Expense · Average Expense
 */
const ExpenseSummary = memo(function ExpenseSummary() {
  const { summary } = useExpenses();
  const { total, count, largest, average } = summary;

  const cards = useMemo(() => [
    {
      id:       'es-total',
      label:    'Total Expenses',
      value:    formatCurrency(total),
      sub:      count === 0 ? 'No expenses recorded' : `${count} ${count === 1 ? 'expense' : 'expenses'} recorded`,
      icon:     ICONS.total,
      iconBg:   'bg-danger-500/15',
      iconText: 'text-danger-400',
      valueCls: 'text-danger-400',
    },
    {
      id:       'es-count',
      label:    'Number of Expenses',
      value:    String(count),
      sub:      'Total transactions',
      icon:     ICONS.count,
      iconBg:   'bg-primary-500/15',
      iconText: 'text-primary-400',
      valueCls: 'text-white',
    },
    {
      id:       'es-largest',
      label:    'Largest Expense',
      value:    count > 0 ? formatCurrency(largest) : '—',
      sub:      'Single biggest spend',
      icon:     ICONS.largest,
      iconBg:   'bg-yellow-500/15',
      iconText: 'text-yellow-400',
      valueCls: 'text-yellow-400',
    },
    {
      id:       'es-average',
      label:    'Average Expense',
      value:    count > 0 ? formatCurrency(average) : '—',
      sub:      'Per transaction',
      icon:     ICONS.average,
      iconBg:   'bg-accent-500/15',
      iconText: 'text-accent-400',
      valueCls: 'text-accent-400',
    },
  ], [total, count, largest, average]);

  return (
    <section aria-label="Expense summary" className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map(card => (
        <StatCard key={card.id} {...card} />
      ))}
    </section>
  );
});

export default ExpenseSummary;
