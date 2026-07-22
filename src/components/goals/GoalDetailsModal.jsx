import { formatCurrency, formatLocalDate } from '../../utils/formatters';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import GoalProgressBar from './GoalProgressBar';
import useGoals from '../../hooks/useGoals';

export default function GoalDetailsModal({ isOpen, onClose, goal, onAddMonthly, onAddCustom }) {
  const { calculateProgress, calculateRemainingAmount } = useGoals();
  
  if (!goal) return null;

  const pct = calculateProgress(goal.id);
  const remaining = calculateRemainingAmount(goal.id);
  const history = goal.history || [];

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Goal Details">
      <div className="flex flex-col h-full">
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          
          {/* Header Info */}
          <div>
            <h3 className="text-xl font-bold text-white mb-1">{goal.title}</h3>
            <p className="text-sm text-slate-400 mb-4">{goal.description || 'No description provided.'}</p>
            
            <div className="flex items-center gap-2 mb-4">
              <span className="rounded-md border px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider bg-surface-700/50 text-slate-300 border-surface-600">
                {goal.priority} Priority
              </span>
              <span className="rounded-md border px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider bg-primary-500/20 text-primary-400 border-primary-500/30">
                Target: {formatLocalDate(goal.targetDate)}
              </span>
            </div>
            
            <GoalProgressBar currentAmount={goal.currentAmount} targetAmount={goal.targetAmount} pct={pct} />
            
            <div className="grid grid-cols-3 gap-2 rounded-xl bg-surface-700/30 p-4 text-center mt-4 border border-surface-700/50">
              <div>
                <p className="text-xs text-slate-500">Target</p>
                <p className="mt-1 text-sm font-bold text-white">{formatCurrency(goal.targetAmount)}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500">Saved</p>
                <p className="mt-1 text-sm font-bold text-success-400">{formatCurrency(goal.currentAmount)}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500">Left</p>
                <p className="mt-1 text-sm font-bold text-slate-300">{formatCurrency(remaining)}</p>
              </div>
            </div>
          </div>

          {/* Savings Actions */}
          {pct < 100 && (
            <div className="bg-surface-800 rounded-xl p-4 border border-surface-700/60">
              <h4 className="text-sm font-semibold text-white mb-3">Add Savings</h4>
              <div className="grid gap-3 sm:grid-cols-2">
                <Button variant="secondary" onClick={() => onAddMonthly(goal)} className="w-full justify-center" disabled={!goal.monthlyContribution || goal.monthlyContribution <= 0}>
                  Add Monthly ({formatCurrency(goal.monthlyContribution || 0)})
                </Button>
                <Button variant="primary" onClick={() => onAddCustom(goal)} className="w-full justify-center">
                  Add Custom Amount
                </Button>
              </div>
            </div>
          )}

          {/* History */}
          <div>
            <h4 className="text-sm font-semibold text-white mb-3">Savings History</h4>
            {history.length === 0 ? (
              <div className="rounded-xl border border-surface-700/50 p-6 text-center">
                <p className="text-sm text-slate-500">No savings recorded yet.</p>
              </div>
            ) : (
              <div className="space-y-2">
                {history.map((record) => (
                  <div key={record.id} className="flex items-center justify-between rounded-xl bg-surface-800 p-3 border border-surface-700/50">
                    <div>
                      <p className="text-sm font-medium text-white">{formatCurrency(record.amount)}</p>
                      <p className="text-xs text-slate-400">
                        {formatLocalDate(record.date)} • {record.type === 'monthly' ? 'Monthly Saving' : 'Custom Saving'}
                      </p>
                      {record.notes && <p className="text-xs text-slate-500 mt-1">{record.notes}</p>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          
        </div>
        
        {/* Footer */}
        <div className="flex-shrink-0 flex items-center justify-end border-t border-surface-700/60 p-6 bg-surface-900 rounded-b-2xl sm:rounded-b-2xl">
          <Button type="button" variant="ghost" onClick={onClose}>Close</Button>
        </div>
      </div>
    </Modal>
  );
}
