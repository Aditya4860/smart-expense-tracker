import useAuth from '../hooks/useAuth';

/**
 * Dashboard — placeholder page for Phase 2.
 *
 * Confirms a successful auth flow. Will be replaced with full
 * dashboard UI in a later phase.
 */
function Dashboard() {
  const { user, logout } = useAuth();

  const initials = user?.name
    ? user.name
        .split(' ')
        .slice(0, 2)
        .map(w => w[0]?.toUpperCase())
        .join('')
    : '?';

  const greeting = (() => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  })();

  const quickStats = [
    {
      label: 'Total Expenses',
      value: '₹0',
      change: '+0%',
      positive: false,
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
          <path d="M2.273 5.625A4.483 4.483 0 0 1 5.25 4.5h13.5c1.141 0 2.183.425 2.977 1.125A3 3 0 0 0 18.75 3H5.25a3 3 0 0 0-2.977 2.625Z" />
          <path d="M2.273 8.625A4.483 4.483 0 0 1 5.25 7.5h13.5c1.141 0 2.183.425 2.977 1.125A3 3 0 0 0 18.75 6H5.25a3 3 0 0 0-2.977 2.625Z" />
          <path d="M5.25 9a3 3 0 0 0-3 3v6a3 3 0 0 0 3 3h13.5a3 3 0 0 0 3-3v-6a3 3 0 0 0-3-3H5.25Zm7.5 7.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm-3 0a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z" />
        </svg>
      ),
      bg: 'bg-danger-500/15',
      text: 'text-danger-400',
    },
    {
      label: 'Total Income',
      value: '₹0',
      change: '+0%',
      positive: true,
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
          <path fillRule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25ZM12.75 9a.75.75 0 0 0-1.5 0v2.25H9a.75.75 0 0 0 0 1.5h2.25V15a.75.75 0 0 0 1.5 0v-2.25H15a.75.75 0 0 0 0-1.5h-2.25V9Z" clipRule="evenodd" />
        </svg>
      ),
      bg: 'bg-success-500/15',
      text: 'text-success-400',
    },
    {
      label: 'Net Savings',
      value: '₹0',
      change: '0%',
      positive: true,
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
          <path d="M10.464 8.746c.227-.18.497-.311.786-.394v2.795a2.252 2.252 0 0 1-.786-.393c-.394-.313-.546-.681-.546-1.004 0-.323.152-.691.546-1.004ZM12.75 15.662v-2.824c.347.085.664.228.921.421.427.32.579.686.579.991 0 .305-.152.671-.579.991a2.534 2.534 0 0 1-.921.42Z" />
          <path fillRule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25ZM12.75 6a.75.75 0 0 0-1.5 0v.816a3.836 3.836 0 0 0-1.72.756c-.712.566-1.112 1.35-1.112 2.178 0 .829.4 1.612 1.113 2.178.502.4 1.102.647 1.719.756v2.978a2.536 2.536 0 0 1-.921-.421l-.879-.66a.75.75 0 0 0-.9 1.2l.879.66c.533.4 1.169.645 1.821.75V18a.75.75 0 0 0 1.5 0v-.81a4.124 4.124 0 0 0 1.821-.749c.745-.559 1.179-1.344 1.179-2.191 0-.847-.434-1.632-1.179-2.191a4.122 4.122 0 0 0-1.821-.75V8.354c.29.082.559.213.786.393l.415.33a.75.75 0 0 0 .933-1.175l-.415-.33a3.836 3.836 0 0 0-1.719-.755V6Z" clipRule="evenodd" />
        </svg>
      ),
      bg: 'bg-primary-500/15',
      text: 'text-primary-400',
    },
    {
      label: 'Budget Used',
      value: '0%',
      change: 'of monthly',
      positive: true,
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
          <path fillRule="evenodd" d="M3 6a3 3 0 0 1 3-3h12a3 3 0 0 1 3 3v12a3 3 0 0 1-3 3H6a3 3 0 0 1-3-3V6Zm4.5 7.5a.75.75 0 0 1 .75.75v2.25a.75.75 0 0 1-1.5 0v-2.25a.75.75 0 0 1 .75-.75Zm3.75-1.5a.75.75 0 0 0-1.5 0v4.5a.75.75 0 0 0 1.5 0V12Zm2.25-3a.75.75 0 0 1 .75.75v6.75a.75.75 0 0 1-1.5 0V9.75A.75.75 0 0 1 13.5 9Zm3.75-1.5a.75.75 0 0 0-1.5 0v9a.75.75 0 0 0 1.5 0v-9Z" clipRule="evenodd" />
        </svg>
      ),
      bg: 'bg-accent-500/15',
      text: 'text-accent-400',
    },
  ];

  const upcomingPhases = [
    { phase: '3', name: 'Expense Management', icon: '💳' },
    { phase: '4', name: 'Income Tracking', icon: '💰' },
    { phase: '5', name: 'Full Dashboard', icon: '📊' },
    { phase: '6', name: 'Analytics & Charts', icon: '📈' },
    { phase: '7', name: 'Budget Planning', icon: '🎯' },
    { phase: '8', name: 'AI Insights', icon: '🤖' },
  ];

  return (
    <div className="min-h-screen bg-surface-950 text-white">
      {/* Ambient glows */}
      <div aria-hidden="true" className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 h-[500px] w-[500px] rounded-full bg-primary-600/10 blur-[120px]" />
        <div className="absolute bottom-0 right-0 h-[400px] w-[400px] rounded-full bg-accent-500/8 blur-[100px]" />
      </div>

      {/* ── Top Navbar ───────────────────────────────────────────── */}
      <header className="relative z-10 border-b border-white/5 bg-surface-900/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-brand shadow-glow-primary">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4 text-white" aria-hidden="true">
                <path d="M11.47 3.841a.75.75 0 0 1 1.06 0l8.69 8.69a.75.75 0 1 0 1.06-1.061l-8.689-8.69a2.25 2.25 0 0 0-3.182 0l-8.69 8.69a.75.75 0 1 0 1.061 1.06l8.69-8.689Z" />
                <path d="m12 5.432 8.159 8.159c.03.03.06.058.091.086v6.198c0 1.035-.84 1.875-1.875 1.875H15a.75.75 0 0 1-.75-.75v-4.5a.75.75 0 0 0-.75-.75h-3a.75.75 0 0 0-.75.75V21a.75.75 0 0 1-.75.75H5.625a1.875 1.875 0 0 1-1.875-1.875v-6.198a2.29 2.29 0 0 0 .091-.086L12 5.432Z" />
              </svg>
            </div>
            <span className="text-sm font-bold">
              <span className="gradient-text">Smart</span> Expense Tracker
            </span>
          </div>

          {/* User menu */}
          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-2 text-sm text-slate-400">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-brand text-xs font-bold text-white">
                {initials}
              </div>
              <span className="font-medium text-white">{user?.name}</span>
            </div>
            <button
              id="dashboard-logout"
              onClick={logout}
              className="btn-secondary px-4 py-2 text-sm"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4" aria-hidden="true">
                <path fillRule="evenodd" d="M3 4.25A2.25 2.25 0 0 1 5.25 2h5.5A2.25 2.25 0 0 1 13 4.25v2a.75.75 0 0 1-1.5 0v-2a.75.75 0 0 0-.75-.75h-5.5a.75.75 0 0 0-.75.75v11.5c0 .414.336.75.75.75h5.5a.75.75 0 0 0 .75-.75v-2a.75.75 0 0 1 1.5 0v2A2.25 2.25 0 0 1 10.75 18h-5.5A2.25 2.25 0 0 1 3 15.75V4.25Z" clipRule="evenodd" />
                <path fillRule="evenodd" d="M6 10a.75.75 0 0 1 .75-.75h9.546l-1.048-.943a.75.75 0 1 1 1.004-1.114l2.5 2.25a.75.75 0 0 1 0 1.114l-2.5 2.25a.75.75 0 1 1-1.004-1.114l1.048-.943H6.75A.75.75 0 0 1 6 10Z" clipRule="evenodd" />
              </svg>
              Sign out
            </button>
          </div>
        </div>
      </header>

      {/* ── Main content ─────────────────────────────────────────── */}
      <main className="relative z-10 mx-auto max-w-7xl px-6 py-10">
        {/* Welcome header */}
        <div className="mb-10 animate-fade-up">
          <h1 className="text-3xl font-bold tracking-tight">
            {greeting},{' '}
            <span className="gradient-text">{user?.name?.split(' ')[0] ?? 'there'}</span> 👋
          </h1>
          <p className="mt-1 text-slate-400">
            Welcome to your Smart Expense Tracker dashboard. Phase 2 authentication is complete.
          </p>
        </div>

        {/* Phase 2 success banner */}
        <div className="mb-8 flex items-start gap-4 rounded-2xl border border-success-500/30 bg-success-500/10 px-6 py-5 animate-fade-in">
          <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-success-500/20 text-success-400">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5" aria-hidden="true">
              <path fillRule="evenodd" d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm3.857-9.809a.75.75 0 0 0-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 1 0-1.06 1.061l2.5 2.5a.75.75 0 0 0 1.137-.089l4-5.5Z" clipRule="evenodd" />
            </svg>
          </div>
          <div>
            <p className="font-semibold text-success-400">Phase 2 — Authentication Complete ✓</p>
            <p className="mt-0.5 text-sm text-slate-400">
              You are securely signed in as <span className="text-white font-medium">{user?.email}</span>.
              Your session is persisted across page refreshes via localStorage.
            </p>
          </div>
        </div>

        {/* Quick stat cards */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-10">
          {quickStats.map(({ label, value, change, positive, icon, bg, text }) => (
            <div key={label} className="card p-5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-medium text-slate-400">{label}</p>
                  <p className="mt-2 text-2xl font-bold text-white">{value}</p>
                  <p className={`mt-1 text-xs ${positive ? 'text-success-400' : 'text-slate-500'}`}>
                    {change}
                  </p>
                </div>
                <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${bg} ${text}`}>
                  {icon}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Upcoming phases */}
        <div className="card p-6">
          <h2 className="mb-1 text-base font-semibold text-white">Coming Next</h2>
          <p className="mb-5 text-sm text-slate-400">
            The following phases will unlock full functionality.
          </p>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {upcomingPhases.map(({ phase, name, icon }) => (
              <div
                key={phase}
                className="flex items-center gap-3 rounded-xl border border-surface-700/50 bg-surface-900/50 px-4 py-3"
              >
                <span className="text-xl">{icon}</span>
                <div>
                  <p className="text-xs text-slate-500">Phase {phase}</p>
                  <p className="text-sm font-medium text-slate-300">{name}</p>
                </div>
                <span className="ml-auto badge-neutral text-xs">Soon</span>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}

export default Dashboard;
