import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Calendar,
  CalendarDays,
  TrendingDown,
  TrendingUp,
  PieChart,
  Target,
  Activity,
  FileSpreadsheet,
  FileText,
  Download,
  AlertCircle,
  RefreshCw,
  Sparkles,
} from 'lucide-react';
import { motion } from 'motion/react';
import DashboardLayout from '../layouts/DashboardLayout';
import PageHeader from '../components/ui/PageHeader';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import EmptyState from '../components/ui/EmptyState';
import ReportKpiCards from '../components/reports/ReportKpiCards';
import ReportCharts from '../components/reports/ReportCharts';
import ReportTable from '../components/reports/ReportTable';
import reportApi from '../services/api/reportApi';
import { MONTH_NAMES, todayString } from '../utils/formatters';

const REPORT_TABS = [
  { id: 'monthly', label: 'Monthly', icon: Calendar, subtitle: 'Monthly statement & budget utilization' },
  { id: 'yearly', label: 'Yearly', icon: CalendarDays, subtitle: 'Annual trends & monthly averages' },
  { id: 'expenses', label: 'Expenses', icon: TrendingDown, subtitle: 'Category & payment breakdowns' },
  { id: 'income', label: 'Income', icon: TrendingUp, subtitle: 'Revenue sources & cash inflow' },
  { id: 'budget', label: 'Budget', icon: PieChart, subtitle: 'Category budget variance & limits' },
  { id: 'savings-goals', label: 'Savings', icon: Target, subtitle: 'Financial goals & milestones' },
  { id: 'cash-flow', label: 'Cash Flow', icon: Activity, subtitle: 'Inflow vs outflow statement' },
];

