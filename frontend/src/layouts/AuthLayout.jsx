import { Navigate, Outlet, Link } from 'react-router-dom';
import useAuth from '../hooks/useAuth';

/**
 * AuthLayout — centered card layout shared by Login and Register pages.
 *
 * Props:
 *   title       — main heading text
 *   subtitle    — secondary description text
 *   footer      — JSX rendered below the card (e.g. "Already have an account?")
 */
export default function AuthLayout({ title, subtitle, footer, children }) {
  return (
    <div className="relative min-h-screen bg-surface-950 text-white flex items-center justify-center px-4 py-12">

      {/* Ambient glows */}
      <div aria-hidden="true" className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 h-[500px] w-[500px] rounded-full bg-primary-600/12 blur-[130px]" />
        <div className="absolute bottom-0 right-1/4 h-[350px] w-[350px] rounded-full bg-accent-600/8 blur-[100px]" />
      </div>

      <div className="relative z-10 w-full max-w-md animate-fade-up">

        {/* Brand mark */}
        <div className="mb-8 flex flex-col items-center gap-3">
          <Link
            to="/"
            id="auth-layout-home-link"
            className="flex h-12 w-12 items-center justify-center rounded-xl border border-white/20 bg-surface-800 transition-transform hover:scale-105"
            aria-label="Go to home"
          >
            <div className="w-5 h-5 border-[1.5px] border-white transform rotate-45 flex items-center justify-center rounded-sm">
              <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
            </div>
          </Link>

          <div className="text-center">
            <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
            {subtitle && (
              <p className="mt-1.5 text-sm text-slate-400">{subtitle}</p>
            )}
          </div>
        </div>

        {/* Card */}
        <div className="card-glass rounded-3xl p-8">
          {children}
        </div>

        {/* Footer link row */}
        {footer && (
          <div className="mt-6 text-center text-sm text-slate-500">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
