import { Link, useNavigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';

/**
 * Landing — public marketing page.
 *
 * Highlights the product value props, provides clear CTAs to
 * Register and Login, and auto-redirects authenticated users
 * to their dashboard.
 */
function Landing() {
  const { isAuthenticated, loading } = useAuth();
  const navigate = useNavigate();

  // Redirect already-authenticated users immediately
  if (!loading && isAuthenticated) {
    navigate('/dashboard', { replace: true });
    return null;
  }

  const features = [
    {
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
          <path d="M10.464 8.746c.227-.18.497-.311.786-.394v2.795a2.252 2.252 0 0 1-.786-.393c-.394-.313-.546-.681-.546-1.004 0-.323.152-.691.546-1.004ZM12.75 15.662v-2.824c.347.085.664.228.921.421.427.32.579.686.579.991 0 .305-.152.671-.579.991a2.534 2.534 0 0 1-.921.42Z" />
          <path fillRule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25ZM12.75 6a.75.75 0 0 0-1.5 0v.816a3.836 3.836 0 0 0-1.72.756c-.712.566-1.112 1.35-1.112 2.178 0 .829.4 1.612 1.113 2.178.502.4 1.102.647 1.719.756v2.978a2.536 2.536 0 0 1-.921-.421l-.879-.66a.75.75 0 0 0-.9 1.2l.879.66c.533.4 1.169.645 1.821.75V18a.75.75 0 0 0 1.5 0v-.81a4.124 4.124 0 0 0 1.821-.749c.745-.559 1.179-1.344 1.179-2.191 0-.847-.434-1.632-1.179-2.191a4.122 4.122 0 0 0-1.821-.75V8.354c.29.082.559.213.786.393l.415.33a.75.75 0 0 0 .933-1.175l-.415-.33a3.836 3.836 0 0 0-1.719-.755V6Z" clipRule="evenodd" />
        </svg>
      ),
      title: 'Expense Tracking',
      description: 'Log and categorize every expense with precision. Know exactly where your money goes each month.',
    },
    {
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
          <path fillRule="evenodd" d="M3 6a3 3 0 0 1 3-3h12a3 3 0 0 1 3 3v12a3 3 0 0 1-3 3H6a3 3 0 0 1-3-3V6Zm4.5 7.5a.75.75 0 0 1 .75.75v2.25a.75.75 0 0 1-1.5 0v-2.25a.75.75 0 0 1 .75-.75Zm3.75-1.5a.75.75 0 0 0-1.5 0v4.5a.75.75 0 0 0 1.5 0V12Zm2.25-3a.75.75 0 0 1 .75.75v6.75a.75.75 0 0 1-1.5 0V9.75A.75.75 0 0 1 13.5 9Zm3.75-1.5a.75.75 0 0 0-1.5 0v9a.75.75 0 0 0 1.5 0v-9Z" clipRule="evenodd" />
        </svg>
      ),
      title: 'Smart Analytics',
      description: 'Beautiful charts and AI-powered insights reveal spending patterns and saving opportunities.',
    },
    {
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
          <path d="M18.375 2.25c-1.035 0-1.875.84-1.875 1.875v15.75c0 1.035.84 1.875 1.875 1.875h.75c1.035 0 1.875-.84 1.875-1.875V4.125c0-1.036-.84-1.875-1.875-1.875h-.75ZM9.75 8.625c0-1.036.84-1.875 1.875-1.875h.75c1.036 0 1.875.84 1.875 1.875v11.25c0 1.035-.84 1.875-1.875 1.875h-.75a1.875 1.875 0 0 1-1.875-1.875V8.625ZM3 13.125c0-1.036.84-1.875 1.875-1.875h.75c1.036 0 1.875.84 1.875 1.875v6.75c0 1.035-.84 1.875-1.875 1.875h-.75A1.875 1.875 0 0 1 3 19.875v-6.75Z" />
        </svg>
      ),
      title: 'Budget Goals',
      description: 'Set monthly budgets per category and get real-time alerts before you overspend.',
    },
    {
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
          <path fillRule="evenodd" d="M12 1.5a5.25 5.25 0 0 0-5.25 5.25v3a3 3 0 0 0-3 3v6.75a3 3 0 0 0 3 3h10.5a3 3 0 0 0 3-3v-6.75a3 3 0 0 0-3-3v-3c0-2.9-2.35-5.25-5.25-5.25Zm3.75 8.25v-3a3.75 3.75 0 1 0-7.5 0v3h7.5Z" clipRule="evenodd" />
        </svg>
      ),
      title: 'Secure & Private',
      description: 'Your financial data is protected with industry-standard encryption. We never sell your data.',
    },
    {
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
          <path fillRule="evenodd" d="M4.125 3C3.089 3 2.25 3.84 2.25 4.875V18a3 3 0 0 0 3 3h15a3 3 0 0 1-3-3V4.875C17.25 3.839 16.41 3 15.375 3H4.125ZM12 9.75a.75.75 0 0 0 0 1.5h1.5a.75.75 0 0 0 0-1.5H12Zm-.75-2.25a.75.75 0 0 1 .75-.75h1.5a.75.75 0 0 1 0 1.5H12a.75.75 0 0 1-.75-.75ZM6 12.75a.75.75 0 0 0 0 1.5h7.5a.75.75 0 0 0 0-1.5H6Zm-.75 3.75a.75.75 0 0 1 .75-.75h7.5a.75.75 0 0 1 0 1.5H6a.75.75 0 0 1-.75-.75ZM6 6.75a.75.75 0 0 0-.75.75v3c0 .414.336.75.75.75h3a.75.75 0 0 0 .75-.75v-3A.75.75 0 0 0 9 6.75H6Z" clipRule="evenodd" />
          <path d="M18.75 6.75h1.875c.621 0 1.125.504 1.125 1.125V18a1.5 1.5 0 0 1-3 0V6.75Z" />
        </svg>
      ),
      title: 'Income Management',
      description: 'Track multiple income streams, salary, freelance, investments — all in one unified view.',
    },
    {
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
          <path d="M5.566 4.657A4.505 4.505 0 0 1 6.75 4.5h10.5c.41 0 .806.055 1.183.157A3 3 0 0 0 15.75 3h-7.5a3 3 0 0 0-2.684 1.657ZM2.25 12a3 3 0 0 1 3-3h13.5a3 3 0 0 1 3 3v6a3 3 0 0 1-3 3H5.25a3 3 0 0 1-3-3v-6ZM5.25 7.5c-.41 0-.806.055-1.184.157A3 3 0 0 1 6.75 6h10.5a3 3 0 0 1 2.683 1.657A4.505 4.505 0 0 0 18.75 7.5H5.25Z" />
        </svg>
      ),
      title: 'Export Reports',
      description: 'Generate detailed PDF and CSV reports for any date range. Perfect for tax season.',
    },
  ];

  const stats = [
    { value: '50K+', label: 'Active Users' },
    { value: '$2M+', label: 'Tracked Monthly' },
    { value: '99.9%', label: 'Uptime' },
    { value: '4.9★', label: 'User Rating' },
  ];

  return (
    <div className="min-h-screen bg-surface-950 text-white">
      {/* ── Ambient glows ──────────────────────────────────────────── */}
      <div aria-hidden="true" className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 h-[700px] w-[700px] rounded-full bg-primary-600/15 blur-[140px]" />
        <div className="absolute top-1/3 -right-32 h-[500px] w-[500px] rounded-full bg-accent-500/10 blur-[120px]" />
        <div className="absolute bottom-0 left-1/4 h-[400px] w-[400px] rounded-full bg-primary-800/10 blur-[100px]" />
      </div>

      {/* ── Navbar ─────────────────────────────────────────────────── */}
      <header className="relative z-10 border-b border-white/5">
        <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <Link to="/" className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-brand shadow-glow-primary">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5 text-white" aria-hidden="true">
                <path d="M11.47 3.841a.75.75 0 0 1 1.06 0l8.69 8.69a.75.75 0 1 0 1.06-1.061l-8.689-8.69a2.25 2.25 0 0 0-3.182 0l-8.69 8.69a.75.75 0 1 0 1.061 1.06l8.69-8.689Z" />
                <path d="m12 5.432 8.159 8.159c.03.03.06.058.091.086v6.198c0 1.035-.84 1.875-1.875 1.875H15a.75.75 0 0 1-.75-.75v-4.5a.75.75 0 0 0-.75-.75h-3a.75.75 0 0 0-.75.75V21a.75.75 0 0 1-.75.75H5.625a1.875 1.875 0 0 1-1.875-1.875v-6.198a2.29 2.29 0 0 0 .091-.086L12 5.432Z" />
              </svg>
            </div>
            <span className="text-base font-bold tracking-tight">
              <span className="gradient-text">Smart</span> Expense Tracker
            </span>
          </Link>

          <div className="flex items-center gap-3">
            <Link to="/login" className="btn-ghost px-4 py-2 text-sm font-medium text-slate-300 hover:text-white">
              Sign In
            </Link>
            <Link to="/register" className="btn-primary px-5 py-2 text-sm">
              Get Started Free
            </Link>
          </div>
        </nav>
      </header>

      {/* ── Hero ───────────────────────────────────────────────────── */}
      <section className="relative z-10 mx-auto max-w-7xl px-6 pt-24 pb-20 text-center">
        <div className="animate-fade-up">
          <span className="badge-primary mb-6 inline-flex items-center gap-2 px-4 py-1.5 text-xs">
            <span className="h-1.5 w-1.5 rounded-full bg-primary-400 animate-pulse-slow" />
            Now in public beta — join free today
          </span>

          <h1 className="mx-auto max-w-4xl text-5xl font-bold leading-tight tracking-tight sm:text-6xl lg:text-7xl">
            Take{' '}
            <span className="gradient-text">full control</span>
            {' '}of your finances
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-lg text-slate-400 leading-relaxed">
            Smart Expense Tracker gives you a crystal-clear view of where every rupee goes.
            Track expenses, set budgets, analyse trends, and hit your saving goals — all in one
            beautifully designed app.
          </p>

          <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <Link
              to="/register"
              id="hero-cta-register"
              className="btn-primary w-full px-8 py-3 text-base sm:w-auto"
            >
              Start tracking for free
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4" aria-hidden="true">
                <path fillRule="evenodd" d="M3 10a.75.75 0 0 1 .75-.75h10.638L10.23 5.29a.75.75 0 1 1 1.04-1.08l5.5 5.25a.75.75 0 0 1 0 1.08l-5.5 5.25a.75.75 0 1 1-1.04-1.08l4.158-3.96H3.75A.75.75 0 0 1 3 10Z" clipRule="evenodd" />
              </svg>
            </Link>
            <Link
              to="/login"
              id="hero-cta-login"
              className="btn-secondary w-full px-8 py-3 text-base sm:w-auto"
            >
              Sign in to your account
            </Link>
          </div>
        </div>

        {/* Stats bar */}
        <div className="mt-20 grid grid-cols-2 gap-4 sm:grid-cols-4">
          {stats.map(({ value, label }) => (
            <div key={label} className="card flex flex-col items-center py-5">
              <span className="text-2xl font-bold gradient-text">{value}</span>
              <span className="mt-1 text-xs text-slate-400">{label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ── Features ───────────────────────────────────────────────── */}
      <section className="relative z-10 mx-auto max-w-7xl px-6 py-20" aria-labelledby="features-heading">
        <div className="text-center">
          <h2 id="features-heading" className="text-3xl font-bold tracking-tight sm:text-4xl">
            Everything you need to{' '}
            <span className="gradient-text">master your money</span>
          </h2>
          <p className="mt-4 text-slate-400 max-w-xl mx-auto">
            Packed with powerful features designed for real people who want financial clarity without the complexity.
          </p>
        </div>

        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map(({ icon, title, description }) => (
            <div
              key={title}
              className="card p-6 group hover:border-primary-500/30 transition-all duration-300 hover:-translate-y-1 hover:shadow-glow-primary/20"
            >
              <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-primary-600/20 text-primary-400 group-hover:bg-primary-600/30 transition-colors duration-200">
                {icon}
              </div>
              <h3 className="mb-2 text-base font-semibold text-white">{title}</h3>
              <p className="text-sm text-slate-400 leading-relaxed">{description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA Banner ─────────────────────────────────────────────── */}
      <section className="relative z-10 mx-auto max-w-7xl px-6 py-20">
        <div className="rounded-3xl bg-gradient-brand p-px shadow-glow-primary">
          <div className="rounded-3xl bg-surface-900 px-8 py-14 text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Ready to take back control?
            </h2>
            <p className="mt-4 text-slate-400 max-w-lg mx-auto">
              Join thousands of people who use Smart Expense Tracker to achieve their financial goals.
              Free to start. No credit card required.
            </p>
            <Link
              to="/register"
              id="bottom-cta-register"
              className="btn-primary mt-8 inline-flex px-10 py-3 text-base"
            >
              Create your free account
            </Link>
          </div>
        </div>
      </section>

      {/* ── Footer ─────────────────────────────────────────────────── */}
      <footer className="relative z-10 border-t border-white/5 py-8 text-center text-xs text-slate-500">
        <p>
          &copy; {new Date().getFullYear()} Smart Expense Tracker. Built with ❤️ for your financial freedom.
        </p>
      </footer>
    </div>
  );
}

export default Landing;
