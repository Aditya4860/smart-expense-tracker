import { memo } from 'react';

/**
 * StatCard — a single financial KPI card used in Summary sections.
 *
 * Eliminates the repeated card layout shared by ExpenseSummary,
 * IncomeSummary, and BudgetSummary.
 *
 * Props:
 *   id       — string  — unique HTML id for the card element
 *   label    — string  — small caps label above the value
 *   value    — string  — the primary display value (already formatted)
 *   sub      — string  — secondary line below the value
 *   icon     — JSX    — SVG icon element
 *   iconBg   — string  — Tailwind bg class for the icon badge
 *   iconText — string  — Tailwind text-colour class for the icon badge
 *   valueCls — string  — Tailwind text-colour class for the value
 */
const StatCard = memo(function StatCard({
  id,
  label,
  value,
  sub,
  icon,
  iconBg,
  iconText,
  valueCls = 'text-white',
}) {
  return (
    <div
      id={id}
      className="flex flex-col gap-3 rounded-2xl border border-surface-700/60 bg-surface-800 p-5 shadow-card-dark"
    >
      {/* Label + icon row */}
      <div className="flex items-start justify-between gap-3">
        <p className="text-xs font-medium uppercase tracking-wider text-slate-500">
          {label}
        </p>
        <div
          className={[
            'flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl',
            iconBg,
            iconText,
          ].join(' ')}
        >
          {icon}
        </div>
      </div>

      {/* Primary value */}
      <p className={`text-2xl font-bold tracking-tight tabular-nums ${valueCls}`}>
        {value}
      </p>

      {/* Sub-label */}
      <p className="text-xs text-slate-500">{sub}</p>
    </div>
  );
});

export default StatCard;
