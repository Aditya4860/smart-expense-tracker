import { memo, useMemo } from 'react';
import useGoals from '../../hooks/useGoals';
import { formatLocalDate } from '../../utils/formatters';
import Card from '../ui/Card';

const UpcomingGoalsWidget = memo(function UpcomingGoalsWidget() {
  const { goals } = useGoals();

  const upcoming = useMemo(() => {
    const now = new Date();
    return goals
      .filter(g => (Number(g.currentAmount) || 0) < (Number(g.targetAmount) || 0) && g.targetDate)
      .map(g => {
        const diffTime = new Date(g.targetDate) - now;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return { ...g, diffDays };
      })
      .filter(g => g.diffDays >= 0)
      .sort((a, b) => a.diffDays - b.diffDays)
      .slice(0, 3);
  }, [goals]);

  return (
    <Card padding="md" className="flex flex-col gap-4 h-full">
      <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-500">Upcoming Deadlines</h3>
      {upcoming.length === 0 ? (
        <p className="text-sm text-slate-500 py-4 text-center my-auto">No upcoming goals.</p>
      ) : (
        <div className="flex flex-col gap-3">
          {upcoming.map(goal => (
            <div key={goal.id} className="flex items-center justify-between rounded-xl bg-surface-700/30 p-3 border border-surface-700/50">
              <div className="min-w-0 pr-2">
                <p className="text-sm font-medium text-white truncate">{goal.title}</p>
                <p className="text-xs text-slate-400">{formatLocalDate(goal.targetDate)}</p>
              </div>
              <div className="text-right flex-shrink-0">
                <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider ${
                  goal.diffDays <= 7 ? 'bg-danger-500/20 text-danger-400' :
                  goal.diffDays <= 30 ? 'bg-yellow-500/20 text-yellow-400' : 'bg-primary-500/20 text-primary-400'
                }`}>
                  {goal.diffDays} {goal.diffDays === 1 ? 'day' : 'days'} left
                </span>
                <p className="mt-1 text-[10px] uppercase text-slate-500">{goal.priority} priority</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
});

export default UpcomingGoalsWidget;
