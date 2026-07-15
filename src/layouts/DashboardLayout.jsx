import { useState, useEffect, useCallback } from 'react';
import Sidebar from '../components/layout/Sidebar';
import TopNavbar from '../components/layout/TopNavbar';
import PageContainer from '../components/layout/PageContainer';

const COLLAPSED_KEY = 'sidebar_collapsed';

/**
 * DashboardLayout — root shell for all authenticated pages.
 *
 * Desktop: fixed sidebar (full or icon-only) + sticky top navbar + scrollable content.
 * Mobile:  full-width top navbar + content; sidebar slides in as a drawer overlay.
 */
export default function DashboardLayout({ children }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed,  setCollapsed]  = useState(
    () => localStorage.getItem(COLLAPSED_KEY) === 'true'
  );

  // Persist collapse preference across refreshes
  useEffect(() => {
    localStorage.setItem(COLLAPSED_KEY, String(collapsed));
  }, [collapsed]);

  // Close mobile drawer automatically when viewport grows to desktop size
  useEffect(() => {
    const mql = window.matchMedia('(min-width: 768px)');
    const handleChange = (e) => { if (e.matches) setMobileOpen(false); };
    mql.addEventListener('change', handleChange);
    return () => mql.removeEventListener('change', handleChange);
  }, []);

  // Stable callbacks — prevent unnecessary child re-renders
  const openMobile   = useCallback(() => setMobileOpen(true),        []);
  const closeMobile  = useCallback(() => setMobileOpen(false),       []);
  const toggleCollapse = useCallback(() => setCollapsed(c => !c),    []);

  return (
    <div className="min-h-screen bg-surface-950 text-white">

      {/* Decorative ambient glows — below all content */}
      <div aria-hidden="true" className="pointer-events-none fixed inset-0 overflow-hidden" style={{ zIndex: 0 }}>
        <div className="absolute -top-32 left-1/3 h-[600px] w-[600px] rounded-full bg-primary-600/[0.07] blur-[160px]" />
        <div className="absolute bottom-0 right-0 h-[400px] w-[400px] rounded-full bg-accent-600/[0.06] blur-[130px]" />
      </div>

      {/* Mobile backdrop — click to close drawer */}
      <div
        className={[
          'fixed inset-0 z-60 bg-black/60 backdrop-blur-sm md:hidden',
          'transition-opacity duration-300',
          mobileOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none',
        ].join(' ')}
        onClick={closeMobile}
        aria-hidden="true"
      />

      {/* Sidebar */}
      <Sidebar
        mobileOpen={mobileOpen}
        collapsed={collapsed}
        onCollapse={toggleCollapse}
        onMobileClose={closeMobile}
      />

      {/* Main column — shifts right on desktop to match sidebar width */}
      <div
        className={[
          'flex min-h-screen flex-col',
          'transition-[margin-left] duration-300 ease-in-out',
          collapsed ? 'md:ml-[4.5rem]' : 'md:ml-64',
        ].join(' ')}
      >
        <TopNavbar onMobileMenuOpen={openMobile} collapsed={collapsed} />
        <PageContainer>{children}</PageContainer>
      </div>
    </div>
  );
}
