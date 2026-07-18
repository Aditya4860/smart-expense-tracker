import { useState, useCallback } from 'react';
import DashboardLayout from '../layouts/DashboardLayout';
import WelcomeCard from '../components/dashboard/WelcomeCard';
import SummaryCards from '../components/dashboard/SummaryCards';
import QuickActions from '../components/dashboard/QuickActions';
import ExpenseModal from '../components/expenses/ExpenseModal';
import ExpenseForm from '../components/expenses/ExpenseForm';
import IncomeModal from '../components/income/IncomeModal';
import IncomeForm from '../components/income/IncomeForm';
import useExpenses from '../hooks/useExpenses';
import useIncome from '../hooks/useIncome';

/**
 * DashboardInner — consumes ExpenseContext and IncomeContext (provided by App).
 *
 * Manages modal state for both "Add Expense" and "Add Income" quick actions.
 */
function DashboardInner() {
  const { addExpense } = useExpenses();
  const { addIncome  } = useIncome();

  const [expenseOpen, setExpenseOpen] = useState(false);
  const [incomeOpen,  setIncomeOpen]  = useState(false);
  const [savingExp,   setSavingExp]   = useState(false);
  const [savingInc,   setSavingInc]   = useState(false);

  const handleAddExpense = useCallback((values) => {
    setSavingExp(true);
    addExpense(values);
    setSavingExp(false);
    setExpenseOpen(false);
  }, [addExpense]);

  const handleAddIncome = useCallback((values) => {
    setSavingInc(true);
    addIncome(values);
    setSavingInc(false);
    setIncomeOpen(false);
  }, [addIncome]);

  return (
    <>
      <div className="space-y-6">
        <WelcomeCard />
        <SummaryCards />
        <QuickActions
          onAddExpense={() => setExpenseOpen(true)}
          onAddIncome={() => setIncomeOpen(true)}
        />
      </div>

      {/* Add Expense modal */}
      <ExpenseModal
        isOpen={expenseOpen}
        onClose={() => setExpenseOpen(false)}
        title="Add Expense"
      >
        <ExpenseForm
          onSubmit={handleAddExpense}
          onCancel={() => setExpenseOpen(false)}
          loading={savingExp}
        />
      </ExpenseModal>

      {/* Add Income modal */}
      <IncomeModal
        isOpen={incomeOpen}
        onClose={() => setIncomeOpen(false)}
        title="Add Income"
      >
        <IncomeForm
          onSubmit={handleAddIncome}
          onCancel={() => setIncomeOpen(false)}
          loading={savingInc}
        />
      </IncomeModal>
    </>
  );
}

/**
 * Dashboard — main authenticated landing page.
 * ExpenseContext and IncomeContext are provided by App above the route tree.
 */
export default function Dashboard() {
  return (
    <DashboardLayout>
      <DashboardInner />
    </DashboardLayout>
  );
}
