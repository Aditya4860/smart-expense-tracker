import React from 'react';

const AIInsightsCard = ({ insights, loading }) => {
    if (loading) {
        return (
            <div className="flex flex-col gap-4 border border-surface-700/60 bg-surface-900/50 p-6 rounded-sm shadow-sm relative overflow-hidden">
                <div className="flex items-center gap-2 mb-2">
                    <div className="h-5 w-5 bg-surface-800 animate-pulse rounded-sm"></div>
                    <div className="h-4 w-1/3 bg-surface-800 animate-pulse rounded-sm"></div>
                </div>
                <div className="space-y-4 mt-2">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="flex gap-4">
                            <div className="h-8 w-8 shrink-0 bg-surface-800 animate-pulse rounded-sm"></div>
                            <div className="flex-1 space-y-2 py-1">
                                <div className="h-3 w-full bg-surface-800 animate-pulse rounded-sm"></div>
                                <div className="h-3 w-4/5 bg-surface-800 animate-pulse rounded-sm"></div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    if (!insights || insights.length === 0) {
        return null;
    }

    return (
        <div className="border border-surface-700/60 bg-surface-900/40 p-6 rounded-sm shadow-sm relative group overflow-hidden transition-colors hover:border-surface-600/80">
            {/* Background subtle glow */}
            <div className="absolute -top-24 -right-24 h-48 w-48 rounded-full bg-primary-500/5 blur-[80px] group-hover:bg-primary-500/10 transition-colors pointer-events-none"></div>

            <div className="flex items-center gap-3 mb-6">
                <div className="flex h-8 w-8 items-center justify-center rounded-sm bg-primary-500/10 text-primary-400 border border-primary-500/20">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                </div>
                <div>
                    <h3 className="font-bold text-sm tracking-widest text-white uppercase">Financial Intelligence</h3>
                    <p className="text-[10px] text-surface-400 uppercase tracking-wider font-semibold mt-0.5">Key Insights</p>
                </div>
            </div>

            <div className="space-y-5">
                {insights.map((insight, idx) => (
                    <div key={idx} className="flex gap-4 group/item">
                        <div className="flex flex-col items-center gap-2 pt-1 shrink-0">
                            <span className="text-xs font-mono font-bold text-surface-500 group-hover/item:text-primary-400 transition-colors">
                                {String(idx + 1).padStart(2, '0')}
                            </span>
                            {idx !== insights.length - 1 && (
                                <div className="w-px h-full bg-surface-800 group-hover/item:bg-surface-700 transition-colors"></div>
                            )}
                        </div>
                        <div className="pb-2">
                            <h4 className="text-xs font-bold text-surface-300 uppercase tracking-wider mb-1.5 group-hover/item:text-white transition-colors">Insight</h4>
                            <p className="text-sm leading-relaxed text-surface-400 group-hover/item:text-surface-200 transition-colors">
                                {insight}
                            </p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default AIInsightsCard;
