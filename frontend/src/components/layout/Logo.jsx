import { Link } from 'react-router-dom';

/**
 * Logo — brand mark used in Sidebar and AuthLayout.
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
      aria-label="Onyx Wealth"
    >
      <div className="flex-shrink-0 flex h-9 w-9 items-center justify-center rounded-xl border border-white/20 bg-surface-800 transition-transform duration-200 group-hover:scale-105">
        <div className="w-4 h-4 border-[1.5px] border-white transform rotate-45 flex items-center justify-center rounded-sm">
          <div className="w-1 h-1 bg-white rounded-full"></div>
        </div>
      </div>

      <div
        className={[
          'flex flex-col justify-center overflow-hidden transition-all duration-300',
          collapsed ? 'w-0 opacity-0' : 'w-24 opacity-100',
        ].join(' ')}
      >
        <span className="font-serif text-lg font-medium leading-none tracking-wide text-white uppercase whitespace-nowrap">
          Onyx
        </span>
      </div>
    </Link>
  );
}
