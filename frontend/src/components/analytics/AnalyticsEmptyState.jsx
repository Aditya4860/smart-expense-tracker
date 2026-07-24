import { memo } from 'react';
import { Link } from 'react-router-dom';
import EmptyState from '../ui/EmptyState';
import Button from '../ui/Button';

const ChartIcon = (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-8 w-8" aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z" />
  </svg>
);

/**
 * AnalyticsEmptyState — shown on the Analytics page when no data exists.
 *
 * Props:
 *   hasIncome   — boolean
 *   hasExpenses — boolean
 */
const AnalyticsEmptyState = memo(function AnalyticsEmptyState({ hasIncome, hasExpenses }) {
  const missing = [];
  if (!hasIncome)   missing.push('income');
  if (!hasExpenses) missing.push('expenses');

  const description = missing.length === 2
    ? 'Add your first income and expense entries to unlock charts and insights.'
    : missing[0] === 'income'
    ? 'You have expenses — add income records to see the full picture.'
    : 'You have income — add expense entries to see your spending breakdown.';

  return (
    <EmptyState
      icon={ChartIcon}
      title="No analytics data yet"
      description={description}
      action={
        <div className="flex flex-wrap items-center justify-center gap-3">
          {!hasIncome && (
            <Link to="/income">
              <Button variant="primary" size="sm">Add Income</Button>
            </Link>
          )}
          {!hasExpenses && (
            <Link to="/expenses">
              <Button variant="ghost" size="sm">Add Expenses</Button>
            </Link>
          )}
        </div>
      }
    />
  );
});

export default AnalyticsEmptyState;
