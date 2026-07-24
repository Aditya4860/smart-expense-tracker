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
            className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-brand shadow-glow-primary transition-transform hover:scale-105"
            aria-label="Go to home"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-6 w-6 text-white" aria-hidden="true">
              <path d="M11.47 3.841a.75.75 0 0 1 1.06 0l8.69 8.69a.75.75 0 1 0 1.06-1.061l-8.689-8.69a2.25 2.25 0 0 0-3.182 0l-8.69 8.69a.75.75 0 1 0 1.061 1.06l8.69-8.689Z" />
              <path d="m12 5.432 8.159 8.159c.03.03.06.058.091.086v6.198c0 1.035-.84 1.875-1.875 1.875H15a.75.75 0 0 1-.75-.75v-4.5a.75.75 0 0 0-.75-.75h-3a.75.75 0 0 0-.75.75V21a.75.75 0 0 1-.75.75H5.625a1.875 1.875 0 0 1-1.875-1.875v-6.198a2.29 2.29 0 0 0 .091-.086L12 5.432Z" />
            </svg>
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
