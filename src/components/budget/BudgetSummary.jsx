import { memo, useMemo } from 'react';
import useBudget from '../../hooks/useBudget';
import Card from '../ui/Card';

// ── Formatter ──────────────────────────────────────────────────────────────

const amountFmt = new Intl.NumberFormat('en-IN', {
  style: 'currency', currency: 'INR', maximumFractionDigits: 0,
});

// ── Icons ──────────────────────────────────────────────────────────────────

const ICONS = {
  wallet: (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5" aria-hidden="true">
      <path d="M2.5 4A1.5 1.5 0 0 0 1 5.5V6h18v-.5A1.5 1.5 0 0 0 17.5 4h-15ZM19 8.5H1v6A1.5 1.5 0 0 0 2.5 16h15a1.5 1.5 0 0 0 1.5-1.5v-6ZM3 13.25a.75.75 0 0 1 .75-.75h1.5a.75.75 0 0 1 0 1.5h-1.5a.75.75 0 0 1-.75-.75Zm4.75-.75a.75.75 0 0 0 0 1.5h3.5a.75.75 0 0 0 0-1.5h-3.5Z" />
    </svg>
  ),
  spent: (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5" aria-hidden="true">
      <path fillRule="evenodd" d="M10 17a.75.75 0 0 1-.75-.75V5.612L5.29 9.77a.75.75 0 0 1-1.08-1.04l5.25-5.5a.75.75 0 0 1 1.08 0l5.25 5.5a.75.75 0 1 1-1.08 1.04l-3.96-4.158V16.25A.75.75 0 0 1 10 17Z" clipRule="evenodd" />
    </svg>
  ),
  remaining: (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5" aria-hidden="true">
      <path fillRule="evenodd" d="M10 3a.75.75 0 0 1 .75.75v10.638l3.96-4.158a.75.75 0 1 1 1.08 1.04l-5.25 5.5a.75.75 0 0 1-1.08 0l-5.25-5.5a.75.75 0 1 1 1.08-1.04l3.96 4.158V3.75A.75.75 0 0 1 10 3Z" clipRule="evenodd" />
    </svg>
  ),
  utilization: (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5" aria-hidden="true">
      <path d="M15.5 2A1.5 1.5 0 0 0 14 3.5v13a1.5 1.5 0 0 0 3 0v-13A1.5 1.5 0 0 0 15.5 2ZM9.5 6A1.5 1.5 0 0 0 8 7.5v9A1.5 1.5 0 0 0 11 16.5v-9A1.5 1.5 0 0 0 9.5 6ZM3.5 10A1.5 1.5 0 0 0 2 11.5v5A1.5 1.5 0 0 0 5 16.5v-5A1.5 1.5 0 0 0 3.5 10Z" />
    </svg>
  ),
  trophy: (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5" aria-hidden="true">
      <path fillRule="evenodd" d="M10 1c-1.828 0-3.623.149-5.371.435a.75.75 0 0 0-.629.74v.387c-.827.157-1.642.345-2.445.564a.75.75 0 0 0-.552.698 5 5 0 0 0 4.503 5.152 6 6 0 0 0 2.946 1.822A6.451 6.451 0 0 1 7.768 13H7.5A1.5 1.5 0 0 0 6 14.5V17h-.75a.75.75 0 0 0 0 1.5h9.5a.75.75 0 0 0 0-1.5H14v-2.5A1.5 1.5 0 0 0 12.5 13h-.268a6.453 6.453 0 0 1-.684-2.202 6 6 0 0 0 2.946-1.822 5 5 0 0 0 4.503-5.152.75.75 0 0 0-.552-.698A31.804 31.804 0 0 0 16 2.562v-.387a.75.75 0 0 0-.629-.74A33.227 33.227 0 0 0 10 1ZM2.525 4.422C3.012 4.3 3.504 4.19 4 4.09V5c0 .74.134 1.448.38 2.103a3.503 3.503 0 0 1-1.855-2.68Zm14.95 0a3.503 3.503 0 0 1-1.854 2.683C15.866 6.448 16 5.74 16 5v-.91c.496.099.988.21 1.475.332Z" clipRule="evenodd" />
    </svg>
  ),
};

// ── Main component ─────────────────────────────────────────────────────────

/**
 * BudgetSummary — five stat cards driven by live BudgetContext data.
 *
 * Cards: Total Budget · Total Spent · Remaining Budget · Top Category · Utilization %
 */
