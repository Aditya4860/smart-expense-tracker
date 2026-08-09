import React from 'react';
import Card from '../ui/Card';

const AIInsightsCard = ({ insights, loading }) => {
    if (loading) {
        return (
            <Card className="flex flex-col gap-3">
                <div className="h-6 w-1/3 bg-surface-700 animate-pulse rounded mb-2"></div>
                <div className="h-4 w-full bg-surface-700 animate-pulse rounded"></div>
                <div className="h-4 w-5/6 bg-surface-700 animate-pulse rounded"></div>
                <div className="h-4 w-4/5 bg-surface-700 animate-pulse rounded"></div>
            </Card>
        );
    }

    if (!insights || insights.length === 0) {
        return null;
    }

    return (
        <Card className="border-accent-500/30 bg-accent-500/5">
            <div className="flex items-center gap-2 mb-4 text-accent-400">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
                </svg>
                <h3 className="font-semibold text-lg">Financial Insights</h3>
            </div>
            <ul className="space-y-3">
                {insights.map((insight, idx) => (
                    <li key={idx} className="flex items-start gap-3">
                        <span className="text-accent-500 mt-1">•</span>
                        <span className="text-surface-200 text-sm leading-relaxed">{insight}</span>
                    </li>
                ))}
            </ul>
        </Card>
    );
};

export default AIInsightsCard;
