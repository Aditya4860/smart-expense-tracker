# Changelog

All notable changes to this project are documented in this file.

The format follows [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).
This project adheres to [Semantic Versioning](https://semver.org/).

---

## [Unreleased]

### In Progress
- Backend integration — replacing localStorage with FastAPI + PostgreSQL
- JWT authentication migration (access + refresh token flow)

---

## [1.0.0] — 2026-07

### Added

**Authentication**
- User registration with email and password
- Login with session persistence via localStorage
- Protected route guard (`ProtectedRoute`) redirecting unauthenticated users
- Logout with full state reset

**Dashboard**
- Financial summary cards (total income, total expenses, net balance, savings rate)
- Top spending category widget with share percentage
- Budget overview, alert, and progress widgets
- Goals overview, progress, upcoming deadlines, and insights widgets
- Recent transactions feed
- Quick action buttons (add expense, add income, set budget, add goal)
- Financial health indicator score

**Expense Management**
- Full CRUD — add, edit, delete expenses
- Fields: amount, merchant, category, payment method, date, description, receipt URL
- Search by merchant or description
- Filter by category, payment method, and date range
- Sort by date, amount, and merchant
- Expense summary totals

**Income Management**
- Full CRUD — add, edit, delete income entries
- Fields: amount, source, category, date, description
- Search, filter, and sort (matching expense feature parity)
- Income summary totals

**Budget Management**
- Set monthly budgets per category
- Live progress bars showing spending vs. budget
- Overspend detection with alerts
- Remaining budget calculation

**Financial Goals**
- Create goals with target amount, name, and deadline
- Track contributions per goal
- Projected completion date calculation
- Goal insights (on-track / at-risk indicator)

**Analytics**
- Monthly cash flow chart (income vs. expenses over time)
- Expense breakdown by category (pie chart)
- Income breakdown by category (pie chart)
- Financial health score with colour-coded indicator

**Reports**
- Filterable transaction report (by type, category, date range)
- CSV export
- PDF report generation

**Category Management**
- Create, edit, and delete custom categories
- Assign icon and colour to each category
- Categories scoped to expense or income type

**Application Infrastructure**
- React 18 + Vite 5 project setup
- Tailwind CSS design system
- React Router v6 with nested protected routes
- 9-provider Context API tree
- Service layer with localStorage adapters
- Custom hooks per domain (useExpenses, useIncome, useBudget, useGoals, useAnalytics)
- Shared UI component library (Button, Card, Input, Modal, Skeleton, EmptyState)
- Dark / light theme toggle via ThemeContext
- Responsive sidebar with mobile drawer

**Backend (FastAPI)**
- FastAPI application with versioned API router (`/api/v1`)
- SQLAlchemy ORM models: User, Expense, Income, Budget, Goal, GoalContribution, Category, Notification, RecurringTransaction, AuditLog
- Pydantic v2 schemas for all request/response types
- Repository pattern data access layer
- JWT access and refresh token security
- bcrypt password hashing
- Rate limiting middleware
- Input sanitization middleware
- Security response headers (CSP, HSTS, X-Frame-Options, X-Content-Type-Options)
- Sensitive parameter redaction in request logs
- Structured exception handlers (BaseAPIException, IntegrityError, SQLAlchemy, validation)
- Alembic migration setup
- `/health` endpoint
- Swagger UI at `/docs`, ReDoc at `/redoc`

---

[Unreleased]: https://github.com/Aditya4860/smart-expense-tracker/compare/v1.0.0...HEAD
[1.0.0]: https://github.com/Aditya4860/smart-expense-tracker/releases/tag/v1.0.0
