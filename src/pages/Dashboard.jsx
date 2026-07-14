import DashboardLayout from '../layouts/DashboardLayout';
import WelcomeCard from '../components/dashboard/WelcomeCard';
import SummaryCards from '../components/dashboard/SummaryCards';
import QuickActions from '../components/dashboard/QuickActions';

/**
 * Dashboard — Phase 3 application shell.
 *
 * Renders the full fintech dashboard layout with:
 *   - DashboardLayout (sidebar + navbar + page container)
 *   - WelcomeCard (greeting + user name + motivational message)
 *   - SummaryCards (4 financial stat cards, mock data)
 *   - QuickActions (Add Expense / Add Income / View Reports buttons)
 */
export default function Dashboard() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <WelcomeCard />
        <SummaryCards />
        <QuickActions />
      </div>
    </DashboardLayout>
  );
}
