import { useState, useCallback, memo, useMemo } from 'react';
import { motion } from 'motion/react';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, Sector, Rectangle,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import DashboardLayout from '../layouts/DashboardLayout';
import WelcomeCard from '../components/dashboard/WelcomeCard';
import SummaryCards from '../components/dashboard/SummaryCards';
import QuickActions from '../components/dashboard/QuickActions';
import BudgetOverviewWidget from '../components/dashboard/BudgetOverviewWidget';
import BudgetAlertWidget from '../components/dashboard/BudgetAlertWidget';
import BudgetProgressWidget from '../components/dashboard/BudgetProgressWidget';
import ExpenseModal from '../components/expenses/ExpenseModal';
import ExpenseForm from '../components/expenses/ExpenseForm';
import IncomeModal from '../components/income/IncomeModal';
import IncomeForm from '../components/income/IncomeForm';
import BudgetModal from '../components/budget/BudgetModal';
import BudgetForm from '../components/budget/BudgetForm';
import GoalsOverviewWidget from '../components/dashboard/GoalsOverviewWidget';
import GoalProgressWidget from '../components/dashboard/GoalProgressWidget';
import UpcomingGoalsWidget from '../components/dashboard/UpcomingGoalsWidget';
import GoalModal from '../components/goals/GoalModal';
import GoalForm from '../components/goals/GoalForm';
import UpcomingRemindersWidget from '../components/dashboard/UpcomingRemindersWidget';
import RecentNotificationsWidget from '../components/dashboard/RecentNotificationsWidget';
import RecurringSummaryWidget from '../components/dashboard/RecurringSummaryWidget';
import RecurringModal from '../components/recurring/RecurringModal';
import RecurringForm from '../components/recurring/RecurringForm';
import Card from '../components/ui/Card';
import useExpenses from '../hooks/useExpenses';
import useIncome from '../hooks/useIncome';
import useAnalytics from '../hooks/useAnalytics';
import useBudget from '../hooks/useBudget';
import useGoals from '../hooks/useGoals';
import useRecurring from '../hooks/useRecurring';
import { useCategory } from '../context/CategoryContext';
import { formatCurrency } from '../utils/formatters';

// ── Color palette for charts ──────────────────────────────────────────────
const CHART_COLORS = [
  '#06b6d4', // Cyan
  '#ec4899', // Pink
  '#facc15', // Yellow
  '#8b5cf6', // Violet
  '#059669', // Darker Green
  '#dc2626', // Dark Red
  '#3b82f6', // Blue
  '#f97316', // Orange
];

// ── Custom tooltip ────────────────────────────────────────────────────────
const ChartTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border border-surface-700/60 bg-[#12141a]/90 backdrop-blur-md px-3 py-2 shadow-2xl text-xs">
      {label && <p className="font-semibold text-white mb-1">{label}</p>}
      {payload.map((entry, i) => (
        <div key={i} className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full" style={{ backgroundColor: entry.color, filter: `drop-shadow(0px 0px 4px ${entry.color})` }} />
          <p style={{ color: '#fff' }} className="tabular-nums">
            <span className="text-slate-400 mr-1">{entry.name}:</span>
            {formatCurrency(entry.value)}
          </p>
        </div>
      ))}
    </div>
  );
};

