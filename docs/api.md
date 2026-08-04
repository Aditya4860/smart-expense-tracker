# Expense API Documentation

This document outlines the REST API endpoints, schemas, and testing instructions for the Expense module of the Smart Expense Tracker.

## Overview
All endpoints require JWT Authentication. The JWT token must be sent in the `Authorization` header as a Bearer token:
`Authorization: Bearer <token>`

Base API Path: `/api/v1/expenses`

---

## Endpoints

### 1. List Expenses
Retrieves a paginated list of expenses for the authenticated user, optionally filtered.

**URL**: `GET /api/v1/expenses`

**Query Parameters:**
- `skip` (int, default=0)
- `limit` (int, default=100)
- `category` (string, optional)
- `start_date` (YYYY-MM-DD, optional)
- `end_date` (YYYY-MM-DD, optional)
- `min_amount` (float, optional)
- `max_amount` (float, optional)

**Response Example (200 OK):**
```json
[
  {
    "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    "title": "Grocery Shopping",
    "description": "Weekly groceries from Whole Foods",
    "amount": 120.50,
    "category": "Food",
    "payment_method": "Credit Card",
    "transaction_date": "2024-02-10",
    "notes": null,
    "receipt_url": null,
    "user_id": "84c85f64-5717-4562-b3fc-2c963f66afa9",
    "created_at": "2024-02-10T12:00:00.000Z",
    "updated_at": "2024-02-10T12:00:00.000Z"
  }
]
```

### 2. Search Expenses
Searches for expenses by matching the `title` or `category`.

**URL**: `GET /api/v1/expenses/search`

**Query Parameters:**
- `q` (string, required, minimum length 1)

**Response Example (200 OK):**
```json
[
  {
    "id": "3fa85f64-...",
    "title": "Coffee",
    "amount": 5.0,
    "category": "Food",
    "transaction_date": "2024-02-11",
    "user_id": "84c85f64-...",
    "created_at": "2024-02-11T09:00:00.000Z",
    "updated_at": "2024-02-11T09:00:00.000Z"
  }
]
```

### 3. Get Expense Statistics
Retrieves aggregation statistics for expenses within a date range.

**URL**: `GET /api/v1/expenses/statistics`

**Query Parameters:**
- `start_date` (YYYY-MM-DD, required)
- `end_date` (YYYY-MM-DD, required)

**Response Example (200 OK):**
```json
{
  "total_transactions": 15,
  "total_amount": 1450.75,
  "average_amount": 96.71,
  "max_amount": 400.00,
  "min_amount": 5.00
}
```

### 4. Create Expense
Creates a new expense record.

**URL**: `POST /api/v1/expenses`

**Request Example:**
```json
{
  "title": "Internet Bill",
  "description": "Monthly ISP bill",
  "amount": 60.00,
  "category": "Utilities",
  "payment_method": "Bank Transfer",
  "transaction_date": "2024-02-15"
}
```

**Response Example (201 Created):**
```json
{
  "id": "5fa85f64-...",
  "title": "Internet Bill",
  "description": "Monthly ISP bill",
  "amount": 60.00,
  "category": "Utilities",
  "payment_method": "Bank Transfer",
  "transaction_date": "2024-02-15",
  "notes": null,
  "receipt_url": null,
  "user_id": "84c85f64-...",
  "created_at": "2024-02-15T14:30:00.000Z",
  "updated_at": "2024-02-15T14:30:00.000Z"
}
```

### 5. Update Expense
Updates an existing expense by ID.

**URL**: `PUT /api/v1/expenses/{id}`

**Request Example (Fields are optional):**
```json
{
  "amount": 65.00,
  "notes": "Price increased this month"
}
```

**Response Example (200 OK):**
```json
{
  "id": "5fa85f64-...",
  "title": "Internet Bill",
  "amount": 65.00,
  "category": "Utilities",
  "notes": "Price increased this month",
  "transaction_date": "2024-02-15",
  "user_id": "84c85f64-...",
  "created_at": "2024-02-15T14:30:00.000Z",
  "updated_at": "2024-02-15T15:00:00.000Z"
}
```

### 6. Delete Expense
Deletes an existing expense by ID.

**URL**: `DELETE /api/v1/expenses/{id}`

**Response Example (204 No Content):**
*(No body)*

---

## Error Codes

The API returns standard HTTP status codes along with a JSON error payload for client debugging.

| Status Code | Description | Example Condition |
|-------------|-------------|-------------------|
| **400 Bad Request** | The request was malformed or validation failed. | Negative `amount`, or `start_date` > `end_date` |
| **401 Unauthorized** | The JWT token is missing, invalid, or expired. | Missing `Authorization` header |
| **403 Forbidden** | The authenticated user does not have permission. | Attempting to access admin-only endpoints |
| **404 Not Found** | The requested resource does not exist. | Querying or deleting a non-existent `id` |
| **422 Unprocessable Entity** | Pydantic validation failed for the JSON body. | Missing required fields like `title` |

**Error Response Structure:**
```json
{
  "detail": "Expense amount must be strictly positive."
}
```

---

## Testing Instructions

### Backend (Pytest)
The backend test suite covers isolated unit tests for the `ExpenseService` and integration tests for the REST API endpoints using FastAPI's `TestClient`.
To run the tests:
1. Navigate to the backend directory:
   `cd backend`
2. Install pytest if not already present:
   `pip install pytest pytest-asyncio httpx`
3. Execute the tests:
   `pytest tests/test_expense_service.py tests/test_expense_api.py -v`

### Frontend (Cypress E2E)
The frontend verification runs via Cypress, interacting with the real UI and mocking network responses to ensure the user workflows (Add, Edit, Delete, Filter, Paginate, Auth) behave correctly.
To run the tests:
1. Navigate to the frontend directory:
   `cd frontend`
2. Install Cypress:
   `npm install cypress --save-dev`
3. Run Cypress tests headlessly:
   `npx cypress run --spec cypress/e2e/expense.cy.js`
4. Or open the Cypress UI:
   `npx cypress open`
