import { memo } from 'react';
import {
  PieChart,
  Pie,
  Cell,
  Sector,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { useState } from 'react';
import useIncome from '../../hooks/useIncome';
import { useCategory } from '../../context/CategoryContext';
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
const PALETTE_FALLBACKS = ['#4ade80', '#60a5fa', '#c084fc', '#22d3ee', '#818cf8', '#2dd4bf', '#fb923c', '#f472b6', '#facc15'];

// ── Active Shape (Hover) ──────────────────────────────────────────────────
const renderActiveShape = (props) => {
  const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill, payload, value, share } = props;
  return (
    <g>
      <text x={cx} y={cy - 12} dy={8} textAnchor="middle" fill="#fff" className="text-[13px] font-semibold">
        {payload.name}
      </text>
      <text x={cx} y={cy + 10} dy={8} textAnchor="middle" fill={fill} className="text-sm font-bold tabular-nums" style={{ filter: `drop-shadow(0 0 4px ${fill})` }}>
        {formatCurrency(value)} ({share}%)
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
  const { getCategoryMeta } = useCategory();

  // Compute category totals from full income array
  const catMap   = {};
  let grandTotal = 0;
  for (const r of income) {
    catMap[r.category] = (catMap[r.category] ?? 0) + r.amount;
    grandTotal += r.amount;
  }

  const data = Object.entries(catMap)
    .map(([cat, total], idx) => {
      const meta = getCategoryMeta(cat, 'INCOME');
      return {
        name:  meta.name,
        value: Math.round(total * 100) / 100,
        share: grandTotal > 0 ? Math.round((total / grandTotal) * 100) : 0,
        fill:  INCOME_CATEGORY_HEX[cat] || PALETTE_FALLBACKS[idx % PALETTE_FALLBACKS.length] || DEFAULT_HEX,
      };
    })
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

  const [activeIndex, setActiveIndex] = useState(0);

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
            activeIndex={activeIndex}
            activeShape={renderActiveShape}
            onMouseEnter={(_, index) => setActiveIndex(index)}
          >
            {data.map((entry, i) => (
              <Cell key={`inc-cell-${i}`} fill={entry.fill} stroke="transparent" />
            ))}
          </Pie>
        </PieChart>
      </ResponsiveContainer>
      <div className="mt-2 flex flex-wrap justify-center gap-x-4 gap-y-2">
        {data.map((entry, i) => (
          <div key={entry.name} className="flex items-center gap-1.5 cursor-pointer" onMouseEnter={() => setActiveIndex(i)}>
            <span className="h-2.5 w-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: entry.fill, filter: activeIndex === i ? `drop-shadow(0 0 6px ${entry.fill})` : 'none' }} />
            <span className={`text-xs ${activeIndex === i ? 'text-white' : 'text-slate-400'}`}>{entry.name}</span>
          </div>
        ))}
      </div>
    </Card>
  );
});

export default IncomeCategoryPieChart;
