import { memo, useMemo } from 'react';
import useGoals from '../../hooks/useGoals';
import { formatCurrency } from '../../utils/formatters';
import Card from '../ui/Card';
import GoalProgressBar from '../goals/GoalProgressBar';

const GoalProgressWidget = memo(function GoalProgressWidget() {
  const { goals, calculateProgress, calculateRemainingAmount } = useGoals();
  
  const topGoals = useMemo(() => {
    return goals
      .filter(g => (Number(g.currentAmount) || 0) < (Number(g.targetAmount) || 0))
      .sort((a, b) => {
        const pA = calculateProgress(a.id);
        const pB = calculateProgress(b.id);
        return pB - pA; // highest progress first
      })
      .slice(0, 3);
  }, [goals, calculateProgress]);

  return (
    <Card padding="md" className="flex flex-col gap-4 h-full">
      <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-500">Top Active Goals</h3>
      {topGoals.length === 0 ? (
        <p className="text-sm text-slate-500 py-4 text-center my-auto">No active goals to show.</p>
      ) : (
        <div className="flex flex-col gap-4">
          {topGoals.map(goal => (
            <div key={goal.id} className="flex flex-col gap-1">
              <div className="flex justify-between text-sm">
                <span className="font-medium text-white truncate mr-2">{goal.title}</span>
                <span className="text-slate-400 whitespace-nowrap">{formatCurrency(Number(goal.currentAmount) || 0)} / {formatCurrency(Number(goal.targetAmount) || 0)}</span>
              </div>
              <GoalProgressBar
                currentAmount={goal.currentAmount}
                targetAmount={goal.targetAmount}
                pct={calculateProgress(goal.id)}
                compact
              />
              <p className="text-right text-[10px] text-slate-500">{formatCurrency(calculateRemainingAmount(goal.id))} remaining</p>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
});

export default GoalProgressWidget;
