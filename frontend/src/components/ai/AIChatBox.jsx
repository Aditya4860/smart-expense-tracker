import React, { useState, useRef, useEffect } from 'react';
import Card from '../ui/Card';
import Button from '../ui/Button';

const SUGGESTED_QUESTIONS = [
    "How much did I spend this month?",
    "Where am I overspending?",
    "How is my savings goal progressing?",
    "Compare this month with last month."
];

const AIChatBox = ({ messages, loading, onSendMessage }) => {
    const [input, setInput] = useState('');
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, loading]);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!input.trim() || loading) return;
        onSendMessage(input);
        setInput('');
    };

    const handleChipClick = (question) => {
        if (loading) return;
        onSendMessage(question);
    };

    return (
        <Card className="flex flex-col h-[600px] max-h-[70vh] p-0 overflow-hidden">
            {/* Header */}
            <div className="p-4 border-b border-surface-700 bg-surface-800/80 backdrop-blur flex items-center justify-between shrink-0">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-accent-500/20 flex items-center justify-center text-accent-400">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
                        </svg>
                    </div>
                    <div>
                        <h3 className="font-semibold text-surface-50">Financial Assistant</h3>
                        <p className="text-xs text-surface-400">Ask me anything about your finances</p>
                    </div>
                </div>
            </div>

            {/* Chat Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-surface-900/20">
                {messages.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-center px-4">
                        <div className="w-16 h-16 rounded-full bg-surface-800 flex items-center justify-center mb-4 text-surface-400">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                            </svg>
                        </div>
                        <h4 className="text-surface-200 font-medium mb-2">How can I help you today?</h4>
                        <p className="text-surface-400 text-sm mb-6 max-w-xs">Try asking about your recent spending, budget limits, or savings progress.</p>
                        
                        <div className="flex flex-wrap justify-center gap-2">
                            {SUGGESTED_QUESTIONS.map((q, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => handleChipClick(q)}
                                    className="px-3 py-1.5 text-xs bg-surface-800 text-surface-300 rounded-full border border-surface-700 hover:border-accent-500 hover:text-accent-400 transition-colors"
                                >
                                    {q}
                                </button>
                            ))}
                        </div>
                    </div>
                ) : (
                    messages.map((msg, idx) => (
                        <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm ${
                                msg.role === 'user' 
                                    ? 'bg-accent-600 text-white rounded-tr-sm' 
                                    : 'bg-surface-800 border border-surface-700 text-surface-200 rounded-tl-sm'
                            }`}>
                                {msg.content}
                            </div>
                        </div>
                    ))
                )}
                
                {loading && (
                    <div className="flex justify-start">
                        <div className="bg-surface-800 border border-surface-700 rounded-2xl rounded-tl-sm px-4 py-3 flex gap-1.5">
                            <div className="w-1.5 h-1.5 rounded-full bg-surface-500 animate-bounce" style={{ animationDelay: '0ms' }}></div>
                            <div className="w-1.5 h-1.5 rounded-full bg-surface-500 animate-bounce" style={{ animationDelay: '150ms' }}></div>
                            <div className="w-1.5 h-1.5 rounded-full bg-surface-500 animate-bounce" style={{ animationDelay: '300ms' }}></div>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-4 bg-surface-800/80 backdrop-blur border-t border-surface-700 shrink-0">
                <form onSubmit={handleSubmit} className="relative flex items-center">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Ask about your finances..."
                        disabled={loading}
                        className="w-full bg-surface-900 border border-surface-700 rounded-full py-3 pl-4 pr-12 text-sm text-surface-50 placeholder-surface-500 focus:outline-none focus:border-accent-500 focus:ring-1 focus:ring-accent-500 disabled:opacity-50 transition-colors"
                    />
                    <button
                        type="submit"
                        disabled={!input.trim() || loading}
                        className="absolute right-1.5 p-2 bg-accent-600 hover:bg-accent-500 disabled:bg-surface-700 disabled:text-surface-500 text-white rounded-full transition-colors flex items-center justify-center"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
                        </svg>
                    </button>
                </form>
            </div>
        </Card>
    );
};

export default AIChatBox;
