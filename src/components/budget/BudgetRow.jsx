import { memo, useState, useCallback } from 'react';
import { BUDGET_CATEGORY_MAP } from '../../constants/budgetCategories';
import { formatCurrency, MONTH_NAMES } from '../../utils/formatters';
import { IconButton, EDIT_ICON, DELETE_ICON } from '../ui/FormField';
import Button from '../ui/Button';
import BudgetModal from './BudgetModal';
import BudgetForm from './BudgetForm';
import BudgetProgressBar from './BudgetProgressBar';
import DeleteConfirmBody from '../ui/DeleteConfirmBody';
import useBudget from '../../hooks/useBudget';

// ── Main component ─────────────────────────────────────────────────────────

/**
 * BudgetRow — renders one <tr> for a budget, plus Edit and Delete modals.
 *
 * Props:
 *   budget — the full budget object from BudgetContext
 */
const BudgetRow = memo(function BudgetRow({ budget }) {
  const { updateBudget, deleteBudget, calculateBudgetProgress } = useBudget();
  const [editOpen,   setEditOpen]   = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [saving,     setSaving]     = useState(false);

  const cat = BUDGET_CATEGORY_MAP[budget.category] ?? BUDGET_CATEGORY_MAP.other;
  const pct = calculateBudgetProgress(budget.id);

  const handleEdit = useCallback((values) => {
    setSaving(true);
    updateBudget(budget.id, values);
    setSaving(false);
    setEditOpen(false);
  }, [budget.id, updateBudget]);

  const handleDelete = useCallback(() => {
    deleteBudget(budget.id);
    setDeleteOpen(false);
  }, [budget.id, deleteBudget]);

  return (
    <>
      <tr className="group border-b border-surface-700/40 transition-colors hover:bg-white/[0.02]">

        {/* Category */}
        <td className="px-4 py-3">
          <div className="flex items-center gap-3">
            <div
              className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl text-base ${cat.bg} ${cat.color}`}
              aria-hidden="true"
            >
              {cat.icon}
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-white">{cat.name}</p>
            </div>
          </div>
        </td>

        {/* Monthly Limit */}
        <td className="px-4 py-3 text-right">
          <span className="text-sm font-semibold tabular-nums text-white">
            {formatCurrency(budget.monthlyLimit)}
          </span>
        </td>

        {/* Spent */}
        <td className="hidden px-4 py-3 text-right sm:table-cell">
          <span className="text-sm tabular-nums text-danger-400">
            {formatCurrency(budget.spent)}
          </span>
        </td>

        {/* Remaining */}
        <td className="hidden px-4 py-3 text-right md:table-cell">
          <span className={`text-sm tabular-nums font-medium ${budget.remaining >= 0 ? 'text-success-400' : 'text-danger-400'}`}>
            {budget.remaining >= 0
              ? formatCurrency(budget.remaining)
              : `−${formatCurrency(Math.abs(budget.remaining))}`}
          </span>
        </td>

        {/* Progress */}
        <td className="hidden px-4 py-3 lg:table-cell">
          <BudgetProgressBar
            spent={budget.spent}
            monthlyLimit={budget.monthlyLimit}
            pct={pct}
            compact
          />
        </td>

        {/* Period */}
        <td className="hidden px-4 py-3 sm:table-cell">
          <span className="badge badge-neutral text-xs">
            {MONTH_NAMES[budget.month]} {budget.year}
          </span>
        </td>

        {/* Actions */}
        <td className="px-4 py-3">
          <div className="flex items-center justify-end gap-1 opacity-0 transition-opacity group-hover:opacity-100 focus-within:opacity-100">
            <IconButton
              onClick={() => setEditOpen(true)}
              label={`Edit ${cat.name} budget`}
              hoverClass="hover:bg-primary-500/10 hover:text-primary-400"
            >
              {EDIT_ICON}
            </IconButton>

            <IconButton
              onClick={() => setDeleteOpen(true)}
              label={`Delete ${cat.name} budget`}
              hoverClass="hover:bg-danger-500/10 hover:text-danger-400"
            >
              {DELETE_ICON}
            </IconButton>
          </div>
        </td>
      </tr>

      {/* Edit modal */}
      <BudgetModal isOpen={editOpen} onClose={() => setEditOpen(false)} title="Edit Budget">
        <BudgetForm
          initialValues={budget}
          onSubmit={handleEdit}
          onCancel={() => setEditOpen(false)}
          loading={saving}
        />
      </BudgetModal>

      {/* Delete confirmation modal */}
      <BudgetModal isOpen={deleteOpen} onClose={() => setDeleteOpen(false)} title="Delete Budget">
        <DeleteConfirmBody
          onCancel={() => setDeleteOpen(false)}
          onConfirm={handleDelete}
          itemName="Budget"
        >
          Are you sure you want to delete the{' '}
          <span className="font-semibold text-white">"{cat.name}"</span>{' '}
          budget for{' '}
          <span className="font-semibold text-white">
            {MONTH_NAMES[budget.month]} {budget.year}
          </span>?
          This action <span className="font-semibold text-danger-400">cannot be undone</span>.
        </DeleteConfirmBody>
      </BudgetModal>
    </>
  );
});

export default BudgetRow;
