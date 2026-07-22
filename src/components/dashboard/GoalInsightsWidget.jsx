import { memo, useMemo } from 'react';
import useGoals from '../../hooks/useGoals';
import { formatCurrency } from '../../utils/formatters';
import Card from '../ui/Card';

const INSIGHT_ICON = (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4 text-accent-400" aria-hidden="true">
    <path fillRule="evenodd" d="M10 2a.75.75 0 0 1 .75.75v1.5a.75.75 0 0 1-1.5 0v-1.5A.75.75 0 0 1 10 2ZM10 15a.75.75 0 0 1 .75.75v1.5a.75.75 0 0 1-1.5 0v-1.5A.75.75 0 0 1 10 15ZM13.82 4.12a.75.75 0 0 1 1.06 0l1.06 1.06a.75.75 0 1 1-1.06 1.06l-1.06-1.06a.75.75 0 0 1 0-1.06ZM5.12 13.82a.75.75 0 0 1 1.06 0l1.06 1.06a.75.75 0 0 1-1.06 1.06l-1.06-1.06a.75.75 0 0 1 0-1.06ZM17.25 10a.75.75 0 0 1-.75.75h-1.5a.75.75 0 0 1 0-1.5h1.5a.75.75 0 0 1 .75.75ZM4.25 10a.75.75 0 0 1-.75.75h-1.5a.75.75 0 0 1 0-1.5h1.5a.75.75 0 0 1 .75.75ZM13.82 15.88a.75.75 0 0 1 0-1.06l1.06-1.06a.75.75 0 1 1 1.06 1.06l-1.06 1.06a.75.75 0 0 1-1.06 0ZM5.12 4.12a.75.75 0 0 1 0 1.06l-1.06 1.06a.75.75 0 0 1-1.06-1.06l1.06-1.06a.75.75 0 0 1 1.06 0ZM10 6a4 4 0 1 0 0 8 4 4 0 0 0 0-8Z" clipRule="evenodd" />
  </svg>
);

const GoalInsightsWidget = memo(function GoalInsightsWidget() {
  const { goals, calculateProgress, calculateRemainingAmount } = useGoals();

  const insights = useMemo(() => {
    const messages = [];
    
    // Overall stats
    const active = goals.filter(g => (Number(g.currentAmount) || 0) < (Number(g.targetAmount) || 0));
    
    if (active.length === 0) {
      if (goals.length > 0) messages.push("All your savings goals are complete! Time to set a new one.");
      else messages.push("Set your first savings goal to track your progress.");
      return messages;
    }

    // Top progress
    const highestProgress = active.reduce((a, b) => calculateProgress(a.id) > calculateProgress(b.id) ? a : b);
    const hpPct = calculateProgress(highestProgress.id);
    if (hpPct > 0) {
      messages.push(`Your ${highestProgress.title} goal is ${hpPct}% complete!`);
    }
    
    // Needs more
    const lowestProgress = active.reduce((a, b) => calculateProgress(a.id) < calculateProgress(b.id) ? a : b);
    const lpRemain = calculateRemainingAmount(lowestProgress.id);
    if (lpRemain > 0 && lowestProgress !== highestProgress) {
      messages.push(`${lowestProgress.title} needs ${formatCurrency(lpRemain)} more to reach its target.`);
    } else if (active.length === 1 && lpRemain > 0) {
      messages.push(`You need ${formatCurrency(lpRemain)} more to reach your target for ${lowestProgress.title}.`);
    }

    // Contribution suggestions
    const soonest = active.filter(g => g.targetDate).sort((a, b) => new Date(a.targetDate) - new Date(b.targetDate))[0];
    if (soonest) {
      const remain = calculateRemainingAmount(soonest.id);
      const diffMonths = Math.max(1, Math.ceil((new Date(soonest.targetDate) - new Date()) / (1000 * 60 * 60 * 24 * 30.44)));
      const requiredMonthly = remain / diffMonths;
      const currentMonthly = Number(soonest.monthlyContribution) || 0;
      
      if (currentMonthly > 0 && currentMonthly < requiredMonthly) {
        messages.push(`Increase monthly contribution for ${soonest.title} by ${formatCurrency(requiredMonthly - currentMonthly)} to stay on track.`);
      } else if (currentMonthly === 0) {
        messages.push(`Start contributing ${formatCurrency(requiredMonthly)} monthly to reach ${soonest.title} on time.`);
      }
    }

    return messages.slice(0, 3);
  }, [goals, calculateProgress, calculateRemainingAmount]);

  return (
    <Card padding="md" className="flex flex-col gap-4 h-full">
      <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-500">Savings Insights</h3>
      <div className="flex flex-col gap-3">
        {insights.map((msg, i) => (
          <div key={i} className="flex items-start gap-3 rounded-xl bg-accent-500/10 p-3">
            <div className="mt-0.5 rounded-full bg-accent-500/20 p-1 flex-shrink-0">
              {INSIGHT_ICON}
            </div>
            <p className="text-sm text-accent-100">{msg}</p>
          </div>
        ))}
      </div>
    </Card>
  );
});

export default GoalInsightsWidget;
