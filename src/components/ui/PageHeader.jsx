import { memo } from 'react';

/**
 * PageHeader — standardized page header with title, optional subtitle and right-side action slot.
 *
 * Props:
 *   title    — string
 *   subtitle — string (optional)
 *   action   — ReactNode (optional, rendered on the right)
 */
const PageHeader = memo(function PageHeader({ title, subtitle, action }) {
  return (
    <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white">{title}</h1>
        {subtitle && (
          <p className="mt-1 text-sm text-slate-500">{subtitle}</p>
        )}
      </div>
      {action && (
        <div className="flex-shrink-0">
          {action}
        </div>
      )}
    </div>
  );
});

export default PageHeader;
