import { memo } from 'react';
import { formatCurrency } from '../../utils/formatters';

function themeForPct(pct) {
  if (pct >= 100) return { bar: 'bg-success-500', text: 'text-success-400', label: 'Completed' };
  if (pct >= 75) return { bar: 'bg-primary-500', text: 'text-primary-400', label: 'Almost there' };
  if (pct >= 25) return { bar: 'bg-accent-500', text: 'text-accent-400', label: 'Making progress' };
  return { bar: 'bg-slate-400', text: 'text-slate-400', label: 'Just started' };
}

const GoalProgressBar = memo(function GoalProgressBar({
  currentAmount,
  targetAmount,
  pct,
  compact = false,
}) {
  const remaining = Math.max(0, targetAmount - currentAmount);
  const theme = themeForPct(pct);

  if (compact) {
    return (
      <div className="flex min-w-[120px] flex-col gap-1">
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-surface-700">
          <div
            className={`h-full rounded-full transition-all duration-700 ease-out ${theme.bar}`}
            style={{ width: `${Math.min(pct, 100)}%` }}
            role="progressbar"
            aria-valuenow={pct}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={`${pct}% of goal reached`}
          />
        </div>
        <p className={`text-xs font-medium tabular-nums ${theme.text}`}>
          {pct}%
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-2">
        <span className={`text-xs font-medium tabular-nums ${theme.text}`}>
          {formatCurrency(currentAmount)} saved
        </span>
        <span className="text-xs tabular-nums text-slate-500">
          {formatCurrency(remaining)} left
        </span>
      </div>

      <div className="h-2.5 w-full overflow-hidden rounded-full bg-surface-700">
        <div
          className={`h-full rounded-full transition-all duration-700 ease-out ${theme.bar}`}
          style={{ width: `${Math.min(pct, 100)}%` }}
          role="progressbar"
          aria-valuenow={pct}
          aria-valuemin={0}
          aria-valuemax={100}
        />
      </div>

      <div className="flex items-center justify-between gap-2">
        <span className={`text-xs font-medium ${theme.text}`}>
          {theme.label}
        </span>
        <span className={`text-xs font-bold tabular-nums ${theme.text}`}>
          {pct}%
        </span>
      </div>
    </div>
  );
});

export default GoalProgressBar;
