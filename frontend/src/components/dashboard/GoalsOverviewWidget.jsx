import { memo, useMemo } from 'react';
import useGoals from '../../hooks/useGoals';
import { formatCurrency } from '../../utils/formatters';
import Card from '../ui/Card';

const GoalsOverviewWidget = memo(function GoalsOverviewWidget() {
  const { goals } = useGoals();
  
  const stats = useMemo(() => {
    const totalGoals = goals.length;
    const completedGoals = goals.filter(g => (Number(g.currentAmount) || 0) >= (Number(g.targetAmount) || 0)).length;
    const totalTarget = goals.reduce((s, g) => s + (Number(g.targetAmount) || 0), 0);
    const totalSaved = goals.reduce((s, g) => s + (Number(g.currentAmount) || 0), 0);
    const overallProgress = totalTarget > 0 ? parseFloat(((totalSaved / totalTarget) * 100).toFixed(1)) : 0;
    const totalRemaining = Math.max(0, totalTarget - totalSaved);
    
    return { totalGoals, completedGoals, overallProgress, totalSaved, totalRemaining };
  }, [goals]);

  return (
    <Card padding="md" className="flex flex-col justify-between gap-4 h-full">
      <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-500">Savings Goals Overview</h3>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <p className="text-xs text-slate-400">Total Saved</p>
          <p className="text-xl font-bold text-success-400">{formatCurrency(stats.totalSaved)}</p>
        </div>
        <div>
          <p className="text-xs text-slate-400">Total Remaining</p>
          <p className="text-xl font-bold text-slate-300">{formatCurrency(stats.totalRemaining)}</p>
        </div>
      </div>
      
      <div>
        <div className="flex justify-between text-xs mb-1">
          <span className="text-slate-400">Overall Progress</span>
          <span className="font-medium text-white">{stats.overallProgress}%</span>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-surface-700">
          <div className="h-full rounded-full bg-primary-500 transition-all duration-500" style={{ width: `${stats.overallProgress}%` }} />
        </div>
      </div>
      
      <div className="flex justify-between border-t border-surface-700/60 pt-3 text-xs text-slate-400">
        <span>{stats.totalGoals} Total Goals</span>
        <span>{stats.completedGoals} Completed</span>
      </div>
    </Card>
  );
});

export default GoalsOverviewWidget;
