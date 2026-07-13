import { Navigate, Link } from 'react-router-dom';
import useAuth from '../hooks/useAuth';

const features = [
  {
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-6 w-6">
        <path d="M10.464 8.746c.227-.18.497-.311.786-.394v2.795a2.252 2.252 0 0 1-.786-.393c-.394-.313-.546-.681-.546-1.004 0-.323.152-.691.546-1.004ZM12.75 15.662v-2.824c.347.085.664.228.921.421.427.32.579.686.579.991 0 .305-.152.671-.579.991a2.534 2.534 0 0 1-.921.42Z" />
        <path fillRule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25ZM12.75 6a.75.75 0 0 0-1.5 0v.816a3.836 3.836 0 0 0-1.72.756c-.712.566-1.112 1.35-1.112 2.178 0 .829.4 1.612 1.113 2.178.502.4 1.102.647 1.719.756v2.978a2.536 2.536 0 0 1-.921-.421l-.879-.66a.75.75 0 0 0-.9 1.2l.879.66c.533.4 1.169.645 1.821.75V18a.75.75 0 0 0 1.5 0v-.81a4.124 4.124 0 0 0 1.821-.749c.745-.559 1.179-1.344 1.179-2.191 0-.847-.434-1.632-1.179-2.191a4.122 4.122 0 0 0-1.821-.75V8.354c.29.082.559.213.786.393l.415.33a.75.75 0 0 0 .933-1.175l-.415-.33a3.836 3.836 0 0 0-1.719-.755V6Z" clipRule="evenodd" />
      </svg>
    ),
    title: 'Track Every Rupee',
    description: 'Log expenses by category and never lose sight of where your money goes.',
  },
  {
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-6 w-6">
        <path fillRule="evenodd" d="M2.25 13.5a8.25 8.25 0 0 1 8.25-8.25.75.75 0 0 1 .75.75v6.75H18a.75.75 0 0 1 .75.75 8.25 8.25 0 0 1-16.5 0Z" clipRule="evenodd" />
        <path fillRule="evenodd" d="M12.75 3a.75.75 0 0 1 .75-.75 8.25 8.25 0 0 1 8.25 8.25.75.75 0 0 1-.75.75h-7.5a.75.75 0 0 1-.75-.75V3Z" clipRule="evenodd" />
      </svg>
    ),
    title: 'Smart Filtering',
    description: 'Slice your data by category, date range, or keyword in seconds.',
  },
  {
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-6 w-6">
        <path fillRule="evenodd" d="M12 1.5a.75.75 0 0 1 .75.75V4.5a.75.75 0 0 1-1.5 0V2.25A.75.75 0 0 1 12 1.5ZM5.636 4.136a.75.75 0 0 1 1.06 0l1.592 1.591a.75.75 0 0 1-1.061 1.061L5.636 5.197a.75.75 0 0 1 0-1.06Zm12.728 0a.75.75 0 0 1 0 1.06l-1.591 1.592a.75.75 0 0 1-1.061-1.061l1.591-1.592a.75.75 0 0 1 1.061 0ZM4.5 12a.75.75 0 0 1-.75.75H2.25a.75.75 0 0 1 0-1.5H3.75A.75.75 0 0 1 4.5 12Zm16.5 0a.75.75 0 0 1-.75.75h-1.5a.75.75 0 0 1 0-1.5h1.5a.75.75 0 0 1 .75.75ZM12 18a.75.75 0 0 1 .75.75v1.5a.75.75 0 0 1-1.5 0v-1.5A.75.75 0 0 1 12 18Z" clipRule="evenodd" />
      </svg>
    ),
    title: 'Instant Persistence',
    description: 'Your data is stored securely per account and survives every page refresh.',
  },
];