const BudgetSummary = memo(function BudgetSummary() {
  const { budgets } = useBudget();

  const stats = useMemo(() => {
    const count        = budgets.length;
    const totalLimit   = budgets.reduce((s, b) => s + b.monthlyLimit, 0);
    const totalSpent   = budgets.reduce((s, b) => s + b.spent,        0);
    const totalRemain  = totalLimit - totalSpent;
    const utilization  = totalLimit > 0
      ? parseFloat(((totalSpent / totalLimit) * 100).toFixed(1))
      : 0;

    const topBudget = budgets.length > 0
      ? budgets.reduce((prev, cur) => cur.monthlyLimit > prev.monthlyLimit ? cur : prev)
      : null;

    return { count, totalLimit, totalSpent, totalRemain, utilization, topBudget };
  }, [budgets]);

  const cards = useMemo(() => [
    {
      id:       'bs-total',
      label:    'Total Budget',
      value:    amountFmt.format(stats.totalLimit),
      sub:      stats.count === 0
        ? 'No budgets set'
        : `${stats.count} ${stats.count === 1 ? 'budget' : 'budgets'} active`,
      icon:     ICONS.wallet,
      iconBg:   'bg-primary-500/15',
      iconText: 'text-primary-400',
      valueCls: 'text-white',
    },
    {
      id:       'bs-spent',
      label:    'Total Spent',
      value:    amountFmt.format(stats.totalSpent),
      sub:      'Across all budgets',
      icon:     ICONS.spent,
      iconBg:   'bg-danger-500/15',
      iconText: 'text-danger-400',
      valueCls: 'text-danger-400',
    },
    {
      id:       'bs-remaining',
      label:    'Remaining',
      value:    stats.totalRemain >= 0
        ? amountFmt.format(stats.totalRemain)
        : `−${amountFmt.format(Math.abs(stats.totalRemain))}`,
      sub:      stats.totalRemain >= 0 ? 'Still available' : 'Over budget',
      icon:     ICONS.remaining,
      iconBg:   stats.totalRemain >= 0 ? 'bg-success-500/15' : 'bg-danger-500/15',
      iconText: stats.totalRemain >= 0 ? 'text-success-400' : 'text-danger-400',
      valueCls: stats.totalRemain >= 0 ? 'text-success-400' : 'text-danger-400',
    },
    {
      id:       'bs-utilization',
      label:    'Utilization',
      value:    `${stats.utilization}%`,
      sub:      stats.utilization <= 70
        ? 'On track'
        : stats.utilization <= 90
          ? 'High usage'
          : 'Over budget',
      icon:     ICONS.utilization,
      iconBg:   stats.utilization <= 70
        ? 'bg-success-500/15'
        : stats.utilization <= 90
          ? 'bg-yellow-500/15'
          : 'bg-danger-500/15',
      iconText: stats.utilization <= 70
        ? 'text-success-400'
        : stats.utilization <= 90
          ? 'text-yellow-400'
          : 'text-danger-400',
      valueCls: stats.utilization <= 70
        ? 'text-success-400'
        : stats.utilization <= 90
          ? 'text-yellow-400'
          : 'text-danger-400',
    },
    {
      id:       'bs-top',
      label:    'Highest Budget',
      value:    stats.topBudget ? amountFmt.format(stats.topBudget.monthlyLimit) : '—',
      sub:      stats.topBudget ? stats.topBudget.category : 'No budgets yet',
      icon:     ICONS.trophy,
      iconBg:   'bg-yellow-500/15',
      iconText: 'text-yellow-400',
      valueCls: 'text-yellow-400',
    },
  ], [stats]);

  return (
    <section aria-label="Budget summary" className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
      {cards.map(card => (
        <Card key={card.id} id={card.id} padding="md" className="flex flex-col gap-3">
          <div className="flex items-start justify-between gap-3">
            <p className="text-xs font-medium uppercase tracking-wider text-slate-500">
              {card.label}
            </p>
            <div
              className={[
                'flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl',
                card.iconBg,
                card.iconText,
              ].join(' ')}
            >
              {card.icon}
            </div>
          </div>
          <p className={`text-2xl font-bold tracking-tight tabular-nums ${card.valueCls}`}>
            {card.value}
          </p>
          <p className="text-xs text-slate-500">{card.sub}</p>
        </Card>
      ))}
    </section>
  );
});

export default BudgetSummary;
