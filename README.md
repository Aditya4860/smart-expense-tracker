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

# ⚡ Quick Start

```bash
git clone <repository-url>
cd expense-tracker

# Backend
cd backend
py -3.12 -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
python -m uvicorn main:app --reload
```

Open a new terminal:

```bash
cd frontend
npm install
npm run dev
```

Frontend:
http://localhost:5173

Backend:
http://127.0.0.1:8000

API Docs:
http://127.0.0.1:8000/docs


---

# 🚀 Getting Started

## Prerequisites

Make sure the following software is installed before running the project.

### Frontend

- Node.js 22.x or later
- npm (comes with Node.js)

### Backend

- Python 3.12.x (recommended)
- PostgreSQL 16+
- Git

> **Note:** Python 3.14 is currently not recommended because some dependencies (such as `asyncpg`) may have compatibility issues.

---

# 📁 Project Structure

```
expense-tracker/
│
├── frontend/
│   ├── src/
│   ├── public/
│   ├── package.json
│   └── ...
│
├── backend/
│   ├── app/
│   ├── alembic/
│   ├── tests/
│   ├── requirements.txt
│   ├── main.py
│   └── ...
│
├── README.md
└── .gitignore
```

---

# ⚙️ Backend Setup

## 1. Navigate to the backend

```bash
cd backend
```

## 2. Create a virtual environment

```bash
py -3.12 -m venv .venv
```

## 3. Activate the virtual environment

### Windows

```powershell
.\.venv\Scripts\Activate.ps1
```

### Linux/macOS

```bash
source .venv/bin/activate
```

---

## 4. Install dependencies

```bash
pip install -r requirements.txt
```

---

## 5. Configure environment variables

Create a `.env` file inside the `backend` directory.

Example:

```env
PROJECT_NAME=Smart Expense Tracker API

SECRET_KEY=your-super-secret-key

DATABASE_URL=postgresql+asyncpg://postgres:password@localhost:5432/expense_tracker

ACCESS_TOKEN_EXPIRE_MINUTES=1440
REFRESH_TOKEN_EXPIRE_MINUTES=10080

ALGORITHM=HS256

BACKEND_CORS_ORIGINS=["http://localhost:5173"]
```

---

## 6. Run the backend

```bash
python -m uvicorn main:app --reload
```

Backend API

```
http://127.0.0.1:8000
```

Swagger Documentation

```
http://127.0.0.1:8000/docs
```

OpenAPI JSON

```
http://127.0.0.1:8000/openapi.json
```

---

# 💻 Frontend Setup

## 1. Navigate to frontend

```bash
cd frontend
```

## 2. Install packages

```bash
npm install
```

## 3. Run the development server

```bash
npm run dev
```

Frontend

```
http://localhost:5173
```

---

# 🗄 Database Setup

Create a PostgreSQL database.

Example

```sql
CREATE DATABASE expense_tracker;
```

Update the `DATABASE_URL` inside `.env`.

Run database migrations.

```bash
alembic upgrade head
```

---

# 🧪 Running Tests

Backend

```bash
pytest
```

Frontend

```bash
npm test
```

---

# 🔧 Common Commands

### Backend

```bash
python -m uvicorn main:app --reload
```

```bash
alembic revision --autogenerate -m "Migration Name"
```

```bash
alembic upgrade head
```

---

### Frontend

```bash
npm run dev
```

```bash
npm run build
```

```bash
npm run preview
```

---

# 🛠 Technology Stack

## Frontend

- React
- Vite
- TypeScript
- Tailwind CSS
- React Router
- Axios

## Backend

- FastAPI
- SQLAlchemy
- Alembic
- PostgreSQL
- AsyncPG
- JWT Authentication
- Pydantic

---

# 📌 Development Notes

- Use **Python 3.12.x** for backend development.
- Keep the virtual environment activated while working on the backend.
- Do not commit `.env`, `.venv`, `node_modules`, or `dist`.
- Use migrations for all database schema changes.
