<div align="center">

<h1>Smart Expense Tracker</h1>

<p>A full-stack personal finance application — React 18 frontend backed by a production-grade FastAPI REST API with PostgreSQL, JWT authentication, and hardened security middleware.</p>

<p>
  <img src="https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react&logoColor=black" alt="React 18"/>
  <img src="https://img.shields.io/badge/Vite-5-646CFF?style=flat-square&logo=vite&logoColor=white" alt="Vite 5"/>
  <img src="https://img.shields.io/badge/Tailwind_CSS-3-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white" alt="Tailwind CSS"/>
  <img src="https://img.shields.io/badge/FastAPI-009688?style=flat-square&logo=fastapi&logoColor=white" alt="FastAPI"/>
  <img src="https://img.shields.io/badge/PostgreSQL-4169E1?style=flat-square&logo=postgresql&logoColor=white" alt="PostgreSQL"/>
  <img src="https://img.shields.io/badge/Python-3.12-3776AB?style=flat-square&logo=python&logoColor=white" alt="Python 3.12"/>
</p>

<p>
  <img src="https://img.shields.io/badge/License-MIT-blue?style=flat-square" alt="License"/>
  <img src="https://img.shields.io/github/last-commit/Aditya4860/smart-expense-tracker?style=flat-square" alt="Last Commit"/>
  <img src="https://img.shields.io/badge/API-v1-58a6ff?style=flat-square" alt="API v1"/>
  <img src="https://img.shields.io/badge/status-active-2ea043?style=flat-square" alt="Status"/>
</p>

</div>

---

## Overview

**Smart Expense Tracker** is a personal finance management application built for production-level software engineering demonstration. It provides full CRUD expense and income tracking, category-based budget management, financial goal monitoring, visual analytics, and CSV/PDF report generation.

The backend is a hardened **FastAPI** application with async PostgreSQL (via SQLAlchemy + asyncpg), repository pattern data access, JWT access and refresh tokens, rate limiting, input sanitization, and CSP/HSTS security headers. The frontend is a React 18 SPA with a 9-provider Context API tree, domain-scoped custom hooks, and a Recharts analytics suite.

---

## Features

| Module | Capabilities |
|---|---|
| **Authentication** | JWT access + refresh tokens, protected routes, registration, logout |
| **Expenses** | Full CRUD, merchant/category/payment method fields, search, filter, sort |
| **Income** | Full CRUD, source/category fields, search, filter, sort |
| **Budgets** | Monthly category budgets, live progress bars, overspend alerts |
| **Goals** | Target amount, deadline, contribution tracking, projected completion |
| **Analytics** | Monthly cash flow chart, category pie charts, financial health score |
| **Reports** | Filterable transaction report, CSV export, PDF generation |
| **Categories** | Custom categories with icon and colour, scoped by type |
| **Dashboard** | Summary cards, top category widget, recent transactions, quick actions |
| **Security** | Rate limiting, input sanitization, CSP, HSTS, X-Frame-Options headers |

---

## Architecture

```mermaid
graph TD
    A[React 18 SPA] -->|Axios / REST| B[FastAPI /api/v1]
    B --> C[JWT Middleware]
    B --> D[Rate Limiter]
    B --> E[Input Sanitizer]
    B --> F[Routers]
    F --> G[Services]
    G --> H[Repositories]
    H --> I[SQLAlchemy ORM]
    I --> J[(PostgreSQL)]
    K[Alembic] -->|Migrations| J

    classDef frontend fill:#61DAFB,color:#000,stroke:none
    classDef backend fill:#009688,color:#fff,stroke:none
    classDef data fill:#4169E1,color:#fff,stroke:none
    class A frontend
    class B,C,D,E,F,G,H backend
    class I,J,K data
```

