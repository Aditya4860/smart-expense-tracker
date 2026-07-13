import useAuth from '../hooks/useAuth';

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

function initials(name) {
  if (!name) return '?';
  return name
    .split(' ')
    .slice(0, 2)
    .map(w => w[0]?.toUpperCase() ?? '')
    .join('');
}

export default function Dashboard() {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-surface-950 text-white">

      {/* Ambient glows */}
      <div aria-hidden="true" className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 h-[500px] w-[500px] rounded-full bg-primary-600/10 blur-[120px]" />
        <div className="absolute bottom-0 right-0 h-[400px] w-[400px] rounded-full bg-accent-500/8 blur-[100px]" />
      </div>

      {/* Navbar */}
      <header className="relative z-10 border-b border-white/5 bg-surface-900/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2.5">
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

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 text-sm">
              <div
                className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-brand text-xs font-bold text-white"
                aria-hidden="true"
              >
                {initials(user?.name)}
              </div>
              <span className="font-medium text-slate-200">{user?.name}</span>
            </div>

            <button
              id="dashboard-logout"
              type="button"
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

      {/* Main */}
      <main className="relative z-10 mx-auto max-w-5xl px-6 py-12">

        {/* Welcome block */}
        <div className="mb-10 animate-fade-up">
          <p className="text-sm font-medium text-primary-400 mb-1">{greeting()}</p>
          <h1 className="text-4xl font-bold tracking-tight">
            {user?.name?.split(' ')[0] ?? 'there'} 👋
          </h1>
          <p className="mt-2 text-slate-400">
            Welcome to your dashboard. Here's a summary of your account.
          </p>
        </div>

        {/* Profile card */}
        <div className="mb-8 card p-6 flex flex-col sm:flex-row items-start sm:items-center gap-5 animate-fade-in">
          <div className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-2xl bg-gradient-brand text-2xl font-bold text-white shadow-glow-primary">
            {initials(user?.name)}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-lg font-semibold text-white truncate">{user?.name}</p>
            <p className="text-sm text-slate-400 truncate">{user?.email}</p>
            <p className="mt-1 text-xs text-slate-600 font-mono truncate">{user?.id}</p>
          </div>
          <span className="badge badge-success text-xs flex-shrink-0">
            <span className="h-1.5 w-1.5 rounded-full bg-success-400 animate-pulse" />
            Active session
          </span>
        </div>

        {/* Info grid */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div className="card p-5">
            <p className="text-xs font-medium text-slate-500 mb-1">Display name</p>
            <p className="text-sm font-semibold text-white">{user?.name ?? '—'}</p>
          </div>
          <div className="card p-5">
            <p className="text-xs font-medium text-slate-500 mb-1">Email address</p>
            <p className="text-sm font-semibold text-white truncate">{user?.email ?? '—'}</p>
          </div>
          <div className="card p-5">
            <p className="text-xs font-medium text-slate-500 mb-1">Session status</p>
            <p className="text-sm font-semibold text-success-400">Authenticated</p>
          </div>
        </div>
      </main>
    </div>
  );
}
