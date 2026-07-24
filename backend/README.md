# Smart Expense Tracker Backend

This is the backend foundation for the Smart Expense Tracker project. It is built using modern asynchronous Python architecture with FastAPI, SQLAlchemy 2.0, Alembic, and PostgreSQL.

## Technologies Used
- **Python 3.12+**
- **FastAPI**: Web framework for building APIs with Python 3.8+ based on standard Python type hints.
- **SQLAlchemy 2.0**: The Python SQL Toolkit and Object Relational Mapper (using `asyncio`).
- **Alembic**: Lightweight database migration tool for usage with the SQLAlchemy.
- **Pydantic v2**: Data validation and settings management using Python type annotations.
- **PostgreSQL**: Powerful, open source object-relational database system.
- **Uvicorn**: ASGI web server implementation for Python.

## Project Structure
```text
expense-tracker-backend/
├── alembic/                # Alembic database migration scripts
├── app/
│   ├── api/v1/             # API routing (auth, users, expenses, etc.)
│   ├── core/               # Core configuration, security, db connection, exceptions
│   ├── middleware/         # Custom FastAPI middlewares
│   ├── models/             # SQLAlchemy ORM models
│   ├── repositories/       # Database access layer (CRUD operations)
│   ├── schemas/            # Pydantic models for request/response validation
│   ├── services/           # Business logic layer
│   └── utils/              # Helper functions and utilities
├── tests/                  # Pytest test suite
├── .env.example            # Example environment variables
├── alembic.ini             # Alembic configuration
├── main.py                 # FastAPI application entry point
└── requirements.txt        # Python dependencies
```

## Setup Instructions

### 1. Create a Virtual Environment
It is recommended to use a virtual environment to manage your dependencies.
```bash
python -m venv venv
source venv/bin/activate  # On Windows use `venv\Scripts\activate`
```

### 2. Install Dependencies
```bash
pip install -r requirements.txt
```

### 3. Environment Configuration
Copy the example environment file and update the variables as needed.
```bash
cp .env.example .env
```
Ensure you have a running PostgreSQL instance and update `DATABASE_URL` in your `.env` file to point to it. The connection string must use the `postgresql+asyncpg://` scheme.

### 4. Database Migrations
Generate the initial database migration and apply it to your database.
*(Note: Ensure you have added your SQLAlchemy models to `app/models/` and imported them into `app/core/database.py` or `alembic/env.py` before running this)*
```bash
# Generate a new migration script
alembic revision --autogenerate -m "Initial commit"

# Apply migrations to the database
alembic upgrade head
```

### 5. Running the Application
Start the development server using Uvicorn.
```bash
uvicorn main:app --reload
```
The server will start at `http://localhost:8000`.

## API Documentation
Once the server is running, you can access the automatically generated interactive API documentation:
- **Swagger UI**: `http://localhost:8000/docs`
- **ReDoc**: `http://localhost:8000/redoc`

## Health Check
You can verify the API is running by hitting the health check endpoint:
```bash
curl http://localhost:8000/api/v1/health
```
