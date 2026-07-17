# Smart Expense Tracker - Architecture

## Overview

Smart Expense Tracker is a modern full-stack personal finance application.

Frontend is built first using React.

Backend will later be integrated using FastAPI.

Current data storage uses localStorage.

Future data storage will use PostgreSQL.

---

# Technology Stack

Frontend

- React 18
- Vite
- JavaScript
- Tailwind CSS
- React Router
- Context API

Backend (Planned)

- FastAPI
- SQLAlchemy
- Alembic
- JWT Authentication

Database

- PostgreSQL (Supabase)

Deployment

Frontend
- Vercel

Backend
- Render

---

# Folder Structure

src/

components/

layout/

dashboard/

expenses/

income/

analytics/

budget/

ui/

context/

hooks/

pages/

layouts/

services/

utils/

constants/

assets/

styles/

---

# Data Flow

User

↓

Login

↓

AuthContext

↓

ProtectedRoute

↓

DashboardLayout

↓

ExpenseContext

↓

IncomeContext

↓

Dashboard

↓

Analytics

---

# State Management

AuthContext

Stores

- User
- Token
- Authentication state

ExpenseContext

Stores

- Expense List
- CRUD
- Search
- Filter
- Sort

IncomeContext

Stores

- Income List
- CRUD
- Search
- Filter
- Sort

Future

BudgetContext

AnalyticsContext

ThemeContext

---

# Routing

/

Landing

/login

/register

/dashboard

/expenses

/income

/analytics

/budget

/settings

---

# Shared Components

Button

Card

Input

Modal

LoadingSpinner

EmptyState

Skeleton

---

# Storage

Current

localStorage

Future

FastAPI API

↓

PostgreSQL

---

# Coding Principles

- Functional Components
- Hooks
- Reusable Components
- No duplicated logic
- Context API
- Modular folders
- Responsive design
- Accessibility
- Clean architecture

---

# Future Features

Budget Management

Analytics

Charts

Reports

AI Insights

Notifications

Recurring Transactions

CSV Import

PDF Export

Cloud Sync
