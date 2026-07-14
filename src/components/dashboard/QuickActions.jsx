import { memo } from 'react';

const ACTIONS = [
  {
    id:          'quick-add-expense',
    label:       'Add Expense',
    description: 'Log a new spend',
    iconBg:      'bg-danger-500/15',
    iconText:    'text-danger-400',
    borderHover: 'hover:border-danger-500/40',
    labelCls:    'text-danger-400',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5" aria-hidden="true">
        <path fillRule="evenodd" d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm.75-11.25a.75.75 0 0 0-1.5 0v2.5h-2.5a.75.75 0 0 0 0 1.5h2.5v2.5a.75.75 0 0 0 1.5 0v-2.5h2.5a.75.75 0 0 0 0-1.5h-2.5v-2.5Z" clipRule="evenodd" />
      </svg>
    ),
  },
  {
    id:          'quick-add-income',
    label:       'Add Income',
    description: 'Record earnings',
    iconBg:      'bg-success-500/15',
    iconText:    'text-success-400',
    borderHover: 'hover:border-success-500/40',
    labelCls:    'text-success-400',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5" aria-hidden="true">
        <path fillRule="evenodd" d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm3.25-7.25a.75.75 0 0 0 0-1.5H6.75a.75.75 0 0 0 0 1.5h6.5Z" clipRule="evenodd" />
      </svg>
    ),
  },
  {
    id:          'quick-view-reports',
    label:       'View Reports',
    description: 'See analytics',
    iconBg:      'bg-primary-500/15',
    iconText:    'text-primary-400',
    borderHover: 'hover:border-primary-500/40',
    labelCls:    'text-primary-400',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5" aria-hidden="true">
        <path d="M15.5 2A1.5 1.5 0 0 0 14 3.5v13a1.5 1.5 0 0 0 3 0v-13A1.5 1.5 0 0 0 15.5 2ZM9.5 6A1.5 1.5 0 0 0 8 7.5v9A1.5 1.5 0 0 0 11 16.5v-9A1.5 1.5 0 0 0 9.5 6ZM3.5 10A1.5 1.5 0 0 0 2 11.5v5A1.5 1.5 0 0 0 5 16.5v-5A1.5 1.5 0 0 0 3.5 10Z" />
      </svg>
    ),
  },
];

/**
 * QuickActions — three shortcut buttons. Visual shell only; click handlers added in later phases.
 */
const QuickActions = memo(function QuickActions() {
  return (
    <section aria-label="Quick actions">
      <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-slate-500">
        Quick Actions
      </h2>
      <div className="grid gap-3 sm:grid-cols-3">
        {ACTIONS.map(action => (
          <button
            key={action.id}
            id={action.id}
            type="button"
            className={[
              'group flex items-center gap-4 rounded-2xl border border-surface-700/60',
              'bg-surface-800 px-5 py-4 text-left',
              'transition-all duration-200',
              'hover:-translate-y-0.5 hover:bg-surface-700/70 hover:shadow-float',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500',
              action.borderHover,
            ].join(' ')}
          >
            {/* Icon with pop-on-hover */}
            <div
              className={[
                'flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl',
                action.iconBg,
                action.iconText,
                'transition-transform duration-200 group-hover:scale-110',
              ].join(' ')}
            >
              {action.icon}
            </div>

            {/* Labels */}
            <div className="min-w-0 flex-1">
              <p className={`text-sm font-semibold ${action.labelCls}`}>{action.label}</p>
              <p className="mt-0.5 text-xs text-slate-500">{action.description}</p>
            </div>

            {/* Chevron */}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 16 16"
              fill="currentColor"
              className="h-4 w-4 flex-shrink-0 text-slate-600 transition-all duration-200 group-hover:translate-x-0.5 group-hover:text-slate-400"
              aria-hidden="true"
            >
              <path fillRule="evenodd" d="M6.22 4.22a.75.75 0 0 1 1.06 0l3.25 3.25a.75.75 0 0 1 0 1.06l-3.25 3.25a.75.75 0 0 1-1.06-1.06L9.19 8 6.22 5.28a.75.75 0 0 1 0-1.06Z" clipRule="evenodd" />
            </svg>
          </button>
        ))}
      </div>
    </section>
  );
});

export default QuickActions;
