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
    id:          'quick-add-budget',
    label:       'Add Budget',
    description: 'Set a spending limit',
    iconBg:      'bg-primary-500/15',
    iconText:    'text-primary-400',
    borderHover: 'hover:border-primary-500/40',
    labelCls:    'text-primary-400',
    handler:     'onAddBudget',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5" aria-hidden="true">
        <path fillRule="evenodd" d="M10 1a4.5 4.5 0 0 0-4.5 4.5V9H5a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-6a2 2 0 0 0-2-2h-.5V5.5A4.5 4.5 0 0 0 10 1Zm3 8V5.5a3 3 0 1 0-6 0V9h6Z" clipRule="evenodd" />
      </svg>
    ),
  },
  {
    id:          'quick-analytics',
    label:       'Analytics',
    description: 'View detailed insights',
    iconBg:      'bg-accent-500/15',
    iconText:    'text-accent-400',
    borderHover: 'hover:border-accent-500/40',
    labelCls:    'text-accent-400',
    handler:     null,
    to:          '/analytics',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5" aria-hidden="true">
        <path d="M15.5 2A1.5 1.5 0 0 0 14 3.5v13a1.5 1.5 0 0 0 3 0v-13A1.5 1.5 0 0 0 15.5 2ZM9.5 6A1.5 1.5 0 0 0 8 7.5v9A1.5 1.5 0 0 0 11 16.5v-9A1.5 1.5 0 0 0 9.5 6ZM3.5 10A1.5 1.5 0 0 0 2 11.5v5A1.5 1.5 0 0 0 5 16.5v-5A1.5 1.5 0 0 0 3.5 10Z" />
      </svg>
    ),
  },
  {
    id:          'quick-view-budget',
    label:       'View Budget',
    description: 'Manage monthly budgets',
    iconBg:      'bg-yellow-500/15',
    iconText:    'text-yellow-400',
    borderHover: 'hover:border-yellow-500/40',
    labelCls:    'text-yellow-400',
    handler:     null,
    to:          '/budget',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5" aria-hidden="true">
        <path fillRule="evenodd" d="M10 2a.75.75 0 0 1 .75.75v.258a33.186 33.186 0 0 1 6.668.83.75.75 0 0 1-.336 1.461 31.28 31.28 0 0 0-1.103-.232l1.702 7.545a.75.75 0 0 1-.387.832A4.981 4.981 0 0 1 15 14c-.825 0-1.606-.2-2.294-.556a.75.75 0 0 1-.387-.832l1.77-7.849a31.743 31.743 0 0 0-3.339-.254v11.505a20.01 20.01 0 0 1 3.78.501.75.75 0 1 1-.339 1.462A18.51 18.51 0 0 0 10 18.25a18.51 18.51 0 0 0-4.191.482.75.75 0 1 1-.338-1.462 20.01 20.01 0 0 1 3.779-.501V5.26a31.743 31.743 0 0 0-3.339.254l1.77 7.85a.75.75 0 0 1-.387.83A4.981 4.981 0 0 1 5 14a4.98 4.98 0 0 1-2.294-.556.75.75 0 0 1-.387-.832L4.02 5.067c-.37.07-.738.148-1.103.232a.75.75 0 1 1-.336-1.462 33.186 33.186 0 0 1 6.668-.829V2.75A.75.75 0 0 1 10 2ZM5 7.543 3.91 12.33a3.499 3.499 0 0 0 2.18 0L5 7.543Zm10 0-1.09 4.787a3.498 3.498 0 0 0 2.18 0L15 7.543Z" clipRule="evenodd" />
      </svg>
    ),
  },
  {
    id:          'quick-expenses',
    label:       'View Expenses',
    description: 'See all transactions',
    iconBg:      'bg-slate-500/15',
    iconText:    'text-slate-400',
    borderHover: 'hover:border-slate-500/40',
    labelCls:    'text-slate-400',
    handler:     null,
    to:          '/expenses',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5" aria-hidden="true">
        <path fillRule="evenodd" d="M2.5 4A1.5 1.5 0 0 0 1 5.5V6h18v-.5A1.5 1.5 0 0 0 17.5 4h-15ZM19 8.5H1v6A1.5 1.5 0 0 0 2.5 16h15a1.5 1.5 0 0 0 1.5-1.5v-6ZM3 13.25a.75.75 0 0 1 .75-.75h1.5a.75.75 0 0 1 0 1.5h-1.5a.75.75 0 0 1-.75-.75Zm4.75-.75a.75.75 0 0 0 0 1.5h3.5a.75.75 0 0 0 0-1.5h-3.5Z" clipRule="evenodd" />
      </svg>
    ),
  },
  {
    id:          'quick-add-goal',
    label:       'Create Goal',
    description: 'Set a savings target',
    iconBg:      'bg-indigo-500/15',
    iconText:    'text-indigo-400',
    borderHover: 'hover:border-indigo-500/40',
    labelCls:    'text-indigo-400',
    handler:     'onAddGoal',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5" aria-hidden="true">
        <path d="M10 1c-1.828 0-3.623.149-5.371.435a.75.75 0 0 0-.629.74v.387c-.827.157-1.642.345-2.445.564a.75.75 0 0 0-.552.698 5 5 0 0 0 4.503 5.152 6 6 0 0 0 2.946 1.822A6.451 6.451 0 0 1 7.768 13H7.5A1.5 1.5 0 0 0 6 14.5V17h-.75a.75.75 0 0 0 0 1.5h9.5a.75.75 0 0 0 0-1.5H14v-2.5A1.5 1.5 0 0 0 12.5 13h-.268a6.453 6.453 0 0 1-.684-2.202 6 6 0 0 0 2.946-1.822 5 5 0 0 0 4.503-5.152.75.75 0 0 0-.552-.698A31.804 31.804 0 0 0 16 2.562v-.387a.75.75 0 0 0-.629-.74A33.227 33.227 0 0 0 10 1ZM2.525 4.422C3.012 4.3 3.504 4.19 4 4.09V5c0 .74.134 1.448.38 2.103a3.503 3.503 0 0 1-1.855-2.68Zm14.95 0a3.503 3.503 0 0 1-1.854 2.683C15.866 6.448 16 5.74 16 5v-.91c.496.099.988.21 1.475.332Z" clipRule="evenodd" />
      </svg>
    ),
  },
  {
    id:          'quick-view-goals',
    label:       'View Goals',
    description: 'Track your progress',
    iconBg:      'bg-purple-500/15',
    iconText:    'text-purple-400',
    borderHover: 'hover:border-purple-500/40',
    labelCls:    'text-purple-400',
    handler:     null,
    to:          '/goals',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5" aria-hidden="true">
        <path d="M3.5 2.75a.75.75 0 0 0-1.5 0v14.5a.75.75 0 0 0 1.5 0v-4.392l1.657-.348a6.449 6.449 0 0 1 4.271.572 7.948 7.948 0 0 0 5.965.524l2.078-.64A.75.75 0 0 0 18 12.25v-8.5a.75.75 0 0 0-.904-.734l-2.38.501a7.25 7.25 0 0 1-4.186-.363l-.502-.2a8.75 8.75 0 0 0-5.053-.439l-1.475.31V2.75Z" />
      </svg>
    ),
  },
];

