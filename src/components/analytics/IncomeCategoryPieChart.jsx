import { memo } from 'react';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import useIncome from '../../hooks/useIncome';
import { INCOME_CATEGORY_MAP } from '../../constants/incomeCategories';
import { formatCurrency } from '../../utils/formatters';
import Card from '../ui/Card';

// ── Hex palette mapped from income category ids ────────────────────────────
// Mirrors the Tailwind color classes in incomeCategories.js

const INCOME_CATEGORY_HEX = {
  salary:        '#4ade80', // green-400
  freelancing:   '#60a5fa', // blue-400
  business:      '#c084fc', // purple-400
  interest:      '#22d3ee', // cyan-400
  dividends:     '#818cf8', // indigo-400
  investment:    '#2dd4bf', // teal-400
  bonus:         '#fb923c', // orange-400
  gift:          '#f472b6', // pink-400
  refund:        '#facc15', // yellow-400
  rental_income: '#fbbf24', // amber-400
  other:         '#94a3b8', // slate-400
};

const DEFAULT_HEX = '#6366f1';

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
      <p className="text-success-400 font-semibold tabular-nums">{formatCurrency(value)}</p>
      <p className="text-slate-500 text-xs">{inner.share}% of total</p>
    </div>
  );
}

// ── Custom legend ──────────────────────────────────────────────────────────

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
 * IncomeCategoryPieChart — donut chart of income distribution by category.
 * Uses category colors from incomeCategories.js (mapped to hex).
 * Reads income from IncomeContext (via useIncome) to compute category totals.
 */
const IncomeCategoryPieChart = memo(function IncomeCategoryPieChart() {
  const { income } = useIncome();

  // Compute category totals from full income array
  const catMap   = {};
  let grandTotal = 0;
  for (const r of income) {
    catMap[r.category] = (catMap[r.category] ?? 0) + r.amount;
    grandTotal += r.amount;
  }

  const data = Object.entries(catMap)
    .map(([cat, total]) => ({
      name:  INCOME_CATEGORY_MAP[cat]?.name ?? cat,
      value: Math.round(total * 100) / 100,
      share: grandTotal > 0 ? Math.round((total / grandTotal) * 100) : 0,
      fill:  INCOME_CATEGORY_HEX[cat] ?? DEFAULT_HEX,
    }))
    .sort((a, b) => b.value - a.value);

  if (!data.length) {
    return (
      <Card padding="lg">
        <h2 className="mb-5 text-sm font-semibold uppercase tracking-wider text-slate-500">
          Income Breakdown
        </h2>
        <p className="flex items-center justify-center text-sm text-slate-600 py-12">
          No income data available.
        </p>
      </Card>
    );
  }

  return (
    <Card padding="lg">
      <h2 className="mb-2 text-sm font-semibold uppercase tracking-wider text-slate-500">
        Income Breakdown
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
              <Cell key={`inc-cell-${i}`} fill={entry.fill} stroke="transparent" />
            ))}
          </Pie>
          <Tooltip content={<PieTooltip />} />
          <Legend content={<CustomLegend />} />
        </PieChart>
      </ResponsiveContainer>
    </Card>
  );
});

export default IncomeCategoryPieChart;
