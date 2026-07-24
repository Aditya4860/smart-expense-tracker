import { memo, useState, useCallback } from 'react';
import { CATEGORY_MAP, PAYMENT_METHOD_MAP } from '../../constants/expenseCategories';
import { formatCurrency, formatLocalDate } from '../../utils/formatters';
import { IconButton, EDIT_ICON, DELETE_ICON } from '../ui/FormField';
import Button from '../ui/Button';
import ExpenseModal from './ExpenseModal';
import ExpenseForm from './ExpenseForm';
import DeleteConfirmBody from '../ui/DeleteConfirmBody';
import useExpenses from '../../hooks/useExpenses';

// ── Main component ─────────────────────────────────────────────────────────

/**
 * ExpenseRow — renders one <tr> for an expense, plus Edit and Delete modals.
 *
 * Props:
 *   expense — the full expense object from ExpenseContext
 */
const ExpenseRow = memo(function ExpenseRow({ expense }) {
  const { updateExpense, deleteExpense } = useExpenses();
  const [editOpen,   setEditOpen]   = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [saving,     setSaving]     = useState(false);

  const isSavings = expense.type === 'savings_contribution';
  const cat     = isSavings ? { bg: 'bg-primary-500/20', color: 'text-primary-400', icon: '🏦', name: 'Savings Transfer' } : (CATEGORY_MAP[expense.category] ?? CATEGORY_MAP.other);
  const payment = isSavings ? { label: 'Internal Transfer' } : (PAYMENT_METHOD_MAP[expense.paymentMethod] ?? { label: expense.paymentMethod });

  const handleEdit = useCallback((values) => {
    setSaving(true);
    updateExpense(expense.id, values);
    setSaving(false);
    setEditOpen(false);
  }, [expense.id, updateExpense]);

  const handleDelete = useCallback(() => {
    deleteExpense(expense.id);
    setDeleteOpen(false);
  }, [expense.id, deleteExpense]);

  return (
    <>
      <tr className="group border-b border-surface-700/40 transition-colors hover:bg-white/[0.02]">

        {/* Category icon + title */}
        <td className="px-4 py-3">
          <div className="flex items-center gap-3">
            <div
              className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl text-base ${cat.bg} ${cat.color}`}
              aria-hidden="true"
            >
              {cat.icon}
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-white">{expense.title}</p>
              <p className="truncate text-xs text-slate-500">{cat.name}</p>
            </div>
          </div>
        </td>

        {/* Amount */}
        <td className="px-4 py-3 text-right">
          <span className={`text-sm font-semibold tabular-nums ${isSavings ? 'text-primary-400' : 'text-danger-400'}`}>
            {formatCurrency(expense.amount)}
          </span>
        </td>

        {/* Date — hidden on xs */}
        <td className="hidden px-4 py-3 sm:table-cell">
          <span className="text-sm text-slate-400">{formatLocalDate(expense.date)}</span>
        </td>

        {/* Payment method — hidden on xs + sm */}
        <td className="hidden px-4 py-3 md:table-cell">
          <span className="badge badge-neutral text-xs">{payment.label}</span>
        </td>

        {/* Actions */}
        <td className="px-4 py-3">
          <div className="flex items-center justify-end gap-1 opacity-0 transition-opacity group-hover:opacity-100 focus-within:opacity-100">
            <IconButton
              onClick={() => setEditOpen(true)}
              label={`Edit ${expense.title}`}
              hoverClass="hover:bg-primary-500/10 hover:text-primary-400"
            >
              {EDIT_ICON}
            </IconButton>

            <IconButton
              onClick={() => setDeleteOpen(true)}
              label={`Delete ${expense.title}`}
              hoverClass="hover:bg-danger-500/10 hover:text-danger-400"
            >
              {DELETE_ICON}
            </IconButton>
          </div>
        </td>
      </tr>

      {/* Edit modal */}
      <ExpenseModal isOpen={editOpen} onClose={() => setEditOpen(false)} title="Edit Expense">
        <ExpenseForm
          initialValues={expense}
          onSubmit={handleEdit}
          onCancel={() => setEditOpen(false)}
          loading={saving}
        />
      </ExpenseModal>

      {/* Delete confirmation modal */}
      <ExpenseModal isOpen={deleteOpen} onClose={() => setDeleteOpen(false)} title="Delete Expense">
        <DeleteConfirmBody
          onCancel={() => setDeleteOpen(false)}
          onConfirm={handleDelete}
          itemName="Expense"
        >
          Are you sure you want to delete{' '}
          <span className="font-semibold text-white">"{expense.title}"</span>?
          This action <span className="font-semibold text-danger-400">cannot be undone</span>.
        </DeleteConfirmBody>
      </ExpenseModal>
    </>
  );
});

export default ExpenseRow;
