import React, { useState, useRef, useEffect } from 'react';
import { sendAIChat } from '../../services/api/aiApi';

const SUGGESTED_QUESTIONS = [
    "How much did I spend this month?",
    "Where did I spend the most?",
    "Am I on track with my budget?",
    "How are my goals progressing?"
];

export default function AIChatBox({ isCompact = false }) {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const messagesEndRef = useRef(null);
    const inputRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, loading]);

    // Auto-focus input when not loading
    useEffect(() => {
        if (!loading && inputRef.current) {
            inputRef.current.focus();
        }
    }, [loading]);

    const handleSendMessage = async (text) => {
        if (!text.trim() || loading) return;
        
        const newMessage = { role: 'user', content: text };
        const updatedHistory = [...messages, newMessage];
        setMessages(updatedHistory);
        setLoading(true);

        try {
            const response = await sendAIChat(updatedHistory);
            if (response.success) {
                setMessages(prev => [...prev, { role: 'assistant', content: response.reply }]);
            }
        } catch (err) {
            console.error("Chat error:", err);
            setMessages(prev => [
                ...prev, 
                { role: 'assistant', content: "I'm sorry, I encountered an error. Please try again." }
            ]);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        handleSendMessage(input);
        setInput('');
    };

    const handleChipClick = (question) => {
        handleSendMessage(question);
    };

    return (
        <div className={`flex flex-col bg-surface-900 border border-surface-700/60 shadow-2xl relative overflow-hidden ${isCompact ? 'h-[500px] w-full rounded-xl' : 'h-[75vh] w-full rounded-none lg:border-y lg:border-l'}`}>
            
            {/* Header */}
            {!isCompact && (
                <div className="p-5 border-b border-surface-800 bg-surface-950/80 backdrop-blur shrink-0 flex items-center gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-sm border border-primary-500/30 bg-primary-500/10 text-primary-400">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
                        </svg>
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <h2 className="text-lg font-bold tracking-tight text-white uppercase">AI FINANCIAL ASSISTANT</h2>
                            <div className="flex items-center gap-1.5 px-2 py-0.5 rounded border border-success-500/30 bg-success-500/10">
                                <span className="h-1.5 w-1.5 rounded-full bg-success-400 animate-pulse"></span>
                                <span className="text-[9px] font-bold tracking-widest text-success-400 uppercase">Online</span>
                            </div>
                        </div>
                        <p className="text-xs text-surface-400 mt-0.5">Ask questions about your spending, income, budgets and goals.</p>
                    </div>
                </div>
            )}

            {/* Chat Area */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 scrollbar-thin scrollbar-thumb-surface-700 scrollbar-track-transparent">
                {messages.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-center max-w-sm mx-auto">
                        <div className="w-12 h-12 rounded border border-surface-700 bg-surface-800/50 flex items-center justify-center mb-6 text-surface-300">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                            </svg>
                        </div>
                        <h3 className="text-white font-medium mb-2 tracking-tight">How can I assist you today?</h3>
                        <p className="text-surface-400 text-sm mb-8 leading-relaxed">I can analyze your financial data and help you track your budget and savings goals.</p>
                        
                        <div className="flex flex-col gap-2 w-full">
                            {SUGGESTED_QUESTIONS.map((q, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => handleChipClick(q)}
                                    disabled={loading}
                                    className="px-4 py-3 text-sm text-left bg-surface-800/30 text-surface-300 rounded border border-surface-700/50 hover:border-primary-500/50 hover:bg-primary-500/5 transition-all group relative overflow-hidden disabled:opacity-50"
                                >
                                    <span className="relative z-10">{q}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                ) : (
                    messages.map((msg, idx) => (
                        <div key={idx} className={`flex w-full ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                            {msg.role !== 'user' && (
                                <div className="mr-3 mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-sm border border-surface-700 bg-surface-800 text-surface-300">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                    </svg>
                                </div>
                            )}
                            <div className={`relative px-4 py-3 text-sm leading-relaxed max-w-[85%] ${
                                msg.role === 'user' 
                                    ? 'bg-primary-600 text-white rounded-l-lg rounded-br-lg shadow-sm' 
                                    : 'bg-surface-800/80 border border-surface-700/60 text-surface-200 rounded-r-lg rounded-bl-lg'
                            }`}>
                                {msg.content}
                            </div>
                        </div>
                    ))
                )}
                
                {loading && (
                    <div className="flex w-full justify-start items-center gap-3">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-sm border border-surface-700 bg-surface-800 text-surface-300">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                        </div>
                        <div className="flex items-center gap-2 px-4 py-3 bg-surface-800/50 border border-surface-700/50 rounded-r-lg rounded-bl-lg text-xs font-mono tracking-widest text-surface-400 uppercase">
                            AI Thinking
                            <span className="flex gap-1 ml-1">
                                <span className="h-1 w-1 rounded-full bg-surface-400 animate-bounce" style={{ animationDelay: '0ms' }}></span>
                                <span className="h-1 w-1 rounded-full bg-surface-400 animate-bounce" style={{ animationDelay: '150ms' }}></span>
                                <span className="h-1 w-1 rounded-full bg-surface-400 animate-bounce" style={{ animationDelay: '300ms' }}></span>
                            </span>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} className="h-px w-full" />
            </div>

            {/* Input Area */}
            <div className="shrink-0 p-4 bg-surface-950/80 backdrop-blur-xl border-t border-surface-800 z-10">
                <form onSubmit={handleSubmit} className="relative flex items-center group">
                    <input
                        ref={inputRef}
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Ask about your finances..."
                        disabled={loading}
                        className="w-full bg-surface-900 border border-surface-700 rounded-sm py-3 pl-4 pr-12 text-sm text-white placeholder-surface-500 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 disabled:opacity-50 transition-all shadow-inner group-hover:border-surface-600"
                    />
                    <button
                        type="submit"
                        disabled={!input.trim() || loading}
                        className="absolute right-2 p-1.5 bg-primary-600 hover:bg-primary-500 disabled:bg-surface-800 disabled:text-surface-600 text-white rounded transition-all flex items-center justify-center group-hover:shadow-[0_0_10px_rgba(var(--color-primary-500),0.3)]"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 10l7-7m0 0l7 7m-7-7v18" />
                        </svg>
                    </button>
                </form>
            </div>
        </div>
    );
}
