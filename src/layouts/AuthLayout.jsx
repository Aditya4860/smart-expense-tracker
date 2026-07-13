import { Link } from 'react-router-dom';

/**
 * AuthLayout — shared wrapper for Login and Register pages.
 *
 * Renders a full-screen dark background with ambient glow orbs,
 * a centred card containing the logo + brand name + children, and
 * a footer attribution link back to the landing page.
 */
function AuthLayout({ children, title, subtitle }) {
  return (
    <div className="relative min-h-screen bg-surface-950 flex flex-col items-center justify-center px-4 py-12">
      {/* Ambient background glows */}
      <div aria-hidden="true" className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-32 left-1/2 -translate-x-1/2 h-[500px] w-[500px] rounded-full bg-primary-600/20 blur-[120px]" />
        <div className="absolute bottom-0 -right-32 h-[400px] w-[400px] rounded-full bg-accent-500/15 blur-[100px]" />
        <div className="absolute top-1/2 -left-24 h-[300px] w-[300px] rounded-full bg-primary-800/10 blur-[80px]" />
      </div>

      {/* Card */}
      <div className="relative z-10 w-full max-w-md animate-fade-up">
        {/* Logo + brand */}
        <div className="mb-8 flex flex-col items-center gap-4 text-center">
          <Link
            to="/"
            className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-brand shadow-glow-primary transition-transform duration-200 hover:scale-105"
            aria-label="Smart Expense Tracker home"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="h-7 w-7 text-white"
              aria-hidden="true"
            >
              <path d="M11.47 3.841a.75.75 0 0 1 1.06 0l8.69 8.69a.75.75 0 1 0 1.06-1.061l-8.689-8.69a2.25 2.25 0 0 0-3.182 0l-8.69 8.69a.75.75 0 1 0 1.061 1.06l8.69-8.689Z" />
              <path d="m12 5.432 8.159 8.159c.03.03.06.058.091.086v6.198c0 1.035-.84 1.875-1.875 1.875H15a.75.75 0 0 1-.75-.75v-4.5a.75.75 0 0 0-.75-.75h-3a.75.75 0 0 0-.75.75V21a.75.75 0 0 1-.75.75H5.625a1.875 1.875 0 0 1-1.875-1.875v-6.198a2.29 2.29 0 0 0 .091-.086L12 5.432Z" />
            </svg>
          </Link>

          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              <span className="gradient-text">Smart Expense</span>
              <span className="text-white"> Tracker</span>
            </h1>
            {title && (
              <p className="mt-1 text-base font-semibold text-white">{title}</p>
            )}
            {subtitle && (
              <p className="mt-1 text-sm text-slate-400">{subtitle}</p>
            )}
          </div>
        </div>

        {/* Content slot */}
        <div className="card p-8">
          {children}
        </div>

        {/* Footer */}
        <p className="mt-6 text-center text-xs text-slate-500">
          &copy; {new Date().getFullYear()} Smart Expense Tracker. All rights reserved.
        </p>
      </div>
    </div>
  );
}

export default AuthLayout;
