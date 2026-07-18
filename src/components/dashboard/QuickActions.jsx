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
    id:          'quick-expenses',
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
    id:          'quick-income',
    label:       'View Income',
    description: 'See all income records',
    iconBg:      'bg-yellow-500/15',
    iconText:    'text-yellow-400',
    borderHover: 'hover:border-yellow-500/40',
    labelCls:    'text-yellow-400',
    handler:     null,
    to:          '/income',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5" aria-hidden="true">
        <path d="M10.464 8.746c.227-.18.497-.311.786-.394v2.795a2.252 2.252 0 0 1-.786-.393c-.394-.313-.546-.681-.546-1.004 0-.323.152-.691.546-1.004ZM12.75 15.662v-2.824c.347.085.664.228.921.421.427.32.579.686.579.991 0 .305-.152.671-.579.991a2.534 2.534 0 0 1-.921.42Z" />
        <path fillRule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25ZM12.75 6a.75.75 0 0 0-1.5 0v.816a3.836 3.836 0 0 0-1.72.756c-.712.566-1.112 1.35-1.112 2.178 0 .829.4 1.612 1.113 2.178.502.4 1.102.647 1.719.756v2.978a2.536 2.536 0 0 1-.921-.421l-.879-.66a.75.75 0 0 0-.9 1.2l.879.66c.533.4 1.169.645 1.821.75V18a.75.75 0 0 0 1.5 0v-.81a4.124 4.124 0 0 0 1.821-.749c.745-.559 1.179-1.344 1.179-2.191 0-.847-.434-1.632-1.179-2.191a4.122 4.122 0 0 0-1.821-.75V8.354c.29.082.559.213.786.393l.415.33a.75.75 0 0 0 .933-1.175l-.415-.33a3.836 3.836 0 0 0-1.719-.755V6Z" clipRule="evenodd" />
      </svg>
    ),
  },
];

// ── Shared UI ──────────────────────────────────────────────────────────────

const CHEVRON = (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="h-4 w-4 flex-shrink-0 text-slate-600 transition-all duration-200 group-hover:translate-x-0.5 group-hover:text-slate-400" aria-hidden="true">
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
 * QuickActions — 5-button dashboard shortcut panel.
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
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
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
