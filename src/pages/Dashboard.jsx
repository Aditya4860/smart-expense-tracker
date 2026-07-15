import { useState } from 'react';
import DashboardLayout from '../layouts/DashboardLayout';
import WelcomeCard from '../components/dashboard/WelcomeCard';
import SummaryCards from '../components/dashboard/SummaryCards';
import QuickActions from '../components/dashboard/QuickActions';
import ExpenseModal from '../components/expenses/ExpenseModal';
import ExpenseForm from '../components/expenses/ExpenseForm';
import useExpenses from '../hooks/useExpenses';

/**
 * DashboardInner — consumes ExpenseContext (already provided by App).
 */
function DashboardInner() {
  const { addExpense } = useExpenses();
  const [addOpen, setAddOpen] = useState(false);
  const [saving,  setSaving]  = useState(false);

  async function handleAdd(values) {
    setSaving(true);
    addExpense(values);
    setSaving(false);
    setAddOpen(false);
  }

  return (
    <>
      <div className="space-y-6">
        <WelcomeCard />
        <SummaryCards />
        <QuickActions onAddExpense={() => setAddOpen(true)} />
      </div>

      <ExpenseModal isOpen={addOpen} onClose={() => setAddOpen(false)} title="Add Expense">
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
 */
export default function Dashboard() {
  return (
    <DashboardLayout>
      <DashboardInner />
    </DashboardLayout>
  );
}
