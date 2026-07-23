import { memo, useContext } from 'react';
import { NavLink } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import { ThemeContext } from '../../context/ThemeContext';

function getInitials(name) {
  if (!name) return '?';
  return name
    .split(' ')
    .slice(0, 2)
    .map(w => w[0]?.toUpperCase() ?? '')
    .join('');
}

const NAV_LINKS = [
  { path: '/dashboard', label: 'Dashboard' },
  { path: '/expenses', label: 'Expenses' },
  { path: '/income', label: 'Income' },
  { path: '/budget', label: 'Budget' },
  { path: '/goals', label: 'Goals' },
  { path: '/analytics', label: 'Analytics' },
];

/**
 * TopNavbar — Premium minimal top navigation.
 *
 * Includes Brand, Links (capsule style), Search, Theme Toggle, Notifications, and Profile.
 */
const TopNavbar = memo(function TopNavbar({ mobileMenuOpen, onToggleMobileMenu, onCloseMobileMenu }) {
  const { user } = useAuth();
  const { theme, toggleTheme } = useContext(ThemeContext);
  const initials = getInitials(user?.name);

  return (
    <>
      <header
        id="top-navbar"
        role="banner"
        className="sticky top-0 z-50 w-full border-b border-surface-700 bg-surface-950/80 px-4 py-3 backdrop-blur-xl md:px-8"
      >
        <div className="mx-auto flex w-full max-w-[1600px] items-center justify-between gap-4">
          {/* Left: Brand + Hamburger (Mobile) */}
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={onToggleMobileMenu}
              className="flex h-9 w-9 items-center justify-center rounded-lg text-surface-400 hover:bg-surface-800 hover:text-white lg:hidden"
              aria-label="Toggle navigation menu"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5">
                <path fillRule="evenodd" d="M2 4.75A.75.75 0 0 1 2.75 4h14.5a.75.75 0 0 1 0 1.5H2.75A.75.75 0 0 1 2 4.75ZM2 10a.75.75 0 0 1 .75-.75h14.5a.75.75 0 0 1 0 1.5H2.75A.75.75 0 0 1 2 10Zm0 5.25a.75.75 0 0 1 .75-.75h14.5a.75.75 0 0 1 0 1.5H2.75a.75.75 0 0 1-.75-.75Z" clipRule="evenodd" />
              </svg>
            </button>
            <NavLink to="/dashboard" className="flex items-center gap-2 group">
              <div className="flex h-8 w-8 items-center justify-center rounded-[8px] bg-white text-surface-950 shadow-sm transition-transform duration-300 group-hover:scale-105">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
                  <path d="M21 7.5l-9-5.25L3 7.5m18 0l-9 5.25m9-5.25v9l-9 5.25M3 7.5l9 5.25M3 7.5v9l9 5.25m0-9v9" />
                </svg>
              </div>
              <span className="hidden text-sm font-bold tracking-tight text-white lg:block">Smart Tracker</span>
            </NavLink>
          </div>

          {/* Middle: Navigation Links (Desktop) */}
          <nav className="hidden lg:flex items-center gap-1">
            {NAV_LINKS.map(link => (
              <NavLink
                key={link.path}
                to={link.path}
                className={({ isActive }) => [
                  'px-3 py-1.5 text-sm font-medium transition-all duration-300 rounded-full border',
                  isActive
                    ? 'border-surface-600 bg-surface-800 text-white shadow-sm glow-active'
                    : 'border-transparent text-surface-400 hover:text-white hover:bg-surface-800/50'
                ].join(' ')}
              >
                {link.label}
              </NavLink>
            ))}
          </nav>

          {/* Right: Actions */}
          <div className="flex items-center gap-2 lg:gap-3">
            {/* Search */}
            <div className="relative hidden w-64 md:block">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-surface-400">
                <path fillRule="evenodd" d="M9 3.5a5.5 5.5 0 1 0 0 11 5.5 5.5 0 0 0 0-11ZM2 9a7 7 0 1 1 12.452 4.391l3.328 3.329a.75.75 0 1 1-1.06 1.06l-3.329-3.328A7 7 0 0 1 2 9Z" clipRule="evenodd" />
              </svg>
              <input
                type="search"
                placeholder="Search..."
                className="input h-8 pl-9 py-1 rounded-full text-xs"
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-0.5">
                <kbd className="font-mono text-[10px] text-surface-500 bg-surface-800 px-1 rounded border border-surface-700">⌘</kbd>
                <kbd className="font-mono text-[10px] text-surface-500 bg-surface-800 px-1 rounded border border-surface-700">K</kbd>
              </div>
            </div>

            <div className="h-4 w-px bg-surface-700 hidden lg:block mx-1"></div>

            {/* Notifications */}
            <button
              type="button"
              className="flex h-8 w-8 items-center justify-center rounded-[8px] text-surface-400 hover:bg-surface-800 hover:text-white transition-all"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-[18px] w-[18px]">
                <path fillRule="evenodd" d="M4 8a6 6 0 1 1 12 0c0 1.887.454 3.665 1.257 5.234a.75.75 0 0 1-.515 1.076 32.91 32.91 0 0 1-3.256.508 3.5 3.5 0 0 1-6.972 0 32.903 32.903 0 0 1-3.256-.508.75.75 0 0 1-.515-1.076A11.448 11.448 0 0 0 4 8Zm6 7c-.655 0-1.286-.02-1.9-.057A2 2 0 0 0 12 15H10Z" clipRule="evenodd" />
              </svg>
            </button>

            {/* Theme Toggle */}
            <button
              type="button"
              onClick={toggleTheme}
              className="flex h-8 w-8 items-center justify-center rounded-[8px] text-surface-400 hover:bg-surface-800 hover:text-white transition-all"
            >
              {theme === 'dark' ? (
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-[18px] w-[18px]">
                  <path d="M10 2a.75.75 0 0 1 .75.75v1.5a.75.75 0 0 1-1.5 0v-1.5A.75.75 0 0 1 10 2ZM10 15a.75.75 0 0 1 .75.75v1.5a.75.75 0 0 1-1.5 0v-1.5A.75.75 0 0 1 10 15ZM10 7a3 3 0 1 0 0 6 3 3 0 0 0 0-6ZM15.657 5.404a.75.75 0 1 0-1.06-1.06l-1.061 1.06a.75.75 0 0 0 1.06 1.06l1.06-1.06ZM6.464 14.596a.75.75 0 1 0-1.06-1.06l-1.06 1.06a.75.75 0 0 0 1.06 1.06l1.06-1.06ZM18 10a.75.75 0 0 1-.75.75h-1.5a.75.75 0 0 1 0-1.5h1.5A.75.75 0 0 1 18 10ZM5 10a.75.75 0 0 1-.75.75h-1.5a.75.75 0 0 1 0-1.5h1.5A.75.75 0 0 1 5 10ZM14.596 15.657a.75.75 0 0 0 1.06-1.06l-1.06-1.061a.75.75 0 1 0-1.06 1.06l1.06 1.061ZM5.404 6.464a.75.75 0 0 0 1.06-1.06L5.404 4.343a.75.75 0 1 0-1.06 1.06l1.06 1.061Z" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-[18px] w-[18px]">
                  <path fillRule="evenodd" d="M7.455 2.004V2a.75.75 0 0 1 .75-.75h3.59a.75.75 0 0 1 .75.75v.004l.327.327a5.25 5.25 0 0 0 1.259.908 6.756 6.756 0 0 0 1.487.525.75.75 0 0 1 .533.91 10.457 10.457 0 0 1-2.915 5.176 10.454 10.454 0 0 1-5.176 2.915.75.75 0 0 1-.91-.533 6.75 6.75 0 0 0-.525-1.487 5.25 5.25 0 0 0-.908-1.259l-.327-.327a.75.75 0 0 1 0-1.06l.327-.327c.365-.365.67-.775.908-1.259.346-.7.545-1.474.525-2.26a.75.75 0 0 1 .75-.75Z" clipRule="evenodd" />
                </svg>
              )}
            </button>

            {/* Profile Avatar */}
            <button
              type="button"
              className="ml-2 flex h-8 w-8 items-center justify-center rounded-full bg-white text-xs font-bold text-surface-950 transition-transform duration-300 hover:scale-105"
            >
              {initials}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Navigation Drawer */}
      <div
        className={[
          'fixed inset-y-0 left-0 z-50 w-64 transform bg-surface-900 border-r border-surface-700 transition-transform duration-300 lg:hidden',
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        ].join(' ')}
      >
        <div className="flex h-14 items-center justify-between border-b border-surface-700 px-4">
          <span className="text-sm font-bold tracking-tight text-white">Smart Tracker</span>
          <button onClick={onCloseMobileMenu} className="text-surface-400 hover:text-white">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5">
              <path d="M6.28 5.22a.75.75 0 0 0-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 1 0 1.06 1.06L10 11.06l3.72 3.72a.75.75 0 1 0 1.06-1.06L11.06 10l3.72-3.72a.75.75 0 0 0-1.06-1.06L10 8.94 6.28 5.22Z" />
            </svg>
          </button>
        </div>
        <nav className="flex flex-col gap-2 p-4">
          {NAV_LINKS.map(link => (
            <NavLink
              key={link.path}
              to={link.path}
              onClick={onCloseMobileMenu}
              className={({ isActive }) => [
                'flex items-center rounded-[8px] px-3 py-2 text-sm font-medium transition-colors',
                isActive ? 'bg-white/10 text-white' : 'text-surface-400 hover:bg-surface-800 hover:text-white'
              ].join(' ')}
            >
              {link.label}
            </NavLink>
          ))}
        </nav>
      </div>
    </>
  );
});

export default TopNavbar;