// ── Shared UI ──────────────────────────────────────────────────────────────

const itemClass = (action) => [
  'group flex items-center justify-between gap-4 rounded-[10px] border border-surface-700',
  'bg-surface-800 px-5 py-4 w-full h-full text-left',
  'transition-all duration-300',
  'hover:-translate-y-1 hover:bg-surface-700 hover:shadow-card hover:border-surface-600',
  'focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-success-500',
  action.borderHover,
].join(' ');

// ── Main component ─────────────────────────────────────────────────────────

/**
 * QuickActions — 6-button dashboard shortcut panel.
 *
 * Props:
 *   onAddExpense — () => void  opens the Add Expense modal
 *   onAddIncome  — () => void  opens the Add Income modal
 *   onAddBudget  — () => void  opens the Add Budget modal
 */
const QuickActions = memo(function QuickActions({ onAddExpense, onAddIncome, onAddBudget, onAddGoal }) {
  const handlerMap = { onAddExpense, onAddIncome, onAddBudget, onAddGoal };

  return (
    <section aria-label="Quick actions">
      <h2 className="mb-4 text-[11px] font-semibold uppercase tracking-widest text-surface-400 font-mono">
        Quick Actions
      </h2>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {ACTIONS.map(action => {
          const inner = (
            <>
              <div className="flex items-center gap-4 min-w-0">
                <div className={[
                  'flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-[8px]',
                  action.iconBg,
                  action.iconText,
                  'transition-transform duration-300 group-hover:scale-110',
                ].join(' ')}>
                  {action.icon}
                </div>
                <div className="min-w-0">
                  <p className={`text-sm font-semibold ${action.labelCls}`}>{action.label}</p>
                  <p className="mt-0.5 text-[11px] font-mono text-surface-500 hidden sm:block">{action.description}</p>
                </div>
              </div>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5 text-surface-600 opacity-0 transition-all duration-300 group-hover:opacity-100 group-hover:translate-x-1">
                <path fillRule="evenodd" d="M3 10a.75.75 0 0 1 .75-.75h10.638L10.23 5.29a.75.75 0 1 1 1.04-1.08l5.5 5.25a.75.75 0 0 1 0 1.08l-5.5 5.25a.75.75 0 1 1-1.04-1.08l4.158-3.96H3.75A.75.75 0 0 1 3 10Z" clipRule="evenodd" />
              </svg>
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
