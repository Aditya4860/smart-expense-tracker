import { memo } from 'react';

/**
 * EmptyState — placeholder for sections with no data.
 *
 * Props:
 *   icon        — JSX (SVG or emoji) displayed above the heading
 *   title       — main heading
 *   description — supporting copy
 *   action      — optional JSX for a CTA button
 *   className   — additional wrapper classes
 */
const EmptyState = memo(function EmptyState({
  icon,
  title,
  description,
  action,
  className = '',
}) {
  return (
    <div
      className={[
        'flex flex-col items-center justify-center gap-4 py-16 text-center',
        className,
      ].join(' ')}
      role="status"
    >
      {icon && (
        <div
          className="flex h-16 w-16 items-center justify-center rounded-2xl bg-surface-700/60 text-slate-500"
          aria-hidden="true"
        >
          {icon}
        </div>
      )}

      <div className="max-w-xs">
        <p className="text-base font-semibold text-slate-300">{title}</p>
        {description && (
          <p className="mt-1.5 text-sm text-slate-500 leading-relaxed">{description}</p>
        )}
      </div>

      {action && <div className="mt-2">{action}</div>}
    </div>
  );
});

export default EmptyState;
