import React, { useState } from 'react';

const TypeStyle = {
    BUDGET: {
        text: 'text-white',
        bg: 'bg-white/10',
        border: 'border-white/20',
        glow: 'group-hover:border-white/40'
    },
    SAVINGS: {
        text: 'text-success-400',
        bg: 'bg-success-500/10',
        border: 'border-success-500/20',
        glow: 'group-hover:border-success-500/40'
    },
    SPENDING: {
        text: 'text-white',
        bg: 'bg-white/10',
        border: 'border-white/20',
        glow: 'group-hover:border-white/40'
    },
    GOAL: {
        text: 'text-success-400',
        bg: 'bg-success-500/10',
        border: 'border-success-500/20',
        glow: 'group-hover:border-success-500/40'
    },
    WARNING: {
        text: 'text-danger-400',
        bg: 'bg-danger-500/10',
        border: 'border-danger-500/20',
        glow: 'group-hover:border-danger-500/40'
    },
};

const RecommendationItem = ({ rec }) => {
    const [expanded, setExpanded] = useState(false);
    const style = TypeStyle[rec.type] || TypeStyle.BUDGET;

    return (
        <div 
            className={`group flex flex-col border border-surface-700/60 bg-surface-900/40 rounded-sm overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 ${style.glow} hover:bg-surface-800/60`}
        >
            <div 
                className="p-4 sm:p-5 flex items-start justify-between cursor-pointer"
                onClick={() => setExpanded(!expanded)}
            >
                <div className="flex-1 pr-4">
                    <div className="flex items-center gap-3 mb-2.5">
                        <span className={`text-[9px] font-bold tracking-widest px-2 py-0.5 rounded-sm border uppercase ${style.text} ${style.bg} ${style.border}`}>
                            {rec.type}
                        </span>
                        <h4 className="font-bold text-white text-sm tracking-tight">{rec.title}</h4>
                    </div>
                    <p className="text-surface-400 text-sm leading-relaxed group-hover:text-surface-300 transition-colors">{rec.description}</p>
                </div>
                <div className="flex flex-col items-center gap-2 mt-1">
                    <button className={`flex items-center justify-center h-6 w-6 rounded-full bg-surface-800 text-surface-400 group-hover:text-white group-hover:bg-surface-700 transition-all ${expanded ? 'rotate-180' : ''}`}>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                    </button>
                </div>
            </div>
            
            <div 
                className={`overflow-hidden transition-all duration-300 ease-in-out ${
                    expanded ? 'max-h-40 opacity-100' : 'max-h-0 opacity-0'
                }`}
            >
                <div className="px-4 sm:px-5 pb-5 pt-0">
                    <div className="p-3 bg-surface-950/50 border-l-2 border-surface-600 rounded-r-sm">
                        <div className="flex items-center gap-2 mb-1">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 text-surface-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span className="font-bold text-surface-400 uppercase tracking-widest text-[10px]">Evidence</span>
                        </div>
                        <p className="text-xs text-surface-300 leading-relaxed pl-5">
                            {rec.evidence}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

const AIRecommendationsList = ({ recommendations, loading }) => {
    if (loading) {
        return (
            <div className="flex flex-col gap-4 border border-surface-700/60 bg-surface-900/50 p-6 rounded-sm shadow-sm relative overflow-hidden">
                <div className="h-5 w-48 bg-surface-800 animate-pulse rounded-sm mb-4"></div>
                <div className="h-24 w-full bg-surface-800 animate-pulse rounded-sm"></div>
                <div className="h-24 w-full bg-surface-800 animate-pulse rounded-sm"></div>
            </div>
        );
    }

    if (!recommendations || recommendations.length === 0) {
        return null;
    }

    return (
        <div className="flex flex-col gap-4">
            <div className="flex items-center gap-3 mb-2 px-1">
                <div className="flex h-8 w-8 items-center justify-center rounded-sm bg-surface-800 text-white border border-surface-700">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                </div>
                <div>
                    <h3 className="font-bold text-sm tracking-widest text-white uppercase">Action Items</h3>
                    <p className="text-[10px] text-surface-400 uppercase tracking-wider font-semibold mt-0.5">Personalized Recommendations</p>
                </div>
            </div>
            <div className="flex flex-col gap-3">
                {recommendations.map((rec, idx) => (
                    <RecommendationItem key={idx} rec={rec} />
                ))}
            </div>
        </div>
    );
};

export default AIRecommendationsList;
