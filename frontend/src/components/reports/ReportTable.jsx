import { memo } from 'react';
import Card from '../ui/Card';
import Skeleton from '../ui/Skeleton';
import EmptyState from '../ui/EmptyState';
import { formatCurrency, formatLocalDate, MONTH_NAMES } from '../../utils/formatters';
import { Layers, AlertTriangle, CheckCircle2, TrendingUp, TrendingDown, Receipt } from 'lucide-react';

const ReportTable = memo(function ReportTable({ reportType, data, loading }) {
  if (loading) {
    return (
      <Card padding="none" className="overflow-hidden">
        <div className="p-5 border-b border-surface-700/60 flex items-center justify-between">
          <Skeleton className="h-4 w-40" />
          <Skeleton className="h-4 w-20" />
        </div>
        <div className="divide-y divide-surface-700/40 p-4 flex flex-col gap-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex items-center justify-between py-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-4 w-24" />
            </div>
          ))}
        </div>
      </Card>
    );
  }

  if (!data) return null;

  switch (reportType) {
    case 'monthly': {
      const expenses = data.expense_by_category || [];
      const budgets = data.budget_utilization || [];

      return (
        <div className="flex flex-col gap-6">
          {/* Category Breakdown */}
          <Card padding="none" className="overflow-hidden">
            <div className="p-5 border-b border-surface-700/60 flex items-center justify-between">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-300">
                Expense Category Breakdown
              </h3>
              <span className="text-xs text-slate-500 font-medium">{expenses.length} Categories</span>
            </div>
            {expenses.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="border-b border-surface-700/60 bg-surface-900/50 text-xs font-semibold uppercase tracking-wider text-slate-400">
                    <tr>
                      <th className="px-5 py-3">Category</th>
                      <th className="px-5 py-3 text-right">Amount</th>
                      <th className="px-5 py-3 text-center">Transactions</th>
                      <th className="px-5 py-3 text-right">% Share</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-surface-700/40 text-slate-200">
                    {expenses.map((c, i) => (
                      <tr key={i} className="hover:bg-surface-700/20 transition-colors">
                        <td className="px-5 py-3.5 font-medium text-white">{c.category_name}</td>
                        <td className="px-5 py-3.5 text-right font-semibold tabular-nums text-danger-400">
                          {formatCurrency(c.total_amount)}
                        </td>
                        <td className="px-5 py-3.5 text-center tabular-nums text-slate-400">
                          {c.transaction_count}
                        </td>
                        <td className="px-5 py-3.5 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <div className="h-1.5 w-16 overflow-hidden rounded-full bg-surface-700">
                              <div
                                className="h-full rounded-full bg-danger-500"
                                style={{ width: `${Math.min(c.percentage, 100)}%` }}
                              />
                            </div>
                            <span className="text-xs font-semibold tabular-nums text-slate-300 w-10 text-right">
                              {c.percentage.toFixed(1)}%
                            </span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="border-t-2 border-surface-700 bg-surface-900/60 text-xs font-bold uppercase text-white">
                    <tr>
                      <td className="px-5 py-3">Total</td>
                      <td className="px-5 py-3 text-right text-danger-400">
                        {formatCurrency(data.total_expenses ?? 0)}
                      </td>
                      <td className="px-5 py-3 text-center">{data.expense_transaction_count ?? 0}</td>
                      <td className="px-5 py-3 text-right">100.0%</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            ) : (
              <EmptyState
                icon={<Receipt className="h-8 w-8" />}
                title="No Expenses"
                description="No expense transactions recorded for this month."
              />
            )}
          </Card>

          {/* Budget Utilization */}
          {budgets.length > 0 && (
            <Card padding="none" className="overflow-hidden">
              <div className="p-5 border-b border-surface-700/60 flex items-center justify-between">
                <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-300">
                  Budget Utilization
                </h3>
                <span className="text-xs text-slate-500 font-medium">{budgets.length} Budgets</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="border-b border-surface-700/60 bg-surface-900/50 text-xs font-semibold uppercase tracking-wider text-slate-400">
                    <tr>
                      <th className="px-5 py-3">Category</th>
                      <th className="px-5 py-3 text-right">Budget Limit</th>
                      <th className="px-5 py-3 text-right">Spent</th>
                      <th className="px-5 py-3 text-right">Remaining</th>
                      <th className="px-5 py-3 text-center">Utilized %</th>
                      <th className="px-5 py-3 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-surface-700/40 text-slate-200">
                    {budgets.map((b, i) => (
                      <tr key={i} className="hover:bg-surface-700/20 transition-colors">
                        <td className="px-5 py-3.5 font-medium text-white">{b.category_name}</td>
                        <td className="px-5 py-3.5 text-right tabular-nums text-slate-300">
                          {formatCurrency(b.budget_amount)}
                        </td>
                        <td className="px-5 py-3.5 text-right tabular-nums font-semibold text-danger-400">
                          {formatCurrency(b.utilized_amount)}
                        </td>
                        <td
                          className={`px-5 py-3.5 text-right tabular-nums font-semibold ${
                            b.remaining_amount >= 0 ? 'text-success-400' : 'text-danger-400'
                          }`}
                        >
                          {formatCurrency(b.remaining_amount)}
                        </td>
                        <td className="px-5 py-3.5 text-center">
                          <div className="inline-flex items-center gap-2">
                            <div className="h-1.5 w-16 overflow-hidden rounded-full bg-surface-700">
                              <div
                                className={`h-full rounded-full ${
                                  b.is_over_budget ? 'bg-danger-500' : 'bg-primary-500'
                                }`}
                                style={{ width: `${Math.min(b.utilization_percentage, 100)}%` }}
                              />
                            </div>
                            <span className="text-xs font-semibold tabular-nums text-slate-300">
                              {b.utilization_percentage.toFixed(1)}%
                            </span>
                          </div>
                        </td>
                        <td className="px-5 py-3.5 text-center">
                          {b.is_over_budget ? (
                            <span className="inline-flex items-center gap-1 rounded-md bg-danger-500/10 px-2 py-0.5 text-xs font-semibold text-danger-400">
                              <AlertTriangle className="h-3 w-3" /> Over
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 rounded-md bg-success-500/10 px-2 py-0.5 text-xs font-semibold text-success-400">
                              <CheckCircle2 className="h-3 w-3" /> OK
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          )}
        </div>
      );
    }

    case 'yearly': {
      const breakdown = data.monthly_breakdown || [];

      return (
        <Card padding="none" className="overflow-hidden">
          <div className="p-5 border-b border-surface-700/60 flex items-center justify-between">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-300">
              12-Month Financial Statement
            </h3>
            <span className="text-xs text-slate-500 font-medium">{data.year}</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-surface-700/60 bg-surface-900/50 text-xs font-semibold uppercase tracking-wider text-slate-400">
                <tr>
                  <th className="px-5 py-3">Month</th>
                  <th className="px-5 py-3 text-right">Income</th>
                  <th className="px-5 py-3 text-right">Expenses</th>
                  <th className="px-5 py-3 text-right">Net Balance</th>
                  <th className="px-5 py-3 text-right">Goal Savings</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-700/40 text-slate-200">
                {breakdown.map((m, i) => (
                  <tr key={i} className="hover:bg-surface-700/20 transition-colors">
                    <td className="px-5 py-3.5 font-medium text-white">
                      {MONTH_NAMES[m.month] || `Month ${m.month}`}
                    </td>
                    <td className="px-5 py-3.5 text-right tabular-nums text-success-400 font-semibold">
                      {formatCurrency(m.income)}
                    </td>
                    <td className="px-5 py-3.5 text-right tabular-nums text-danger-400 font-semibold">
                      {formatCurrency(m.expenses)}
                    </td>
                    <td
                      className={`px-5 py-3.5 text-right tabular-nums font-bold ${
                        m.net >= 0 ? 'text-success-400' : 'text-danger-400'
                      }`}
                    >
                      {formatCurrency(m.net)}
                    </td>
                    <td className="px-5 py-3.5 text-right tabular-nums text-accent-400">
                      {formatCurrency(m.savings_contributions)}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="border-t-2 border-surface-700 bg-surface-900/80 text-xs font-bold uppercase text-white">
                <tr>
                  <td className="px-5 py-3">Yearly Total</td>
                  <td className="px-5 py-3 text-right text-success-400 font-bold">
                    {formatCurrency(data.total_income ?? 0)}
                  </td>
                  <td className="px-5 py-3 text-right text-danger-400 font-bold">
                    {formatCurrency(data.total_expenses ?? 0)}
                  </td>
                  <td
                    className={`px-5 py-3 text-right font-bold ${
                      (data.net_balance ?? 0) >= 0 ? 'text-success-400' : 'text-danger-400'
                    }`}
                  >
                    {formatCurrency(data.net_balance ?? 0)}
                  </td>
                  <td className="px-5 py-3 text-right text-accent-400 font-bold">
                    {formatCurrency(data.total_savings_contributions ?? 0)}
                  </td>
                </tr>
                <tr className="text-slate-400 border-t border-surface-800">
                  <td className="px-5 py-2.5">Monthly Average</td>
                  <td className="px-5 py-2.5 text-right font-semibold">
                    {formatCurrency(data.average_monthly_income ?? 0)}
                  </td>
                  <td className="px-5 py-2.5 text-right font-semibold">
                    {formatCurrency(data.average_monthly_expenses ?? 0)}
                  </td>
                  <td className="px-5 py-2.5 text-right font-semibold">
                    {formatCurrency((data.net_balance ?? 0) / 12)}
                  </td>
                  <td className="px-5 py-2.5 text-right font-semibold">
                    {formatCurrency((data.total_savings_contributions ?? 0) / 12)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </Card>
      );
    }

    case 'expenses': {
      const topExp = data.top_expenses || [];
      const byCat = data.by_category || [];

      return (
        <div className="flex flex-col gap-6">
          {/* Category Share */}
          <Card padding="none" className="overflow-hidden">
            <div className="p-5 border-b border-surface-700/60 flex items-center justify-between">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-300">
                Expense Breakdown by Category
              </h3>
              <span className="text-xs text-slate-500 font-medium">{byCat.length} Categories</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-surface-700/60 bg-surface-900/50 text-xs font-semibold uppercase tracking-wider text-slate-400">
                  <tr>
                    <th className="px-5 py-3">Category</th>
                    <th className="px-5 py-3 text-right">Total Outflow</th>
                    <th className="px-5 py-3 text-center">Transactions</th>
                    <th className="px-5 py-3 text-right">% of Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-700/40 text-slate-200">
                  {byCat.map((c, i) => (
                    <tr key={i} className="hover:bg-surface-700/20 transition-colors">
                      <td className="px-5 py-3.5 font-medium text-white">{c.category_name}</td>
                      <td className="px-5 py-3.5 text-right font-semibold tabular-nums text-danger-400">
                        {formatCurrency(c.total_amount)}
                      </td>
                      <td className="px-5 py-3.5 text-center tabular-nums text-slate-400">
                        {c.transaction_count}
                      </td>
                      <td className="px-5 py-3.5 text-right font-semibold tabular-nums text-slate-300">
                        {c.percentage.toFixed(1)}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          {/* Top 10 Expenses */}
          {topExp.length > 0 && (
            <Card padding="none" className="overflow-hidden">
              <div className="p-5 border-b border-surface-700/60 flex items-center justify-between">
                <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-300">
                  Top 10 Largest Expense Transactions
                </h3>
                <span className="text-xs text-slate-500 font-medium">Ranked by Amount</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="border-b border-surface-700/60 bg-surface-900/50 text-xs font-semibold uppercase tracking-wider text-slate-400">
                    <tr>
                      <th className="px-5 py-3">Date</th>
                      <th className="px-5 py-3">Description / Merchant</th>
                      <th className="px-5 py-3">Category</th>
                      <th className="px-5 py-3 text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-surface-700/40 text-slate-200">
                    {topExp.map((exp, i) => (
                      <tr key={i} className="hover:bg-surface-700/20 transition-colors">
                        <td className="px-5 py-3.5 text-xs text-slate-400 tabular-nums">
                          {formatLocalDate(exp.date)}
                        </td>
                        <td className="px-5 py-3.5 font-medium text-white">
                          {exp.description || 'N/A'}
                        </td>
                        <td className="px-5 py-3.5 text-slate-400">{exp.category_name || 'Uncategorized'}</td>
                        <td className="px-5 py-3.5 text-right font-bold tabular-nums text-danger-400">
                          {formatCurrency(exp.amount)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          )}
        </div>
      );
    }

    case 'income': {
      const topInc = data.top_income_entries || [];
      const bySrc = data.by_source || [];

      return (
        <div className="flex flex-col gap-6">
          <Card padding="none" className="overflow-hidden">
            <div className="p-5 border-b border-surface-700/60 flex items-center justify-between">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-300">
                Income Sources Breakdown
              </h3>
              <span className="text-xs text-slate-500 font-medium">{bySrc.length} Sources</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-surface-700/60 bg-surface-900/50 text-xs font-semibold uppercase tracking-wider text-slate-400">
                  <tr>
                    <th className="px-5 py-3">Source</th>
                    <th className="px-5 py-3 text-right">Total Inflow</th>
                    <th className="px-5 py-3 text-center">Deposits</th>
                    <th className="px-5 py-3 text-right">% of Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-700/40 text-slate-200">
                  {bySrc.map((s, i) => (
                    <tr key={i} className="hover:bg-surface-700/20 transition-colors">
                      <td className="px-5 py-3.5 font-medium text-white">{s.source}</td>
                      <td className="px-5 py-3.5 text-right font-semibold tabular-nums text-success-400">
                        {formatCurrency(s.total_amount)}
                      </td>
                      <td className="px-5 py-3.5 text-center tabular-nums text-slate-400">
                        {s.transaction_count}
                      </td>
                      <td className="px-5 py-3.5 text-right font-semibold tabular-nums text-slate-300">
                        {s.percentage.toFixed(1)}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          {topInc.length > 0 && (
            <Card padding="none" className="overflow-hidden">
              <div className="p-5 border-b border-surface-700/60 flex items-center justify-between">
                <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-300">
                  Top Income Entries
                </h3>
                <span className="text-xs text-slate-500 font-medium">Ranked by Amount</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="border-b border-surface-700/60 bg-surface-900/50 text-xs font-semibold uppercase tracking-wider text-slate-400">
                    <tr>
                      <th className="px-5 py-3">Date</th>
                      <th className="px-5 py-3">Description / Source</th>
                      <th className="px-5 py-3">Category</th>
                      <th className="px-5 py-3 text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-surface-700/40 text-slate-200">
                    {topInc.map((inc, i) => (
                      <tr key={i} className="hover:bg-surface-700/20 transition-colors">
                        <td className="px-5 py-3.5 text-xs text-slate-400 tabular-nums">
                          {formatLocalDate(inc.date)}
                        </td>
                        <td className="px-5 py-3.5 font-medium text-white">
                          {inc.description || 'N/A'}
                        </td>
                        <td className="px-5 py-3.5 text-slate-400">{inc.category_name || 'Uncategorized'}</td>
                        <td className="px-5 py-3.5 text-right font-bold tabular-nums text-success-400">
                          {formatCurrency(inc.amount)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          )}
        </div>
      );
    }

    case 'budget': {
      const budgets = data.budgets || [];

      return (
        <Card padding="none" className="overflow-hidden">
          <div className="p-5 border-b border-surface-700/60 flex items-center justify-between">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-300">
              Budget Performance Statement
            </h3>
            <span className="text-xs text-slate-500 font-medium">{budgets.length} Categories</span>
          </div>
          {budgets.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-surface-700/60 bg-surface-900/50 text-xs font-semibold uppercase tracking-wider text-slate-400">
                  <tr>
                    <th className="px-5 py-3">Category</th>
                    <th className="px-5 py-3 text-right">Budget Limit</th>
                    <th className="px-5 py-3 text-right">Actual Spent</th>
                    <th className="px-5 py-3 text-right">Variance / Remaining</th>
                    <th className="px-5 py-3 text-center">Utilization</th>
                    <th className="px-5 py-3 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-700/40 text-slate-200">
                  {budgets.map((b, i) => (
                    <tr key={i} className="hover:bg-surface-700/20 transition-colors">
                      <td className="px-5 py-3.5 font-medium text-white">{b.category_name}</td>
                      <td className="px-5 py-3.5 text-right tabular-nums text-slate-300">
                        {formatCurrency(b.budget_amount)}
                      </td>
                      <td className="px-5 py-3.5 text-right tabular-nums font-semibold text-danger-400">
                        {formatCurrency(b.utilized_amount)}
                      </td>
                      <td
                        className={`px-5 py-3.5 text-right tabular-nums font-semibold ${
                          b.remaining_amount >= 0 ? 'text-success-400' : 'text-danger-400'
                        }`}
                      >
                        {formatCurrency(b.remaining_amount)}
                      </td>
                      <td className="px-5 py-3.5 text-center">
                        <div className="inline-flex items-center gap-2">
                          <div className="h-1.5 w-16 overflow-hidden rounded-full bg-surface-700">
                            <div
                              className={`h-full rounded-full ${
                                b.is_over_budget ? 'bg-danger-500' : 'bg-primary-500'
                              }`}
                              style={{ width: `${Math.min(b.utilization_percentage, 100)}%` }}
                            />
                          </div>
                          <span className="text-xs font-semibold tabular-nums text-slate-300">
                            {b.utilization_percentage.toFixed(1)}%
                          </span>
                        </div>
                      </td>
                      <td className="px-5 py-3.5 text-center">
                        {b.is_over_budget ? (
                          <span className="inline-flex items-center gap-1 rounded-md bg-danger-500/10 px-2 py-0.5 text-xs font-semibold text-danger-400">
                            <AlertTriangle className="h-3 w-3" /> Over Budget
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded-md bg-success-500/10 px-2 py-0.5 text-xs font-semibold text-success-400">
                            <CheckCircle2 className="h-3 w-3" /> On Track
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <EmptyState
              icon={<Layers className="h-8 w-8" />}
              title="No Budgets Configured"
              description="No category budgets found for the selected period."
            />
          )}
        </Card>
      );
    }

    case 'savings-goals': {
      const goals = data.goals || [];

      return (
        <Card padding="none" className="overflow-hidden">
          <div className="p-5 border-b border-surface-700/60 flex items-center justify-between">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-300">
              Savings Goals & Progress Status
            </h3>
            <span className="text-xs text-slate-500 font-medium">{goals.length} Goals</span>
          </div>
          {goals.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-surface-700/60 bg-surface-900/50 text-xs font-semibold uppercase tracking-wider text-slate-400">
                  <tr>
                    <th className="px-5 py-3">Goal Name</th>
                    <th className="px-5 py-3 text-right">Target</th>
                    <th className="px-5 py-3 text-right">Saved</th>
                    <th className="px-5 py-3 text-right">Remaining</th>
                    <th className="px-5 py-3 text-center">Progress</th>
                    <th className="px-5 py-3 text-center">Deadline</th>
                    <th className="px-5 py-3 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-700/40 text-slate-200">
                  {goals.map((g, i) => (
                    <tr key={i} className="hover:bg-surface-700/20 transition-colors">
                      <td className="px-5 py-3.5 font-medium text-white">{g.name}</td>
                      <td className="px-5 py-3.5 text-right tabular-nums text-slate-300">
                        {formatCurrency(g.target_amount)}
                      </td>
                      <td className="px-5 py-3.5 text-right tabular-nums font-semibold text-success-400">
                        {formatCurrency(g.current_amount)}
                      </td>
                      <td className="px-5 py-3.5 text-right tabular-nums text-slate-400">
                        {formatCurrency(g.remaining_amount)}
                      </td>
                      <td className="px-5 py-3.5 text-center">
                        <div className="inline-flex items-center gap-2">
                          <div className="h-1.5 w-16 overflow-hidden rounded-full bg-surface-700">
                            <div
                              className="h-full rounded-full bg-success-500"
                              style={{ width: `${Math.min(g.progress_percentage, 100)}%` }}
                            />
                          </div>
                          <span className="text-xs font-semibold tabular-nums text-slate-300">
                            {g.progress_percentage.toFixed(1)}%
                          </span>
                        </div>
                      </td>
                      <td className="px-5 py-3.5 text-center text-xs text-slate-400">
                        {g.deadline ? formatLocalDate(g.deadline) : '—'}
                      </td>
                      <td className="px-5 py-3.5 text-center">
                        <span className="inline-flex items-center rounded-md bg-surface-700 px-2 py-0.5 text-xs font-medium uppercase text-slate-300">
                          {g.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <EmptyState
              icon={<Layers className="h-8 w-8" />}
              title="No Savings Goals"
              description="Create a savings goal to start tracking progress towards your financial milestones."
            />
          )}
        </Card>
      );
    }

    case 'cash-flow': {
      const breakdown = data.monthly_breakdown || [];

      return (
        <Card padding="none" className="overflow-hidden">
          <div className="p-5 border-b border-surface-700/60 flex items-center justify-between">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-300">
              Month-by-Month Cash Flow Statement
            </h3>
            <span className="text-xs text-slate-500 font-medium">{breakdown.length} Months</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-surface-700/60 bg-surface-900/50 text-xs font-semibold uppercase tracking-wider text-slate-400">
                <tr>
                  <th className="px-5 py-3">Period</th>
                  <th className="px-5 py-3 text-right">Inflows (Income)</th>
                  <th className="px-5 py-3 text-right">Outflows (Expenses)</th>
                  <th className="px-5 py-3 text-right">Goal Transfers</th>
                  <th className="px-5 py-3 text-right">Net Cash Flow</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-700/40 text-slate-200">
                {breakdown.map((m, i) => (
                  <tr key={i} className="hover:bg-surface-700/20 transition-colors">
                    <td className="px-5 py-3.5 font-medium text-white">
                      {MONTH_NAMES[m.month] || m.month} {m.year}
                    </td>
                    <td className="px-5 py-3.5 text-right tabular-nums text-success-400 font-semibold">
                      {formatCurrency(m.income)}
                    </td>
                    <td className="px-5 py-3.5 text-right tabular-nums text-danger-400 font-semibold">
                      {formatCurrency(m.expenses)}
                    </td>
                    <td className="px-5 py-3.5 text-right tabular-nums text-accent-400">
                      {formatCurrency(m.savings_contributions)}
                    </td>
                    <td
                      className={`px-5 py-3.5 text-right tabular-nums font-bold ${
                        m.net_cash_flow >= 0 ? 'text-success-400' : 'text-danger-400'
                      }`}
                    >
                      {formatCurrency(m.net_cash_flow)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      );
    }

    default:
      return null;
  }
});

export default ReportTable;
