import Button from './Button';

/**
 * DeleteConfirmBody — shared UI for inline delete confirmations.
 * 
 * Props:
 *   onCancel — () => void
 *   onConfirm — () => void
 *   itemName — string for the submit button text (e.g., "Expense")
 *   children — the warning message to display
 */
export default function DeleteConfirmBody({ onCancel, onConfirm, itemName = 'item', children }) {
  return (
    <div className="space-y-5">
      <div className="rounded-xl border border-danger-500/20 bg-danger-500/5 p-4">
        <p className="text-sm text-slate-300">
          {children}
        </p>
      </div>
      <div className="flex items-center justify-end gap-3 border-t border-surface-700/60 pt-4">
        <Button variant="ghost" onClick={onCancel} className="text-slate-400">
          Cancel
        </Button>
        <Button variant="danger" onClick={onConfirm}>
          Delete {itemName}
        </Button>
      </div>
    </div>
  );
}
