import { useMemo } from 'react';
import Card from '../ui/Card';
import useGoals from '../../hooks/useGoals';
import { formatCurrency } from '../../utils/formatters';

export default function GoalAnalytics() {
  const { goals } = useGoals();
  
  const stats = useMemo(() => {
    let totalTarget = 0;
    let totalSaved = 0;
    let completed = 0;
    
    goals.forEach(g => {
      const target = Number(g.targetAmount) || 0;
      const current = Number(g.currentAmount) || 0;
      totalTarget += target;
      totalSaved += current;
      if (current >= target && target > 0) completed++;
    });
    
    const progressPct = totalTarget > 0 ? (totalSaved / totalTarget) * 100 : 0;
    
    return {
      total: goals.length,
      completed,
      totalTarget,
      totalSaved,
      progressPct: Math.min(100, Math.max(0, progressPct))
    };
  }, [goals]);

  if (goals.length === 0) return null;

  return (
    <Card padding="md" className="flex flex-col gap-4">
      <h3 className="text-base font-semibold text-white">Savings Goals Overview</h3>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-surface-800 rounded-xl p-4 border border-surface-700/50">
          <p className="text-xs text-slate-500 mb-1">Total Goals</p>
          <p className="text-xl font-bold text-white">{stats.total}</p>
        </div>
        <div className="bg-surface-800 rounded-xl p-4 border border-surface-700/50">
          <p className="text-xs text-slate-500 mb-1">Completed</p>
          <p className="text-xl font-bold text-success-400">{stats.completed}</p>
        </div>
        <div className="bg-surface-800 rounded-xl p-4 border border-surface-700/50">
          <p className="text-xs text-slate-500 mb-1">Total Saved</p>
          <p className="text-xl font-bold text-white tabular-nums">{formatCurrency(stats.totalSaved)}</p>
        </div>
        <div className="bg-surface-800 rounded-xl p-4 border border-surface-700/50">
          <p className="text-xs text-slate-500 mb-1">Overall Progress</p>
          <div className="flex items-end gap-2">
            <p className="text-xl font-bold text-primary-400 tabular-nums">{stats.progressPct.toFixed(1)}%</p>
          </div>
        </div>
      </div>
    </Card>
  );
}