export default function Landing() {
  const { isAuthenticated, loading } = useAuth();

  if (!loading && isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="relative min-h-screen bg-surface-950 text-white overflow-x-hidden">

      {/* Ambient glows */}
      <div aria-hidden="true" className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-32 left-1/2 -translate-x-1/2 h-[600px] w-[600px] rounded-full bg-primary-600/12 blur-[140px]" />
        <div className="absolute top-1/2 -right-40 h-[400px] w-[400px] rounded-full bg-accent-600/10 blur-[120px]" />
        <div className="absolute bottom-0 left-0 h-[300px] w-[300px] rounded-full bg-primary-500/8 blur-[100px]" />
      </div>

      {/* Navbar */}
      <header className="relative z-10 border-b border-white/5 bg-surface-900/60 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-brand shadow-glow-primary">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4 text-white" aria-hidden="true">
                <path d="M11.47 3.841a.75.75 0 0 1 1.06 0l8.69 8.69a.75.75 0 1 0 1.06-1.061l-8.689-8.69a2.25 2.25 0 0 0-3.182 0l-8.69 8.69a.75.75 0 1 0 1.061 1.06l8.69-8.689Z" />
                <path d="m12 5.432 8.159 8.159c.03.03.06.058.091.086v6.198c0 1.035-.84 1.875-1.875 1.875H15a.75.75 0 0 1-.75-.75v-4.5a.75.75 0 0 0-.75-.75h-3a.75.75 0 0 0-.75.75V21a.75.75 0 0 1-.75.75H5.625a1.875 1.875 0 0 1-1.875-1.875v-6.198a2.29 2.29 0 0 0 .091-.086L12 5.432Z" />
              </svg>
            </div>
            <span className="font-bold text-sm">
              <span className="gradient-text">Smart</span> Expense Tracker
            </span>
          </div>

          <div className="flex items-center gap-3">
            <Link
              id="landing-login-nav"
              to="/login"
              className="btn-ghost px-4 py-2 text-sm"
            >
              Sign in
            </Link>
            <Link
              id="landing-register-nav"
              to="/register"
              className="btn-primary px-4 py-2 text-sm"
            >
              Get started
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <main className="relative z-10">
        <section className="mx-auto max-w-6xl px-6 pt-24 pb-20 text-center">
          <div className="animate-fade-up">
            <span className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary-500/30 bg-primary-600/10 px-4 py-1.5 text-xs font-medium text-primary-400">
              <span className="h-1.5 w-1.5 rounded-full bg-primary-400 animate-pulse" />
              Personal finance, simplified
            </span>

            <h1 className="mt-6 text-5xl font-bold leading-tight tracking-tight sm:text-6xl lg:text-7xl">
              Take control of{' '}
              <br className="hidden sm:block" />
              <span className="gradient-text">every expense</span>
            </h1>

            <p className="mx-auto mt-6 max-w-2xl text-lg text-slate-400 leading-relaxed">
              Smart Expense Tracker helps you log, categorise, and understand where
              your money goes — with a beautiful interface built for clarity.
            </p>

            <div className="mt-10 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
              <Link
                id="landing-cta-register"
                to="/register"
                className="btn-primary w-full sm:w-auto px-8 py-3 text-base"
              >
                Create free account
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4" aria-hidden="true">
                  <path fillRule="evenodd" d="M3 10a.75.75 0 0 1 .75-.75h10.638L10.23 5.29a.75.75 0 1 1 1.04-1.08l5.5 5.25a.75.75 0 0 1 0 1.08l-5.5 5.25a.75.75 0 1 1-1.04-1.08l4.158-3.96H3.75A.75.75 0 0 1 3 10Z" clipRule="evenodd" />
                </svg>
              </Link>
              <Link
                id="landing-cta-login"
                to="/login"
                className="btn-secondary w-full sm:w-auto px-8 py-3 text-base"
              >
                Sign in
              </Link>
            </div>
          </div>

          {/* Mock UI preview strip */}
          <div className="mt-20 animate-fade-in">
            <div className="mx-auto max-w-3xl rounded-3xl border border-white/8 bg-surface-800/60 p-6 backdrop-blur-sm shadow-card-dark">
              <div className="mb-4 flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-danger-500/60" />
                <div className="h-3 w-3 rounded-full bg-warning-500/60" />
                <div className="h-3 w-3 rounded-full bg-success-500/60" />
                <div className="ml-3 h-5 flex-1 rounded-full bg-surface-700/80" />
              </div>
              <div className="grid grid-cols-3 gap-3 mb-4">
                {[
                  { label: 'Total Expenses', value: '₹24,580', color: 'text-danger-400' },
                  { label: 'This Month', value: '₹8,230', color: 'text-warning-400' },
                  { label: 'Saved', value: '₹6,420', color: 'text-success-400' },
                ].map(s => (
                  <div key={s.label} className="rounded-xl bg-surface-700/60 p-4">
                    <p className="text-xs text-slate-500">{s.label}</p>
                    <p className={`mt-1 text-lg font-bold ${s.color}`}>{s.value}</p>
                  </div>
                ))}
              </div>
              <div className="space-y-2">
                {[
                  { icon: '🍽️', label: 'Dinner at Trattoria', cat: 'Food', amount: '₹1,240', date: 'Today' },
                  { icon: '🚗', label: 'Ola cab to office', cat: 'Transport', amount: '₹180', date: 'Yesterday' },
                  { icon: '📱', label: 'Netflix subscription', cat: 'Subscriptions', amount: '₹649', date: '2 days ago' },
                ].map(e => (
                  <div key={e.label} className="flex items-center gap-3 rounded-xl bg-surface-700/40 px-4 py-3">
                    <span className="text-lg">{e.icon}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-200 truncate">{e.label}</p>
                      <p className="text-xs text-slate-500">{e.cat}</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-sm font-bold text-danger-400">{e.amount}</p>
                      <p className="text-xs text-slate-600">{e.date}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="mx-auto max-w-6xl px-6 pb-24">
          <div className="grid gap-6 sm:grid-cols-3">
            {features.map(f => (
              <div
                key={f.title}
                className="card p-6 transition-all duration-300 hover:border-primary-500/30 hover:-translate-y-0.5"
              >
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary-600/15 text-primary-400">
                  {f.icon}
                </div>
                <h3 className="mb-2 text-base font-semibold text-white">{f.title}</h3>
                <p className="text-sm text-slate-400 leading-relaxed">{f.description}</p>
              </div>
            ))}
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/5 py-6">
        <p className="text-center text-xs text-slate-600">
          © {new Date().getFullYear()} Smart Expense Tracker. Built with ♥
        </p>
      </footer>
    </div>
  );
}
