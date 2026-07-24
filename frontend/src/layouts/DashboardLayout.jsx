import { useState, useCallback } from 'react';
import TopNavbar from '../components/layout/TopNavbar';
import PageContainer from '../components/layout/PageContainer';

/**
 * DashboardLayout — root shell for all authenticated pages.
 *
 * Desktop: sticky top navbar + scrollable content, max 1600px centered.
 * Mobile:  full-width top navbar + mobile dropdown/drawer.
 */
export default function DashboardLayout({ children }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const toggleMobileMenu = useCallback(() => setMobileMenuOpen(open => !open), []);
  const closeMobileMenu  = useCallback(() => setMobileMenuOpen(false), []);

  return (
    <div className="min-h-screen bg-surface-950 text-white">

      {/* Subtle grain overlay */}
      <div 
        aria-hidden="true" 
        className="pointer-events-none fixed inset-0 z-0 opacity-[0.015]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
          backgroundRepeat: 'repeat',
        }}
      />

      {/* Mobile backdrop */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={closeMobileMenu}
          aria-hidden="true"
        />
      )}

      {/* Main column */}
      <div className="flex min-h-screen flex-col relative z-10 mx-auto max-w-[1600px]">
        <TopNavbar mobileMenuOpen={mobileMenuOpen} onToggleMobileMenu={toggleMobileMenu} onCloseMobileMenu={closeMobileMenu} />
        <PageContainer>{children}</PageContainer>
      </div>
    </div>
  );
}
