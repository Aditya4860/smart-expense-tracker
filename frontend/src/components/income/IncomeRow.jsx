import { memo, useState, useCallback } from 'react';
import { INCOME_CATEGORY_MAP } from '../../constants/incomeCategories';
import { formatCurrency, formatLocalDate } from '../../utils/formatters';
import { IconButton, EDIT_ICON, DELETE_ICON } from '../ui/FormField';
import Button from '../ui/Button';
import IncomeModal from './IncomeModal';
import IncomeForm from './IncomeForm';
import DeleteConfirmBody from '../ui/DeleteConfirmBody';
import useIncome from '../../hooks/useIncome';

// ── Main component ─────────────────────────────────────────────────────────

/**
 * IncomeRow — renders one <tr> for an income record, plus Edit and Delete modals.
 *
 * Props:
 *   record — the full income object from IncomeContext
 */
const IncomeRow = memo(function IncomeRow({ record }) {
  const { updateIncome, deleteIncome } = useIncome();
  const [editOpen,   setEditOpen]   = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [saving,     setSaving]     = useState(false);

  const cat = INCOME_CATEGORY_MAP[record.category] ?? INCOME_CATEGORY_MAP.other;

  const handleEdit = useCallback((values) => {
    setSaving(true);
    updateIncome(record.id, values);
    setSaving(false);
    setEditOpen(false);
  }, [record.id, updateIncome]);

  const handleDelete = useCallback(() => {
    deleteIncome(record.id);
    setDeleteOpen(false);
  }, [record.id, deleteIncome]);

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
              <p className="truncate text-sm font-medium text-white">{record.title}</p>
              <p className="truncate text-xs text-slate-500">{cat.name}</p>
            </div>
          </div>
        </td>

        {/* Amount */}
        <td className="px-4 py-3 text-right">
          <span className="text-sm font-semibold tabular-nums text-success-400">
            {formatCurrency(record.amount)}
          </span>
        </td>

        {/* Date — hidden on xs */}
        <td className="hidden px-4 py-3 sm:table-cell">
          <span className="text-sm text-slate-400">{formatLocalDate(record.date)}</span>
        </td>

        {/* Source — hidden on xs + sm */}
        <td className="hidden px-4 py-3 md:table-cell">
          {record.source ? (
            <span className="badge badge-neutral text-xs">{record.source}</span>
          ) : (
            <span className="text-xs text-slate-600">—</span>
          )}
        </td>

        {/* Actions */}
        <td className="px-4 py-3">
          <div className="flex items-center justify-end gap-1 opacity-0 transition-opacity group-hover:opacity-100 focus-within:opacity-100">
            <IconButton
              onClick={() => setEditOpen(true)}
              label={`Edit ${record.title}`}
              hoverClass="hover:bg-primary-500/10 hover:text-primary-400"
            >
              {EDIT_ICON}
            </IconButton>

            <IconButton
              onClick={() => setDeleteOpen(true)}
              label={`Delete ${record.title}`}
              hoverClass="hover:bg-danger-500/10 hover:text-danger-400"
            >
              {DELETE_ICON}
            </IconButton>
          </div>
        </td>
      </tr>

      {/* Edit modal */}
      <IncomeModal isOpen={editOpen} onClose={() => setEditOpen(false)} title="Edit Income">
        <IncomeForm
          initialValues={record}
          onSubmit={handleEdit}
          onCancel={() => setEditOpen(false)}
          loading={saving}
        />
      </IncomeModal>

      {/* Delete confirmation modal */}
      <IncomeModal isOpen={deleteOpen} onClose={() => setDeleteOpen(false)} title="Delete Income">
        <DeleteConfirmBody
          onCancel={() => setDeleteOpen(false)}
          onConfirm={handleDelete}
          itemName="Income"
        >
          Are you sure you want to delete{' '}
          <span className="font-semibold text-white">"{record.title}"</span>?
          This action <span className="font-semibold text-danger-400">cannot be undone</span>.
        </DeleteConfirmBody>
      </IncomeModal>
    </>
  );
});

export default IncomeRow;
