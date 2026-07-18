import { memo } from 'react';
import { Link } from 'react-router-dom';

// ── Action definitions ─────────────────────────────────────────────────────

const ACTIONS = [
  {
    id:          'quick-add-expense',
    label:       'Add Expense',
    description: 'Log a new spend',
    iconBg:      'bg-danger-500/15',
    iconText:    'text-danger-400',
    borderHover: 'hover:border-danger-500/40',
    labelCls:    'text-danger-400',
    handler:     'onAddExpense',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5" aria-hidden="true">
        <path fillRule="evenodd" d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm.75-11.25a.75.75 0 0 0-1.5 0v2.5h-2.5a.75.75 0 0 0 0 1.5h2.5v2.5a.75.75 0 0 0 1.5 0v-2.5h2.5a.75.75 0 0 0 0-1.5h-2.5v-2.5Z" clipRule="evenodd" />
      </svg>
    ),
  },
  {
    id:          'quick-add-income',
    label:       'Add Income',
    description: 'Record a new income',
    iconBg:      'bg-success-500/15',
    iconText:    'text-success-400',
    borderHover: 'hover:border-success-500/40',
    labelCls:    'text-success-400',
    handler:     'onAddIncome',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5" aria-hidden="true">
        <path fillRule="evenodd" d="M1 4a1 1 0 0 1 1-1h16a1 1 0 0 1 1 1v8a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1V4Zm12 4a3 3 0 1 1-6 0 3 3 0 0 1 6 0ZM4 9a1 1 0 1 0 0-2 1 1 0 0 0 0 2Zm13-1a1 1 0 1 1-2 0 1 1 0 0 1 2 0ZM1.75 14.5a.75.75 0 0 0 0 1.5c4.417 0 8.693.603 12.749 1.73 1.111.309 2.251-.512 2.251-1.696v-.784a.75.75 0 0 0-1.5 0v.784a.272.272 0 0 1-.35.26A49.869 49.869 0 0 0 1.75 14.5Z" clipRule="evenodd" />
      </svg>
    ),
  },
  {
    id:          'quick-view-expenses',
    label:       'View Expenses',
    description: 'See all transactions',
    iconBg:      'bg-primary-500/15',
    iconText:    'text-primary-400',
    borderHover: 'hover:border-primary-500/40',
    labelCls:    'text-primary-400',
    handler:     null,
    to:          '/expenses',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5" aria-hidden="true">
        <path fillRule="evenodd" d="M2.5 4A1.5 1.5 0 0 0 1 5.5V6h18v-.5A1.5 1.5 0 0 0 17.5 4h-15ZM19 8.5H1v6A1.5 1.5 0 0 0 2.5 16h15a1.5 1.5 0 0 0 1.5-1.5v-6ZM3 13.25a.75.75 0 0 1 .75-.75h1.5a.75.75 0 0 1 0 1.5h-1.5a.75.75 0 0 1-.75-.75Zm4.75-.75a.75.75 0 0 0 0 1.5h3.5a.75.75 0 0 0 0-1.5h-3.5Z" clipRule="evenodd" />
      </svg>
    ),
  },
  {
    id:          'quick-view-income',
    label:       'View Income',
    description: 'See all income records',
    iconBg:      'bg-accent-500/15',
    iconText:    'text-accent-400',
    borderHover: 'hover:border-accent-500/40',
    labelCls:    'text-accent-400',
    handler:     null,
    to:          '/income',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5" aria-hidden="true">
        <path d="M15.5 2A1.5 1.5 0 0 0 14 3.5v13a1.5 1.5 0 0 0 3 0v-13A1.5 1.5 0 0 0 15.5 2ZM9.5 6A1.5 1.5 0 0 0 8 7.5v9A1.5 1.5 0 0 0 11 16.5v-9A1.5 1.5 0 0 0 9.5 6ZM3.5 10A1.5 1.5 0 0 0 2 11.5v5A1.5 1.5 0 0 0 5 16.5v-5A1.5 1.5 0 0 0 3.5 10Z" />
      </svg>
    ),
  },
];

// ── Shared UI helpers ──────────────────────────────────────────────────────

const CHEVRON = (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 16 16"
    fill="currentColor"
    className="h-4 w-4 flex-shrink-0 text-slate-600 transition-all duration-200 group-hover:translate-x-0.5 group-hover:text-slate-400"
    aria-hidden="true"
  >
    <path fillRule="evenodd" d="M6.22 4.22a.75.75 0 0 1 1.06 0l3.25 3.25a.75.75 0 0 1 0 1.06l-3.25 3.25a.75.75 0 0 1-1.06-1.06L9.19 8 6.22 5.28a.75.75 0 0 1 0-1.06Z" clipRule="evenodd" />
  </svg>
);

const itemClass = (action) => [
  'group flex items-center gap-4 rounded-2xl border border-surface-700/60',
  'bg-surface-800 px-5 py-4 text-left w-full',
  'transition-all duration-200',
  'hover:-translate-y-0.5 hover:bg-surface-700/70 hover:shadow-float',
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500',
  action.borderHover,
].join(' ');

// ── Main component ─────────────────────────────────────────────────────────

/**
 * QuickActions — dashboard shortcut buttons.
 *
 * Props:
 *   onAddExpense — () => void  opens the Add Expense modal
 *   onAddIncome  — () => void  opens the Add Income modal
 */
const QuickActions = memo(function QuickActions({ onAddExpense, onAddIncome }) {
  const handlerMap = { onAddExpense, onAddIncome };

  return (
    <section aria-label="Quick actions">
      <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-slate-500">
        Quick Actions
      </h2>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {ACTIONS.map(action => {
          const inner = (
            <>
              <div className={[
                'flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl',
                action.iconBg,
                action.iconText,
                'transition-transform duration-200 group-hover:scale-110',
              ].join(' ')}>
                {action.icon}
              </div>
              <div className="min-w-0 flex-1">
                <p className={`text-sm font-semibold ${action.labelCls}`}>{action.label}</p>
                <p className="mt-0.5 text-xs text-slate-500">{action.description}</p>
              </div>
              {CHEVRON}
            </>
          );

          if (action.handler) {
            return (
              <button
                key={action.id}
                id={action.id}
                type="button"
                onClick={handlerMap[action.handler]}
                className={itemClass(action)}
              >
                {inner}
              </button>
            );
          }

          return (
            <Link
              key={action.id}
              id={action.id}
              to={action.to}
              className={itemClass(action)}
            >
              {inner}
            </Link>
          );
        })}
      </div>
    </section>
  );
});

export default QuickActions;
