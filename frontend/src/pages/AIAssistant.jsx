import React, { useState, useEffect, useCallback } from 'react';
import PageHeader from '../components/ui/PageHeader';
import AIInsightsCard from '../components/ai/AIInsightsCard';
import AIRecommendationsList from '../components/ai/AIRecommendationsList';
import AIChatBox from '../components/ai/AIChatBox';
import { getAIInsights, getAIRecommendations, sendAIChat } from '../services/api/aiApi';
import EmptyState from '../components/ui/EmptyState';

const AIAssistant = () => {
    // Top-level State
    const [insights, setInsights] = useState([]);
    const [recommendations, setRecommendations] = useState([]);
    const [loadingInsights, setLoadingInsights] = useState(true);
    const [loadingRecs, setLoadingRecs] = useState(true);
    const [error, setError] = useState(null);

    // Chat State
    const [chatHistory, setChatHistory] = useState([]);
    const [chatLoading, setChatLoading] = useState(false);

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
        // We explicitly do not load chat history from localStorage
        // to maintain security of sensitive financial context.
    }, [fetchInitialData]);

    const handleSendMessage = async (text) => {
        const newMessage = { role: 'user', content: text };
        const updatedHistory = [...chatHistory, newMessage];
        setChatHistory(updatedHistory);
        setChatLoading(true);

        try {
            // We slice on backend, but we can also slice on frontend if desired.
            // For now, we send the whole active session history.
            const response = await sendAIChat(updatedHistory);
            if (response.success) {
                setChatHistory(prev => [...prev, { role: 'assistant', content: response.reply }]);
            }
        } catch (err) {
            console.error("Chat error:", err);
            setChatHistory(prev => [
                ...prev, 
                { role: 'assistant', content: "I'm sorry, I encountered an error. Please try again." }
            ]);
        } finally {
            setChatLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <PageHeader 
                title="AI Financial Assistant" 
                subtitle="Get personalized insights and chat with your smart financial advisor."
            />

            {error ? (
                <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-6 text-center">
                    <p className="text-red-400 mb-4">{error}</p>
                    <button 
                        onClick={fetchInitialData}
                        className="px-4 py-2 bg-red-500/20 text-red-400 rounded hover:bg-red-500/30 transition-colors"
                    >
                        Retry Connection
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    {/* Left Column: Insights & Recommendations */}
                    <div className="lg:col-span-5 space-y-6">
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

                    {/* Right Column: Chat Interface */}
                    <div className="lg:col-span-7">
                        <AIChatBox 
                            messages={chatHistory} 
                            loading={chatLoading} 
                            onSendMessage={handleSendMessage} 
                        />
                    </div>
                </div>
            )}
        </div>
    );
};

export default AIAssistant;
