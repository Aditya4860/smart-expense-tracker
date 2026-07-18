import { memo } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import useAnalytics from '../../hooks/useAnalytics';
import Card from '../ui/Card';

// ── Palette (hex values — Recharts cannot use Tailwind classes) ────────────

const COLORS = {
  income:  '#34d399', // emerald-400 / success-400
  expense: '#f87171', // red-400     / danger-400
  balance: '#818cf8', // indigo-400  / primary-400
};

// ── Formatter ──────────────────────────────────────────────────────────────

const amountFmt = new Intl.NumberFormat('en-IN', {
  style:                 'currency',
  currency:              'INR',
  maximumFractionDigits: 0,
  notation:              'compact',
});

// ── Custom tooltip ─────────────────────────────────────────────────────────

const fullFmt = new Intl.NumberFormat('en-IN', {
  style:                 'currency',
  currency:              'INR',
  maximumFractionDigits: 0,
});

function CashFlowTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border border-surface-700/60 bg-surface-900 p-3 shadow-2xl text-sm">
      <p className="mb-2 font-semibold text-white">{label}</p>
      {payload.map(entry => (
        <div key={entry.dataKey} className="flex items-center gap-2 py-0.5">
          <span className="h-2 w-2 rounded-full flex-shrink-0" style={{ backgroundColor: entry.fill || entry.color }} />
          <span className="text-slate-400 capitalize">{entry.name}:</span>
          <span className="ml-auto pl-4 font-semibold tabular-nums" style={{ color: entry.fill || entry.color }}>
            {fullFmt.format(entry.value)}
          </span>
        </div>
      ))}
    </div>
  );
}

// ── Main component ─────────────────────────────────────────────────────────

/**
 * MonthlyCashFlowChart — grouped bar chart of monthly income vs expense with net balance line.
 */
const MonthlyCashFlowChart = memo(function MonthlyCashFlowChart() {
  const { analytics } = useAnalytics();
  const data = analytics.monthlyTotals;

  // Only render months that have at least one non-zero value
  const nonEmpty = data.filter(d => d.income > 0 || d.expense > 0);
  const chartData = nonEmpty.length > 0 ? nonEmpty : data.slice(-6);

  return (
    <Card padding="lg">
      <h2 className="mb-5 text-sm font-semibold uppercase tracking-wider text-slate-500">
        Monthly Cash Flow
      </h2>
      <ResponsiveContainer width="100%" height={280}>
        <BarChart
          data={chartData}
          margin={{ top: 4, right: 8, left: 0, bottom: 4 }}
          barCategoryGap="30%"
          barGap={4}
        >
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="rgba(255,255,255,0.05)"
            vertical={false}
          />
          <XAxis
            dataKey="label"
            tick={{ fill: '#64748b', fontSize: 11 }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tickFormatter={v => amountFmt.format(v)}
            tick={{ fill: '#64748b', fontSize: 11 }}
            axisLine={false}
            tickLine={false}
            width={56}
          />
          <Tooltip content={<CashFlowTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
          <Legend
            wrapperStyle={{ fontSize: 12, color: '#94a3b8', paddingTop: 12 }}
            formatter={value => <span className="capitalize">{value}</span>}
          />
          <Bar dataKey="income"  name="Income"  fill={COLORS.income}  radius={[4, 4, 0, 0]} maxBarSize={40} />
          <Bar dataKey="expense" name="Expense" fill={COLORS.expense} radius={[4, 4, 0, 0]} maxBarSize={40} />
          <Bar dataKey="balance" name="Balance" fill={COLORS.balance} radius={[4, 4, 0, 0]} maxBarSize={40} />
        </BarChart>
      </ResponsiveContainer>
    </Card>
  );
});

export default MonthlyCashFlowChart;
