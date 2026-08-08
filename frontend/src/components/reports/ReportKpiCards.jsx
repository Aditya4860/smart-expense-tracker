import { memo } from 'react';
import {
  TrendingUp,
  TrendingDown,
  Wallet,
  PiggyBank,
  Receipt,
  ArrowUpRight,
  ArrowDownRight,
  ShieldCheck,
  Target,
  Activity,
  Layers,
} from 'lucide-react';
import StatCard from '../ui/StatCard';
import Skeleton from '../ui/Skeleton';
import { formatCurrency } from '../../utils/formatters';

const ReportKpiCards = memo(function ReportKpiCards({ reportType, data, loading }) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="flex flex-col gap-3 rounded-2xl border border-surface-700/60 bg-surface-800 p-5 shadow-card-dark"
          >
            <div className="flex items-start justify-between">
              <Skeleton className="h-3.5 w-24" />
              <Skeleton className="h-9 w-9 rounded-xl" />
            </div>
            <Skeleton className="h-7 w-32" />
            <Skeleton className="h-3.5 w-20" />
          </div>
        ))}
      </div>
    );
  }

  if (!data) return null;

  switch (reportType) {
    case 'monthly': {
      const net = data.net_balance ?? 0;
      const isPositive = net >= 0;
      return (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            id="kpi-monthly-income"
            label="Total Income"
            value={formatCurrency(data.total_income ?? 0)}
            sub={`${data.income_transaction_count ?? 0} deposits`}
            icon={<TrendingUp className="h-5 w-5" />}
            iconBg="bg-success-500/10"
            iconText="text-success-400"
            valueCls="text-success-400"
          />
          <StatCard
            id="kpi-monthly-expense"
            label="Total Expenses"
            value={formatCurrency(data.total_expenses ?? 0)}
            sub={`${data.expense_transaction_count ?? 0} transactions`}
            icon={<TrendingDown className="h-5 w-5" />}
            iconBg="bg-danger-500/10"
            iconText="text-danger-400"
            valueCls="text-danger-400"
          />
          <StatCard
            id="kpi-monthly-net"
            label="Net Balance"
            value={formatCurrency(net)}
            sub={isPositive ? 'Surplus this month' : 'Deficit this month'}
            icon={<Wallet className="h-5 w-5" />}
            iconBg={isPositive ? 'bg-primary-500/10' : 'bg-danger-500/10'}
            iconText={isPositive ? 'text-primary-400' : 'text-danger-400'}
            valueCls={isPositive ? 'text-white' : 'text-danger-400'}
          />
          <StatCard
            id="kpi-monthly-savings"
            label="Savings Rate"
            value={`${(data.savings_rate ?? 0).toFixed(1)}%`}
            sub={`${formatCurrency(data.savings_contributions ?? 0)} allocated`}
            icon={<PiggyBank className="h-5 w-5" />}
            iconBg="bg-accent-500/10"
            iconText="text-accent-400"
            valueCls="text-accent-400"
          />
        </div>
      );
    }

    case 'yearly': {
      const net = data.net_balance ?? 0;
      const isPositive = net >= 0;
      return (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            id="kpi-yearly-income"
            label="Yearly Income"
            value={formatCurrency(data.total_income ?? 0)}
            sub={`Avg. ${formatCurrency(data.average_monthly_income ?? 0)} / mo`}
            icon={<TrendingUp className="h-5 w-5" />}
            iconBg="bg-success-500/10"
            iconText="text-success-400"
            valueCls="text-success-400"
          />
          <StatCard
            id="kpi-yearly-expense"
            label="Yearly Expenses"
            value={formatCurrency(data.total_expenses ?? 0)}
            sub={`Avg. ${formatCurrency(data.average_monthly_expenses ?? 0)} / mo`}
            icon={<TrendingDown className="h-5 w-5" />}
            iconBg="bg-danger-500/10"
            iconText="text-danger-400"
            valueCls="text-danger-400"
          />
          <StatCard
            id="kpi-yearly-net"
            label="Annual Net Balance"
            value={formatCurrency(net)}
            sub={isPositive ? 'Annual surplus' : 'Annual deficit'}
            icon={<Wallet className="h-5 w-5" />}
            iconBg={isPositive ? 'bg-primary-500/10' : 'bg-danger-500/10'}
            iconText={isPositive ? 'text-primary-400' : 'text-danger-400'}
            valueCls={isPositive ? 'text-white' : 'text-danger-400'}
          />
          <StatCard
            id="kpi-yearly-savings"
            label="Total Saved"
            value={formatCurrency(data.total_savings_contributions ?? 0)}
            sub="Invested in goals"
            icon={<PiggyBank className="h-5 w-5" />}
            iconBg="bg-accent-500/10"
            iconText="text-accent-400"
            valueCls="text-accent-400"
          />
        </div>
      );
    }

    case 'expenses': {
      return (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            id="kpi-expense-total"
            label="Total Outflow"
            value={formatCurrency(data.total_expenses ?? 0)}
            sub="Across selected period"
            icon={<TrendingDown className="h-5 w-5" />}
            iconBg="bg-danger-500/10"
            iconText="text-danger-400"
            valueCls="text-danger-400"
          />
          <StatCard
            id="kpi-expense-count"
            label="Total Transactions"
            value={String(data.transaction_count ?? 0)}
            sub="Expense entries"
            icon={<Receipt className="h-5 w-5" />}
            iconBg="bg-info-500/10"
            iconText="text-info-400"
            valueCls="text-white"
          />
          <StatCard
            id="kpi-expense-average"
            label="Average Expense"
            value={formatCurrency(data.average_expense ?? 0)}
            sub="Per transaction"
            icon={<Activity className="h-5 w-5" />}
            iconBg="bg-surface-700"
            iconText="text-slate-300"
            valueCls="text-slate-200"
          />
          <StatCard
            id="kpi-expense-largest"
            label="Largest Single Spend"
            value={formatCurrency(data.largest_expense ?? 0)}
            sub="Peak outlay"
            icon={<ArrowDownRight className="h-5 w-5" />}
            iconBg="bg-danger-500/10"
            iconText="text-danger-400"
            valueCls="text-danger-400"
          />
        </div>
      );
    }

    case 'income': {
      return (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            id="kpi-income-total"
            label="Total Income"
            value={formatCurrency(data.total_income ?? 0)}
            sub="Across selected period"
            icon={<TrendingUp className="h-5 w-5" />}
            iconBg="bg-success-500/10"
            iconText="text-success-400"
            valueCls="text-success-400"
          />
          <StatCard
            id="kpi-income-count"
            label="Deposits Count"
            value={String(data.transaction_count ?? 0)}
            sub="Income entries"
            icon={<Receipt className="h-5 w-5" />}
            iconBg="bg-info-500/10"
            iconText="text-info-400"
            valueCls="text-white"
          />
          <StatCard
            id="kpi-income-average"
            label="Average Inflow"
            value={formatCurrency(data.average_income ?? 0)}
            sub="Per deposit"
            icon={<Activity className="h-5 w-5" />}
            iconBg="bg-surface-700"
            iconText="text-slate-300"
            valueCls="text-slate-200"
          />
          <StatCard
            id="kpi-income-largest"
            label="Largest Inflow"
            value={formatCurrency(data.largest_income ?? 0)}
            sub="Peak single credit"
            icon={<ArrowUpRight className="h-5 w-5" />}
            iconBg="bg-success-500/10"
            iconText="text-success-400"
            valueCls="text-success-400"
          />
        </div>
      );
    }

    case 'budget': {
      const remaining = data.total_remaining ?? 0;
      const isPositive = remaining >= 0;
      return (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            id="kpi-budget-total"
            label="Total Budgeted"
            value={formatCurrency(data.total_budgeted ?? 0)}
            sub={`${data.budgets?.length ?? 0} active categories`}
            icon={<Layers className="h-5 w-5" />}
            iconBg="bg-info-500/10"
            iconText="text-info-400"
            valueCls="text-info-400"
          />
          <StatCard
            id="kpi-budget-spent"
            label="Total Spent"
            value={formatCurrency(data.total_utilized ?? 0)}
            sub={`${(data.overall_utilization_percentage ?? 0).toFixed(1)}% utilized`}
            icon={<TrendingDown className="h-5 w-5" />}
            iconBg="bg-warning-500/10"
            iconText="text-warning-400"
            valueCls="text-warning-400"
          />
          <StatCard
            id="kpi-budget-remaining"
            label="Remaining Limit"
            value={formatCurrency(remaining)}
            sub={isPositive ? 'Under total budget' : 'Exceeded total budget'}
            icon={<ShieldCheck className="h-5 w-5" />}
            iconBg={isPositive ? 'bg-success-500/10' : 'bg-danger-500/10'}
            iconText={isPositive ? 'text-success-400' : 'text-danger-400'}
            valueCls={isPositive ? 'text-success-400' : 'text-danger-400'}
          />
          <StatCard
            id="kpi-budget-status"
            label="Category Alerts"
            value={`${data.over_budget_count ?? 0} Over`}
            sub={`${data.within_budget_count ?? 0} within limits`}
            icon={<Activity className="h-5 w-5" />}
            iconBg={data.over_budget_count > 0 ? 'bg-danger-500/10' : 'bg-success-500/10'}
            iconText={data.over_budget_count > 0 ? 'text-danger-400' : 'text-success-400'}
            valueCls={data.over_budget_count > 0 ? 'text-danger-400' : 'text-success-400'}
          />
        </div>
      );
    }

    case 'savings-goals': {
      return (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            id="kpi-goals-target"
            label="Total Target"
            value={formatCurrency(data.total_target_amount ?? 0)}
            sub={`${data.total_goals ?? 0} goals created`}
            icon={<Target className="h-5 w-5" />}
            iconBg="bg-info-500/10"
            iconText="text-info-400"
            valueCls="text-info-400"
          />
          <StatCard
            id="kpi-goals-saved"
            label="Total Saved"
            value={formatCurrency(data.total_saved_amount ?? 0)}
            sub={`${(data.overall_progress_percentage ?? 0).toFixed(1)}% funded`}
            icon={<PiggyBank className="h-5 w-5" />}
            iconBg="bg-success-500/10"
            iconText="text-success-400"
            valueCls="text-success-400"
          />
          <StatCard
            id="kpi-goals-remaining"
            label="Remaining to Target"
            value={formatCurrency(data.total_remaining_amount ?? 0)}
            sub="Needed to complete"
            icon={<Wallet className="h-5 w-5" />}
            iconBg="bg-warning-500/10"
            iconText="text-warning-400"
            valueCls="text-warning-400"
          />
          <StatCard
            id="kpi-goals-completed"
            label="Completed Goals"
            value={`${data.completed_goals ?? 0} / ${data.total_goals ?? 0}`}
            sub={`${data.active_goals ?? 0} active in progress`}
            icon={<ShieldCheck className="h-5 w-5" />}
            iconBg="bg-accent-500/10"
            iconText="text-accent-400"
            valueCls="text-accent-400"
          />
        </div>
      );
    }

    case 'cash-flow': {
      const net = data.net_cash_flow ?? 0;
      const isPositive = net >= 0;
      return (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            id="kpi-cf-inflow"
            label="Total Inflow"
            value={formatCurrency(data.total_income ?? 0)}
            sub="Total cash collected"
            icon={<TrendingUp className="h-5 w-5" />}
            iconBg="bg-success-500/10"
            iconText="text-success-400"
            valueCls="text-success-400"
          />
          <StatCard
            id="kpi-cf-outflow"
            label="Total Outflow"
            value={formatCurrency(data.total_expenses ?? 0)}
            sub="Total spending disbursed"
            icon={<TrendingDown className="h-5 w-5" />}
            iconBg="bg-danger-500/10"
            iconText="text-danger-400"
            valueCls="text-danger-400"
          />
          <StatCard
            id="kpi-cf-savings"
            label="Goal Transfers"
            value={formatCurrency(data.total_savings_contributions ?? 0)}
            sub="Dedicated savings"
            icon={<PiggyBank className="h-5 w-5" />}
            iconBg="bg-accent-500/10"
            iconText="text-accent-400"
            valueCls="text-accent-400"
          />
          <StatCard
            id="kpi-cf-net"
            label="Net Cash Flow"
            value={formatCurrency(net)}
            sub={isPositive ? 'Positive net cash' : 'Negative net cash'}
            icon={<Wallet className="h-5 w-5" />}
            iconBg={isPositive ? 'bg-primary-500/10' : 'bg-danger-500/10'}
            iconText={isPositive ? 'text-primary-400' : 'text-danger-400'}
            valueCls={isPositive ? 'text-white' : 'text-danger-400'}
          />
        </div>
      );
    }

    default:
      return null;
  }
});

export default ReportKpiCards;
