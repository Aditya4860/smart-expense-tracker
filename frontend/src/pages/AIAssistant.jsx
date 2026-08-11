import React, { useState, useEffect, useCallback } from 'react';
import DashboardLayout from '../layouts/DashboardLayout';
import PageHeader from '../components/ui/PageHeader';
import AIInsightsCard from '../components/ai/AIInsightsCard';
import AIRecommendationsList from '../components/ai/AIRecommendationsList';
import AIChatBox from '../components/ai/AIChatBox';
import { getAIInsights, getAIRecommendations } from '../services/api/aiApi';
import EmptyState from '../components/ui/EmptyState';

const AIAssistantInner = () => {
    // Top-level State
    const [insights, setInsights] = useState([]);
    const [recommendations, setRecommendations] = useState([]);
    const [loadingInsights, setLoadingInsights] = useState(true);
    const [loadingRecs, setLoadingRecs] = useState(true);
    const [error, setError] = useState(null);

    const fetchInitialData = useCallback(async () => {
        setLoadingInsights(true);
        setLoadingRecs(true);
        setError(null);
        try {
            // Fetch concurrently
            const [insightsRes, recsRes] = await Promise.allSettled([
                getAIInsights(),
                getAIRecommendations()
            ]);

            if (insightsRes.status === 'fulfilled' && insightsRes.value.success) {
                setInsights(insightsRes.value.insights);
            } else {
                console.error("Failed to load insights", insightsRes.reason);
            }

            if (recsRes.status === 'fulfilled' && recsRes.value.success) {
                setRecommendations(recsRes.value.recommendations);
            } else {
                console.error("Failed to load recommendations", recsRes.reason);
            }
            
            if (insightsRes.status === 'rejected' && recsRes.status === 'rejected') {
                throw new Error("Failed to load AI services.");
            }
        } catch (err) {
            setError(err.response?.data?.message || err.message || "Failed to load AI data.");
        } finally {
            setLoadingInsights(false);
            setLoadingRecs(false);
        }
    }, []);

    useEffect(() => {
        fetchInitialData();
    }, [fetchInitialData]);

    return (
        <div className="space-y-6">
            {error ? (
                <div className="bg-danger-500/10 border border-danger-500/20 rounded-sm p-6 text-center">
                    <p className="text-danger-400 mb-4">{error}</p>
                    <button 
                        onClick={fetchInitialData}
                        className="px-4 py-2 bg-danger-500/20 text-danger-400 rounded-sm hover:bg-danger-500/30 transition-colors uppercase text-xs font-bold tracking-wider"
                    >
                        Retry Connection
                    </button>
                </div>
            ) : (
                <div className="flex flex-col xl:flex-row gap-6 items-start">
                    {/* Left Column: Insights & Recommendations (35%) */}
                    <div className="w-full xl:w-[35%] space-y-6 shrink-0">
                        <AIInsightsCard 
                            insights={insights} 
                            loading={loadingInsights} 
                        />
                        <AIRecommendationsList 
                            recommendations={recommendations} 
                            loading={loadingRecs} 
                        />
                        
                        {!loadingInsights && !loadingRecs && insights.length === 0 && recommendations.length === 0 && (
                            <EmptyState 
                                title="No Insights Available"
                                message="Start logging your expenses and income to get personalized AI insights."
                                icon={
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-surface-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                                    </svg>
                                }
                            />
                        )}
                    </div>

                    {/* Right Column: Chat Interface (65%) */}
                    <div className="w-full xl:w-[65%]">
                        <AIChatBox isCompact={false} />
                    </div>
                </div>
            )}
        </div>
    );
};

export default function AIAssistant() {
    return (
        <DashboardLayout>
            <AIAssistantInner />
        </DashboardLayout>
    );
}
