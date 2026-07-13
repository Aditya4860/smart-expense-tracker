import { useState } from 'react';
import { getCategoryById } from '../../constants/categories';
import { formatCurrency, formatRelativeDate, formatDate } from '../../utils/formatters';
import useExpenses from '../../hooks/useExpenses';

/**
 * ExpenseItem — single expense row card.
 *
 * Props:
 *   expense   — Expense object from context
 *   onEdit    — (expense) => void  — called when the edit button is pressed
 */
export default function ExpenseItem({ expense, onEdit }) {
  const { deleteExpense } = useExpenses();
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const category = getCategoryById(expense.category);

  async function handleDelete() {
    if (!confirmDelete) {
      setConfirmDelete(true);
      // Auto-dismiss the confirm state after 3 s if not clicked
      setTimeout(() => setConfirmDelete(false), 3000);
      return;
    }
    setDeleting(true);
    deleteExpense(expense.id);
  }

  return (
    <div
      id={`expense-item-${expense.id}`}
      className={[
        'group flex items-center gap-4 rounded-2xl border border-surface-700/60',
        'bg-surface-800 px-4 py-3.5 transition-all duration-200',
        'hover:border-surface-600 hover:bg-surface-700/70',
        deleting ? 'opacity-50 pointer-events-none' : '',
      ].join(' ')}
    >
      {/* Category icon */}
      <div
        className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-surface-700 text-xl"
        aria-hidden="true"
        title={category.label}
      >
        {category.icon}
      </div>

      {/* Main info */}
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-white">
          {expense.description}
        </p>
        <div className="mt-0.5 flex items-center gap-2 flex-wrap">
          <span className="badge badge-neutral text-2xs">
            {category.label}
          </span>
          {expense.notes && (
            <span
              className="truncate max-w-[200px] text-xs text-slate-500"
              title={expense.notes}
            >
              {expense.notes}
            </span>
          )}
        </div>
      </div>

      {/* Date + Amount */}
      <div className="flex flex-col items-end gap-0.5 flex-shrink-0">
        <p className="text-base font-bold text-danger-400">
          {formatCurrency(expense.amount)}
        </p>
        <p
          className="text-xs text-slate-500"
          title={formatDate(expense.date)}
        >
          {formatRelativeDate(expense.date)}
        </p>
      </div>

      {/* Actions — visible on hover or focus-within */}
      <div
        className={[
          'flex items-center gap-1 flex-shrink-0',
          'opacity-0 group-hover:opacity-100 focus-within:opacity-100',
          'transition-opacity duration-150',
        ].join(' ')}
      >
        {/* Edit */}
        {onEdit && (
          <button
            id={`expense-edit-${expense.id}`}
            type="button"
            aria-label={`Edit ${expense.description}`}
            onClick={() => onEdit(expense)}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400
                       hover:bg-primary-600/20 hover:text-primary-400 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="h-4 w-4">
              <path d="M13.488 2.513a1.75 1.75 0 0 0-2.475 0L6.75 6.774a2.75 2.75 0 0 0-.596.892l-.848 2.047a.75.75 0 0 0 .98.98l2.047-.848a2.75 2.75 0 0 0 .892-.596l4.261-4.263a1.75 1.75 0 0 0 0-2.474Z" />
              <path d="M4.75 3.5c-.69 0-1.25.56-1.25 1.25v6.5c0 .69.56 1.25 1.25 1.25h6.5c.69 0 1.25-.56 1.25-1.25V9a.75.75 0 0 1 1.5 0v2.25A2.75 2.75 0 0 1 11.25 14h-6.5A2.75 2.75 0 0 1 2 11.25v-6.5A2.75 2.75 0 0 1 4.75 2H7a.75.75 0 0 1 0 1.5H4.75Z" />
            </svg>
          </button>
        )}

        {/* Delete / Confirm delete */}
        <button
          id={`expense-delete-${expense.id}`}
          type="button"
          aria-label={confirmDelete ? 'Confirm delete' : `Delete ${expense.description}`}
          onClick={handleDelete}
          className={[
            'flex h-8 items-center justify-center rounded-lg transition-all duration-200',
            confirmDelete
              ? 'gap-1.5 px-2.5 bg-danger-600/90 text-white text-xs font-medium hover:bg-danger-600'
              : 'w-8 text-slate-400 hover:bg-danger-600/20 hover:text-danger-400',
          ].join(' ')}
        >
          {confirmDelete ? (
            <>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="h-3.5 w-3.5">
                <path fillRule="evenodd" d="M5 3.25V4H2.75a.75.75 0 0 0 0 1.5h.3l.815 8.15A1.5 1.5 0 0 0 5.357 15h5.285a1.5 1.5 0 0 0 1.493-1.35l.815-8.15h.3a.75.75 0 0 0 0-1.5H11v-.75A2.25 2.25 0 0 0 8.75 1h-1.5A2.25 2.25 0 0 0 5 3.25Zm2.25-.75a.75.75 0 0 0-.75.75V4h3v-.75a.75.75 0 0 0-.75-.75h-1.5ZM6.05 6a.75.75 0 0 1 .787.713l.275 5.5a.75.75 0 0 1-1.498.075l-.275-5.5A.75.75 0 0 1 6.05 6Zm3.9 0a.75.75 0 0 1 .712.787l-.275 5.5a.75.75 0 0 1-1.498-.075l.275-5.5a.75.75 0 0 1 .786-.711Z" clipRule="evenodd" />
              </svg>
              Confirm
            </>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="h-4 w-4">
              <path fillRule="evenodd" d="M5 3.25V4H2.75a.75.75 0 0 0 0 1.5h.3l.815 8.15A1.5 1.5 0 0 0 5.357 15h5.285a1.5 1.5 0 0 0 1.493-1.35l.815-8.15h.3a.75.75 0 0 0 0-1.5H11v-.75A2.25 2.25 0 0 0 8.75 1h-1.5A2.25 2.25 0 0 0 5 3.25Zm2.25-.75a.75.75 0 0 0-.75.75V4h3v-.75a.75.75 0 0 0-.75-.75h-1.5ZM6.05 6a.75.75 0 0 1 .787.713l.275 5.5a.75.75 0 0 1-1.498.075l-.275-5.5A.75.75 0 0 1 6.05 6Zm3.9 0a.75.75 0 0 1 .712.787l-.275 5.5a.75.75 0 0 1-1.498-.075l.275-5.5a.75.75 0 0 1 .786-.711Z" clipRule="evenodd" />
            </svg>
          )}
        </button>
      </div>
    </div>
  );
}
