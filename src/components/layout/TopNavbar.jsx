import { memo } from 'react';
import useAuth from '../../hooks/useAuth';

function getInitials(name) {
  if (!name) return '?';
  return name
    .split(' ')
    .slice(0, 2)
    .map(w => w[0]?.toUpperCase() ?? '')
    .join('');
}

/**
 * TopNavbar — sticky header with hamburger, search, action icons, and user identity.
 *
 * Props:
 *   onMobileMenuOpen — () => void  opens the mobile sidebar drawer
 *   collapsed        — boolean     whether the desktop sidebar is in icon-only mode
 */
const TopNavbar = memo(function TopNavbar({ onMobileMenuOpen }) {
  const { user } = useAuth();
  const initials = getInitials(user?.name);

  return (
    <header
      id="top-navbar"
      role="banner"
      className="sticky top-0 z-50 flex h-16 flex-shrink-0 items-center gap-3 border-b border-surface-700/60 bg-surface-900/90 px-4 backdrop-blur-md md:px-6"
    >
      {/* Mobile hamburger */}
      <button
        id="topnav-mobile-menu"
        type="button"
        onClick={onMobileMenuOpen}
        className={[
          'flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl',
          'text-slate-400 transition-all duration-200',
          'hover:bg-white/5 hover:text-white',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500',
          'md:hidden',
        ].join(' ')}
        aria-label="Open navigation menu"
        aria-haspopup="dialog"
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5" aria-hidden="true">
          <path fillRule="evenodd" d="M2 4.75A.75.75 0 0 1 2.75 4h14.5a.75.75 0 0 1 0 1.5H2.75A.75.75 0 0 1 2 4.75ZM2 10a.75.75 0 0 1 .75-.75h14.5a.75.75 0 0 1 0 1.5H2.75A.75.75 0 0 1 2 10Zm0 5.25a.75.75 0 0 1 .75-.75h14.5a.75.75 0 0 1 0 1.5H2.75a.75.75 0 0 1-.75-.75Z" clipRule="evenodd" />
        </svg>
      </button>

      {/* Search — hidden on very small mobile to preserve space */}
      <div className="relative hidden max-w-xs flex-1 sm:block">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
          className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500"
          aria-hidden="true"
        >
          <path fillRule="evenodd" d="M9 3.5a5.5 5.5 0 1 0 0 11 5.5 5.5 0 0 0 0-11ZM2 9a7 7 0 1 1 12.452 4.391l3.328 3.329a.75.75 0 1 1-1.06 1.06l-3.329-3.328A7 7 0 0 1 2 9Z" clipRule="evenodd" />
        </svg>
        <input
          id="topnav-search"
          type="search"
          placeholder="Search transactions…"
          aria-label="Search transactions"
          readOnly
          className="input h-9 pl-9 text-sm bg-surface-800/80"
        />
      </div>

      {/* Right-side actions */}
      <div className="ml-auto flex items-center gap-2">

        {/* Notification bell */}
        <button
          id="topnav-notifications"
          type="button"
          aria-label="Notifications (1 unread)"
          className={[
            'relative flex h-9 w-9 items-center justify-center rounded-xl',
            'border border-surface-700 bg-surface-800',
            'text-slate-400 transition-all duration-200',
            'hover:border-primary-500/50 hover:bg-surface-700 hover:text-white hover:scale-105',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500',
          ].join(' ')}
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-[18px] w-[18px]" aria-hidden="true">
            <path fillRule="evenodd" d="M4 8a6 6 0 1 1 12 0c0 1.887.454 3.665 1.257 5.234a.75.75 0 0 1-.515 1.076 32.91 32.91 0 0 1-3.256.508 3.5 3.5 0 0 1-6.972 0 32.903 32.903 0 0 1-3.256-.508.75.75 0 0 1-.515-1.076A11.448 11.448 0 0 0 4 8Zm6 7c-.655 0-1.286-.02-1.9-.057A2 2 0 0 0 12 15H10Z" clipRule="evenodd" />
          </svg>
          <span
            className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-primary-500 ring-2 ring-surface-900 animate-pulse-slow"
            aria-hidden="true"
          />
        </button>

        {/* Theme toggle (shell — no functionality yet) */}
        <button
          id="topnav-theme-toggle"
          type="button"
          aria-label="Toggle theme"
          className={[
            'flex h-9 w-9 items-center justify-center rounded-xl',
            'border border-surface-700 bg-surface-800',
            'text-slate-400 transition-all duration-200',
            'hover:border-primary-500/50 hover:bg-surface-700 hover:text-white hover:scale-105',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500',
          ].join(' ')}
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-[18px] w-[18px]" aria-hidden="true">
            <path d="M10 2a.75.75 0 0 1 .75.75v1.5a.75.75 0 0 1-1.5 0v-1.5A.75.75 0 0 1 10 2ZM10 15a.75.75 0 0 1 .75.75v1.5a.75.75 0 0 1-1.5 0v-1.5A.75.75 0 0 1 10 15ZM10 7a3 3 0 1 0 0 6 3 3 0 0 0 0-6ZM15.657 5.404a.75.75 0 1 0-1.06-1.06l-1.061 1.06a.75.75 0 0 0 1.06 1.06l1.06-1.06ZM6.464 14.596a.75.75 0 1 0-1.06-1.06l-1.06 1.06a.75.75 0 0 0 1.06 1.06l1.06-1.06ZM18 10a.75.75 0 0 1-.75.75h-1.5a.75.75 0 0 1 0-1.5h1.5A.75.75 0 0 1 18 10ZM5 10a.75.75 0 0 1-.75.75h-1.5a.75.75 0 0 1 0-1.5h1.5A.75.75 0 0 1 5 10ZM14.596 15.657a.75.75 0 0 0 1.06-1.06l-1.06-1.061a.75.75 0 1 0-1.06 1.06l1.06 1.061ZM5.404 6.464a.75.75 0 0 0 1.06-1.06L5.404 4.343a.75.75 0 1 0-1.06 1.06l1.06 1.061Z" />
          </svg>
        </button>

        {/* User identity */}
        <div
          className="flex items-center gap-2.5 border-l border-surface-700/60 pl-3"
          aria-label={`Signed in as ${user?.name ?? 'user'}`}
        >
          <button
            id="topnav-user-menu"
            type="button"
            className={[
              'flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full',
              'bg-gradient-brand text-sm font-bold text-white',
              'transition-transform duration-200 hover:scale-110',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 focus-visible:ring-offset-surface-900',
            ].join(' ')}
            aria-label="User menu"
          >
            {initials}
          </button>
          <div className="hidden sm:block leading-none min-w-0">
            <p className="text-sm font-semibold text-white truncate max-w-[120px]">
              {user?.name}
            </p>
            <p className="mt-0.5 truncate text-xs text-slate-500 max-w-[140px]">
              {user?.email}
            </p>
          </div>
        </div>
      </div>
    </header>
  );
});

export default TopNavbar;
