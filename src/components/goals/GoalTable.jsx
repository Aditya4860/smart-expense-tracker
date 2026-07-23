import { memo } from 'react';
import useGoals from '../../hooks/useGoals';
import { formatCurrency, formatLocalDate } from '../../utils/formatters';
import GoalProgressBar from './GoalProgressBar';
import { EDIT_ICON, DELETE_ICON } from '../ui/FormField';
import GoalEmptyState from './GoalEmptyState';

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

const TH = ({ children, className = '' }) => (
  <th scope="col" className={`px-4 py-2.5 text-xs font-medium uppercase tracking-wider text-slate-500 ${className}`}>
    {children}
  </th>
);

const GoalRow = memo(function GoalRow({ goal, onEdit, onDelete, onClick }) {
  const { calculateProgress, calculateRemainingAmount } = useGoals();
  const pct = calculateProgress(goal.id);
  const remaining = calculateRemainingAmount(goal.id);

  return (
    <tr 
      className="group border-b border-surface-700/40 transition-colors hover:bg-white/[0.02] cursor-pointer"
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
      <td className="px-4 py-3">
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-white">{goal.title}</p>
          {pct >= 100 && <span className="mt-1 badge badge-success px-1.5 py-0.5 text-[10px]">Completed</span>}
        </div>
      </td>
      <td className="px-4 py-3 text-right">
        <span className="text-sm font-semibold tabular-nums text-white">
          {formatCurrency(goal.targetAmount)}
        </span>
      </td>
      <td className="hidden px-4 py-3 text-right sm:table-cell">
        <span className="text-sm tabular-nums text-success-400">
          {formatCurrency(goal.currentAmount)}
        </span>
      </td>
      <td className="hidden px-4 py-3 text-right md:table-cell">
        <span className="text-sm tabular-nums font-medium text-slate-300">
          {formatCurrency(remaining)}
        </span>
      </td>
      <td className="hidden px-4 py-3 lg:table-cell">
        <GoalProgressBar
          currentAmount={goal.currentAmount}
          targetAmount={goal.targetAmount}
          pct={pct}
          compact
        />
      </td>
      <td className="hidden px-4 py-3 sm:table-cell">
        <div className="flex flex-col gap-1 items-start">
          <span className={`rounded-md border px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider ${PRIORITY_COLORS[goal.priority] || PRIORITY_COLORS.medium}`}>
            {goal.priority}
          </span>
          <span className={`rounded-md border px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider ${
            goal.status === 'completed' || pct >= 100 ? 'bg-success-500/20 text-success-400 border-success-500/30' :
            goal.status === 'paused' ? 'bg-slate-500/20 text-slate-400 border-slate-500/30' :
            'bg-primary-500/20 text-primary-400 border-primary-500/30'
          }`}>
            {pct >= 100 ? 'completed' : goal.status}
          </span>
        </div>
      </td>
      <td className="hidden px-4 py-3 md:table-cell">
        <span className="text-sm text-slate-300">{formatLocalDate(goal.targetDate)}</span>
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center justify-end gap-1 opacity-0 transition-opacity group-hover:opacity-100 focus-within:opacity-100">
          <button
            type="button" onClick={(e) => { e.stopPropagation(); onEdit(); }} aria-label="Edit goal"
            className="flex h-7 w-7 items-center justify-center rounded-lg text-slate-500 transition-colors hover:bg-primary-500/10 hover:text-primary-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
          >
            {EDIT_ICON}
          </button>
          <button
            type="button" onClick={(e) => { e.stopPropagation(); onDelete(); }} aria-label="Delete goal"
            className="flex h-7 w-7 items-center justify-center rounded-lg text-slate-500 transition-colors hover:bg-danger-500/10 hover:text-danger-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-danger-500"
          >
            {DELETE_ICON}
          </button>
        </div>
      </td>
    </tr>
  );
});

const GoalTable = memo(function GoalTable({ onEdit, onDelete, onClickRow }) {
  const { goals } = useGoals();

  return (
    <div className="overflow-hidden card">
      <div className="flex items-center justify-between border-b border-surface-700/60 px-4 py-3">
        <p className="text-sm text-slate-400">
          {goals.length === 0 ? (
            <span className="text-slate-600">No data</span>
          ) : (
            <>
              <span className="font-semibold text-white">{goals.length}</span>
              {' '}
              {goals.length === 1 ? 'goal' : 'goals'}
            </>
          )}
        </p>
      </div>

      {goals.length === 0 ? (
        <GoalEmptyState />
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[520px]" aria-label="Savings Goals">
            <thead>
              <tr className="border-b border-surface-700/40">
                <TH className="text-left">Title</TH>
                <TH className="text-right">Target</TH>
                <TH className="hidden text-right sm:table-cell">Saved</TH>
                <TH className="hidden text-right md:table-cell">Remaining</TH>
                <TH className="hidden text-left lg:table-cell">Progress</TH>
                <TH className="hidden text-left sm:table-cell">Priority</TH>
                <TH className="hidden text-left md:table-cell">Target Date</TH>
                <TH className="text-right"><span className="sr-only">Actions</span></TH>
              </tr>
            </thead>
            <tbody>
              {goals.map(goal => (
                <GoalRow
                  key={goal.id}
                  goal={goal}
                  onEdit={() => onEdit(goal)}
                  onDelete={() => onDelete(goal)}
                  onClick={() => onClickRow(goal)}
                />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
});

export default GoalTable;
