import React, { useState, useRef, useEffect } from 'react';
import AIChatBox from './AIChatBox';
import { useNavigate } from 'react-router-dom';

export default function AIFloatingWidget() {
    const [isOpen, setIsOpen] = useState(false);
    const popoverRef = useRef(null);
    const navigate = useNavigate();

    // Close on escape key
    useEffect(() => {
        const handleEscape = (e) => {
            if (e.key === 'Escape' && isOpen) {
                setIsOpen(false);
            }
        };
        window.addEventListener('keydown', handleEscape);
        return () => window.removeEventListener('keydown', handleEscape);
    }, [isOpen]);

    // Close when clicking outside
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (popoverRef.current && !popoverRef.current.contains(e.target) && isOpen) {
                // If they clicked the toggle button, it's handled by the button's onClick
                if (e.target.closest('#ai-widget-toggle')) return;
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isOpen]);

    return (
        <div className="fixed bottom-4 right-4 md:bottom-6 md:right-6 z-[100] flex flex-col items-end pointer-events-none">
            {/* Popover */}
        <div 
            ref={popoverRef}
            className={`mb-4 w-[90vw] md:w-[400px] overflow-hidden transition-all duration-300 origin-bottom-right ${
                isOpen 
                    ? 'opacity-100 scale-100 translate-y-0 pointer-events-auto' 
                    : 'opacity-0 scale-95 translate-y-4 pointer-events-none invisible'
            }`}
        >
                {/* Popover Header */}
                <div className="bg-surface-950 border border-surface-700/60 rounded-t-xl p-3 flex items-center justify-between shadow-2xl">
                    <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full border border-success-500/30 bg-success-500/10">
                            <span className="h-1.5 w-1.5 rounded-full bg-success-400 animate-pulse"></span>
                            <span className="text-[10px] font-bold tracking-widest text-success-400 uppercase">Online</span>
                        </div>
                        <span className="text-xs font-bold text-white tracking-widest uppercase">AI Assistant</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <button 
                            onClick={() => {
                                setIsOpen(false);
                                navigate('/ai-assistant');
                            }}
                            className="p-1.5 rounded text-surface-400 hover:text-white hover:bg-surface-800 transition-colors tooltip-trigger relative"
                            title="Open full page"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                <path d="M11 3a1 1 0 100 2h2.586l-6.293 6.293a1 1 0 101.414 1.414L15 6.414V9a1 1 0 102 0V4a1 1 0 00-1-1h-5z" />
                                <path d="M5 5a2 2 0 00-2 2v8a2 2 0 002 2h8a2 2 0 002-2v-3a1 1 0 10-2 0v3H5V7h3a1 1 0 000-2H5z" />
                            </svg>
                        </button>
                        <button 
                            onClick={() => setIsOpen(false)}
                            className="p-1.5 rounded text-surface-400 hover:text-white hover:bg-danger-500/20 hover:text-danger-400 transition-colors tooltip-trigger relative"
                            title="Close"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                            </svg>
                        </button>
                    </div>
                </div>
                {/* Embedded Chat Box */}
                <div className="bg-surface-900 border-x border-b border-surface-700/60 rounded-b-xl shadow-2xl">
                    <AIChatBox isCompact={true} />
                </div>
            </div>

            {/* Floating Toggle Button */}
            <button
                id="ai-widget-toggle"
                onClick={() => setIsOpen(!isOpen)}
                className={`pointer-events-auto group flex items-center justify-center rounded-full shadow-2xl transition-all duration-300 overflow-hidden ${
                    isOpen 
                        ? 'bg-surface-800 border border-surface-700 text-white w-12 h-12' 
                        : 'bg-primary-600 border border-primary-500/50 text-white w-auto h-12 px-5 hover:bg-primary-500 hover:scale-105 hover:shadow-[0_0_20px_rgba(var(--color-primary-500),0.4)]'
                }`}
            >
                {isOpen ? (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                ) : (
                    <div className="flex items-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
                        </svg>
                        <span className="font-bold tracking-tight text-sm">Ask AI</span>
                    </div>
                )}
            </button>
        </div>
    );
}
