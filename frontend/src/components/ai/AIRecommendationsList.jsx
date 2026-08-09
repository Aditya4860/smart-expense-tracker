import React, { useState } from 'react';
import Card from '../ui/Card';

const TypeColors = {
    BUDGET: 'text-blue-400 bg-blue-400/10 border-blue-400/20',
    SAVINGS: 'text-green-400 bg-green-400/10 border-green-400/20',
    SPENDING: 'text-purple-400 bg-purple-400/10 border-purple-400/20',
    GOAL: 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20',
    WARNING: 'text-red-400 bg-red-400/10 border-red-400/20',
};

const RecommendationItem = ({ rec }) => {
    const [expanded, setExpanded] = useState(false);
    const badgeStyle = TypeColors[rec.type] || 'text-surface-300 bg-surface-700/50 border-surface-600';

    return (
        <div className="border border-surface-700 rounded-lg overflow-hidden bg-surface-800/50 hover:border-surface-600 transition-colors">
            <div 
                className="p-4 flex items-start justify-between cursor-pointer"
                onClick={() => setExpanded(!expanded)}
            >
                <div className="flex-1 pr-4">
                    <div className="flex items-center gap-3 mb-2">
                        <span className={`text-[10px] font-bold tracking-wider px-2 py-0.5 rounded border uppercase ${badgeStyle}`}>
                            {rec.type}
                        </span>
                        <h4 className="font-medium text-surface-50 text-sm">{rec.title}</h4>
                    </div>
                    <p className="text-surface-300 text-sm leading-relaxed">{rec.description}</p>
                </div>
                <button className="text-surface-400 mt-1">
                    <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 transition-transform ${expanded ? 'rotate-180' : ''}`} viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                </button>
            </div>
            {expanded && (
                <div className="px-4 pb-4 pt-1 bg-surface-900/30 border-t border-surface-700/50">
                    <div className="text-xs text-surface-400">
                        <span className="font-semibold text-surface-300 uppercase tracking-wider text-[10px] mr-2">Evidence:</span>
                        {rec.evidence}
                    </div>
                </div>
            )}
        </div>
    );
};

const AIRecommendationsList = ({ recommendations, loading }) => {
    if (loading) {
        return (
            <Card className="flex flex-col gap-3">
                <div className="h-6 w-1/2 bg-surface-700 animate-pulse rounded mb-4"></div>
                <div className="h-20 w-full bg-surface-700 animate-pulse rounded-lg"></div>
                <div className="h-20 w-full bg-surface-700 animate-pulse rounded-lg"></div>
            </Card>
        );
    }

    if (!recommendations || recommendations.length === 0) {
        return null;
    }

    return (
        <Card className="flex flex-col gap-4">
            <div className="flex items-center gap-2 text-surface-50">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-accent-500" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                <h3 className="font-semibold text-lg">Personalized Recommendations</h3>
            </div>
            <div className="flex flex-col gap-3">
                {recommendations.map((rec, idx) => (
                    <RecommendationItem key={idx} rec={rec} />
                ))}
            </div>
        </Card>
    );
};

export default AIRecommendationsList;
