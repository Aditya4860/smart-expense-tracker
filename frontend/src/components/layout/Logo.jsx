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
      aria-label="Smart Expense Tracker"
    >
      <div className="flex-shrink-0 flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-brand shadow-glow-primary transition-transform duration-200 group-hover:scale-105">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="currentColor"
          className="h-5 w-5 text-white"
          aria-hidden="true"
        >
          <path d="M11.47 3.841a.75.75 0 0 1 1.06 0l8.69 8.69a.75.75 0 1 0 1.06-1.061l-8.689-8.69a2.25 2.25 0 0 0-3.182 0l-8.69 8.69a.75.75 0 1 0 1.061 1.06l8.69-8.689Z" />
          <path d="m12 5.432 8.159 8.159c.03.03.06.058.091.086v6.198c0 1.035-.84 1.875-1.875 1.875H15a.75.75 0 0 1-.75-.75v-4.5a.75.75 0 0 0-.75-.75h-3a.75.75 0 0 0-.75.75V21a.75.75 0 0 1-.75.75H5.625a1.875 1.875 0 0 1-1.875-1.875v-6.198a2.29 2.29 0 0 0 .091-.086L12 5.432Z" />
        </svg>
      </div>

      <div
        className={[
          'flex flex-col overflow-hidden transition-all duration-300',
          collapsed ? 'w-0 opacity-0' : 'w-32 opacity-100',
        ].join(' ')}
      >
        <span className="text-sm font-bold leading-none whitespace-nowrap">
          <span className="gradient-text">Smart</span>
          <span className="text-white"> Expense</span>
        </span>
        <span className="text-[10px] text-slate-500 whitespace-nowrap leading-none mt-0.5">
          Tracker
        </span>
      </div>
    </Link>
  );
}
