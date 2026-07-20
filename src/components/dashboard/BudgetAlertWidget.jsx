import { memo, useMemo } from 'react';
import useBudget from '../../hooks/useBudget';
import Card from '../ui/Card';

// ── Alert thresholds ───────────────────────────────────────────────────────

const THRESHOLD_EXCEEDED  = 100;
const THRESHOLD_CRITICAL  = 90;
const THRESHOLD_WARNING   = 70;

// ── Month labels ───────────────────────────────────────────────────────────

const MONTH_NAMES = [
  '', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
];

// ── Alert severity theme ───────────────────────────────────────────────────

function alertTheme(pct) {
  if (pct >= THRESHOLD_EXCEEDED) {
    return {
      border:  'border-danger-500/30',
      bg:      'bg-danger-500/8',
      dot:     'bg-danger-500',
      text:    'text-danger-400',
      badge:   'bg-danger-500/20 text-danger-400',
      label:   'Exceeded',
    };
  }
  if (pct >= THRESHOLD_CRITICAL) {
    return {
      border:  'border-danger-500/20',
      bg:      'bg-danger-500/5',
      dot:     'bg-orange-500',
      text:    'text-orange-400',
      badge:   'bg-orange-500/20 text-orange-400',
      label:   'Critical',
    };
  }
  return {
    border:  'border-yellow-500/20',
    bg:      'bg-yellow-500/5',
    dot:     'bg-yellow-500',
    text:    'text-yellow-400',
    badge:   'bg-yellow-500/20 text-yellow-400',
    label:   'Warning',
  };
}

// ── Alert message generator ────────────────────────────────────────────────

function buildMessage(categoryName, pct, period) {
  if (pct >= THRESHOLD_EXCEEDED) {
    return `${categoryName} budget exceeded for ${period}.`;
  }
  if (pct >= THRESHOLD_CRITICAL) {
    return `You have used ${pct}% of your ${categoryName} budget for ${period}.`;
  }
  return `${categoryName} budget is almost exhausted for ${period} (${pct}% used).`;
}

// ── Warning icon ───────────────────────────────────────────────────────────

const WarningIcon = (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4 flex-shrink-0" aria-hidden="true">
    <path fillRule="evenodd" d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495ZM10 5a.75.75 0 0 1 .75.75v3.5a.75.75 0 0 1-1.5 0v-3.5A.75.75 0 0 1 10 5Zm0 9a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z" clipRule="evenodd" />
  </svg>
);

// ── Main component ─────────────────────────────────────────────────────────

/**
 * BudgetAlertWidget — lists active budget alerts for the Dashboard.
 *
 * Generates alerts for budgets at ≥70% utilization.
 * Reads from BudgetContext via useBudget() — no duplicate calculations.
 */
const BudgetAlertWidget = memo(function BudgetAlertWidget() {
  const { budgets, calculateBudgetProgress } = useBudget();

  const alerts = useMemo(() => {
    return budgets
      .map(b => ({
        id:           b.id,
        category:     b.category,
        pct:          calculateBudgetProgress(b.id),
        period:       `${MONTH_NAMES[b.month]} ${b.year}`,
      }))
      .filter(a => a.pct >= THRESHOLD_WARNING)
      .sort((a, b) => b.pct - a.pct);
  }, [budgets, calculateBudgetProgress]);

  return (
    <Card padding="md" className="flex flex-col gap-3">
      {/* Header */}
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs font-medium uppercase tracking-wider text-slate-500">
          Budget Alerts
        </p>
        {alerts.length > 0 && (
          <span className="inline-flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-danger-500/20 px-1.5 text-[10px] font-bold text-danger-400">
            {alerts.length}
          </span>
        )}
      </div>

      {/* Alert list */}
      {alerts.length === 0 ? (
        <div className="flex flex-col items-center gap-2 py-4 text-center">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-success-500/15" aria-hidden="true">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5 text-success-400" aria-hidden="true">
              <path fillRule="evenodd" d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm3.857-9.809a.75.75 0 0 0-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 1 0-1.06 1.061l2.5 2.5a.75.75 0 0 0 1.137-.089l4-5.5Z" clipRule="evenodd" />
            </svg>
          </div>
          <p className="text-sm font-medium text-slate-400">All budgets on track</p>
          <p className="text-xs text-slate-600">No categories approaching their limits.</p>
        </div>
      ) : (
        <ul className="space-y-2" role="list" aria-label="Budget alerts">
          {alerts.map(alert => {
            const theme   = alertTheme(alert.pct);
            const message = buildMessage(alert.category, alert.pct, alert.period);
            return (
              <li
                key={alert.id}
                className={`flex items-start gap-2.5 rounded-xl border p-3 ${theme.border} ${theme.bg}`}
              >
                <span className={`mt-0.5 ${theme.text}`}>{WarningIcon}</span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className={`inline-flex items-center gap-1 rounded-full px-1.5 py-0.5 text-[10px] font-bold ${theme.badge}`}>
                      <span className={`h-1.5 w-1.5 rounded-full ${theme.dot}`} aria-hidden="true" />
                      {theme.label}
                    </span>
                    <span className="text-[10px] text-slate-600">{alert.pct}%</span>
                  </div>
                  <p className="mt-1 text-xs leading-snug text-slate-300">
                    {message}
                  </p>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </Card>
  );
});

export default BudgetAlertWidget;
