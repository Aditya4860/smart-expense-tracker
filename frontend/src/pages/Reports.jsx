import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import DashboardLayout from '../layouts/DashboardLayout';
import { useExpenseContext } from '../context/ExpenseContext';
import { useIncomeContext } from '../context/IncomeContext';
import { useBudgetContext } from '../context/BudgetContext';
import { useGoals } from '../context/GoalContext';
import { useAnalyticsContext } from '../context/AnalyticsContext';
import { useCategory } from '../context/CategoryContext';
import { exportToCSV, exportToExcel, triggerPDFPrint } from '../utils/exportUtils';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line
} from 'recharts';

const REPORT_TYPES = [
  { id: 'monthly', label: 'Monthly Summary' },
  { id: 'yearly', label: 'Yearly Summary' },
  { id: 'expense', label: 'Expense by Category' },
  { id: 'income', label: 'Income by Category' },
  { id: 'savings', label: 'Savings & Goals Progress' },
  { id: 'budget', label: 'Budget Utilization' },
  { id: 'cashflow', label: 'Cash Flow Analysis' },
  { id: 'analytics', label: 'Full Analytics Overview' },
];

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16'];

export default function Reports() {
  const { expenses } = useExpenseContext();
  const { income } = useIncomeContext();
  const { budgets, calculateSpentBudget } = useBudgetContext();
  const { goals, calculateProgress } = useGoals();
  const { analytics } = useAnalyticsContext();
  const { getCategoryMeta } = useCategory();

  const [activeReport, setActiveReport] = useState('monthly');
  const [reportYear, setReportYear] = useState(new Date().getFullYear().toString());

  // ── Data Shapers ────────────────────────────────────────────────────────

  const reportData = useMemo(() => {
    let tableData = [];
    let chartData = [];
    let title = '';
    let chartType = 'bar'; // 'bar', 'pie', 'line'

    if (activeReport === 'monthly') {
      title = `Monthly Summary (${reportYear})`;
      chartType = 'bar';
      
      const monthlyMap = {};
      for (let i = 1; i <= 12; i++) {
        monthlyMap[i] = { month: i, Income: 0, Expense: 0, Net: 0 };
      }
      
      income.forEach(inc => {
        if (!inc.date) return;
        const [y, m] = inc.date.split('-');
        if (y === reportYear) monthlyMap[parseInt(m)].Income += inc.amount;
      });
      expenses.forEach(exp => {
        if (!exp.date) return;
        const [y, m] = exp.date.split('-');
        if (y === reportYear) monthlyMap[parseInt(m)].Expense += exp.amount;
      });

      chartData = Object.values(monthlyMap).map(d => ({
        ...d,
        Net: d.Income - d.Expense,
        MonthName: new Date(2000, d.month - 1).toLocaleString('default', { month: 'short' })
      }));
      
      tableData = chartData.map(d => ({
        Month: d.MonthName,
        'Income ($)': d.Income.toFixed(2),
        'Expense ($)': d.Expense.toFixed(2),
        'Net ($)': d.Net.toFixed(2)
      }));
    } 
    
    else if (activeReport === 'yearly') {
      title = 'Yearly Summary';
      chartType = 'bar';
      const yearMap = {};
      
      income.forEach(inc => {
        if (!inc.date) return;
        const y = inc.date.split('-')[0];
        if (!yearMap[y]) yearMap[y] = { year: y, Income: 0, Expense: 0 };
        yearMap[y].Income += inc.amount;
      });
      expenses.forEach(exp => {
        if (!exp.date) return;
        const y = exp.date.split('-')[0];
        if (!yearMap[y]) yearMap[y] = { year: y, Income: 0, Expense: 0 };
        yearMap[y].Expense += exp.amount;
      });

      chartData = Object.values(yearMap).sort((a,b) => a.year.localeCompare(b.year));
      tableData = chartData.map(d => ({
        Year: d.year,
        'Income ($)': d.Income.toFixed(2),
        'Expense ($)': d.Expense.toFixed(2),
        'Net ($)': (d.Income - d.Expense).toFixed(2)
      }));
    }

    else if (activeReport === 'expense') {
      title = 'Expenses by Category';
      chartType = 'pie';
      const catMap = {};
      
      expenses.forEach(exp => {
        if (exp.date && exp.date.startsWith(reportYear)) {
          const catName = exp.categoryName || getCategoryMeta(exp.category, 'EXPENSE').name;
          catMap[catName] = (catMap[catName] || 0) + exp.amount;
        }
      });
      
      chartData = Object.keys(catMap).map(k => ({ name: k, value: catMap[k] }));
      tableData = chartData.map(d => ({
        Category: d.name,
        'Total Spent ($)': d.value.toFixed(2)
      }));
    }

    else if (activeReport === 'income') {
      title = 'Income by Source';
      chartType = 'pie';
      const catMap = {};
      
      income.forEach(inc => {
        if (inc.date && inc.date.startsWith(reportYear)) {
          const source = inc.source || inc.categoryName || getCategoryMeta(inc.category, 'INCOME').name || 'Other';
          catMap[source] = (catMap[source] || 0) + inc.amount;
        }
      });
      
      chartData = Object.keys(catMap).map(k => ({ name: k, value: catMap[k] }));
      tableData = chartData.map(d => ({
        Source: d.name,
        'Total Income ($)': d.value.toFixed(2)
      }));
    }

    else if (activeReport === 'savings') {
      title = 'Savings & Goals Progress';
      chartType = 'bar';
      
      chartData = goals.map(g => ({
        name: g.title,
        'Current ($)': g.currentAmount,
        'Target ($)': g.targetAmount,
        Progress: calculateProgress(g.id)
      }));

      tableData = chartData.map(d => ({
        Goal: d.name,
        'Current Amount ($)': d['Current ($)'].toFixed(2),
        'Target Amount ($)': d['Target ($)'].toFixed(2),
        'Progress (%)': d.Progress + '%'
      }));
    }

    else if (activeReport === 'budget') {
      title = 'Budget Utilization';
      chartType = 'bar';
      
      chartData = budgets.map(b => ({
        name: getCategoryMeta(b.category, 'EXPENSE').name || 'General',
        'Spent ($)': calculateSpentBudget(b.id),
        'Limit ($)': b.monthlyLimit,
      }));

      tableData = chartData.map(d => ({
        'Budget Category': d.name,
        'Limit ($)': d['Limit ($)'].toFixed(2),
        'Spent ($)': d['Spent ($)'].toFixed(2),
        'Remaining ($)': (d['Limit ($)'] - d['Spent ($)']).toFixed(2)
      }));
    }

    else if (activeReport === 'cashflow') {
      title = `Cash Flow Analysis (${reportYear})`;
      chartType = 'line';
      
      const monthlyMap = {};
      for (let i = 1; i <= 12; i++) {
        monthlyMap[i] = { month: i, Flow: 0 };
      }
      
      income.forEach(inc => {
        if (inc.date && inc.date.startsWith(reportYear)) {
          monthlyMap[parseInt(inc.date.split('-')[1])].Flow += inc.amount;
        }
      });
      expenses.forEach(exp => {
        if (exp.date && exp.date.startsWith(reportYear)) {
          monthlyMap[parseInt(exp.date.split('-')[1])].Flow -= exp.amount;
        }
      });

      let cumulative = 0;
      chartData = Object.values(monthlyMap).map(d => {
        cumulative += d.Flow;
        return {
          MonthName: new Date(2000, d.month - 1).toLocaleString('default', { month: 'short' }),
          'Net Flow': d.Flow,
          'Cumulative Cash': cumulative
        };
      });

      tableData = chartData.map(d => ({
        Month: d.MonthName,
        'Net Flow ($)': d['Net Flow'].toFixed(2),
        'Cumulative Cash ($)': d['Cumulative Cash'].toFixed(2)
      }));
    }

    else if (activeReport === 'analytics') {
      title = 'High-Level Analytics Overview';
      chartType = 'none';
      tableData = [
        { Metric: 'Total Income', Value: `$${analytics?.totalIncome.toFixed(2)}` },
        { Metric: 'Total Expenses', Value: `$${analytics?.totalExpense.toFixed(2)}` },
        { Metric: 'Net Savings', Value: `$${analytics?.netSavings.toFixed(2)}` },
        { Metric: 'Savings Rate', Value: `${analytics?.savingsRate.toFixed(1)}%` },
      ];
    }

    return { title, chartType, chartData, tableData };
  }, [activeReport, reportYear, expenses, income, budgets, goals, calculateProgress, calculateSpentBudget, analytics]);

  // ── Render Helpers ──────────────────────────────────────────────────────

  const renderChart = () => {
    const { chartType, chartData } = reportData;
    if (chartType === 'none' || chartData.length === 0) return null;

    if (chartType === 'pie') {
      return (
        <ResponsiveContainer width="100%" height={350}>
          <PieChart>
            <Pie data={chartData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={120} label>
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff' }} />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      );
    }

    if (chartType === 'line') {
      return (
        <ResponsiveContainer width="100%" height={350}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
            <XAxis dataKey="MonthName" stroke="#94a3b8" />
            <YAxis stroke="#94a3b8" />
            <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff' }} />
            <Legend />
            <Line type="monotone" dataKey="Net Flow" stroke="#f59e0b" strokeWidth={3} />
            <Line type="monotone" dataKey="Cumulative Cash" stroke="#10b981" strokeWidth={3} />
          </LineChart>
        </ResponsiveContainer>
      );
    }

    // Default: Bar Chart
    const keys = Object.keys(chartData[0] || {}).filter(k => k !== 'MonthName' && k !== 'month' && k !== 'year' && k !== 'name' && k !== 'Progress');
    return (
      <ResponsiveContainer width="100%" height={350}>
        <BarChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
          <XAxis dataKey={chartData[0]?.MonthName ? "MonthName" : (chartData[0]?.year ? "year" : "name")} stroke="#94a3b8" />
          <YAxis stroke="#94a3b8" />
          <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff' }} />
          <Legend />
          {keys.map((k, i) => (
            <Bar key={k} dataKey={k} fill={COLORS[i % COLORS.length]} radius={[4, 4, 0, 0]} />
          ))}
        </BarChart>
      </ResponsiveContainer>
    );
  };

  return (
    <DashboardLayout>
      <div className="w-full max-w-7xl mx-auto print-wrapper">
        
        {/* Navigation Breadcrumb / Back button */}
        <div className="mb-4 no-print flex items-center justify-between">
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium text-slate-400 hover:text-white hover:bg-surface-800 transition-colors group border border-transparent hover:border-surface-700"
          >
            <svg 
              className="w-4 h-4 transition-transform group-hover:-translate-x-1" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Dashboard
          </Link>
        </div>

        {/* Header - Hidden in Print */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8 no-print">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-white">Reports Module</h1>
            <p className="text-surface-400 mt-1">Generate, analyze, and export your financial data.</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Link
              to="/dashboard"
              className="px-3.5 py-2 bg-surface-800/80 hover:bg-surface-700 text-slate-300 hover:text-white rounded-lg font-medium transition-colors border border-surface-700 text-sm inline-flex items-center gap-1.5"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              Dashboard
            </Link>
            <button 
              onClick={() => exportToCSV(reportData.tableData, `${activeReport}_report`)}
              className="px-4 py-2 bg-surface-800 hover:bg-surface-700 text-white rounded-lg font-medium transition-colors border border-surface-700 text-sm"
            >
              Export CSV
            </button>
            <button 
              onClick={() => exportToExcel(reportData.tableData, `${activeReport}_report`)}
              className="px-4 py-2 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 rounded-lg font-medium transition-colors border border-emerald-500/30 text-sm"
            >
              Export Excel
            </button>
            <button 
              onClick={triggerPDFPrint}
              className="px-4 py-2 bg-primary-600 hover:bg-primary-500 text-white rounded-lg font-medium shadow-sm transition-colors text-sm"
            >
              Download PDF
            </button>
          </div>
        </div>

        {/* Controls - Hidden in Print */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8 no-print p-4 bg-surface-900 border border-surface-800 rounded-xl">
          <div className="flex flex-col gap-1.5 md:col-span-2">
            <label className="text-xs font-semibold text-surface-400 uppercase tracking-wider">Report Type</label>
            <select 
              value={activeReport} 
              onChange={e => setActiveReport(e.target.value)}
              className="input w-full"
            >
              {REPORT_TYPES.map(t => (
                <option key={t.id} value={t.id}>{t.label}</option>
              ))}
            </select>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-surface-400 uppercase tracking-wider">Target Year</label>
            <select 
              value={reportYear} 
              onChange={e => setReportYear(e.target.value)}
              className="input w-full"
            >
              {[...Array(5)].map((_, i) => {
                const year = new Date().getFullYear() - i;
                return <option key={year} value={year}>{year}</option>;
              })}
            </select>
          </div>
        </div>

        {/* Printable Report Area */}
        <div className="bg-surface-900 border border-surface-800 rounded-xl overflow-hidden print-area">
          <div className="p-6 border-b border-surface-800 flex justify-between items-center bg-surface-800/50">
            <h2 className="text-xl font-bold text-white">{reportData.title}</h2>
            <span className="text-sm font-mono text-surface-400">Generated: {new Date().toLocaleDateString()}</span>
          </div>
          
          {/* Chart Area */}
          {reportData.chartType !== 'none' && (
            <div className="p-6 border-b border-surface-800 min-h-[400px] flex items-center justify-center bg-surface-900/50">
              {renderChart()}
            </div>
          )}

          {/* Data Table */}
          <div className="p-0 overflow-x-auto">
            {reportData.tableData.length > 0 ? (
              <table className="w-full text-sm text-left">
                <thead className="text-xs uppercase bg-surface-800/80 text-surface-300">
                  <tr>
                    {Object.keys(reportData.tableData[0]).map(key => (
                      <th key={key} className="px-6 py-4 font-semibold tracking-wider">{key}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-800/50">
                  {reportData.tableData.map((row, i) => (
                    <tr key={i} className="hover:bg-surface-800/20 transition-colors">
                      {Object.values(row).map((val, j) => (
                        <td key={j} className="px-6 py-4 text-surface-200">{val}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="p-8 text-center text-surface-400">
                No data available for the selected parameters.
              </div>
            )}
          </div>
        </div>

        {/* Print-specific CSS injected locally */}
        <style>{`
          @media print {
            body {
              background-color: white !important;
              color: black !important;
            }
            .no-print, #top-navbar, .sidebar {
              display: none !important;
            }
            .print-area {
              background-color: white !important;
              border: 1px solid #ccc !important;
              color: black !important;
              box-shadow: none !important;
            }
            .print-area h2 {
              color: black !important;
            }
            .print-area th {
              background-color: #f3f4f6 !important;
              color: #374151 !important;
              border-bottom: 2px solid #ccc;
            }
            .print-area td {
              color: black !important;
              border-bottom: 1px solid #eee;
            }
            .print-area .bg-surface-800\\/50, .print-area .bg-surface-900\\/50 {
              background-color: transparent !important;
            }
            /* Attempt to make recharts look better on print */
            .recharts-text {
              fill: black !important;
            }
            .recharts-cartesian-grid line {
              stroke: #eee !important;
            }
          }
        `}</style>
      </div>
    </DashboardLayout>
  );
}