// ── Active Shape for Pie Charts ───────────────────────────────────────────
const renderActiveShape = (props) => {
  const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill, payload, value, percent } = props;
  const p = percent !== undefined ? percent : (payload?.percent || 0);
  return (
    <g>
      <text x={cx} y={cy - 12} dy={8} textAnchor="middle" fill="#ffffff" className="text-[13px] font-semibold">
        {payload.name || ''}
      </text>
      <text x={cx} y={cy + 10} dy={8} textAnchor="middle" fill={fill} className="text-sm font-bold tabular-nums" style={{ filter: `drop-shadow(0 0 4px ${fill})` }}>
        {formatCurrency(value || 0)} {p > 0 ? `(${(p * 100).toFixed(0)}%)` : ''}
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

// ── Income vs Expense trend chart ─────────────────────────────────────────
const CashFlowChart = memo(function CashFlowChart({ analytics }) {
  const data = useMemo(() => {
    return (analytics.monthlyTotals || []).slice(-6).map(m => ({
      month: m.label || m.month,
      Income: m.income,
      Expenses: m.expense,
    }));
  }, [analytics.monthlyTotals]);

  if (data.length === 0) {
    return (
      <div className="flex h-full items-center justify-center py-12">
        <p className="text-sm text-slate-600">No monthly data yet.</p>
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={220}>
      <AreaChart data={data} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="incomeGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%"  stopColor="#10b981" stopOpacity={0.25} />
            <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="expenseGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%"  stopColor="#ef4444" stopOpacity={0.25} />
            <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#1e2228" vertical={false} />
        <XAxis dataKey="month" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false}
          tickFormatter={v => `₹${v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v}`} width={42} />
        <Tooltip content={<ChartTooltip />} />
        <Legend wrapperStyle={{ fontSize: 11, paddingTop: 8 }} />
        <Area type="monotone" dataKey="Income"   stroke="#10b981" strokeWidth={3} fill="url(#incomeGrad)"  dot={false} activeDot={{ r: 6, fill: "#10b981", stroke: "#fff", strokeWidth: 2, style: { filter: 'drop-shadow(0px 0px 8px #10b981)' } }} />
        <Area type="monotone" dataKey="Expenses" stroke="#ef4444" strokeWidth={3} fill="url(#expenseGrad)" dot={false} activeDot={{ r: 6, fill: "#ef4444", stroke: "#fff", strokeWidth: 2, style: { filter: 'drop-shadow(0px 0px 8px #ef4444)' } }} />
      </AreaChart>
    </ResponsiveContainer>
  );
});

// ── Spending by category bar chart ────────────────────────────────────────
const SpendingByCategoryChart = memo(function SpendingByCategoryChart({ analytics }) {
  const { getCategoryMeta } = useCategory();
  const data = useMemo(() => {
    return (analytics.topExpenseCategories || []).slice(0, 6).map(c => ({
      name: getCategoryMeta(c.category, 'EXPENSE')?.name || c.category,
      Amount: c.total,
      share: c.share,
    }));
  }, [analytics.topExpenseCategories, getCategoryMeta]);

  if (data.length === 0) {
    return (
      <div className="flex h-full items-center justify-center py-12">
        <p className="text-sm text-slate-600">No expense data yet.</p>
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={data} layout="vertical" margin={{ top: 0, right: 8, left: 4, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#1e2228" horizontal={false} />
        <XAxis type="number" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false}
          tickFormatter={v => `₹${v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v}`} />
        <YAxis type="category" dataKey="name" tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false} width={110} />
        <Tooltip content={<ChartTooltip />} />
        <Bar 
          dataKey="Amount" 
          radius={[12, 12, 12, 12]} 
          maxBarSize={6}
          activeBar={(props) => <Rectangle {...props} width={props.width} height={props.height + 4} style={{ filter: `drop-shadow(0px 0px 8px ${props.fill})` }} />}
        >
          {data.map((_, i) => (
            <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
});

// ── Income vs Expense donut ────────────────────────────────────────────────
const IncomeExpenseDonut = memo(function IncomeExpenseDonut({ analytics }) {
  const { totalIncome, totalExpense, savingsRate } = analytics;
  const data = [
    { name: 'Income',   value: totalIncome  },
    { name: 'Expenses', value: totalExpense },
    { name: 'Savings',  value: Math.max(0, totalIncome - totalExpense) },
  ].filter(d => d.value > 0);

  const DONUT_COLORS = ['#059669', '#dc2626', '#3b82f6']; // Darker Green, Dark Red, Blue

  const [activeIndex, setActiveIndex] = useState(0);

  if (data.length === 0) {
    return (
      <div className="flex h-full items-center justify-center py-12">
        <p className="text-sm text-slate-600">No data yet.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-3">
      <ResponsiveContainer width="100%" height={180}>
        <PieChart>
          <Pie 
            data={data} 
            cx="50%" 
            cy="50%" 
            innerRadius={60} 
            outerRadius={80}
            paddingAngle={3} 
            dataKey="value" 
            stroke="none"
            activeIndex={activeIndex}
            activeShape={renderActiveShape}
            onMouseEnter={(_, index) => setActiveIndex(index)}
          >
            {data.map((_, i) => (
              <Cell key={i} fill={DONUT_COLORS[i % DONUT_COLORS.length]} />
            ))}
          </Pie>
        </PieChart>
      </ResponsiveContainer>
      {/* Legend below donut */}
      <div className="flex gap-4 text-xs mt-2">
        {data.map((d, i) => (
          <div key={d.name} className="flex items-center gap-1.5 cursor-pointer" onMouseEnter={() => setActiveIndex(i)}>
            <span className="h-2 w-2 rounded-full flex-shrink-0" style={{ background: DONUT_COLORS[i], filter: activeIndex === i ? `drop-shadow(0 0 6px ${DONUT_COLORS[i]})` : 'none' }} />
            <span className={activeIndex === i ? 'text-white' : 'text-slate-400'}>{d.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
});

// ── Compact stat pill ─────────────────────────────────────────────────────
const StatPill = ({ label, value, color = 'text-white' }) => (
  <div className="flex flex-col gap-0.5 rounded-xl bg-surface-elevated px-4 py-3 min-w-0">
    <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-500 truncate">{label}</p>
    <p className={`text-base font-bold tabular-nums ${color} truncate`}>{value}</p>
  </div>
);

// ── Top Spending Category small card ──────────────────────────────────────
const TopSpendingCategory = memo(function TopSpendingCategory({ analytics }) {
  const { getCategoryMeta } = useCategory();
  const top = analytics.topExpenseCategories?.[0];
  const cat = top ? getCategoryMeta(top.category, 'EXPENSE') : null;
  return (
    <Card padding="md" className="flex flex-col gap-3">
      <p className="text-[11px] font-semibold uppercase tracking-widest text-slate-500">Top Spending</p>
      {cat ? (
        <>
          <div className="flex items-center gap-3">
            <div className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl text-base ${cat.bg} ${cat.color}`}>{cat.icon}</div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-white truncate">{cat.name}</p>
              <p className="text-xs text-slate-500">{top.count} transactions</p>
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-lg font-bold tabular-nums text-danger-400">{formatCurrency(top.total)}</span>
            <span className="text-xs text-slate-500">{top.share}% of spend</span>
          </div>
          <div className="h-1 w-full overflow-hidden rounded-full bg-surface-700">
            <div className="h-full rounded-full bg-danger-500/70" style={{ width: `${top.share}%` }} />
          </div>
        </>
      ) : (
        <p className="py-4 text-center text-sm text-slate-600">No expense data yet.</p>
      )}
    </Card>
  );
});

// ── Highest Income Source small card ─────────────────────────────────────
const HighestIncomeSource = memo(function HighestIncomeSource({ analytics }) {
  const top = analytics.topIncomeSources?.[0];
  return (
    <Card padding="md" className="flex flex-col gap-3">
      <p className="text-[11px] font-semibold uppercase tracking-widest text-slate-500">Top Income Source</p>
      {top ? (
        <>
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-success-500/15 text-lg">💰</div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-white truncate">{top.source}</p>
              <p className="text-xs text-slate-500">{top.count} records</p>
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-lg font-bold tabular-nums text-success-400">{formatCurrency(top.total)}</span>
            <span className="text-xs text-slate-500">{top.share}% of income</span>
          </div>
          <div className="h-1 w-full overflow-hidden rounded-full bg-surface-700">
            <div className="h-full rounded-full bg-success-500/60" style={{ width: `${top.share}%` }} />
          </div>
        </>
      ) : (
        <p className="py-4 text-center text-sm text-slate-600">No income data yet.</p>
      )}
    </Card>
  );
});

// ── Monthly Net Savings small card ────────────────────────────────────────
const MonthlyNetSavings = memo(function MonthlyNetSavings({ analytics }) {
  const now       = new Date();
  const ymNow     = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  const thisMonth = analytics.monthlyTotals?.find(m => m.month === ymNow);
  const netSav    = thisMonth ? thisMonth.balance : 0;
  const isPos     = netSav >= 0;
  return (
    <Card padding="md" className="flex flex-col gap-3">
      <p className="text-[11px] font-semibold uppercase tracking-widest text-slate-500">This Month's Net</p>
      <div className="flex items-center gap-3">
        <div className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl ${isPos ? 'bg-primary-500/15' : 'bg-danger-500/15'}`}>
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={`h-5 w-5 ${isPos ? 'text-primary-400' : 'text-danger-400'}`}>
            {isPos
              ? <path fillRule="evenodd" d="M10 17a.75.75 0 0 1-.75-.75V5.612L5.29 9.77a.75.75 0 0 1-1.08-1.04l5.25-5.5a.75.75 0 0 1 1.08 0l5.25 5.5a.75.75 0 1 1-1.08 1.04l-3.96-4.158V16.25A.75.75 0 0 1 10 17Z" clipRule="evenodd" />
              : <path fillRule="evenodd" d="M10 3a.75.75 0 0 1 .75.75v8.69l3.22-3.22a.75.75 0 1 1 1.06 1.06l-4.5 4.5a.75.75 0 0 1-1.06 0l-4.5-4.5a.75.75 0 0 1 1.06-1.06l3.22 3.22V3.75A.75.75 0 0 1 10 3Z" clipRule="evenodd" />
            }
          </svg>
        </div>
        <div>
          <p className={`text-xl font-bold tabular-nums ${isPos ? 'text-white' : 'text-danger-400'}`}>
            {formatCurrency(Math.abs(netSav))}
          </p>
          <p className="text-xs text-slate-500">{isPos ? 'Saved this month' : 'Over budget'}</p>
        </div>
      </div>
      {thisMonth && (
        <div className="grid grid-cols-2 gap-2 pt-0.5">
          <div className="rounded-lg bg-success-500/10 px-3 py-1.5">
            <p className="text-[10px] text-slate-500">Income</p>
            <p className="text-sm font-semibold tabular-nums text-success-400">{formatCurrency(thisMonth.income)}</p>
          </div>
          <div className="rounded-lg bg-danger-500/10 px-3 py-1.5">
            <p className="text-[10px] text-slate-500">Expenses</p>
            <p className="text-sm font-semibold tabular-nums text-danger-400">{formatCurrency(thisMonth.expense)}</p>
          </div>
        </div>
      )}
    </Card>
  );
});

// ── Inner page ─────────────────────────────────────────────────────────────
function DashboardInner() {
  const { addExpense } = useExpenses();
  const { addIncome  } = useIncome();
  const { analytics  } = useAnalytics();
  const { addBudget  } = useBudget();
  const { addGoal    } = useGoals();
  const { addRecurring } = useRecurring();

  const [expenseOpen,   setExpenseOpen]   = useState(false);
  const [incomeOpen,    setIncomeOpen]    = useState(false);
  const [budgetOpen,    setBudgetOpen]    = useState(false);
  const [goalOpen,      setGoalOpen]      = useState(false);
  const [recurringOpen, setRecurringOpen] = useState(false);

  const [savingExp,       setSavingExp]       = useState(false);
  const [savingInc,       setSavingInc]       = useState(false);
  const [savingBud,       setSavingBud]       = useState(false);
  const [savingGoal,      setSavingGoal]      = useState(false);
  const [savingRecurring, setSavingRecurring] = useState(false);

  const handleAddExpense = useCallback((values) => {
    setSavingExp(true); addExpense(values); setSavingExp(false); setExpenseOpen(false);
  }, [addExpense]);

  const handleAddIncome = useCallback((values) => {
    setSavingInc(true); addIncome(values); setSavingInc(false); setIncomeOpen(false);
  }, [addIncome]);

  const handleAddBudget = useCallback((values) => {
    setSavingBud(true); addBudget(values); setSavingBud(false); setBudgetOpen(false);
  }, [addBudget]);

  const handleAddGoal = useCallback((values) => {
    setSavingGoal(true); addGoal(values); setSavingGoal(false); setGoalOpen(false);
  }, [addGoal]);

  const handleAddRecurring = useCallback(async (values) => {
    setSavingRecurring(true);
    try { await addRecurring(values); setRecurringOpen(false); }
    catch (err) { console.error(err); }
    finally { setSavingRecurring(false); }
  }, [addRecurring]);

  const fade = { hidden: { opacity: 0, y: 14 }, visible: { opacity: 1, y: 0, transition: { duration: 0.38, ease: 'easeOut' } } };
  const container = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.09 } } };

  return (
    <>
      <motion.div className="space-y-5" variants={container} initial="hidden" animate="visible">

        {/* ── Row 1: Welcome + Quick Actions ───────────────────────── */}
        <motion.div variants={fade} className="flex flex-col xl:flex-row gap-5">
          <div className="flex-1 min-w-0"><WelcomeCard /></div>
          <div className="shrink-0 xl:w-[430px]">
            <QuickActions
              onAddExpense={() => setExpenseOpen(true)}
              onAddIncome={() => setIncomeOpen(true)}
              onAddBudget={() => setBudgetOpen(true)}
              onAddGoal={() => setGoalOpen(true)}
            />
          </div>
        </motion.div>

        {/* ── Row 2: 4 KPI cards ───────────────────────────────────── */}
        <motion.div variants={fade}><SummaryCards /></motion.div>

        {/* ── Row 3: Snapshot pills ────────────────────────────────── */}
        <motion.div variants={fade} className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-3">
          <TopSpendingCategory analytics={analytics} />
          <HighestIncomeSource analytics={analytics} />
          <MonthlyNetSavings   analytics={analytics} />
        </motion.div>

        {/* ── Row 4: Charts row ─────────────────────────────────────── */}
        <motion.div variants={fade} className="grid gap-4 lg:grid-cols-3">
          {/* Cash-flow area chart — 2 cols */}
          <Card padding="lg" className="lg:col-span-2 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-widest text-slate-500">Cash Flow</p>
                <p className="text-sm font-semibold text-white mt-0.5">Income vs Expenses — Last 6 Months</p>
              </div>
              <div className="flex items-center gap-3 text-xs text-slate-500">
                <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-success-500"/>Income</span>
                <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-danger-500"/>Expenses</span>
              </div>
            </div>
            <CashFlowChart analytics={analytics} />
          </Card>

          {/* Income/Expense donut — 1 col */}
          <Card padding="lg" className="flex flex-col gap-2">
            <p className="text-[11px] font-semibold uppercase tracking-widest text-slate-500">Distribution</p>
            <p className="text-sm font-semibold text-white mt-0.5">Income · Expenses · Savings</p>
            <IncomeExpenseDonut analytics={analytics} />
          </Card>
        </motion.div>

        {/* ── Row 5: Category bar chart + Budget section ────────────── */}
        <motion.div variants={fade} className="grid gap-4 lg:grid-cols-3">
          {/* Category bar chart */}
          <Card padding="lg" className="flex flex-col gap-3">
            <p className="text-[11px] font-semibold uppercase tracking-widest text-slate-500">Spending Breakdown</p>
            <p className="text-sm font-semibold text-white mt-0.5">Top 6 Categories</p>
            <SpendingByCategoryChart analytics={analytics} />
          </Card>

          {/* Budget progress + alerts */}
          <div className="lg:col-span-2 space-y-4">
            <BudgetOverviewWidget />
            <div className="grid gap-4 sm:grid-cols-2">
              <BudgetProgressWidget />
              <BudgetAlertWidget />
            </div>
          </div>
        </motion.div>

        {/* ── Row 6: Goals ─────────────────────────────────────────── */}
        <motion.div variants={fade} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <GoalsOverviewWidget />
          <GoalProgressWidget />
          <UpcomingGoalsWidget />
        </motion.div>

        {/* ── Row 7: Reminders / Recurring / Alerts ────────────────── */}
        <motion.div variants={fade} className="grid gap-4 lg:grid-cols-3">
          <UpcomingRemindersWidget />
          <RecurringSummaryWidget onAddNew={() => setRecurringOpen(true)} />
          <RecentNotificationsWidget />
        </motion.div>

      </motion.div>

      {/* ── Modals ─────────────────────────────────────────────────── */}
      <ExpenseModal isOpen={expenseOpen} onClose={() => setExpenseOpen(false)} title="Add Expense">
        <ExpenseForm onSubmit={handleAddExpense} onCancel={() => setExpenseOpen(false)} loading={savingExp} />
      </ExpenseModal>
      <IncomeModal isOpen={incomeOpen} onClose={() => setIncomeOpen(false)} title="Add Income">
        <IncomeForm onSubmit={handleAddIncome} onCancel={() => setIncomeOpen(false)} loading={savingInc} />
      </IncomeModal>
      <BudgetModal isOpen={budgetOpen} onClose={() => setBudgetOpen(false)} title="Add Budget">
        <BudgetForm onSubmit={handleAddBudget} onCancel={() => setBudgetOpen(false)} loading={savingBud} />
      </BudgetModal>
      <GoalModal isOpen={goalOpen} onClose={() => setGoalOpen(false)} title="Create Goal">
        <GoalForm onSubmit={handleAddGoal} onCancel={() => setGoalOpen(false)} loading={savingGoal} />
      </GoalModal>
      <RecurringModal isOpen={recurringOpen} onClose={() => setRecurringOpen(false)} title="New Recurring Schedule">
        <RecurringForm onSubmit={handleAddRecurring} onCancel={() => setRecurringOpen(false)} loading={savingRecurring} />
      </RecurringModal>
    </>
  );
}

// ── Page ───────────────────────────────────────────────────────────────────
export default function Dashboard() {
  return (
    <DashboardLayout>
      <DashboardInner />
    </DashboardLayout>
  );
}
