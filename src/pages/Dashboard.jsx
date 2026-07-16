import { useState, useCallback } from 'react';
import DashboardLayout from '../layouts/DashboardLayout';
import WelcomeCard from '../components/dashboard/WelcomeCard';
import SummaryCards from '../components/dashboard/SummaryCards';
import QuickActions from '../components/dashboard/QuickActions';
import ExpenseModal from '../components/expenses/ExpenseModal';
import ExpenseForm from '../components/expenses/ExpenseForm';
import useExpenses from '../hooks/useExpenses';

/**
 * DashboardInner — consumes ExpenseContext (provided by App).
 *
 * Manages the "Add Expense" modal state and delegates opening
 * to the QuickActions "Add Expense" button via the onAddExpense prop.
 */
function DashboardInner() {
  const { addExpense } = useExpenses();
  const [addOpen, setAddOpen] = useState(false);
  const [saving,  setSaving]  = useState(false);

  const handleAdd = useCallback((values) => {
    setSaving(true);
    addExpense(values);
    setSaving(false);
    setAddOpen(false);
  }, [addExpense]);

  return (
    <>
      <div className="space-y-6">
        <WelcomeCard />
        <SummaryCards />
        <QuickActions onAddExpense={() => setAddOpen(true)} />
      </div>

      <ExpenseModal
        isOpen={addOpen}
        onClose={() => setAddOpen(false)}
        title="Add Expense"
      >
        <ExpenseForm
          onSubmit={handleAdd}
          onCancel={() => setAddOpen(false)}
          loading={saving}
        />
      </ExpenseModal>
    </>
  );
}

/**
 * Dashboard — main authenticated landing page.
 * ExpenseContext is provided by App above the route tree.
 */
export default function Dashboard() {
  return (
    <DashboardLayout>
      <DashboardInner />
    </DashboardLayout>
  );
}