const getMonthDateRange = (year, month) => {
  const y = parseInt(year, 10);
  const m = parseInt(month, 10);
  const start = `${y}-${String(m).padStart(2, '0')}-01`;
  const lastDay = new Date(y, m, 0).getDate();
  const end = `${y}-${String(m).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;
  return { start, end };
};

export default function Reports() {
  const today = new Date();
  const currentYear = today.getFullYear();
  const currentMonth = today.getMonth() + 1;

  // Selected report type
  const [activeTab, setActiveTab] = useState('monthly');

  // Date filters
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [selectedMonth, setSelectedMonth] = useState(currentMonth);
  const [startDate, setStartDate] = useState(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-01`;
  });
  const [endDate, setEndDate] = useState(() => todayString());

  // Data & status state
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Export states
  const [exportingFormat, setExportingFormat] = useState(null); // 'csv' | 'excel' | 'pdf' | null
  const [exportNotice, setExportNotice] = useState(null); // { type: 'success' | 'error', text: '' }

  // Available year options (e.g. current year - 4 to current year + 1)
  const yearOptions = useMemo(() => {
    const years = [];
    for (let y = currentYear + 1; y >= currentYear - 4; y--) {
      years.push(y);
    }
    return years;
  }, [currentYear]);

  // Fetch report data on parameter change
  const fetchReport = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      let data = null;
      switch (activeTab) {
        case 'monthly':
          data = await reportApi.getMonthlyReport(selectedYear, selectedMonth);
          break;
        case 'yearly':
          data = await reportApi.getYearlyReport(selectedYear);
          break;
        case 'expenses':
          data = await reportApi.getExpenseReport(startDate, endDate);
          break;
        case 'income':
          data = await reportApi.getIncomeReport(startDate, endDate);
          break;
        case 'budget':
          data = await reportApi.getBudgetReport(selectedYear, selectedMonth);
          break;
        case 'savings-goals':
          data = await reportApi.getSavingsGoalReport();
          break;
        case 'cash-flow':
          data = await reportApi.getCashFlowReport(startDate, endDate);
          break;
        default:
          break;
      }
      setReportData(data);
    } catch (err) {
      console.error('Failed to load report:', err);
      setError(err?.message || 'Unable to generate report data from the server.');
    } finally {
      setLoading(false);
    }
  }, [activeTab, selectedYear, selectedMonth, startDate, endDate]);

  useEffect(() => {
    fetchReport();
  }, [fetchReport]);

  // Clear toast feedback after 4 seconds
  useEffect(() => {
    if (!exportNotice) return;
    const timer = setTimeout(() => setExportNotice(null), 4500);
    return () => clearTimeout(timer);
  }, [exportNotice]);

  // Trigger export download
  const handleExport = async (format) => {
    if (exportingFormat) return;
    setExportingFormat(format);
    setExportNotice(null);

    try {
      const params = {};
      if (activeTab === 'monthly' || activeTab === 'budget') {
        params.year = selectedYear;
        params.month = selectedMonth;
      } else if (activeTab === 'yearly') {
        params.year = selectedYear;
      } else if (activeTab === 'expenses' || activeTab === 'income' || activeTab === 'cash-flow') {
        params.start_date = startDate;
        params.end_date = endDate;
      }

      const filename = await reportApi.downloadExport(activeTab, format, params);
      setExportNotice({
        type: 'success',
        text: `Report downloaded successfully: ${filename}`,
      });
    } catch (err) {
      console.error(`Export ${format} failed:`, err);
      setExportNotice({
        type: 'error',
        text: `Failed to export ${format.toUpperCase()} report: ${err?.message || 'Server error'}`,
      });
    } finally {
      setExportingFormat(null);
    }
  };

  // Quick date presets for range-based reports
  const applyPreset = (preset) => {
    const now = new Date();
    const curY = now.getFullYear();
    const curM = now.getMonth() + 1;

    if (preset === 'this-month') {
      const { start, end } = getMonthDateRange(curY, curM);
      setStartDate(start);
      setEndDate(end);
    } else if (preset === 'last-month') {
      const prevM = curM === 1 ? 12 : curM - 1;
      const prevY = curM === 1 ? curY - 1 : curY;
      const { start, end } = getMonthDateRange(prevY, prevM);
      setStartDate(start);
      setEndDate(end);
    } else if (preset === 'last-30') {
      const prior = new Date(now);
      prior.setDate(prior.getDate() - 30);
      setStartDate(prior.toISOString().split('T')[0]);
      setEndDate(now.toISOString().split('T')[0]);
    } else if (preset === 'ytd') {
      setStartDate(`${curY}-01-01`);
      setEndDate(todayString());
    }
  };

  const activeTabMeta = useMemo(() => {
    return REPORT_TABS.find((t) => t.id === activeTab) || REPORT_TABS[0];
  }, [activeTab]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1, 
      transition: { staggerChildren: 0.1 } 
    }
  };
  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } }
  };

  return (
    <DashboardLayout>
      <motion.div 
        className="w-full max-w-7xl mx-auto flex flex-col gap-6 pb-12"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Header with Export Action Toolbar */}
        <motion.div variants={itemVariants}>
          <PageHeader
          title="Financial Reports & Analytics"
          subtitle="Generate audit-ready reports, analyze trends, and export verified financial statements."
          action={
            <div className="flex flex-wrap items-center gap-2.5">
              <Button
                variant="secondary"
                size="md"
                onClick={() => handleExport('csv')}
                disabled={loading || Boolean(exportingFormat)}
                loading={exportingFormat === 'csv'}
                className="gap-2 border-surface-700 bg-surface-800 hover:border-slate-500"
              >
                <FileSpreadsheet className="h-4 w-4 text-emerald-400" />
                <span>CSV</span>
              </Button>

              <Button
                variant="secondary"
                size="md"
                onClick={() => handleExport('excel')}
                disabled={loading || Boolean(exportingFormat)}
                loading={exportingFormat === 'excel'}
                className="gap-2 border-surface-700 bg-surface-800 hover:border-slate-500"
              >
                <FileSpreadsheet className="h-4 w-4 text-emerald-500" />
                <span>Excel (.xlsx)</span>
              </Button>

              <Button
                variant="primary"
                size="md"
                onClick={() => handleExport('pdf')}
                disabled={loading || Boolean(exportingFormat)}
                loading={exportingFormat === 'pdf'}
                className="gap-2"
              >
                <Download className="h-4 w-4" />
                <span>Download PDF</span>
              </Button>
            </div>
          }
        />
        </motion.div>

        {/* Download Feedback Banner */}
        {exportNotice && (
          <motion.div variants={itemVariants}
            className={`flex items-center justify-between gap-3 rounded-xl border p-4 text-sm font-medium transition-all ${
              exportNotice.type === 'success'
                ? 'border-success-500/30 bg-success-500/10 text-success-400'
                : 'border-danger-500/30 bg-danger-500/10 text-danger-400'
            }`}
          >
            <div className="flex items-center gap-2.5">
              {exportNotice.type === 'success' ? (
                <Sparkles className="h-4 w-4 flex-shrink-0" />
              ) : (
                <AlertCircle className="h-4 w-4 flex-shrink-0" />
              )}
              <span>{exportNotice.text}</span>
            </div>
            <button
              onClick={() => setExportNotice(null)}
              className="text-xs uppercase hover:underline opacity-80"
            >
              Dismiss
            </button>
          </motion.div>
        )}

        {/* Report Selector Pills */}
        <motion.div variants={itemVariants} className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {REPORT_TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2.5 rounded-xl px-4 py-2.5 text-sm font-medium transition-all whitespace-nowrap ${
                  isActive
                    ? 'bg-primary-500 text-white shadow-glow-primary'
                    : 'border border-surface-700 bg-surface-800 text-slate-400 hover:border-slate-600 hover:text-white'
                }`}
              >
                <Icon className={`h-4 w-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </motion.div>

        {/* Dynamic Filters & Date Controls Bar */}
        <motion.div variants={itemVariants}>
        <Card padding="md" className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-2 text-sm text-slate-400">
            <span className="font-semibold text-white">{activeTabMeta.label} Report</span>
            <span>•</span>
            <span className="text-slate-400 text-xs">{activeTabMeta.subtitle}</span>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Monthly / Budget Controls: Month & Year Selector */}
            {(activeTab === 'monthly' || activeTab === 'budget') && (
              <>
                <div className="flex items-center gap-2">
                  <label className="text-xs font-medium text-slate-400 uppercase tracking-wider">Month:</label>
                  <select
                    value={selectedMonth}
                    onChange={(e) => setSelectedMonth(Number(e.target.value))}
                    className="rounded-lg border border-surface-700 bg-surface-900 px-3 py-1.5 text-sm text-white focus:border-primary-500 focus:outline-none"
                  >
                    {MONTH_NAMES.slice(1).map((name, index) => (
                      <option key={name} value={index + 1}>
                        {name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center gap-2">
                  <label className="text-xs font-medium text-slate-400 uppercase tracking-wider">Year:</label>
                  <select
                    value={selectedYear}
                    onChange={(e) => setSelectedYear(Number(e.target.value))}
                    className="rounded-lg border border-surface-700 bg-surface-900 px-3 py-1.5 text-sm text-white focus:border-primary-500 focus:outline-none"
                  >
                    {yearOptions.map((y) => (
                      <option key={y} value={y}>
                        {y}
                      </option>
                    ))}
                  </select>
                </div>
              </>
            )}

            {/* Yearly Controls: Year Selector */}
            {activeTab === 'yearly' && (
              <div className="flex items-center gap-2">
                <label className="text-xs font-medium text-slate-400 uppercase tracking-wider">Year:</label>
                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(Number(e.target.value))}
                  className="rounded-lg border border-surface-700 bg-surface-900 px-3 py-1.5 text-sm text-white focus:border-primary-500 focus:outline-none"
                >
                  {yearOptions.map((y) => (
                    <option key={y} value={y}>
                      {y}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Expenses, Income, Cash Flow Controls: Date Range */}
            {(activeTab === 'expenses' || activeTab === 'income' || activeTab === 'cash-flow') && (
              <div className="flex flex-wrap items-center gap-2.5">
                <div className="flex items-center gap-1.5">
                  <label className="text-xs font-medium text-slate-400 uppercase">From:</label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="rounded-lg border border-surface-700 bg-surface-900 px-2.5 py-1 text-sm text-white focus:border-primary-500 focus:outline-none"
                  />
                </div>

                <div className="flex items-center gap-1.5">
                  <label className="text-xs font-medium text-slate-400 uppercase">To:</label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="rounded-lg border border-surface-700 bg-surface-900 px-2.5 py-1 text-sm text-white focus:border-primary-500 focus:outline-none"
                  />
                </div>

                {/* Range Presets */}
                <div className="flex items-center gap-1 border-l border-surface-700/80 pl-2">
                  <button
                    type="button"
                    onClick={() => applyPreset('this-month')}
                    className="rounded-md bg-surface-700/60 px-2 py-1 text-xs font-medium text-slate-300 hover:bg-surface-700 hover:text-white"
                  >
                    This Month
                  </button>
                  <button
                    type="button"
                    onClick={() => applyPreset('last-month')}
                    className="rounded-md bg-surface-700/60 px-2 py-1 text-xs font-medium text-slate-300 hover:bg-surface-700 hover:text-white"
                  >
                    Last Month
                  </button>
                  <button
                    type="button"
                    onClick={() => applyPreset('last-30')}
                    className="rounded-md bg-surface-700/60 px-2 py-1 text-xs font-medium text-slate-300 hover:bg-surface-700 hover:text-white"
                  >
                    Last 30D
                  </button>
                  <button
                    type="button"
                    onClick={() => applyPreset('ytd')}
                    className="rounded-md bg-surface-700/60 px-2 py-1 text-xs font-medium text-slate-300 hover:bg-surface-700 hover:text-white"
                  >
                    YTD
                  </button>
                </div>
              </div>
            )}

            {/* Refresh Button */}
            <button
              onClick={fetchReport}
              disabled={loading}
              title="Refresh Report Data"
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-surface-700 bg-surface-800 text-slate-400 hover:border-slate-500 hover:text-white transition-colors"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin text-primary-400' : ''}`} />
            </button>
          </div>
        </Card>
        </motion.div>

        {/* Error State Banner */}
        {error && (
          <motion.div variants={itemVariants}>
          <Card padding="md" className="border-danger-500/40 bg-danger-500/10">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <AlertCircle className="h-5 w-5 text-danger-400 flex-shrink-0" />
                <div>
                  <p className="text-sm font-semibold text-danger-300">Report Calculation Error</p>
                  <p className="text-xs text-danger-400/90 mt-0.5">{error}</p>
                </div>
              </div>
              <Button variant="secondary" size="sm" onClick={fetchReport} className="border-danger-500/40">
                Retry Query
              </Button>
            </div>
          </Card>
          </motion.div>
        )}

        {/* Top Summary Cards / Financial KPIs */}
        <motion.div variants={itemVariants}>
          <ReportKpiCards reportType={activeTab} data={reportData} loading={loading} />
        </motion.div>

        {/* Interactive Charts & Visualizations */}
        <motion.div variants={itemVariants}>
          <ReportCharts reportType={activeTab} data={reportData} loading={loading} />
        </motion.div>

        {/* Structured Data & Breakdown Tables */}
        <motion.div variants={itemVariants}>
          <ReportTable reportType={activeTab} data={reportData} loading={loading} />
        </motion.div>
      </motion.div>
    </DashboardLayout>
  );
}
