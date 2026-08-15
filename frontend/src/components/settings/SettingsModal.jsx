import { useEffect, useContext, useState } from 'react';
import { ThemeContext } from '../../context/ThemeContext';

/**
 * SettingsModal — full-screen-centered modal card for application settings.
 * Matches the aesthetic of ProfileModal.
 *
 * Props:
 *   isOpen  — boolean, controls visibility
 *   onClose — function to close the modal
 */
export default function SettingsModal({ isOpen, onClose }) {
  const { theme, toggleTheme } = useContext(ThemeContext);
  
  // Local state for mock settings (notifications, etc)
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(true);

  // Close on Escape
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [isOpen, onClose]);

  // Prevent body scroll while modal open
  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    /* Backdrop */
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center backdrop-blur-sm px-4 transition-all"
      style={{ backgroundColor: 'rgba(0,0,0,0.75)' }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      role="dialog"
      aria-modal="true"
      aria-label="Application Settings"
    >
      {/* Card */}
      <div
        className="relative w-full max-w-md rounded-3xl shadow-2xl overflow-hidden animate-scale-in"
        style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-default)' }}
      >
        {/* Header bar */}
        <div className="relative h-24 flex items-end px-8 pb-4" style={{ borderBottom: '1px solid var(--border-default)', background: 'linear-gradient(to bottom right, rgba(255,255,255,0.05), transparent)' }}>
          {/* Subtle geometric bg */}
          <div className="absolute inset-0 opacity-10 pointer-events-none overflow-hidden">
            <div className="absolute -top-10 -right-10 w-48 h-48 rounded-full" style={{ border: '1px solid var(--border-strong)' }} />
            <div className="absolute top-4 right-16 w-24 h-24 rounded-full" style={{ border: '1px solid var(--border-default)' }} />
          </div>

          <h2 className="text-xl font-bold relative z-10" style={{ color: 'var(--text-primary)' }}>Settings</h2>

          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full transition-colors"
            style={{ color: 'var(--text-secondary)' }}
            onMouseEnter={e => { e.currentTarget.style.backgroundColor = 'var(--border-default)'; e.currentTarget.style.color = 'var(--text-primary)'; }}
            onMouseLeave={e => { e.currentTarget.style.backgroundColor = ''; e.currentTarget.style.color = 'var(--text-secondary)'; }}
            aria-label="Close settings"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
              <path d="M6.28 5.22a.75.75 0 0 0-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 1 0 1.06 1.06L10 11.06l3.72 3.72a.75.75 0 1 0 1.06-1.06L11.06 10l3.72-3.72a.75.75 0 0 0-1.06-1.06L10 8.94 6.28 5.22Z" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="px-8 py-8 space-y-8">

          {/* Appearance Section */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider mb-4" style={{ color: 'var(--text-secondary)' }}>Appearance</h3>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>Theme Mode</p>
                <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>Switch between light and dark mode</p>
              </div>
              <button
                onClick={toggleTheme}
                className="relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none"
                style={{ backgroundColor: theme === 'dark' ? '#22c55e' : 'var(--border-strong)' }}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    theme === 'dark' ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>

          <div className="h-px w-full" style={{ backgroundColor: 'var(--border-default)' }} />

          {/* Notifications Section */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider mb-4" style={{ color: 'var(--text-secondary)' }}>Notifications</h3>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>Email Alerts</p>
                  <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>Receive budget alerts via email</p>
                </div>
                <button
                  onClick={() => setEmailAlerts(!emailAlerts)}
                  className="relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none"
                  style={{ backgroundColor: emailAlerts ? '#22c55e' : 'var(--border-strong)' }}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      emailAlerts ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>Push Notifications</p>
                  <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>Get notified on your device</p>
                </div>
                <button
                  onClick={() => setPushNotifications(!pushNotifications)}
                  className="relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none"
                  style={{ backgroundColor: pushNotifications ? '#22c55e' : 'var(--border-strong)' }}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      pushNotifications ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>

          <div className="h-px w-full" style={{ backgroundColor: 'var(--border-default)' }} />
          
          {/* Security / Advanced Section */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider mb-4" style={{ color: 'var(--text-secondary)' }}>Account</h3>
            <button
              className="text-sm font-medium transition-colors text-red-500 hover:text-red-400"
            >
              Reset Password
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
