import { memo, useMemo } from 'react';
import useAuth from '../../hooks/useAuth';
import useAnalytics from '../../hooks/useAnalytics';
import useBudget from '../../hooks/useBudget';
import useGoals from '../../hooks/useGoals';

// ── Helpers ────────────────────────────────────────────────────────────────

const MESSAGES = [
  'Every rupee tracked is a step toward financial freedom.',
  'Small habits compound into big results. Keep going.',
  'Clarity in spending leads to clarity in life.',
  'Awareness is the first step to financial wellness.',
  'Track today, thrive tomorrow.',
  'Mindful spending is the foundation of wealth.',
  "You're building something great — stay consistent.",
];

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

function formatToday() {
  return new Date().toLocaleDateString('en-IN', {
    weekday: 'long',
    day:     'numeric',
    month:   'long',
    year:    'numeric',
  });
}

/**
 * Derive financial health label + colours from savings rate.
 * @param {number}  rate    — integer 0–100
 * @param {boolean} hasData — false when no income/expense exists yet
 * @returns {{ label: string, dot: string, badge: string }}
 */
function healthFromRate(rate, hasData) {
  if (!hasData) return { label: 'No data yet',      dot: 'bg-slate-400',   badge: 'bg-white/10 text-white/60' };
  if (rate >= 30) return { label: 'Excellent 🏆',   dot: 'bg-emerald-400', badge: 'bg-emerald-400/20 text-emerald-300' };
  if (rate >= 20) return { label: 'Healthy 🎉',     dot: 'bg-green-400',   badge: 'bg-green-400/20 text-green-300'   };
  if (rate >= 10) return { label: 'Fair ⚡',         dot: 'bg-yellow-400',  badge: 'bg-yellow-400/20 text-yellow-300' };
  if (rate >  0)  return { label: 'Needs Attention', dot: 'bg-orange-400',  badge: 'bg-orange-400/20 text-orange-300' };
  return              { label: 'Over Budget ⚠️',    dot: 'bg-red-400',     badge: 'bg-red-400/20 text-red-300'       };
}

// ── Main component ─────────────────────────────────────────────────────────

/**
 * WelcomeCard — gradient hero card with greeting, financial health status,
 * today's date, budget alert count, and a rotating motivational message.
 *
 * Budget alert count is derived here (not from BudgetAlertWidget) to keep
 * each component independently re-renderable.
 */
const WelcomeCard = memo(function WelcomeCard() {
  const { user }      = useAuth();
  const { analytics } = useAnalytics();
  const { budgets, calculateBudgetProgress } = useBudget();
  const { goals }     = useGoals();

  const firstName = user?.name?.split(' ')[0] ?? 'there';
  const message   = MESSAGES[new Date().getDay() % MESSAGES.length];

  const hasData = analytics.incomeCount > 0 || analytics.expenseCount > 0;
  const health  = healthFromRate(analytics.savingsRate, hasData);

  // Count budgets at >=70 % utilization for the alert badge
  const alertCount = useMemo(() =>
    budgets.filter(b => calculateBudgetProgress(b.id) >= 70).length,
    [budgets, calculateBudgetProgress],
  );

  // Count goals due in <= 7 days
  const goalAlertCount = useMemo(() => {
    const now = new Date();
    return goals.filter(g => {
      if ((Number(g.currentAmount) || 0) >= (Number(g.targetAmount) || 0)) return false;
      if (!g.targetDate) return false;
      const diffTime = new Date(g.targetDate) - now;
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays >= 0 && diffDays <= 7;
    }).length;
  }, [goals]);

  return (
    <div
      id="welcome-card"
      className="relative overflow-hidden rounded-[10px] bg-surface-950 p-6 text-white shadow-card-dark border border-surface-700"
    >
      {/* Subtle grid/wireframe background */}
      <div 
        aria-hidden="true" 
        className="absolute inset-0 opacity-[0.15] pointer-events-none"
        style={{
          backgroundImage: `linear-gradient(to right, var(--tw-colors-surface-800) 1px, transparent 1px), linear-gradient(to bottom, var(--tw-colors-surface-800) 1px, transparent 1px)`,
          backgroundSize: '24px 24px'
        }}
      />
      
      {/* Glow effect */}
      <div className="absolute -top-24 -right-24 h-64 w-64 rounded-full bg-success-500/10 blur-[80px] pointer-events-none" />

      <div className="relative z-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        {/* Text */}
        <div className="min-w-0">
          <p className="text-xs font-medium uppercase tracking-wider text-white/60">
            {formatToday()}
          </p>
          <h2 className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">
            {getGreeting()}, {firstName} 👋
          </h2>
          <p className="mt-2 max-w-sm text-sm text-white/70 leading-relaxed">
            {message}
          </p>

          {/* Badges row */}
          <div className="mt-4 flex flex-wrap items-center gap-2">
            {/* Financial health */}
            <span className="text-xs font-medium text-white/60 uppercase tracking-wider">
              Financial Health:
            </span>
            <span
              className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${health.badge}`}
              aria-label={`Financial health: ${health.label}`}
            >
              <span className={`h-1.5 w-1.5 rounded-full ${health.dot}`} aria-hidden="true" />
              {health.label}
            </span>

            {/* Budget alert badge — only when there are active alerts */}
            {alertCount > 0 && (
              <span
                className="inline-flex items-center gap-1.5 rounded-full bg-orange-400/20 px-2.5 py-1 text-xs font-semibold text-orange-300"
                aria-label={`${alertCount} budget ${alertCount === 1 ? 'alert' : 'alerts'}`}
              >
                <span className="h-1.5 w-1.5 rounded-full bg-orange-400" aria-hidden="true" />
                {alertCount} Budget {alertCount === 1 ? 'Alert' : 'Alerts'}
              </span>
            )}

            {/* Goal alert badge */}
            {goalAlertCount > 0 && (
              <span
                className="inline-flex items-center gap-1.5 rounded-full bg-indigo-400/20 px-2.5 py-1 text-xs font-semibold text-indigo-300"
                aria-label={`${goalAlertCount} goal ${goalAlertCount === 1 ? 'deadline' : 'deadlines'} soon`}
              >
                <span className="h-1.5 w-1.5 rounded-full bg-indigo-400" aria-hidden="true" />
                {goalAlertCount} Goal {goalAlertCount === 1 ? 'Deadline' : 'Deadlines'} Soon
              </span>
            )}
          </div>
        </div>

        {/* Illustration/Icon */}
        <div
          className="flex-shrink-0 hidden md:flex h-20 w-20 items-center justify-center rounded-[12px] bg-surface-900 border border-surface-700 text-surface-400"
          aria-hidden="true"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-10 w-10">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z" />
          </svg>
        </div>
      </div>
    </div>
  );
});

export default WelcomeCard;
