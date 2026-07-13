# Smart Expense Tracker

A production-quality full-stack expense tracking application built for software engineering portfolio placements.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend Framework | React 18 + Vite 5 |
| Language | JavaScript (ES2022+) |
| Styling | Tailwind CSS v3 |
| Routing | React Router v6 |
| HTTP Client | Axios |
| Backend *(Phase 2)* | FastAPI + PostgreSQL |
| Auth *(Phase 2)* | JWT |

---

## Prerequisites

- [Node.js](https://nodejs.org/) v18 or higher
- npm v9 or higher

---

## Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/your-username/expense-tracker.git
cd expense-tracker
```

### 2. Install dependencies

```bash
npm install
```

### 3. Start the development server

```bash
npm run dev
```

The app will open at [http://localhost:3000](http://localhost:3000).

---

## Available Scripts

| Script | Description |
|---|---|
| `npm run dev` | Start development server on port 3000 |
| `npm run build` | Build production bundle to `dist/` |
| `npm run preview` | Preview production build locally |
| `npm run lint` | Run ESLint across all source files |

---

## Project Structure

```
src/
├── api/            # Axios instance + per-domain API modules
├── assets/         # Static assets (icons, images)
├── components/     # Shared reusable UI components
├── constants/      # App-wide constant values
├── context/        # React Context providers
├── hooks/          # Custom React hooks
├── layouts/        # Page layout shells (AppShell, Sidebar, Navbar)
├── pages/          # Route-level page components
├── services/       # Business logic layer (pure functions)
├── styles/         # Global CSS (design tokens, animations)
├── utils/          # Pure utility helpers
├── App.jsx         # Root component with router
└── main.jsx        # Application entry point
```

---

## Phase Roadmap

| Phase | Status | Scope |
|---|---|---|
| 1 — Foundation | ✅ Complete | Scaffold, Tailwind, routing, layout |
| 2 — Auth | 🔲 Planned | Login, Register, JWT, ProtectedRoute |
| 3 — Expenses | 🔲 Planned | Expense CRUD, categories, filters |
| 4 — Income | 🔲 Planned | Income CRUD |
| 5 — Dashboard | 🔲 Planned | Summary cards, recent transactions |
| 6 — Analytics | 🔲 Planned | Charts, trends, breakdowns |
| 7 — Budget | 🔲 Planned | Budget goals, progress tracking |
| 8 — AI Insights | 🔲 Planned | GPT-backed suggestions |
| 9 — Reports | 🔲 Planned | PDF/CSV export |
| 10 — Backend | 🔲 Planned | FastAPI, PostgreSQL, JWT |
| 11 — Deployment | 🔲 Planned | Docker, CI/CD, cloud |

---

## Environment Variables

Create a `.env.local` file in the project root for environment-specific config:

```env
VITE_API_BASE_URL=http://localhost:8000/api/v1
```

---

## License

MIT