**Frontend layer**
- React 18 + Vite 5 + Tailwind CSS v3
- React Router v6 with nested protected routes
- 9-provider Context API tree (Auth, Theme, Expenses, Income, Budget, Goals, Analytics, Categories, Notifications)
- Domain-scoped custom hooks: `useExpenses`, `useIncome`, `useBudget`, `useGoals`, `useAnalytics`
- Recharts for all data visualizations

**Backend layer**
- FastAPI with versioned router (`/api/v1`)
- SQLAlchemy async ORM + asyncpg driver
- Repository pattern — clean separation of data access from business logic
- Pydantic v2 schemas for all request/response validation
- bcrypt password hashing
- Structured exception handlers for `BaseAPIException`, `IntegrityError`, `SQLAlchemyError`
- Consistent JSON envelope: `{ success, message, data }`

---

## Folder Structure

```text
expense-tracker/
│
├── frontend/
│   ├── src/
│   │   ├── pages/            # 12 pages (Dashboard, Expenses, Income, Budget, Goals…)
│   │   ├── components/       # Shared UI components (Button, Card, Modal, Skeleton…)
│   │   ├── context/          # 9 React context providers
│   │   ├── hooks/            # Domain-scoped custom hooks
│   │   ├── services/         # localStorage adapters and API service layer
│   │   ├── constants/        # App-wide constants
│   │   ├── utils/            # Helper functions
│   │   ├── styles/           # Global CSS
│   │   └── App.jsx           # Root component and router
│   ├── index.html
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── package.json
│
├── backend/
│   ├── app/
│   │   ├── api/v1/           # Versioned API routes (auth, expenses, income, budget…)
│   │   ├── core/             # Config, security, database, exceptions, logging
│   │   ├── models/           # SQLAlchemy ORM models
│   │   ├── schemas/          # Pydantic v2 request/response schemas
│   │   ├── repositories/     # Data access layer (repository pattern)
│   │   ├── services/         # Business logic layer
│   │   ├── middleware/       # Rate limiting, input sanitization
│   │   └── utils/            # Shared utilities
│   ├── alembic/              # Database migration scripts
│   ├── tests/                # Pytest test suite
│   ├── main.py               # App entry point, middleware stack, exception handlers
│   ├── alembic.ini           # Alembic configuration
│   ├── requirements.txt      # Python dependencies
│   ├── .env.example          # Environment variable template
│   └── seed_test_user.py     # Seeds a test user for local development
│
├── docs/                     # API docs, architecture, design notes, roadmap
├── .github/                  # Issue templates, PR template
├── .gitignore
├── CHANGELOG.md
├── LICENSE
└── README.md
```

---

## Installation

### Prerequisites

| Requirement | Version |
|---|---|
| Node.js | 18.x or later |
| Python | 3.12.x (recommended) |
| PostgreSQL | 15+ |
| Git | Latest |

> Python 3.14 is not recommended — some dependencies (`asyncpg`) may have compatibility issues.

---

### Backend Setup

**1. Navigate to the backend directory**
```bash
cd backend
```

**2. Create and activate a virtual environment**
```bash
# Windows
py -3.12 -m venv .venv
.venv\Scripts\activate

# macOS / Linux
python3.12 -m venv .venv
source .venv/bin/activate
```

**3. Install dependencies**
```bash
pip install -r requirements.txt
```

**4. Configure environment variables**
```bash
cp .env.example .env
```

Edit `.env` with your values:
```env
PROJECT_NAME="Smart Expense Tracker API"
SECRET_KEY=your-super-secret-key
DATABASE_URL=postgresql+asyncpg://postgres:postgres@localhost:5432/expense_tracker
BACKEND_CORS_ORIGINS=http://localhost:5173
ACCESS_TOKEN_EXPIRE_MINUTES=1440
ALGORITHM=HS256
```

**5. Create the database**
```sql
CREATE DATABASE expense_tracker;
```

**6. Run migrations**
```bash
alembic upgrade head
```

**7. (Optional) Seed a test user**
```bash
python seed_test_user.py
```

**8. Start the backend**
```bash
uvicorn main:app --reload
```

