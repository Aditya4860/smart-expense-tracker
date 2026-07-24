import { memo } from 'react';
import { formatCurrency, formatLocalDate } from '../../utils/formatters';
import useGoals from '../../hooks/useGoals';
import GoalProgressBar from './GoalProgressBar';
import Card from '../ui/Card';
import { EDIT_ICON, DELETE_ICON } from '../ui/FormField';

const PRIORITY_COLORS = {
  high: 'bg-danger-500/20 text-danger-400 border-danger-500/30',
  medium: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  low: 'bg-success-500/20 text-success-400 border-success-500/30',
};

const UPDATE_ICON = (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="h-3.5 w-3.5" aria-hidden="true">
    <path d="M8 2a.75.75 0 0 1 .75.75v4.5h4.5a.75.75 0 0 1 0 1.5h-4.5v4.5a.75.75 0 0 1-1.5 0v-4.5h-4.5a.75.75 0 0 1 0-1.5h4.5v-4.5A.75.75 0 0 1 8 2Z" />
  </svg>
);

const GoalCard = memo(function GoalCard({ goal, onEdit, onDelete, onClick }) {
  const { calculateProgress, calculateRemainingAmount } = useGoals();
  const pct = calculateProgress(goal.id);
  const remaining = calculateRemainingAmount(goal.id);

  return (
    <Card 
      padding="md" 
      className="flex flex-col gap-4 cursor-pointer hover:border-primary-500/50 transition-colors"
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick?.();
        }
      }}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h3 className="truncate text-base font-semibold text-white">{goal.title}</h3>
            {pct >= 100 && (
              <span className="badge badge-success px-1.5 py-0.5 text-[10px]">Completed</span>
            )}
          </div>
          <p className="mt-1 truncate text-sm text-slate-500">
            Due {formatLocalDate(goal.targetDate)}
          </p>
          {goal.description && (
            <p className="mt-2 line-clamp-2 text-sm text-slate-400">{goal.description}</p>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onEdit(); }}
            aria-label={`Edit ${goal.title}`}
            className="flex h-7 w-7 items-center justify-center rounded-lg text-slate-500 transition-colors hover:bg-primary-500/10 hover:text-primary-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
          >
            {EDIT_ICON}
          </button>
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onDelete(); }}
            aria-label={`Delete ${goal.title}`}
            className="flex h-7 w-7 items-center justify-center rounded-lg text-slate-500 transition-colors hover:bg-danger-500/10 hover:text-danger-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-danger-500"
          >
            {DELETE_ICON}
          </button>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <span className={`rounded-md border px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider ${PRIORITY_COLORS[goal.priority] || PRIORITY_COLORS.medium}`}>
          {goal.priority} Priority
        </span>
        <span className={`rounded-md border px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider ${
          goal.status === 'completed' || pct >= 100 ? 'bg-success-500/20 text-success-400 border-success-500/30' :
          goal.status === 'paused' ? 'bg-slate-500/20 text-slate-400 border-slate-500/30' :
          'bg-primary-500/20 text-primary-400 border-primary-500/30'
        }`}>
          {pct >= 100 ? 'completed' : goal.status}
        </span>
      </div>

      {/* Amounts */}
      <div className="grid grid-cols-3 gap-2 rounded-xl bg-surface-700/30 p-3 text-center">
        <div>
          <p className="text-xs text-slate-500">Target</p>
          <p className="mt-0.5 text-sm font-bold tabular-nums text-white">
            {formatCurrency(goal.targetAmount)}
          </p>
        </div>
        <div>
          <p className="text-xs text-slate-500">Saved</p>
          <p className="mt-0.5 text-sm font-bold tabular-nums text-success-400">
            {formatCurrency(goal.currentAmount)}
          </p>
        </div>
        <div>
          <p className="text-xs text-slate-500">Left</p>
          <p className="mt-0.5 text-sm font-bold tabular-nums text-slate-300">
            {formatCurrency(remaining)}
          </p>
        </div>
      </div>

      {/* Progress */}
      <GoalProgressBar
        currentAmount={goal.currentAmount}
        targetAmount={goal.targetAmount}
        pct={pct}
      />
    </Card>
  );
});

export default GoalCard;
