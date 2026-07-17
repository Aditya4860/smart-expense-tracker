import { memo, useState, useCallback } from 'react';
import { INCOME_CATEGORY_MAP } from '../../constants/incomeCategories';
import Button from '../ui/Button';
import IncomeModal from './IncomeModal';
import IncomeForm from './IncomeForm';
import useIncome from '../../hooks/useIncome';

// ── Formatters (created once — never recreated) ────────────────────────────

const amountFmt = new Intl.NumberFormat('en-IN', {
  style:                 'currency',
  currency:              'INR',
  maximumFractionDigits: 2,
});

function formatDate(dateStr) {
  return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric',
  });
}

// ── Icon button ────────────────────────────────────────────────────────────

function IconButton({ onClick, label, hoverClass, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className={[
        'flex h-7 w-7 items-center justify-center rounded-lg',
        'text-slate-500 transition-colors',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500',
        hoverClass,
      ].join(' ')}
    >
      {children}
    </button>
  );
}

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
            {amountFmt.format(record.amount)}
          </span>
        </td>

        {/* Date — hidden on xs */}
        <td className="hidden px-4 py-3 sm:table-cell">
          <span className="text-sm text-slate-400">{formatDate(record.date)}</span>
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
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="h-3.5 w-3.5" aria-hidden="true">
                <path d="M13.488 2.513a1.75 1.75 0 0 0-2.475 0L6.75 6.774a2.75 2.75 0 0 0-.596.892l-.848 2.047a.75.75 0 0 0 .98.98l2.047-.848a2.75 2.75 0 0 0 .892-.596l4.261-4.263a1.75 1.75 0 0 0 0-2.474Z" />
                <path d="M4.75 3.5c-.69 0-1.25.56-1.25 1.25v6.5c0 .69.56 1.25 1.25 1.25h6.5c.69 0 1.25-.56 1.25-1.25V9a.75.75 0 0 1 1.5 0v2.25A2.75 2.75 0 0 1 11.25 14h-6.5A2.75 2.75 0 0 1 2 11.25v-6.5A2.75 2.75 0 0 1 4.75 2H7a.75.75 0 0 1 0 1.5H4.75Z" />
              </svg>
            </IconButton>

            <IconButton
              onClick={() => setDeleteOpen(true)}
              label={`Delete ${record.title}`}
              hoverClass="hover:bg-danger-500/10 hover:text-danger-400"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="h-3.5 w-3.5" aria-hidden="true">
                <path fillRule="evenodd" d="M5 3.25V4H2.75a.75.75 0 0 0 0 1.5h.3l.815 8.15A1.5 1.5 0 0 0 5.357 15h5.285a1.5 1.5 0 0 0 1.493-1.35l.815-8.15h.3a.75.75 0 0 0 0-1.5H11v-.75A2.25 2.25 0 0 0 8.75 1h-1.5A2.25 2.25 0 0 0 5 3.25Zm2.25-.75a.75.75 0 0 0-.75.75V4h3v-.75a.75.75 0 0 0-.75-.75h-1.5ZM6.05 6a.75.75 0 0 1 .787.713l.275 5.5a.75.75 0 0 1-1.498.075l-.275-5.5A.75.75 0 0 1 6.05 6Zm3.9 0a.75.75 0 0 1 .712.787l-.275 5.5a.75.75 0 0 1-1.498-.075l.275-5.5a.75.75 0 0 1 .786-.711Z" clipRule="evenodd" />
              </svg>
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
        <div className="space-y-5">
          <div className="rounded-xl border border-danger-500/20 bg-danger-500/5 p-4">
            <p className="text-sm text-slate-300">
              Are you sure you want to delete{' '}
              <span className="font-semibold text-white">"{record.title}"</span>?
              This action <span className="font-semibold text-danger-400">cannot be undone</span>.
            </p>
          </div>
          <div className="flex items-center justify-end gap-3 border-t border-surface-700/60 pt-4">
            <Button variant="ghost" onClick={() => setDeleteOpen(false)}>Cancel</Button>
            <Button variant="danger" onClick={handleDelete}>Delete Income</Button>
          </div>
        </div>
      </IncomeModal>
    </>
  );
});

export default IncomeRow;
