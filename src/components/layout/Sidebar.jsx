import { memo } from 'react';
import { Link, useLocation } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import Logo from './Logo';

const NAV_ITEMS = [
  {
    id: 'nav-dashboard', label: 'Dashboard', to: '/dashboard', exact: true,
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5" aria-hidden="true">
        <path fillRule="evenodd" d="M9.293 2.293a1 1 0 0 1 1.414 0l7 7A1 1 0 0 1 17 11h-1v6a1 1 0 0 1-1 1h-2a1 1 0 0 1-1-1v-3a1 1 0 0 0-1-1H9a1 1 0 0 0-1 1v3a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1v-6H3a1 1 0 0 1-.707-1.707l7-7Z" clipRule="evenodd" />
      </svg>
    ),
  },
  {
    id: 'nav-expenses', label: 'Expenses', to: '/expenses', exact: false,
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5" aria-hidden="true">
        <path fillRule="evenodd" d="M2.5 4A1.5 1.5 0 0 0 1 5.5V6h18v-.5A1.5 1.5 0 0 0 17.5 4h-15ZM19 8.5H1v6A1.5 1.5 0 0 0 2.5 16h15a1.5 1.5 0 0 0 1.5-1.5v-6ZM3 13.25a.75.75 0 0 1 .75-.75h1.5a.75.75 0 0 1 0 1.5h-1.5a.75.75 0 0 1-.75-.75Zm4.75-.75a.75.75 0 0 0 0 1.5h3.5a.75.75 0 0 0 0-1.5h-3.5Z" clipRule="evenodd" />
      </svg>
    ),
  },
  {
    id: 'nav-income', label: 'Income', to: '/income', exact: false,
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5" aria-hidden="true">
        <path fillRule="evenodd" d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm.75-11.25a.75.75 0 0 0-1.5 0v2.5h-2.5a.75.75 0 0 0 0 1.5h2.5v2.5a.75.75 0 0 0 1.5 0v-2.5h2.5a.75.75 0 0 0 0-1.5h-2.5v-2.5Z" clipRule="evenodd" />
      </svg>
    ),
  },
  {
    id: 'nav-analytics', label: 'Analytics', to: '/analytics', exact: false,
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5" aria-hidden="true">
        <path d="M15.5 2A1.5 1.5 0 0 0 14 3.5v13a1.5 1.5 0 0 0 3 0v-13A1.5 1.5 0 0 0 15.5 2ZM9.5 6A1.5 1.5 0 0 0 8 7.5v9A1.5 1.5 0 0 0 11 16.5v-9A1.5 1.5 0 0 0 9.5 6ZM3.5 10A1.5 1.5 0 0 0 2 11.5v5A1.5 1.5 0 0 0 5 16.5v-5A1.5 1.5 0 0 0 3.5 10Z" />
      </svg>
    ),
  },
  {
    id: 'nav-budget', label: 'Budget', to: '/budget', exact: false,
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5" aria-hidden="true">
        <path fillRule="evenodd" d="M10 2a.75.75 0 0 1 .75.75v.258a33.186 33.186 0 0 1 6.668.83.75.75 0 0 1-.336 1.461 31.28 31.28 0 0 0-1.103-.232l1.702 7.545a.75.75 0 0 1-.387.832A4.981 4.981 0 0 1 15 14c-.825 0-1.606-.2-2.294-.556a.75.75 0 0 1-.387-.832l1.77-7.849a31.743 31.743 0 0 0-3.339-.254v11.505a20.01 20.01 0 0 1 3.78.501.75.75 0 1 1-.339 1.462A18.51 18.51 0 0 0 10 18.25a18.51 18.51 0 0 0-4.191.482.75.75 0 1 1-.338-1.462 20.01 20.01 0 0 1 3.779-.501V5.26a31.743 31.743 0 0 0-3.339.254l1.77 7.85a.75.75 0 0 1-.387.83A4.981 4.981 0 0 1 5 14a4.98 4.98 0 0 1-2.294-.556.75.75 0 0 1-.387-.832L4.02 5.067c-.37.07-.738.148-1.103.232a.75.75 0 1 1-.336-1.462 33.186 33.186 0 0 1 6.668-.829V2.75A.75.75 0 0 1 10 2ZM5 7.543 3.91 12.33a3.499 3.499 0 0 0 2.18 0L5 7.543Zm10 0-1.09 4.787a3.498 3.498 0 0 0 2.18 0L15 7.543Z" clipRule="evenodd" />
      </svg>
    ),
  },
  {
    id: 'nav-settings', label: 'Settings', to: '/settings', exact: false,
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5" aria-hidden="true">
        <path fillRule="evenodd" d="M7.84 1.804A1 1 0 0 1 8.82 1h2.36a1 1 0 0 1 .98.804l.331 1.652a6.993 6.993 0 0 1 1.929 1.115l1.598-.54a1 1 0 0 1 1.186.447l1.18 2.044a1 1 0 0 1-.205 1.251l-1.267 1.113a7.047 7.047 0 0 1 0 2.228l1.267 1.113a1 1 0 0 1 .205 1.251l-1.18 2.044a1 1 0 0 1-1.186.447l-1.598-.54a6.993 6.993 0 0 1-1.929 1.115l-.33 1.652a1 1 0 0 1-.98.804H8.82a1 1 0 0 1-.98-.804l-.331-1.652a6.993 6.993 0 0 1-1.929-1.115l-1.598.54a1 1 0 0 1-1.186-.447l-1.18-2.044a1 1 0 0 1 .205-1.251l1.267-1.114a7.05 7.05 0 0 1 0-2.227L1.821 7.773a1 1 0 0 1-.205-1.251l1.18-2.044a1 1 0 0 1 1.186-.447l1.598.54A6.992 6.992 0 0 1 7.51 3.456l.33-1.652ZM10 13a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" clipRule="evenodd" />
      </svg>
    ),
  },
];

