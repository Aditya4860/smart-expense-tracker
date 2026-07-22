import { useState, useCallback } from 'react';
import DashboardLayout from '../layouts/DashboardLayout';
import GoalSummary from '../components/goals/GoalSummary';
import GoalTable from '../components/goals/GoalTable';
import GoalCard from '../components/goals/GoalCard';
import GoalModal from '../components/goals/GoalModal';
import GoalForm from '../components/goals/GoalForm';
import GoalDetailsModal from '../components/goals/GoalDetailsModal';
import AddSavingModal from '../components/goals/AddSavingModal';
import GoalEmptyState from '../components/goals/GoalEmptyState';
import Button from '../components/ui/Button';
import useGoals from '../hooks/useGoals';

const PlusIcon = (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="h-4 w-4" aria-hidden="true">
    <path d="M8.75 3.75a.75.75 0 0 0-1.5 0v3.5h-3.5a.75.75 0 0 0 0 1.5h3.5v3.5a.75.75 0 0 0 1.5 0v-3.5h3.5a.75.75 0 0 0 0-1.5h-3.5v-3.5Z" />
  </svg>
);

const TableIcon = (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="h-4 w-4" aria-hidden="true">
    <path fillRule="evenodd" d="M1 3.75C1 2.784 1.784 2 2.75 2h10.5c.966 0 1.75.784 1.75 1.75v8.5A1.75 1.75 0 0 1 13.25 14H2.75A1.75 1.75 0 0 1 1 12.25v-8.5ZM2.5 5v7.25c0 .138.112.25.25.25h10.5a.25.25 0 0 0 .25-.25V5h-11Zm0-1.5h11V3.75a.25.25 0 0 0-.25-.25H2.75a.25.25 0 0 0-.25.25V3.5Z" clipRule="evenodd" />
  </svg>
);

const GridIcon = (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="h-4 w-4" aria-hidden="true">
    <path d="M1 3a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V3ZM9 3a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2a2 2 0 0 1-2 2h-2a2 2 0 0 1-2-2V3ZM1 11a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2v-2ZM9 11a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2a2 2 0 0 1-2 2h-2a2 2 0 0 1-2-2v-2Z" />
  </svg>
);

