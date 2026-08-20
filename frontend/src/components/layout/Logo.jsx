import { Link } from 'react-router-dom';
import { ZenithLogo } from '../../pages/Landing';

/**
 * Logo — brand mark used in Sidebar.
 * Uses the shared ZenithLogo SVG for consistency across the app.
 *
 * Props:
 *   collapsed — when true, hides the text label (icon-only mode)
 */
export default function Logo({ collapsed = false }) {
  return (
    <Link
      to="/dashboard"
      id="logo-link"
      className="flex items-center gap-2.5 group overflow-hidden"
      aria-label="Zenith Wealth — Dashboard"
    >
      <div className="flex-shrink-0 flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-surface-800/80 transition-all duration-200 group-hover:scale-105 group-hover:border-white/25">
        <ZenithLogo size={22} />
      </div>

      <div
        className={[
          'flex flex-col justify-center overflow-hidden transition-all duration-300',
          collapsed ? 'w-0 opacity-0' : 'w-20 opacity-100',
        ].join(' ')}
      >
        <span className="font-serif text-lg font-semibold leading-none tracking-wide text-white uppercase whitespace-nowrap">
          Zenith
        </span>
      </div>
    </Link>
  );
}
