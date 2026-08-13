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
  Rectangle,
} from 'recharts';
import useAnalytics from '../../hooks/useAnalytics';
import { formatCurrency, formatCompactCurrency } from '../../utils/formatters';
import Card from '../ui/Card';

// ── Palette (hex values — Recharts cannot use Tailwind classes) ────────────

const COLORS = {
  income:  '#059669', // darker green
  expense: '#dc2626', // dark red
  balance: '#06b6d4', // cyan
};


function CashFlowTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border border-surface-700/60 bg-[#12141a]/90 backdrop-blur-md p-3 shadow-2xl text-sm">
      <p className="mb-2 font-semibold text-white">{label}</p>
      {payload.map(entry => (
        <div key={entry.dataKey} className="flex items-center gap-2 py-0.5">
          <span className="h-2 w-2 rounded-full flex-shrink-0" style={{ backgroundColor: entry.fill || entry.color, filter: `drop-shadow(0px 0px 4px ${entry.fill || entry.color})` }} />
          <span className="text-slate-400 capitalize">{entry.name}:</span>
          <span className="ml-auto pl-4 font-semibold tabular-nums" style={{ color: entry.fill || entry.color }}>
            {formatCurrency(entry.value)}
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
            tickFormatter={v => formatCompactCurrency(v)}
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
          <Bar dataKey="income"  name="Income"  fill={COLORS.income}  radius={[20, 20, 20, 20]} maxBarSize={10} activeBar={(props) => <Rectangle {...props} width={props.width + 2} style={{ filter: `drop-shadow(0px 0px 8px ${COLORS.income})` }} />} />
          <Bar dataKey="expense" name="Expense" fill={COLORS.expense} radius={[20, 20, 20, 20]} maxBarSize={10} activeBar={(props) => <Rectangle {...props} width={props.width + 2} style={{ filter: `drop-shadow(0px 0px 8px ${COLORS.expense})` }} />} />
          <Bar dataKey="balance" name="Balance" fill={COLORS.balance} radius={[20, 20, 20, 20]} maxBarSize={10} activeBar={(props) => <Rectangle {...props} width={props.width + 2} style={{ filter: `drop-shadow(0px 0px 8px ${COLORS.balance})` }} />} />
        </BarChart>
      </ResponsiveContainer>
    </Card>
  );
});

export default MonthlyCashFlowChart;
