import { memo, useMemo } from 'react';
import useGoals from '../../hooks/useGoals';
import { formatCurrency, formatLocalDate } from '../../utils/formatters';
import StatCard from '../ui/StatCard';

const ICONS = {
  goals: (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5" aria-hidden="true">
      <path fillRule="evenodd" d="M10 1c-1.828 0-3.623.149-5.371.435a.75.75 0 0 0-.629.74v.387c-.827.157-1.642.345-2.445.564a.75.75 0 0 0-.552.698 5 5 0 0 0 4.503 5.152 6 6 0 0 0 2.946 1.822A6.451 6.451 0 0 1 7.768 13H7.5A1.5 1.5 0 0 0 6 14.5V17h-.75a.75.75 0 0 0 0 1.5h9.5a.75.75 0 0 0 0-1.5H14v-2.5A1.5 1.5 0 0 0 12.5 13h-.268a6.453 6.453 0 0 1-.684-2.202 6 6 0 0 0 2.946-1.822 5 5 0 0 0 4.503-5.152.75.75 0 0 0-.552-.698A31.804 31.804 0 0 0 16 2.562v-.387a.75.75 0 0 0-.629-.74A33.227 33.227 0 0 0 10 1ZM2.525 4.422C3.012 4.3 3.504 4.19 4 4.09V5c0 .74.134 1.448.38 2.103a3.503 3.503 0 0 1-1.855-2.68Zm14.95 0a3.503 3.503 0 0 1-1.854 2.683C15.866 6.448 16 5.74 16 5v-.91c.496.099.988.21 1.475.332Z" clipRule="evenodd" />
    </svg>
  ),
  target: (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5" aria-hidden="true">
      <path fillRule="evenodd" d="M10 1a4.5 4.5 0 0 0-4.5 4.5V9H5a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-6a2 2 0 0 0-2-2h-.5V5.5A4.5 4.5 0 0 0 10 1Zm3 8V5.5a3 3 0 1 0-6 0V9h6Z" clipRule="evenodd" />
    </svg>
  ),
  saved: (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5" aria-hidden="true">
      <path d="M2.5 4A1.5 1.5 0 0 0 1 5.5V6h18v-.5A1.5 1.5 0 0 0 17.5 4h-15ZM19 8.5H1v6A1.5 1.5 0 0 0 2.5 16h15a1.5 1.5 0 0 0 1.5-1.5v-6ZM3 13.25a.75.75 0 0 1 .75-.75h1.5a.75.75 0 0 1 0 1.5h-1.5a.75.75 0 0 1-.75-.75Zm4.75-.75a.75.75 0 0 0 0 1.5h3.5a.75.75 0 0 0 0-1.5h-3.5Z" />
    </svg>
  ),
  progress: (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5" aria-hidden="true">
      <path d="M15.5 2A1.5 1.5 0 0 0 14 3.5v13a1.5 1.5 0 0 0 3 0v-13A1.5 1.5 0 0 0 15.5 2ZM9.5 6A1.5 1.5 0 0 0 8 7.5v9A1.5 1.5 0 0 0 11 16.5v-9A1.5 1.5 0 0 0 9.5 6ZM3.5 10A1.5 1.5 0 0 0 2 11.5v5A1.5 1.5 0 0 0 5 16.5v-5A1.5 1.5 0 0 0 3.5 10Z" />
    </svg>
  ),
  calendar: (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5" aria-hidden="true">
      <path fillRule="evenodd" d="M5.75 2a.75.75 0 0 1 .75.75V4h7V2.75a.75.75 0 0 1 1.5 0V4h.25A2.75 2.75 0 0 1 18 6.75v8.5A2.75 2.75 0 0 1 15.25 18H4.75A2.75 2.75 0 0 1 2 15.25v-8.5A2.75 2.75 0 0 1 4.75 4H5V2.75A.75.75 0 0 1 5.75 2Zm-1 5.5c-.69 0-1.25.56-1.25 1.25v6.5c0 .69.56 1.25 1.25 1.25h10.5c.69 0 1.25-.56 1.25-1.25v-6.5c0-.69-.56-1.25-1.25-1.25H4.75Z" clipRule="evenodd" />
    </svg>
  ),
};

const GoalSummary = memo(function GoalSummary() {
  const { goals } = useGoals();

  const stats = useMemo(() => {
    const count = goals.length;
    const completed = goals.filter(g => (Number(g.currentAmount) || 0) >= (Number(g.targetAmount) || 0)).length;
    const totalTarget = goals.reduce((s, g) => s + (Number(g.targetAmount) || 0), 0);
    const totalSaved = goals.reduce((s, g) => s + (Number(g.currentAmount) || 0), 0);
    const overallProgress = totalTarget > 0 ? parseFloat(((totalSaved / totalTarget) * 100).toFixed(1)) : 0;
    
    const activeGoals = goals.filter(g => (Number(g.currentAmount) || 0) < (Number(g.targetAmount) || 0));
    let nearest = null;
    if (activeGoals.length > 0) {
      nearest = activeGoals.reduce((a, b) => new Date(a.targetDate) < new Date(b.targetDate) ? a : b);
    }
    
    return { count, completed, totalTarget, totalSaved, overallProgress, nearest };
  }, [goals]);

  const cards = useMemo(() => [
    {
      id: 'gs-goals',
      label: 'Total Goals',
      value: stats.count,
      sub: `${stats.completed} completed`,
      icon: ICONS.goals,
      iconBg: 'bg-primary-500/15',
      iconText: 'text-primary-400',
      valueCls: 'text-white',
    },
    {
      id: 'gs-target',
      label: 'Total Target',
      value: formatCurrency(stats.totalTarget),
      sub: 'Across all goals',
      icon: ICONS.target,
      iconBg: 'bg-accent-500/15',
      iconText: 'text-accent-400',
      valueCls: 'text-white',
    },
    {
      id: 'gs-saved',
      label: 'Total Saved',
      value: formatCurrency(stats.totalSaved),
      sub: 'Total progress so far',
      icon: ICONS.saved,
      iconBg: 'bg-success-500/15',
      iconText: 'text-success-400',
      valueCls: 'text-success-400',
    },
    {
      id: 'gs-progress',
      label: 'Overall Progress',
      value: `${stats.overallProgress}%`,
      sub: stats.overallProgress >= 100 ? 'All goals reached!' : 'Keep saving',
      icon: ICONS.progress,
      iconBg: stats.overallProgress >= 50 ? 'bg-success-500/15' : 'bg-primary-500/15',
      iconText: stats.overallProgress >= 50 ? 'text-success-400' : 'text-primary-400',
      valueCls: stats.overallProgress >= 50 ? 'text-success-400' : 'text-primary-400',
    },
    {
      id: 'gs-nearest',
      label: 'Nearest Deadline',
      value: stats.nearest ? formatLocalDate(stats.nearest.targetDate) : '—',
      sub: stats.nearest ? stats.nearest.title : 'No active goals',
      icon: ICONS.calendar,
      iconBg: 'bg-yellow-500/15',
      iconText: 'text-yellow-400',
      valueCls: 'text-yellow-400',
    }
  ], [stats]);

  return (
    <section aria-label="Goal summary" className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
      {cards.map(card => (
        <StatCard key={card.id} {...card} />
      ))}
    </section>
  );
});

export default GoalSummary;
