import { memo } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import useAnalytics from '../../hooks/useAnalytics';
import { formatCurrency, formatCompactCurrency } from '../../utils/formatters';
import Card from '../ui/Card';

// ── Palette ────────────────────────────────────────────────────────────────

const COLORS = {
  income:  '#34d399',
  expense: '#f87171',
};


// ── Custom tooltip ─────────────────────────────────────────────────────────

function TrendTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border border-surface-700/60 bg-surface-900 p-3 shadow-2xl text-sm">
      <p className="mb-2 font-semibold text-white">{label}</p>
      {payload.map(entry => (
        <div key={entry.dataKey} className="flex items-center gap-2 py-0.5">
          <span className="h-2 w-2 rounded-full flex-shrink-0" style={{ backgroundColor: entry.color }} />
          <span className="text-slate-400 capitalize">{entry.name}:</span>
          <span className="ml-auto pl-4 font-semibold tabular-nums" style={{ color: entry.color }}>
            {formatCurrency(entry.value)}
          </span>
        </div>
      ))}
    </div>
  );
}

// ── Main component ─────────────────────────────────────────────────────────

/**
 * MonthlyTrend — line chart showing income and expense trends over 12 months.
 */
const MonthlyTrend = memo(function MonthlyTrend() {
  const { analytics } = useAnalytics();
  const data = analytics.monthlyTotals;

  const nonEmpty = data.filter(d => d.income > 0 || d.expense > 0);
  const chartData = nonEmpty.length > 0 ? nonEmpty : data.slice(-6);

  return (
    <Card padding="lg">
      <h2 className="mb-5 text-sm font-semibold uppercase tracking-wider text-slate-500">
        Monthly Trend
      </h2>
      <ResponsiveContainer width="100%" height={260}>
        <LineChart
          data={chartData}
          margin={{ top: 4, right: 8, left: 0, bottom: 4 }}
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
            tickFormatter={v => formatCompactCurrency(v)}
            tick={{ fill: '#64748b', fontSize: 11 }}
            axisLine={false}
            tickLine={false}
            width={56}
          />
          <Tooltip content={<TrendTooltip />} cursor={{ stroke: 'rgba(255,255,255,0.06)' }} />
          <Legend
            wrapperStyle={{ fontSize: 12, color: '#94a3b8', paddingTop: 12 }}
            formatter={value => <span className="capitalize">{value}</span>}
          />
          <Line
            type="monotone"
            dataKey="income"
            name="Income"
            stroke={COLORS.income}
            strokeWidth={2.5}
            dot={{ r: 3, fill: COLORS.income, strokeWidth: 0 }}
            activeDot={{ r: 5, strokeWidth: 0 }}
          />
          <Line
            type="monotone"
            dataKey="expense"
            name="Expense"
            stroke={COLORS.expense}
            strokeWidth={2.5}
            dot={{ r: 3, fill: COLORS.expense, strokeWidth: 0 }}
            activeDot={{ r: 5, strokeWidth: 0 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </Card>
  );
});

export default MonthlyTrend;