/**
 * Sidebar — primary navigation drawer.
 *
 * Props:
 *   mobileOpen    — whether the mobile drawer is open
 *   collapsed     — whether the desktop sidebar is in icon-only mode
 *   onCollapse    — () => void  toggle collapsed state
 *   onMobileClose — () => void  close mobile drawer
 */
const Sidebar = memo(function Sidebar({ mobileOpen, collapsed, onCollapse, onMobileClose }) {
  const location = useLocation();
  const { logout } = useAuth();

  function isActive(item) {
    return item.exact
      ? location.pathname === item.to
      : location.pathname.startsWith(item.to);
  }

  return (
    <aside
      id="sidebar"
      aria-label="Primary navigation"
      className={[
        // Position & layering
        'fixed inset-y-0 left-0 z-70 flex flex-col',
        // Visual
        'bg-surface-900 border-r border-surface-700/60',
        // Animate width AND transform only — avoids repaints from transition-all
        'transition-[width,transform] duration-300 ease-in-out will-change-transform',
        // Width: icon-only (72px) or full (256px)
        collapsed ? 'w-[4.5rem]' : 'w-64',
        // Mobile: hidden off-screen by default, slides in when open
        // Desktop: always visible — md:translate-x-0 overrides the -translate-x-full
        mobileOpen ? 'translate-x-0' : '-translate-x-full',
        'md:translate-x-0',
      ].join(' ')}
    >
      {/* ── Header ───────────────────────────────────────── */}
      <div className="relative flex h-16 flex-shrink-0 items-center border-b border-surface-700/60 px-3">
        {/* Logo — hidden when collapsed so only the icon shows */}
        <div className={['transition-opacity duration-200', collapsed ? 'opacity-0 pointer-events-none' : 'opacity-100'].join(' ')}>
          <Logo collapsed={false} />
        </div>

        {/* Desktop collapse toggle — absolutely centred when collapsed */}
        <button
          id="sidebar-collapse-btn"
          type="button"
          onClick={onCollapse}
          className={[
            'hidden md:flex h-7 w-7 flex-shrink-0 items-center justify-center',
            'rounded-lg text-slate-500 transition-colors duration-200',
            'hover:bg-white/5 hover:text-white',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500',
            // When sidebar is full, pin to the right edge; when collapsed, centre in the rail
            collapsed
              ? 'absolute inset-0 m-auto'
              : 'ml-auto',
          ].join(' ')}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          aria-expanded={!collapsed}
        >
          {/* Single chevron that rotates 180° on collapse */}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 16 16"
            fill="currentColor"
            className={['h-4 w-4 transition-transform duration-300', collapsed ? 'rotate-180' : ''].join(' ')}
            aria-hidden="true"
          >
            <path fillRule="evenodd" d="M9.78 4.22a.75.75 0 0 1 0 1.06L6.81 8l2.97 2.72a.75.75 0 1 1-1.04 1.08l-3.5-3.25a.75.75 0 0 1 0-1.08l3.5-3.25a.75.75 0 0 1 1.04.02Z" clipRule="evenodd" />
          </svg>
        </button>

        {/* Mobile close button */}
        <button
          id="sidebar-mobile-close"
          type="button"
          onClick={onMobileClose}
          className={[
            'flex md:hidden ml-auto h-7 w-7 items-center justify-center rounded-lg',
            'text-slate-500 transition-colors hover:bg-white/5 hover:text-white',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500',
          ].join(' ')}
          aria-label="Close sidebar"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="h-4 w-4" aria-hidden="true">
            <path d="M5.28 4.22a.75.75 0 0 0-1.06 1.06L6.94 8l-2.72 2.72a.75.75 0 1 0 1.06 1.06L8 9.06l2.72 2.72a.75.75 0 1 0 1.06-1.06L9.06 8l2.72-2.72a.75.75 0 0 0-1.06-1.06L8 6.94 5.28 4.22Z" />
          </svg>
        </button>
      </div>

      {/* ── Navigation ───────────────────────────────────── */}
      <nav
        className="flex-1 overflow-y-auto overflow-x-hidden scrollbar-hide py-3 px-2"
        aria-label="Sidebar navigation"
      >
        <ul role="list" className="space-y-0.5">
          {NAV_ITEMS.map(item => {
            const active = isActive(item);
            return (
              <li key={item.id}>
                <Link
                  id={item.id}
                  to={item.to}
                  onClick={onMobileClose}
                  aria-current={active ? 'page' : undefined}
                  title={collapsed ? item.label : undefined}
                  className={[
                    // Layout & spacing
                    'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium',
                    // Use transition-colors instead of transition-all (cheaper repaints)
                    'transition-colors duration-200 outline-none',
                    'focus-visible:ring-2 focus-visible:ring-primary-500',
                    collapsed ? 'justify-center' : '',
                    active
                      ? 'bg-primary-600/20 text-primary-400 shadow-[inset_2px_0_0_#6370f1]'
                      : 'text-slate-400 hover:bg-white/5 hover:text-white',
                  ].join(' ')}
                >
                  {/* Icon — always visible, never moves */}
                  <span className="flex-shrink-0">{item.icon}</span>

                  {/* Label — animates via max-width (animatable) + opacity */}
                  <span
                    className={[
                      'overflow-hidden whitespace-nowrap',
                      'transition-[max-width,opacity] duration-300 ease-in-out',
                      collapsed ? 'max-w-0 opacity-0' : 'max-w-[12rem] opacity-100',
                    ].join(' ')}
                  >
                    {item.label}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* ── Logout ───────────────────────────────────────── */}
      <div className="flex-shrink-0 border-t border-surface-700/60 p-2">
        <button
          id="sidebar-logout"
          type="button"
          onClick={logout}
          title={collapsed ? 'Sign out' : undefined}
          className={[
            'flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium',
            'text-slate-400 transition-all duration-200',
            'hover:bg-danger-500/10 hover:text-danger-400',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-danger-500',
            collapsed ? 'justify-center' : '',
          ].join(' ')}
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5 flex-shrink-0" aria-hidden="true">
            <path fillRule="evenodd" d="M3 4.25A2.25 2.25 0 0 1 5.25 2h5.5A2.25 2.25 0 0 1 13 4.25v2a.75.75 0 0 1-1.5 0v-2a.75.75 0 0 0-.75-.75h-5.5a.75.75 0 0 0-.75.75v11.5c0 .414.336.75.75.75h5.5a.75.75 0 0 0 .75-.75v-2a.75.75 0 0 1 1.5 0v2A2.25 2.25 0 0 1 10.75 18h-5.5A2.25 2.25 0 0 1 3 15.75V4.25Z" clipRule="evenodd" />
            <path fillRule="evenodd" d="M6 10a.75.75 0 0 1 .75-.75h9.546l-1.048-.943a.75.75 0 1 1 1.004-1.114l2.5 2.25a.75.75 0 0 1 0 1.114l-2.5 2.25a.75.75 0 1 1-1.004-1.114l1.048-.943H6.75A.75.75 0 0 1 6 10Z" clipRule="evenodd" />
          </svg>
          <span
            className={[
              'overflow-hidden whitespace-nowrap',
              'transition-[max-width,opacity] duration-300 ease-in-out',
              collapsed ? 'max-w-0 opacity-0' : 'max-w-[12rem] opacity-100',
            ].join(' ')}
          >
            Sign out
          </span>
        </button>
      </div>
    </aside>
  );
});

export default Sidebar;
