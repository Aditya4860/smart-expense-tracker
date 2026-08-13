import { memo, useState } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  Sector,
  Rectangle,
} from 'recharts';
import Card from '../ui/Card';
import Skeleton from '../ui/Skeleton';
import { formatCurrency, formatCompactCurrency, MONTH_NAMES } from '../../utils/formatters';

const PALETTE = [
  '#06b6d4', // Cyan
  '#ec4899', // Pink
  '#facc15', // Yellow
  '#8b5cf6', // Violet
  '#059669', // Darker Green
  '#dc2626', // Dark Red
  '#3b82f6', // Blue
  '#f97316', // Orange
  '#14b8a6', // Teal
  '#d946ef', // Fuchsia
];

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload || !payload.length) return null;
  return (
    <div className="rounded-xl border border-surface-700/60 bg-[#12141a]/90 p-3.5 shadow-2xl backdrop-blur-md">
      {label && <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-400">{label}</p>}
      <div className="flex flex-col gap-1.5">
        {payload.map((entry, index) => (
          <div key={`item-${index}`} className="flex items-center justify-between gap-4 text-xs">
            <div className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full" style={{ backgroundColor: entry.color || entry.fill, filter: `drop-shadow(0px 0px 4px ${entry.color || entry.fill})` }} />
              <span className="text-slate-300 font-medium">{entry.name}:</span>
            </div>
            <span className="font-semibold tabular-nums" style={{ color: entry.color || entry.fill || '#fff' }}>
              {typeof entry.value === 'number' ? formatCurrency(entry.value) : entry.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

// ── Active Shape for Pie Charts ───────────────────────────────────────────
const renderActiveShape = (props) => {
  const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill, payload, value, share } = props;
  return (
    <g>
      <text x={cx} y={cy - 12} dy={8} textAnchor="middle" fill="#fff" className="text-[13px] font-semibold">
        {payload.name}
      </text>
      <text x={cx} y={cy + 10} dy={8} textAnchor="middle" fill={fill} className="text-sm font-bold tabular-nums" style={{ filter: `drop-shadow(0 0 4px ${fill})` }}>
        {formatCurrency(value)} {share ? `(${Math.round(share)}%)` : ''}
      </text>
      <Sector
        cx={cx} cy={cy}
        innerRadius={innerRadius}
        outerRadius={outerRadius + 8}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
        style={{ filter: `drop-shadow(0px 0px 10px ${fill})` }}
      />
    </g>
  );
};

const ReportCharts = memo(function ReportCharts({ reportType, data, loading }) {
  const [activeIndex, setActiveIndex] = useState(0);

  if (loading) {
    return (
      <Card padding="lg" className="flex flex-col gap-4">
        <Skeleton className="h-5 w-48" />
        <Skeleton className="h-[320px] w-full" rounded="xl" />
      </Card>
    );
  }

  if (!data) return null;

  switch (reportType) {
    case 'monthly': {
      const catData = (data.expense_by_category || []).map((c) => ({
        name: c.category_name,
        amount: c.total_amount,
        share: c.percentage,
      }));

      if (catData.length === 0) {
        return (
          <Card padding="lg" className="flex h-[280px] flex-col items-center justify-center text-center">
            <p className="text-sm font-medium text-slate-400">No expense category data for this month</p>
          </Card>
        );
      }

      return (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          <Card padding="lg" className="lg:col-span-7 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-400">
                Expense Distribution by Category
              </h3>
              <span className="text-xs text-slate-500">{catData.length} categories</span>
            </div>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={catData} margin={{ top: 10, right: 10, left: 0, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#242B36" vertical={false} />
                  <XAxis
                    dataKey="name"
                    stroke="#64748b"
                    fontSize={11}
                    tickLine={false}
                    interval={0}
                    angle={-25}
                    textAnchor="end"
                  />
                  <YAxis
                    stroke="#64748b"
                    fontSize={11}
                    tickLine={false}
                    tickFormatter={formatCompactCurrency}
                  />
                  <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
                  <Bar dataKey="amount" name="Spent" fill="#ef4444" radius={[20, 20, 20, 20]} maxBarSize={10} activeBar={(props) => <Rectangle {...props} width={props.width + 2} style={{ filter: `drop-shadow(0px 0px 8px ${props.fill})` }} />}>
                    {catData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={PALETTE[index % PALETTE.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>

          <Card padding="lg" className="lg:col-span-5 flex flex-col gap-4">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-400">
              Category Share (%)
            </h3>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={catData}
                    dataKey="amount"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={95}
                    paddingAngle={3}
                    activeIndex={activeIndex}
                    activeShape={renderActiveShape}
                    onMouseEnter={(_, index) => setActiveIndex(index)}
                  >
                    {catData.map((_, index) => (
                      <Cell key={`pie-cell-${index}`} fill={PALETTE[index % PALETTE.length]} />
                    ))}
                  </Pie>
                  <Legend
                    layout="horizontal"
                    verticalAlign="bottom"
                    align="center"
                    wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>
      );
    }

    case 'yearly': {
      const monthlyData = (data.monthly_breakdown || []).map((m) => ({
        name: MONTH_NAMES[m.month] || `M${m.month}`,
        Income: m.income,
        Expenses: m.expenses,
        Savings: m.savings_contributions,
        Net: m.net,
      }));

      return (
        <Card padding="lg" className="flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-400">
              12-Month Cash Flow & Net Balance Trajectory
            </h3>
            <div className="flex items-center gap-4 text-xs text-slate-400">
              <span className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-success-500" /> Income
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-danger-500" /> Expenses
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-info-500" /> Net Balance
              </span>
            </div>
          </div>
          <div className="h-[340px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#242B36" vertical={false} />
                <XAxis dataKey="name" stroke="#64748b" fontSize={12} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={12} tickLine={false} tickFormatter={formatCompactCurrency} />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
                <Bar dataKey="Income" name="Income" fill="#22c55e" radius={[20, 20, 20, 20]} maxBarSize={8} activeBar={(props) => <Rectangle {...props} width={props.width + 2} style={{ filter: `drop-shadow(0px 0px 8px #22c55e)` }} />} />
                <Bar dataKey="Expenses" name="Expenses" fill="#ef4444" radius={[20, 20, 20, 20]} maxBarSize={8} activeBar={(props) => <Rectangle {...props} width={props.width + 2} style={{ filter: `drop-shadow(0px 0px 8px #ef4444)` }} />} />
                <Bar dataKey="Net" name="Net Balance" fill="#3b82f6" radius={[20, 20, 20, 20]} maxBarSize={8} activeBar={(props) => <Rectangle {...props} width={props.width + 2} style={{ filter: `drop-shadow(0px 0px 8px #3b82f6)` }} />} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      );
    }

    case 'expenses': {
      const catData = (data.by_category || []).map((c) => ({
        name: c.category_name,
        value: c.total_amount,
        count: c.transaction_count,
        share: c.percentage,
      }));

      const pmData = (data.by_payment_method || []).map((p) => ({
        name: p.payment_method || 'Unspecified',
        amount: p.total_amount,
        count: p.transaction_count,
      }));

      if (catData.length === 0) {
        return null;
      }

      return (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          <Card padding="lg" className="lg:col-span-6 flex flex-col gap-4">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-400">
              Spending by Category
            </h3>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={catData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={95}
                    paddingAngle={3}
                    activeIndex={activeIndex}
                    activeShape={renderActiveShape}
                    onMouseEnter={(_, index) => setActiveIndex(index)}
                  >
                    {catData.map((_, index) => (
                      <Cell key={`cell-exp-${index}`} fill={PALETTE[index % PALETTE.length]} />
                    ))}
                  </Pie>
                  <Legend layout="horizontal" verticalAlign="bottom" align="center" wrapperStyle={{ fontSize: '11px' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </Card>

          <Card padding="lg" className="lg:col-span-6 flex flex-col gap-4">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-400">
              Payment Method Breakdown
            </h3>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={pmData} margin={{ top: 10, right: 10, left: 0, bottom: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#242B36" vertical={false} />
                  <XAxis dataKey="name" stroke="#64748b" fontSize={11} tickLine={false} />
                  <YAxis stroke="#64748b" fontSize={11} tickLine={false} tickFormatter={formatCompactCurrency} />
                  <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
                  <Bar dataKey="amount" name="Amount" fill="#009246" radius={[20, 20, 20, 20]} maxBarSize={12} activeBar={(props) => <Rectangle {...props} width={props.width + 2} style={{ filter: `drop-shadow(0px 0px 8px #009246)` }} />} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>
      );
    }

    case 'income': {
      const srcData = (data.by_source || []).map((s) => ({
        name: s.source,
        value: s.total_amount,
        count: s.transaction_count,
        share: s.percentage,
      }));

      const catData = (data.by_category || []).map((c) => ({
        name: c.category_name,
        value: c.total_amount,
        count: c.transaction_count,
        share: c.percentage,
      }));

      if (srcData.length === 0 && catData.length === 0) return null;

      return (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          <Card padding="lg" className="lg:col-span-6 flex flex-col gap-4">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-400">
              Income by Source
            </h3>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={srcData.length ? srcData : catData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={95}
                    paddingAngle={3}
                    activeIndex={activeIndex}
                    activeShape={renderActiveShape}
                    onMouseEnter={(_, index) => setActiveIndex(index)}
                  >
                    {(srcData.length ? srcData : catData).map((_, index) => (
                      <Cell key={`cell-inc-${index}`} fill={PALETTE[index % PALETTE.length]} />
                    ))}
                  </Pie>
                  <Legend layout="horizontal" verticalAlign="bottom" align="center" wrapperStyle={{ fontSize: '11px' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </Card>

          <Card padding="lg" className="lg:col-span-6 flex flex-col gap-4">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-400">
              Income by Category
            </h3>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={catData} margin={{ top: 10, right: 10, left: 0, bottom: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#242B36" vertical={false} />
                  <XAxis dataKey="name" stroke="#64748b" fontSize={11} tickLine={false} />
                  <YAxis stroke="#64748b" fontSize={11} tickLine={false} tickFormatter={formatCompactCurrency} />
                  <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
                  <Bar dataKey="value" name="Total Inflow" fill="#22c55e" radius={[20, 20, 20, 20]} maxBarSize={12} activeBar={(props) => <Rectangle {...props} width={props.width + 2} style={{ filter: `drop-shadow(0px 0px 8px #22c55e)` }} />} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>
      );
    }

    case 'budget': {
      const budgetItems = (data.budgets || []).map((b) => ({
        name: b.category_name,
        Budget: b.budget_amount,
        Spent: b.utilized_amount,
        Remaining: b.remaining_amount,
      }));

      if (budgetItems.length === 0) return null;

      return (
        <Card padding="lg" className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-400">
              Category Budget vs. Actual Expenditure
            </h3>
            <div className="flex items-center gap-3 text-xs text-slate-400">
              <span className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-info-500" /> Budget Limit
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-warning-500" /> Spent
              </span>
            </div>
          </div>
          <div className="h-[320px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={budgetItems} margin={{ top: 10, right: 10, left: 0, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#242B36" vertical={false} />
                <XAxis
                  dataKey="name"
                  stroke="#64748b"
                  fontSize={11}
                  tickLine={false}
                  interval={0}
                  angle={-20}
                  textAnchor="end"
                />
                <YAxis stroke="#64748b" fontSize={11} tickLine={false} tickFormatter={formatCompactCurrency} />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
                <Bar dataKey="Budget" name="Budget Limit" fill="#3b82f6" radius={[20, 20, 20, 20]} maxBarSize={10} activeBar={(props) => <Rectangle {...props} width={props.width + 2} style={{ filter: `drop-shadow(0px 0px 8px #3b82f6)` }} />} />
                <Bar dataKey="Spent" name="Actual Spent" fill="#f59e0b" radius={[20, 20, 20, 20]} maxBarSize={10} activeBar={(props) => <Rectangle {...props} width={props.width + 2} style={{ filter: `drop-shadow(0px 0px 8px #f59e0b)` }} />} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      );
    }

    case 'savings-goals': {
      const goals = (data.goals || []).map((g) => ({
        name: g.name,
        Target: g.target_amount,
        Saved: g.current_amount,
        Progress: g.progress_percentage,
      }));

      if (goals.length === 0) return null;

      return (
        <Card padding="lg" className="flex flex-col gap-4">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-400">
            Goal Target vs Current Accumulated Savings
          </h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={goals} margin={{ top: 10, right: 10, left: 0, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#242B36" vertical={false} />
                <XAxis dataKey="name" stroke="#64748b" fontSize={11} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={11} tickLine={false} tickFormatter={formatCompactCurrency} />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
                <Bar dataKey="Target" name="Target Amount" fill="#6366f1" radius={[20, 20, 20, 20]} maxBarSize={10} activeBar={(props) => <Rectangle {...props} width={props.width + 2} style={{ filter: `drop-shadow(0px 0px 8px #6366f1)` }} />} />
                <Bar dataKey="Saved" name="Saved Amount" fill="#10b981" radius={[20, 20, 20, 20]} maxBarSize={10} activeBar={(props) => <Rectangle {...props} width={props.width + 2} style={{ filter: `drop-shadow(0px 0px 8px #10b981)` }} />} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      );
    }

    case 'cash-flow': {
      const cfData = (data.monthly_breakdown || []).map((m) => ({
        name: `${MONTH_NAMES[m.month] || m.month} ${m.year}`,
        Inflow: m.income,
        Outflow: m.expenses,
        Net: m.net_cash_flow,
      }));

      if (cfData.length === 0) return null;

      return (
        <Card padding="lg" className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-400">
              Cash Inflow vs Outflow & Net Cash Position
            </h3>
            <div className="flex items-center gap-3 text-xs text-slate-400">
              <span className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-success-500" /> Inflow
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-danger-500" /> Outflow
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-info-500" /> Net Cash
              </span>
            </div>
          </div>
          <div className="h-[320px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={cfData} margin={{ top: 10, right: 10, left: 0, bottom: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#242B36" vertical={false} />
                <XAxis dataKey="name" stroke="#64748b" fontSize={11} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={11} tickLine={false} tickFormatter={formatCompactCurrency} />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
                <Bar dataKey="Inflow" name="Inflow" fill="#22c55e" radius={[20, 20, 20, 20]} maxBarSize={8} activeBar={(props) => <Rectangle {...props} width={props.width + 2} style={{ filter: `drop-shadow(0px 0px 8px #22c55e)` }} />} />
                <Bar dataKey="Outflow" name="Outflow" fill="#ef4444" radius={[20, 20, 20, 20]} maxBarSize={8} activeBar={(props) => <Rectangle {...props} width={props.width + 2} style={{ filter: `drop-shadow(0px 0px 8px #ef4444)` }} />} />
                <Bar dataKey="Net" name="Net Cash" fill="#3b82f6" radius={[20, 20, 20, 20]} maxBarSize={8} activeBar={(props) => <Rectangle {...props} width={props.width + 2} style={{ filter: `drop-shadow(0px 0px 8px #3b82f6)` }} />} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      );
    }

    default:
      return null;
  }
});

export default ReportCharts;
