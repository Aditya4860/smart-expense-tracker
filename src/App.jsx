import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

/**
 * App.jsx — Root component.
 *
 * Responsibilities:
 *  - Wraps the entire application in BrowserRouter
 *  - Defines the top-level route structure
 *  - Acts as the single composition root for global providers (added phase by phase)
 *
 * Route structure will grow across phases:
 *  Phase 1  → Scaffold placeholder
 *  Phase 2  → Auth routes + ProtectedRoute guard
 *  Phase 3+ → Feature routes (Expenses, Income, Dashboard, etc.)
 */
function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Temporary scaffold landing — replaced in Phase 2 with AppShell + Dashboard */}
        <Route path="/" element={<ScaffoldLanding />} />

        {/* Catch-all redirect */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

/* --------------------------------------------------------------------------
   Scaffold Landing — visible only during Phase 1.
   Replaced by the real Dashboard in Phase 5.
   -------------------------------------------------------------------------- */
function ScaffoldLanding() {
  return (
    <div className="min-h-screen bg-surface-950 flex flex-col items-center justify-center px-4">
      {/* Ambient glow */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 overflow-hidden"
      >
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 h-[600px] w-[600px] rounded-full bg-primary-600/20 blur-[120px]" />
        <div className="absolute top-1/2 -right-40 h-[400px] w-[400px] rounded-full bg-accent-500/10 blur-[100px]" />
      </div>

      <div className="relative z-10 flex flex-col items-center text-center gap-6 animate-fade-up">
        {/* Logo mark */}
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-brand shadow-glow-primary">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            className="h-8 w-8 text-white"
            aria-hidden="true"
          >
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
          </svg>
        </div>

        {/* Heading */}
        <div className="space-y-2">
          <h1 className="text-4xl font-bold tracking-tight">
            <span className="gradient-text">Smart Expense</span>
            <span className="text-white"> Tracker</span>
          </h1>
          <p className="text-slate-400 text-lg max-w-md">
            Production scaffold is live. Phase 1 complete — ready for Phase 2.
          </p>
        </div>

        {/* Status badges */}
        <div className="flex flex-wrap items-center justify-center gap-2 mt-2">
          {[
            { label: 'Vite 5',          color: 'badge-primary'  },
            { label: 'React 18',        color: 'badge-primary'  },
            { label: 'Tailwind CSS 3',  color: 'badge-primary'  },
            { label: 'React Router 6',  color: 'badge-success'  },
            { label: 'Axios',           color: 'badge-success'  },
            { label: 'Phase 1 ✓',      color: 'badge-neutral'  },
          ].map(({ label, color }) => (
            <span key={label} className={color}>
              {label}
            </span>
          ))}
        </div>

        {/* Phase checklist */}
        <div className="card w-full max-w-sm mt-4 p-5 text-left space-y-3">
          <h2 className="text-sm font-semibold text-slate-300 uppercase tracking-wider">
            Phase Roadmap
          </h2>
          <ul className="space-y-2 text-sm">
            {[
              { phase: '1 — Foundation',  done: true  },
              { phase: '2 — Auth',        done: false },
              { phase: '3 — Expenses',    done: false },
              { phase: '4 — Income',      done: false },
              { phase: '5 — Dashboard',   done: false },
              { phase: '6 — Analytics',   done: false },
              { phase: '7 — Budget',      done: false },
              { phase: '8 — AI Insights', done: false },
              { phase: '9 — Reports',     done: false },
              { phase: '10 — Backend',    done: false },
            ].map(({ phase, done }) => (
              <li key={phase} className="flex items-center gap-2.5">
                <span
                  className={`flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full text-xs ${
                    done
                      ? 'bg-success-500/20 text-success-400'
                      : 'bg-surface-700 text-slate-600'
                  }`}
                  aria-hidden="true"
                >
                  {done ? '✓' : '○'}
                </span>
                <span className={done ? 'text-success-400' : 'text-slate-500'}>
                  Phase {phase}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

export default App;
