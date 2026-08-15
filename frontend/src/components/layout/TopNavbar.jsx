import { memo, useContext, useState, useRef, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import { ThemeContext } from '../../context/ThemeContext';
import NotificationDropdown from '../notifications/NotificationDropdown';
import ProfileModal from '../profile/ProfileModal';
import SettingsModal from '../settings/SettingsModal';

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
  { path: '/reminders', label: 'Reminders' },
  { path: '/analytics', label: 'Analytics' },
  { path: '/reports', label: 'Reports' },
  { path: '/categories', label: 'Categories' },
  { path: '/ai-assistant', label: 'ASK AI' },
];


/**
 * TopNavbar — Premium floating capsule navigation.
 *
 * Implements a cyclic carousel for navigation links (5 visible at a time).
 */
const TopNavbar = memo(function TopNavbar({ mobileMenuOpen, onToggleMobileMenu, onCloseMobileMenu }) {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useContext(ThemeContext);
  const initials = getInitials(user?.name);
  const navigate = useNavigate();

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Carousel state
  const [startIndex, setStartIndex] = useState(0);
  const visibleCount = 5;
  const wheelTimeout = useRef(null);

  const [isVisible, setIsVisible] = useState(true);
  const lastScrollY = useRef(0);
  const navRef = useRef(null);

  const nextSlide = () => setStartIndex((prev) => (prev + 1) % NAV_LINKS.length);
  const prevSlide = () => setStartIndex((prev) => (prev - 1 + NAV_LINKS.length) % NAV_LINKS.length);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      if (currentScrollY > lastScrollY.current && currentScrollY > 50) {
        setIsVisible(false); // scrolling down
      } else {
        setIsVisible(true);  // scrolling up
      }
      lastScrollY.current = currentScrollY;
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const nav = navRef.current;
    if (!nav) return;

    const handleWheelNative = (e) => {
      e.preventDefault(); // prevent page scroll
      
      if (wheelTimeout.current) return;
      
      if (e.deltaY > 0 || e.deltaX > 0) {
        setStartIndex((prev) => (prev + 2) % NAV_LINKS.length);
      } else if (e.deltaY < 0 || e.deltaX < 0) {
        setStartIndex((prev) => (prev - 2 + NAV_LINKS.length) % NAV_LINKS.length);
      }

      wheelTimeout.current = setTimeout(() => {
        wheelTimeout.current = null;
      }, 150);
    };

    nav.addEventListener('wheel', handleWheelNative, { passive: false });
    return () => nav.removeEventListener('wheel', handleWheelNative);
  }, []);
  // Get exactly 5 items from the circular array
  const visibleLinks = [];
  for (let i = 0; i < visibleCount; i++) {
    visibleLinks.push(NAV_LINKS[(startIndex + i) % NAV_LINKS.length]);
  }

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    }
    
    function handleEscape(event) {
      if (event.key === 'Escape') {
        setIsDropdownOpen(false);
      }
    }

    if (isDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscape);
    }
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isDropdownOpen]);

  const handleLogout = () => {
    setIsDropdownOpen(false);
    logout();
    navigate('/');
  };

  return (
    <>
      <header
        id="top-navbar"
        role="banner"
        className={`fixed left-1/2 -translate-x-1/2 z-50 flex items-center justify-between gap-2 rounded-full px-2 py-2 shadow-2xl w-[95%] max-w-[1000px] backdrop-blur-xl transition-all duration-300 ${isVisible ? 'top-6 translate-y-0 opacity-100' : '-top-20 -translate-y-full opacity-0'}`}
        style={{ backgroundColor: 'var(--bg-navbar)', border: '1px solid var(--border-default)' }}
      >
        {/* Left: Mobile hamburger & Logo */}
        <div className="flex items-center gap-2 pl-2">
          <button
            type="button"
            onClick={onToggleMobileMenu}
            className="flex h-10 w-10 items-center justify-center rounded-full text-surface-400 hover:bg-surface-800 hover:text-white lg:hidden"
            aria-label="Toggle navigation menu"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5">
              <path fillRule="evenodd" d="M2 4.75A.75.75 0 0 1 2.75 4h14.5a.75.75 0 0 1 0 1.5H2.75A.75.75 0 0 1 2 4.75ZM2 10a.75.75 0 0 1 .75-.75h14.5a.75.75 0 0 1 0 1.5H2.75A.75.75 0 0 1 2 10Zm0 5.25a.75.75 0 0 1 .75-.75h14.5a.75.75 0 0 1 0 1.5H2.75a.75.75 0 0 1-.75-.75Z" clipRule="evenodd" />
            </svg>
          </button>
          <NavLink to="/dashboard" className="flex items-center justify-center h-10 w-10 rounded-full bg-white text-black transition-transform hover:scale-105">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-6 w-6">
              <path d="M21 7.5l-9-5.25L3 7.5m18 0l-9 5.25m9-5.25v9l-9 5.25M3 7.5l9 5.25M3 7.5v9l9 5.25m0-9v9" />
            </svg>
          </NavLink>
        </div>

        {/* Middle: Cyclic Navigation (Desktop) */}
        <div className="hidden lg:flex items-center justify-center flex-1 mx-4">
          <button onClick={prevSlide} className="h-8 w-8 flex items-center justify-center rounded-full text-white/50 hover:text-white hover:bg-white/10 transition">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5"><path fillRule="evenodd" d="M11.78 5.22a.75.75 0 0 1 0 1.06L8.06 10l3.72 3.72a.75.75 0 1 1-1.06 1.06l-4.25-4.25a.75.75 0 0 1 0-1.06l4.25-4.25a.75.75 0 0 1 1.06 0Z" clipRule="evenodd" /></svg>
          </button>
          
          <nav ref={navRef} className="flex items-center gap-1 mx-2 overflow-hidden w-[500px] justify-center">
            {visibleLinks.map((link) => (
              <NavLink
                key={link.path}
                to={link.path}
                className={({ isActive }) => [
                  'px-4 py-2 text-sm font-medium transition-all duration-300 rounded-full text-center min-w-[90px]',
                  isActive
                    ? 'bg-white text-black shadow-md'
                    : 'text-white/70 hover:text-white hover:bg-white/10'
                ].join(' ')}
              >
                {link.label}
              </NavLink>
            ))}
          </nav>
          
          <button onClick={nextSlide} className="h-8 w-8 flex items-center justify-center rounded-full text-white/50 hover:text-white hover:bg-white/10 transition">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5"><path fillRule="evenodd" d="M8.22 5.22a.75.75 0 0 1 1.06 0l4.25 4.25a.75.75 0 0 1 0 1.06l-4.25 4.25a.75.75 0 0 1-1.06-1.06L11.94 10 8.22 6.28a.75.75 0 0 1 0-1.06Z" clipRule="evenodd" /></svg>
          </button>
        </div>

        {/* Right: Actions (Theme, Notifications, Profile) */}
        <div className="flex items-center gap-2 pr-1">
          <NotificationDropdown />

          <button
            type="button"
            onClick={toggleTheme}
            className="flex h-10 w-10 items-center justify-center rounded-full text-white/70 hover:bg-white/10 hover:text-white transition-all"
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

          <div className="relative" ref={dropdownRef}>
            <button
              type="button"
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex h-10 px-4 items-center gap-2 rounded-full bg-white text-sm font-medium text-black transition-transform hover:scale-105"
            >
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-black/10 text-[10px] font-bold">
                {initials}
              </div>
              <span className="max-w-[100px] truncate hidden md:block">{user?.name || user?.email || 'User'}</span>
            </button>

            {/* Dropdown Menu */}
            <div
              className={`absolute right-0 mt-3 w-56 origin-top-right rounded-2xl py-2 shadow-xl backdrop-blur-xl transition-all duration-200 ${
                isDropdownOpen
                  ? 'scale-100 opacity-100 visible translate-y-0'
                  : 'scale-95 opacity-0 invisible -translate-y-2'
              }`}
              style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-default)' }}
            >
              <div className="px-4 py-2 mb-2" style={{ borderBottom: '1px solid var(--border-default)' }}>
                <p className="truncate text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{user?.name || 'User'}</p>
                <p className="truncate text-xs" style={{ color: 'var(--text-secondary)' }}>{user?.email}</p>
              </div>

              <button
                onClick={() => { setIsDropdownOpen(false); setIsProfileOpen(true); }}
                className="flex w-full items-center px-4 py-2 text-sm transition-colors"
                style={{ color: 'var(--text-secondary)' }}
                onMouseEnter={e => { e.currentTarget.style.backgroundColor = 'var(--border-default)'; e.currentTarget.style.color = 'var(--text-primary)'; }}
                onMouseLeave={e => { e.currentTarget.style.backgroundColor = ''; e.currentTarget.style.color = 'var(--text-secondary)'; }}
              >
                <svg className="mr-3 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                View Profile
              </button>
              
              <button
                onClick={() => { setIsDropdownOpen(false); setIsSettingsOpen(true); }}
                className="flex w-full items-center px-4 py-2 text-sm transition-colors"
                style={{ color: 'var(--text-secondary)' }}
                onMouseEnter={e => { e.currentTarget.style.backgroundColor = 'var(--border-default)'; e.currentTarget.style.color = 'var(--text-primary)'; }}
                onMouseLeave={e => { e.currentTarget.style.backgroundColor = ''; e.currentTarget.style.color = 'var(--text-secondary)'; }}
              >
                <svg className="mr-3 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Settings
              </button>

              <button onClick={handleLogout} className="flex w-full items-center px-4 py-2 text-left text-sm text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors mt-2 border-t border-surface-700/50 pt-2">
                <svg className="mr-3 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* spacer to prevent content hiding under fixed header */}
      <div className="h-24 w-full" />

      {/* Mobile Navigation Drawer */}
      <div
        className={[
          'fixed inset-y-0 left-0 z-50 w-64 transform bg-[#0a0b0f] border-r border-white/8 transition-transform duration-300 lg:hidden',
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        ].join(' ')}
      >
        <div className="flex h-14 items-center justify-between border-b border-white/8 px-4">
          <span className="text-sm font-bold tracking-tight text-white">Onyx</span>
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
                'flex items-center rounded-full px-4 py-2 text-sm font-medium transition-colors text-center',
                isActive ? 'bg-white text-black' : 'text-surface-400 hover:bg-white/10 hover:text-white'
              ].join(' ')}
            >
              {link.label}
            </NavLink>
          ))}
        </nav>
      </div>

      {/* Profile Modal */}
      <ProfileModal isOpen={isProfileOpen} onClose={() => setIsProfileOpen(false)} />

      {/* Settings Modal */}
      <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
    </>
  );
});

export default TopNavbar;
