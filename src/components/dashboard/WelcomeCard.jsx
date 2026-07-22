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
      className="relative overflow-hidden rounded-2xl bg-gradient-brand p-6 text-white shadow-glow-primary/50"
    >
      {/* Decorative circles */}
      <div aria-hidden="true" className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-white/[0.06]" />
      <div aria-hidden="true" className="absolute -right-4 -bottom-10 h-40 w-40 rounded-full bg-white/[0.04]" />
      <div aria-hidden="true" className="absolute left-1/2 -top-8 h-32 w-32 rounded-full bg-white/[0.04]" />

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

        {/* Coin icon badge */}
        <div
          className="flex-shrink-0 flex h-16 w-16 items-center justify-center rounded-2xl bg-white/10 backdrop-blur-sm ring-1 ring-white/20"
          aria-hidden="true"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-8 w-8 text-white/90">
            <path d="M10.464 8.746c.227-.18.497-.311.786-.394v2.795a2.252 2.252 0 0 1-.786-.393c-.394-.313-.546-.681-.546-1.004 0-.323.152-.691.546-1.004ZM12.75 15.662v-2.824c.347.085.664.228.921.421.427.32.579.686.579.991 0 .305-.152.671-.579.991a2.534 2.534 0 0 1-.921.42Z" />
            <path fillRule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25ZM12.75 6a.75.75 0 0 0-1.5 0v.816a3.836 3.836 0 0 0-1.72.756c-.712.566-1.112 1.35-1.112 2.178 0 .829.4 1.612 1.113 2.178.502.4 1.102.647 1.719.756v2.978a2.536 2.536 0 0 1-.921-.421l-.879-.66a.75.75 0 0 0-.9 1.2l.879.66c.533.4 1.169.645 1.821.75V18a.75.75 0 0 0 1.5 0v-.81a4.124 4.124 0 0 0 1.821-.749c.745-.559 1.179-1.344 1.179-2.191 0-.847-.434-1.632-1.179-2.191a4.122 4.122 0 0 0-1.821-.75V8.354c.29.082.559.213.786.393l.415.33a.75.75 0 0 0 .933-1.175l-.415-.33a3.836 3.836 0 0 0-1.719-.755V6Z" clipRule="evenodd" />
          </svg>
        </div>
      </div>
    </div>
  );
});

export default WelcomeCard;