function GoalsInner() {
  const [addOpen,    setAddOpen]    = useState(false);
  const [editGoal,   setEditGoal]   = useState(null);
  const [delGoal,    setDelGoal]    = useState(null);
  const [selectedGoal, setSelectedGoal] = useState(null); // For Details
  const [addSavingGoal, setAddSavingGoal] = useState(null); // For Add Custom Saving
  
  const [saving,     setSaving]     = useState(false);
  const [viewMode,   setViewMode]   = useState('table'); // 'table' | 'grid'

  const { goals, addGoal, updateGoal, deleteGoal, addGoalSaving } = useGoals();

  const handleAdd = useCallback((values) => {
    setSaving(true);
    addGoal(values);
    setSaving(false);
    setAddOpen(false);
  }, [addGoal]);

  const handleEdit = useCallback((values) => {
    if (!editGoal) return;
    setSaving(true);
    updateGoal(editGoal.id, values);
    setSaving(false);
    setEditGoal(null);
  }, [editGoal, updateGoal]);

  const handleDelete = useCallback(() => {
    if (!delGoal) return;
    deleteGoal(delGoal.id);
    setDelGoal(null);
    setSelectedGoal(null); // Close details if open
  }, [delGoal, deleteGoal]);
  
  const handleAddMonthly = useCallback((goal) => {
    addGoalSaving(goal.id, goal.monthlyContribution, 'monthly', 'Monthly contribution');
  }, [addGoalSaving]);

  const handleAddCustomSubmit = useCallback((data) => {
    if (!addSavingGoal) return;
    setSaving(true);
    addGoalSaving(addSavingGoal.id, data.amount, data.type, data.notes, data.date);
    setSaving(false);
    setAddSavingGoal(null);
  }, [addSavingGoal, addGoalSaving]);

  return (
    <div className="space-y-6">

      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Savings Goals</h1>
          <p className="mt-1 text-sm text-slate-500">
            Track and manage your financial targets.
          </p>
        </div>
        <Button id="open-add-goal-modal" variant="primary" size="md" onClick={() => setAddOpen(true)}>
          {PlusIcon} Add Goal
        </Button>
      </div>

      <GoalSummary />

      <div className="flex items-center justify-between gap-3">
        <p className="text-sm text-slate-500">
          {goals.length === 0 ? (
            <span className="text-slate-600">No goals yet</span>
          ) : (
            <><span className="font-semibold text-white">{goals.length}</span> {goals.length === 1 ? 'goal' : 'goals'} configured</>
          )}
        </p>

        <div className="flex items-center gap-1 rounded-xl border border-surface-700/60 bg-surface-800 p-1">
          <button
            id="goal-view-table" type="button" onClick={() => setViewMode('table')}
            aria-pressed={viewMode === 'table'} aria-label="Table view"
            className={`flex h-7 w-7 items-center justify-center rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 ${viewMode === 'table' ? 'bg-primary-500/20 text-primary-400' : 'text-slate-500 hover:text-slate-300'}`}
          >
            {TableIcon}
          </button>
          <button
            id="goal-view-grid" type="button" onClick={() => setViewMode('grid')}
            aria-pressed={viewMode === 'grid'} aria-label="Grid view"
            className={`flex h-7 w-7 items-center justify-center rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 ${viewMode === 'grid' ? 'bg-primary-500/20 text-primary-400' : 'text-slate-500 hover:text-slate-300'}`}
          >
            {GridIcon}
          </button>
        </div>
      </div>

      {viewMode === 'table' ? (
        <GoalTable onEdit={setEditGoal} onDelete={setDelGoal} onClickRow={setSelectedGoal} />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {goals.length === 0 ? (
            <div className="col-span-full"><GoalEmptyState /></div>
          ) : (
            goals.map(goal => (
              <GoalCard 
                key={goal.id} 
                goal={goal} 
                onEdit={() => setEditGoal(goal)} 
                onDelete={() => setDelGoal(goal)} 
                onClick={() => setSelectedGoal(goal)} 
              />
            ))
          )}
        </div>
      )}

      {/* Add Modal */}
      <GoalModal isOpen={addOpen} onClose={() => setAddOpen(false)} title="Add Goal">
        <GoalForm onSubmit={handleAdd} onCancel={() => setAddOpen(false)} loading={saving} />
      </GoalModal>

      {/* Edit Modal */}
      <GoalModal isOpen={Boolean(editGoal)} onClose={() => setEditGoal(null)} title="Edit Goal">
        <GoalForm initialValues={editGoal} onSubmit={handleEdit} onCancel={() => setEditGoal(null)} loading={saving} />
      </GoalModal>
      
      {/* Details Modal */}
      <GoalDetailsModal 
        isOpen={Boolean(selectedGoal)} 
        onClose={() => setSelectedGoal(null)} 
        goal={selectedGoal ? goals.find(g => g.id === selectedGoal.id) : null}
        onAddMonthly={handleAddMonthly}
        onAddCustom={(goal) => setAddSavingGoal(goal)}
      />

      {/* Add Custom Saving Modal */}
      <AddSavingModal
        isOpen={Boolean(addSavingGoal)}
        onClose={() => setAddSavingGoal(null)}
        goalTitle={addSavingGoal?.title}
        onSubmit={handleAddCustomSubmit}
        loading={saving}
      />

      {/* Delete Confirmation Modal */}
      <GoalModal isOpen={Boolean(delGoal)} onClose={() => setDelGoal(null)} title="Delete Goal">
        <div className="space-y-5">
          <div className="rounded-xl border border-danger-500/20 bg-danger-500/5 p-4">
            <p className="text-sm text-slate-300">
              Are you sure you want to delete the <span className="font-semibold text-white">"{delGoal?.title}"</span> goal? This action <span className="font-semibold text-danger-400">cannot be undone</span>.
            </p>
          </div>
          <div className="flex items-center justify-end gap-3 border-t border-surface-700/60 pt-4">
            <Button variant="ghost" onClick={() => setDelGoal(null)}>Cancel</Button>
            <Button variant="danger" onClick={handleDelete}>Delete Goal</Button>
          </div>
        </div>
      </GoalModal>
    </div>
  );
}

export default function Goals() {
  return (
    <DashboardLayout>
      <GoalsInner />
    </DashboardLayout>
  );
}
