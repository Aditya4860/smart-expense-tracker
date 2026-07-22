import { memo } from 'react';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import useAnalytics from '../../hooks/useAnalytics';
import { CATEGORY_MAP } from '../../constants/expenseCategories';
import { formatCurrency } from '../../utils/formatters';
import Card from '../ui/Card';

// ── Hex palette mapped from expense category ids ───────────────────────────
// Mirrors the Tailwind color classes in expenseCategories.js

const EXPENSE_CATEGORY_HEX = {
  food:          '#fb923c', // orange-400
  transport:     '#60a5fa', // blue-400
  shopping:      '#f472b6', // pink-400
  bills:         '#facc15', // yellow-400
  entertainment: '#c084fc', // purple-400
  healthcare:    '#f87171', // red-400
  education:     '#22d3ee', // cyan-400
  travel:        '#2dd4bf', // teal-400
  investment:    '#4ade80', // green-400
  other:         '#94a3b8', // slate-400
};

const DEFAULT_HEX = '#6366f1'; // indigo-400 fallback



// ── Custom tooltip ─────────────────────────────────────────────────────────

function PieTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;
  const { name, value, payload: inner } = payload[0];
  return (
    <div className="rounded-xl border border-surface-700/60 bg-surface-900 p-3 shadow-2xl text-sm">
      <div className="flex items-center gap-2 mb-1">
        <span className="h-2.5 w-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: inner.fill }} />
        <span className="font-semibold text-white">{name}</span>
      </div>
      <p className="text-danger-400 font-semibold tabular-nums">{formatCurrency(value)}</p>
      <p className="text-slate-500 text-xs">{inner.share}% of total</p>
    </div>
  );
}

// ── Legend item ────────────────────────────────────────────────────────────

function CustomLegend({ payload }) {
  if (!payload?.length) return null;
  return (
    <ul className="mt-4 flex flex-wrap justify-center gap-x-4 gap-y-2">
      {payload.map(entry => (
        <li key={entry.value} className="flex items-center gap-1.5 text-xs text-slate-400">
          <span className="h-2 w-2 rounded-full flex-shrink-0" style={{ backgroundColor: entry.color }} />
          {entry.value}
        </li>
      ))}
    </ul>
  );
}

// ── Main component ─────────────────────────────────────────────────────────

/**
 * ExpenseCategoryPieChart — donut chart of expense distribution by category.
 * Uses category colors from expenseCategories.js (mapped to hex).
 */
const ExpenseCategoryPieChart = memo(function ExpenseCategoryPieChart() {
  const { analytics } = useAnalytics();

  const data = analytics.categoryTotals.map(item => ({
    name:  CATEGORY_MAP[item.category]?.name ?? item.category,
    value: item.total,
    share: item.share,
    fill:  EXPENSE_CATEGORY_HEX[item.category] ?? DEFAULT_HEX,
  }));

  if (!data.length) {
    return (
      <Card padding="lg" className="flex flex-col">
        <h2 className="mb-5 text-sm font-semibold uppercase tracking-wider text-slate-500">
          Expense Breakdown
        </h2>
        <p className="flex-1 flex items-center justify-center text-sm text-slate-600 py-12">
          No expense data available.
        </p>
      </Card>
    );
  }

  return (
    <Card padding="lg">
      <h2 className="mb-2 text-sm font-semibold uppercase tracking-wider text-slate-500">
        Expense Breakdown
      </h2>
      <ResponsiveContainer width="100%" height={280}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={70}
            outerRadius={110}
            paddingAngle={3}
            dataKey="value"
            nameKey="name"
            animationBegin={0}
            animationDuration={600}
          >
            {data.map((entry, i) => (
              <Cell key={`exp-cell-${i}`} fill={entry.fill} stroke="transparent" />
            ))}
          </Pie>
          <Tooltip content={<PieTooltip />} />
          <Legend content={<CustomLegend />} />
        </PieChart>
      </ResponsiveContainer>
    </Card>
  );
});

export default ExpenseCategoryPieChart;