| Endpoint | URL |
|---|---|
| API Base | `http://127.0.0.1:8000/api/v1` |
| Swagger UI | `http://127.0.0.1:8000/docs` |
| ReDoc | `http://127.0.0.1:8000/redoc` |
| Health Check | `http://127.0.0.1:8000/health` |

---

### Frontend Setup

**1. Navigate to the frontend directory**
```bash
cd frontend
```

**2. Install packages**
```bash
npm install
```

**3. Start the development server**
```bash
npm run dev
```

Frontend runs at `http://localhost:5173`.

> To run both frontend and backend concurrently from the `frontend/` directory:
> ```bash
> npm run dev
> ```
> This uses `concurrently` to launch both processes together.

---

## API Overview

All endpoints are prefixed with `/api/v1` and return a consistent envelope:

```json
{ "success": true, "message": "Operation successful", "data": { ... } }
```

| Resource | Endpoints |
|---|---|
| Auth | `POST /auth/register`, `POST /auth/login`, `POST /auth/refresh`, `POST /auth/logout` |
| Expenses | `GET/POST /expenses`, `GET/PUT/DELETE /expenses/{id}` |
| Income | `GET/POST /income`, `GET/PUT/DELETE /income/{id}` |
| Budget | `GET/POST /budget`, `PUT/DELETE /budget/{id}` |
| Goals | `GET/POST /goals`, `GET/PUT/DELETE /goals/{id}`, `POST /goals/{id}/contribute` |
| Analytics | `GET /analytics/cashflow`, `GET /analytics/categories`, `GET /analytics/health-score` |
| Categories | `GET/POST /category`, `PUT/DELETE /category/{id}` |
| Reports | `GET /reports/transactions`, `GET /reports/export/csv`, `GET /reports/export/pdf` |

Full interactive documentation is available at `/docs` when the backend is running.

---

## Screenshots

> Screenshots are planned for the next milestone. Pages to capture:
> - Landing page and login/register flow
> - Dashboard — summary cards, recent transactions
> - Expenses page — list view with filters active
> - Budget page — progress bars with an overspend alert
> - Analytics page — cash flow chart and pie charts
> - Reports page — with CSV export button visible

---

## Future Improvements

- [ ] Complete backend integration — replace localStorage with live API calls
- [ ] Recurring transactions with automated scheduling
- [ ] Multi-currency support with real-time exchange rates
- [ ] Progressive Web App (PWA) for mobile installation
- [ ] Bank account linking (Plaid or similar)
- [ ] Email notifications for budget alerts and due dates
- [ ] Docker Compose setup for one-command local startup
- [ ] CI/CD pipeline with GitHub Actions

---

## Development Notes

- Use **Python 3.12.x** for the backend; keep the virtual environment activated.
- Do not commit `.env`, `.venv`, `node_modules`, or `dist`.
- All database schema changes must go through Alembic migrations.
- Run `alembic revision --autogenerate -m "description"` after model changes.

---

## Contributing

Contributions are welcome. Please read the [PR template](.github/PULL_REQUEST_TEMPLATE.md) before submitting.

1. Fork the repository
2. Create a feature branch (`git checkout -b feat/your-feature`)
3. Commit using [Conventional Commits](https://www.conventionalcommits.org/) (`git commit -m 'feat: add recurring transactions'`)
4. Push and open a Pull Request against `main`

---

## Changelog

See [CHANGELOG.md](CHANGELOG.md) for a full release history.

---

## License

This project is licensed under the [MIT License](LICENSE).

---

## Author

**Aditya Jain** — CS Engineering Student, VIT Bhopal University

[![GitHub](https://img.shields.io/badge/GitHub-Aditya4860-181717?style=flat-square&logo=github)](https://github.com/Aditya4860)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-aditya--jain0315-0A66C2?style=flat-square&logo=linkedin)](https://www.linkedin.com/in/aditya-jain0315/)
