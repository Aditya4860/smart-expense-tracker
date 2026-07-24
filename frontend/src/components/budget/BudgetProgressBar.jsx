import { memo } from 'react';
import { formatCurrency } from '../../utils/formatters';

// ── Colour thresholds ──────────────────────────────────────────────────────

/**
 * Returns Tailwind colour tokens for track fill and text based on utilisation %.
 *   < 70  → green
 *   70–90 → yellow/amber
 *   > 90  → red/danger
 */
function themeForPct(pct) {
  if (pct > 90) return { bar: 'bg-danger-500',  text: 'text-danger-400',  label: 'Over budget' };
  if (pct > 70) return { bar: 'bg-yellow-500',  text: 'text-yellow-400',  label: 'High usage'  };
  return              { bar: 'bg-success-500',  text: 'text-success-400', label: 'On track'    };
}

// ── Main component ─────────────────────────────────────────────────────────

/**
 * BudgetProgressBar — animated progress bar that communicates budget health.
 *
 * Props:
 *   spent        — number — amount spent so far
 *   monthlyLimit — number — total budget for the month
 *   pct          — number — 0–100 percentage (already clamped by context)
 *   compact      — boolean — render a slimmer variant for table rows
 */
const BudgetProgressBar = memo(function BudgetProgressBar({
  spent,
  monthlyLimit,
  pct,
  compact = false,
}) {
  const remaining = monthlyLimit - spent;
  const theme     = themeForPct(pct);

  if (compact) {
    return (
      <div className="flex min-w-[120px] flex-col gap-1">
        {/* Track */}
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-surface-700">
          <div
            className={`h-full rounded-full transition-all duration-700 ease-out ${theme.bar}`}
            style={{ width: `${pct}%` }}
            role="progressbar"
            aria-valuenow={pct}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={`${pct}% of budget used`}
          />
        </div>

        {/* Percentage label */}
        <p className={`text-xs font-medium tabular-nums ${theme.text}`}>
          {pct}%
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {/* Labels row */}
      <div className="flex items-center justify-between gap-2">
        <span className={`text-xs font-medium tabular-nums ${theme.text}`}>
          {formatCurrency(spent)} spent
        </span>
        <span className="text-xs tabular-nums text-slate-500">
          {remaining >= 0
            ? `${formatCurrency(remaining)} left`
            : `${formatCurrency(Math.abs(remaining))} over`}
        </span>
      </div>

      {/* Track */}
      <div className="h-2.5 w-full overflow-hidden rounded-full bg-surface-700">
        <div
          className={`h-full rounded-full transition-all duration-700 ease-out ${theme.bar}`}
          style={{ width: `${pct}%` }}
          role="progressbar"
          aria-valuenow={pct}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={`${pct}% of budget used`}
        />
      </div>

      {/* Status + percentage */}
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

export default BudgetProgressBar;
