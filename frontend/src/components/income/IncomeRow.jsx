import { memo, useState, useCallback } from 'react';
import { useCategory } from '../../context/CategoryContext';
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

  const { getCategoryById } = useCategory();
  
  const apiCat = getCategoryById(record.category);
  const cat = apiCat 
    ? { bg: 'bg-slate-700/50', color: apiCat.color, icon: apiCat.icon, name: apiCat.name }
    : { bg: 'bg-slate-700/50', color: 'text-slate-400', icon: '💰', name: 'Other' };

  const handleEdit = useCallback(async (values) => {
    setSaving(true);
    try {
      await updateIncome(record.id, values);
      setEditOpen(false);
    } catch (err) {
      console.error(err);
      // Toast would be nice here, but since it's a row, the error is logged and modal stays open
    } finally {
      setSaving(false);
    }
  }, [record.id, updateIncome]);

  const handleDelete = useCallback(() => {
    deleteIncome(record.id);
    setDeleteOpen(false);
  }, [record.id, deleteIncome]);

  return (
    <>
      <tr className="group border-b border-surface-700/40 transition-colors hover:bg-surface-800/80 hover:shadow-[inset_4px_0_0_rgba(var(--color-primary-500),1)]">

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
              <p className="truncate text-sm font-medium text-white">{record.source || 'Income'}</p>
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
              label={`Edit ${record.source || 'Income'}`}
              hoverClass="hover:bg-primary-500/10 hover:text-primary-400"
            >
              {EDIT_ICON}
            </IconButton>

            <IconButton
              onClick={() => setDeleteOpen(true)}
              label={`Delete ${record.source || 'Income'}`}
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
          <span className="font-semibold text-white">"{record.source || 'this income'}"</span>?
          This action <span className="font-semibold text-danger-400">cannot be undone</span>.
        </DeleteConfirmBody>
      </IncomeModal>
    </>
  );
});

export default IncomeRow;
