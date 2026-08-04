# Architecture — Smart Expense Tracker

> Last updated: August 2026

---

## Overview

Smart Expense Tracker is a decoupled, full-stack personal finance application. The frontend and backend are independent services that communicate over HTTP. This separation allows each tier to be developed, tested, and deployed independently.

---

## System Architecture

```
┌────────────────────────────────────────────────────────────┐
│                     React Frontend                         │
│         Vite · Tailwind CSS · React Router v6              │
│              Context API · Recharts · Axios                │
└──────────────────────────┬─────────────────────────────────┘
                           │ HTTP REST  /api/v1/*
                           │ JWT Bearer Token (Authorization header)
┌──────────────────────────▼─────────────────────────────────┐
│                    FastAPI Backend                          │
│   Security Headers · Rate Limiting · Input Sanitization    │
│   JWT Auth Middleware · Repository Pattern                 │
│   Pydantic Schemas · SQLAlchemy ORM                        │
└──────────────────────────┬─────────────────────────────────┘
                           │ SQLAlchemy / asyncpg
┌──────────────────────────▼─────────────────────────────────┐
│              PostgreSQL  (Supabase managed)                │
│  users · expenses · income · categories · budgets          │
│  goals · goal_contributions · notifications                │
│  recurring_transactions · audit_logs                       │
└────────────────────────────────────────────────────────────┘
```

---

## Frontend Architecture

### Technology

| Layer | Choice | Reason |
|---|---|---|
| Framework | React 18 | Component model, ecosystem |
| Build | Vite 5 | Fast HMR, minimal config |
| Styling | Tailwind CSS 3 | Design system via utility classes |
| Routing | React Router v6 | Nested routes, protected routes |
| State | Context API | Sufficient for current scale |
| Charts | Recharts 3 | Composable, responsive |
| HTTP | Axios | Interceptors, timeout handling |
| Icons | Lucide React | Consistent, tree-shakeable |

### State Management

Each feature domain has its own Context + Provider:

| Context | Manages |
|---|---|
| `AuthContext` | User session, tokens, login/logout |
| `ThemeContext` | Dark/light theme preference |
| `CategoryContext` | Custom categories with icons and colours |
| `ExpenseContext` | Expense list, CRUD, search, filter, sort |
| `IncomeContext` | Income list, CRUD, search, filter, sort |
| `BudgetContext` | Budget limits, progress, alerts |
| `GoalContext` | Financial goals, contributions, projections |
| `AnalyticsContext` | Derived financial summaries and health score |
| `TransactionContext` | Unified transaction feed (expenses + income) |

### Provider Tree

```jsx
<AuthProvider>
  <ThemeProvider>
    <CategoryProvider>
      <TransactionProvider>
        <ExpenseProvider>
          <IncomeProvider>
            <AnalyticsProvider>
              <BudgetProvider>
                <GoalProvider>
                  <BrowserRouter>
                    <Routes />
                  </BrowserRouter>
                </GoalProvider>
              </BudgetProvider>
            </AnalyticsProvider>
          </IncomeProvider>
        </ExpenseProvider>
      </TransactionProvider>
    </CategoryProvider>
  </ThemeProvider>
</AuthProvider>
```

### Route Structure

| Route | Component | Access |
|---|---|---|
| `/` | `Landing` | Public |
| `/login` | `Login` | Public |
| `/register` | `Register` | Public |
| `/dashboard` | `Dashboard` | Protected |
| `/expenses` | `Expenses` | Protected |
| `/income` | `Income` | Protected |
| `/analytics` | `Analytics` | Protected |
| `/budget` | `Budget` | Protected |
| `/goals` | `Goals` | Protected |
| `/reports` | `Reports` | Protected |
| `/categories` | `Categories` | Protected |

### Current Data Storage

The frontend currently uses localStorage via the service layer. All context providers call service functions that read/write JSON to localStorage keys. When the backend integration is complete, these service calls will be replaced with Axios API calls — the context and component layers remain unchanged.

```
Component
    │ calls hook
    ▼
Custom Hook (useExpenses, useBudget, …)
    │ calls service
    ▼
Service Layer (expenseStorage.js / API client)
    │
    ▼
localStorage  →  (future) FastAPI backend
```

---

## Backend Architecture

### Technology

| Layer | Choice |
|---|---|
| Framework | FastAPI 0.115 |
| ORM | SQLAlchemy 2.x |
| Migrations | Alembic |
| Validation | Pydantic v2 |
| Auth | python-jose (JWT), bcrypt |
| Database | PostgreSQL 16 |
| Config | pydantic-settings |

### Layer Responsibilities

```
HTTP Request
    │
    ▼
FastAPI Router           ← validates path/query params, calls service
    │
    ▼
Pydantic Schema          ← validates and deserialises request body
    │
    ▼
Service Layer            ← business logic, financial calculations
    │
    ▼
Repository Layer         ← all database queries (SQLAlchemy)
    │
    ▼
SQLAlchemy Models        ← ORM table definitions
    │
    ▼
PostgreSQL
```

**Rule:** Business logic stays in services. Database access stays in repositories. Route handlers contain no logic beyond calling a service and returning its result.

### Middleware Stack (outermost → innermost)

1. **CORS** — origin allowlist from settings
2. **Security Headers** — injects CSP, HSTS, X-Frame-Options, etc. on every response
3. **Request Logging** — logs method, path, status, duration; warns on > 500 ms
4. **Sensitive Parameter Redaction** — masks `token`, `secret`, `password`, `key` in logs

### Database Models

| Model | Table | Key Fields |
|---|---|---|
| `User` | `users` | id, email, hashed_password, is_active |
| `Expense` | `expenses` | id, user_id, amount, category_id, date, merchant |
| `Income` | `income` | id, user_id, amount, category_id, date, source |
| `Category` | `categories` | id, user_id, name, type, icon, colour |
| `Budget` | `budgets` | id, user_id, category_id, amount, period |
| `Goal` | `goals` | id, user_id, name, target_amount, deadline |
| `GoalContribution` | `goal_contributions` | id, goal_id, amount, date |
| `Notification` | `notifications` | id, user_id, message, is_read |
| `RecurringTransaction` | `recurring_transactions` | id, user_id, type, amount, frequency |
| `AuditLog` | `audit_logs` | id, user_id, action, resource |

All models inherit from `BaseModel` which provides `id` (UUID), `created_at`, and `updated_at`.

### API Design

- All endpoints are versioned under `/api/v1/`.
- Successful responses are wrapped: `{ "success": true, "message": "...", "data": ... }`.
- Error responses follow the same envelope: `{ "success": false, "message": "...", "errors": [] }`.
- Interactive documentation: `/docs` (Swagger UI), `/redoc` (ReDoc).

---

## Security

| Concern | Implementation |
|---|---|
| Authentication | JWT access tokens (24 h) + refresh tokens (7 days) |
| Password storage | bcrypt hashing |
| CORS | Explicit allowlist — no wildcard |
| XSS | `X-XSS-Protection: 0`, CSP header |
| Clickjacking | `X-Frame-Options: DENY` |
| MIME sniffing | `X-Content-Type-Options: nosniff` |
| Transport security | `Strict-Transport-Security` (1 year + subdomains) |
| Log safety | Sensitive query parameters redacted before logging |
| DB conflicts | IntegrityError caught and sanitised — internal schema not exposed |

---

## Deployment Plan

| Service | Platform |
|---|---|
| Frontend | Vercel (automatic Next.js / Vite detection) |
| Backend | Render (Python web service) |
| Database | Supabase (managed PostgreSQL) |
| CI/CD | GitHub Actions (planned) |
