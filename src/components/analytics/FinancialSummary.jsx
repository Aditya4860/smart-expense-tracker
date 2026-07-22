import { memo } from 'react';
import useAnalytics from '../../hooks/useAnalytics';
import { formatCurrency } from '../../utils/formatters';
import Card from '../ui/Card';


// ── Stat item ──────────────────────────────────────────────────────────────

function StatItem({ label, value, valueCls = 'text-white', sub, subCls }) {
  return (
    <div className="flex flex-col gap-1">
      <p className="text-xs font-medium uppercase tracking-wider text-slate-500">{label}</p>
      <p className={`text-xl font-bold tabular-nums tracking-tight ${valueCls}`}>{value}</p>
      {sub && <p className={`text-xs ${subCls ?? 'text-slate-500'}`}>{sub}</p>}
    </div>
  );
}

// ── Divider ────────────────────────────────────────────────────────────────

function Divider() {
  return <div className="hidden h-12 w-px bg-surface-700/60 sm:block" aria-hidden="true" />;
}

// ── Main component ─────────────────────────────────────────────────────────

/**
 * FinancialSummary — two-row grid of key financial stats.
 *
 * Row 1: Total Income · Net Balance · Savings Rate
 * Row 2: Total Expense · Largest Expense · Average Expense
 *        Largest Income · Average Income
 */
const FinancialSummary = memo(function FinancialSummary() {
  const { analytics } = useAnalytics();
  const {
    totalIncome, totalExpense, netBalance,
    savingsRate, largestExpense, largestIncome,
    averageExpense, averageIncome, incomeCount, expenseCount,
  } = analytics;

  const balanceCls = netBalance >= 0 ? 'text-success-400' : 'text-danger-400';
  const savingsCls = savingsRate >= 20 ? 'text-success-400' : savingsRate > 0 ? 'text-yellow-400' : 'text-danger-400';

  return (
    <Card padding="lg">
      <h2 className="mb-5 text-sm font-semibold uppercase tracking-wider text-slate-500">
        Financial Overview
      </h2>

      {/* Primary stats */}
      <div className="mb-6 grid grid-cols-2 gap-y-6 gap-x-4 sm:grid-cols-3 lg:grid-cols-5">
        <StatItem
          label="Total Income"
          value={formatCurrency(totalIncome)}
          valueCls="text-success-400"
          sub={`${incomeCount} records`}
        />
        <StatItem
          label="Total Expenses"
          value={formatCurrency(totalExpense)}
          valueCls="text-danger-400"
          sub={`${expenseCount} records`}
        />
        <StatItem
          label="Net Balance"
          value={formatCurrency(netBalance)}
          valueCls={balanceCls}
          sub={netBalance >= 0 ? 'Surplus' : 'Deficit'}
          subCls={balanceCls}
        />
        <StatItem
          label="Savings"
          value={formatCurrency(Math.max(0, netBalance))}
          valueCls={netBalance >= 0 ? 'text-white' : 'text-slate-500'}
        />
        <StatItem
          label="Savings Rate"
          value={`${savingsRate}%`}
          valueCls={savingsCls}
          sub={
            savingsRate >= 30 ? 'Excellent 🏆' :
            savingsRate >= 20 ? 'Great job 🎉' :
            savingsRate >  0  ? 'Keep going' :
            totalIncome === 0 ? 'No income yet' : 'Over budget'
          }
        />
      </div>

      {/* Divider */}
      <div className="mb-6 h-px w-full bg-surface-700/60" aria-hidden="true" />

      {/* Secondary stats */}
      <div className="grid grid-cols-2 gap-y-6 gap-x-4 sm:grid-cols-4">
        <StatItem
          label="Largest Expense"
          value={expenseCount > 0 ? formatCurrency(largestExpense) : '—'}
          valueCls="text-danger-400"
        />
        <StatItem
          label="Avg Expense"
          value={expenseCount > 0 ? formatCurrency(averageExpense) : '—'}
          valueCls="text-slate-300"
        />
        <StatItem
          label="Largest Income"
          value={incomeCount > 0 ? formatCurrency(largestIncome) : '—'}
          valueCls="text-success-400"
        />
        <StatItem
          label="Avg Income"
          value={incomeCount > 0 ? formatCurrency(averageIncome) : '—'}
          valueCls="text-slate-300"
        />
      </div>
    </Card>
  );
});

export default FinancialSummary;

