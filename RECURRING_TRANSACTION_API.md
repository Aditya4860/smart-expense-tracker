# Recurring Transactions API Documentation

This document describes the REST API endpoints, automated transaction generation mechanics, downstream ledger updates, and test coverage for Recurring Transactions (Phase 13B).

---

## 1. Overview

The Recurring Transactions API enables automated generation of regular expenses and income streams on configurable frequencies. When an occurrence executes, it generates a real transaction in the ledger, instantly updating Dashboard KPIs, Analytics, Budgets, Savings Goals, and Reports.

* **Base URL**: `/api/v1/recurring`
* **Authentication**: JWT Bearer token (`Authorization: Bearer <access_token>`)
* **Content-Type**: `application/json`

---

## 2. Core Features & Supported Frequencies

### Transaction Types (`TransactionType`)
* `EXPENSE`: Recurring costs (rent, subscriptions, utilities, groceries, gym).
* `INCOME`: Recurring receipts (salary, freelance retainer, dividend, rental income).

### Frequency Options (`RecurringFrequency`)
* `DAILY`: Executes every day (+1 day).
* `WEEKLY`: Executes every week (+7 days).
* `MONTHLY`: Executes monthly (+1 month with day clamping).
* `QUARTERLY`: Executes every 3 months (+3 months with day clamping).
* `YEARLY`: Executes annually (+1 year, handling leap year Feb 29).

### Schedule Statuses (`RecurringStatus`)
* `ACTIVE`: Enabled for automated scheduler execution.
* `PAUSED`: Temporarily suspended; ignored during hourly scheduler runs.
* `COMPLETED`: Schedule reached its `end_date`.
* `CANCELLED`: Permanently terminated by user.

---

## 3. Data Schemas

### `RecurringResponse`
```json
{
  "id": "e4a85f64-5717-4562-b3fc-2c963f66afa1",
  "user_id": "90d1f729-3a72-4b36-a19e-f00a4592a110",
  "title": "Monthly Salary",
  "amount": 5500.00,
  "type": "INCOME",
  "category": "Salary",
  "frequency": "MONTHLY",
  "start_date": "2026-01-01",
  "end_date": null,
  "never_ending": true,
  "status": "ACTIVE",
  "next_date": "2026-09-01",
  "last_executed_at": "2026-08-01T06:00:00.000Z",
  "notes": "Direct bank deposit",
  "created_at": "2026-01-01T00:00:00.000Z",
  "updated_at": "2026-08-01T06:00:00.000Z"
}
```

### `RecurringCreate`
```json
{
  "title": "Spotify Family Subscription",
  "amount": 16.99,
  "type": "EXPENSE",
  "category": "Entertainment",
  "frequency": "MONTHLY",
  "start_date": "2026-08-01",
  "end_date": null,
  "never_ending": true,
  "notes": "Shared plan"
}
```

### `RecurringCountsResponse`
```json
{
  "total_active": 6,
  "active_expenses": 5,
  "active_income": 1,
  "total_monthly_recurring_expense": 1850.50,
  "total_monthly_recurring_income": 5500.00
}
```

---

## 4. Downstream Lifecycle & Cascading Updates

When a recurring transaction executes (via background scheduler or manual `POST /recurring/{id}/run-now`):

```
┌────────────────────────────────────────────────────────┐
│ Recurring Schedule Occurrence Triggered               │
└──────────────────────────┬─────────────────────────────┘
                           │
       ┌───────────────────┴───────────────────┐
       ▼                                       ▼
  [EXPENSE Type]                         [INCOME Type]
       │                                       │
       ▼                                       ▼
Creates row in `expenses` table         Creates row in `incomes` table
       │                                       │
       ├───────────────────────────────────────┤
       ▼                                       ▼
• Updates Dashboard Spend/Income Totals & Cashflow
• Updates Analytics & Category Breakdowns
• Evaluates Budgets (Triggers 80%/90%/100% threshold notifications)
• Updates Savings Goal linked balances & progress milestones
• Advances `next_date` to next interval or marks `COMPLETED`
• Emits `RECURRING_EXECUTED` In-App Notification
```

---

## 5. API Endpoints

### 5.1. List Recurring Schedules
Retrieves user schedules with type, status, and frequency filtering.

* **Method**: `GET`
* **Path**: `/api/v1/recurring`
* **Query Parameters**:
  * `type` *(string, optional)*: `EXPENSE` or `INCOME`
  * `status` *(string, optional)*: `ACTIVE`, `PAUSED`, `COMPLETED`, `CANCELLED`
  * `frequency` *(string, optional)*: Filter by frequency
  * `skip` *(int, default=0)*
  * `limit` *(int, default=100)*
* **Response `200 OK`**: Array of `RecurringResponse`.

---

### 5.2. Create Recurring Schedule
* **Method**: `POST`
* **Path**: `/api/v1/recurring`
* **Request Body**: `RecurringCreate`
* **Response `201 Created`**: `RecurringResponse`

---

### 5.3. Get Recurring Summary & Totals
Computes aggregated counts, monthly recurring expense spend, and monthly recurring income totals.

* **Method**: `GET`
* **Path**: `/api/v1/recurring/counts`
* **Response `200 OK`**: `RecurringCountsResponse`

---

### 5.4. Pause Recurring Schedule
Suspends future executions.

* **Method**: `POST`
* **Path**: `/api/v1/recurring/{recurring_id}/pause`
* **Response `200 OK`**: Updated `RecurringResponse` with `status = "PAUSED"`.

---

### 5.5. Resume Recurring Schedule
Re-activates a paused schedule and ensures `next_date` is synced.

* **Method**: `POST`
* **Path**: `/api/v1/recurring/{recurring_id}/resume`
* **Response `200 OK`**: Updated `RecurringResponse` with `status = "ACTIVE"`.

---

### 5.6. Skip Next Occurrence
Advances the `next_date` by one interval without creating a transaction.

* **Method**: `POST`
* **Path**: `/api/v1/recurring/{recurring_id}/skip`
* **Response `200 OK`**: Updated `RecurringResponse` with advanced `next_date`.

---

### 5.7. Trigger Immediate Execution (`Run Now`)
Executes an occurrence immediately regardless of schedule time.

* **Method**: `POST`
* **Path**: `/api/v1/recurring/{recurring_id}/run-now`
* **Response `200 OK`**:
  ```json
  {
    "status": "success",
    "generated_transaction_id": "89f0123a-5717-4562-b3fc-2c963f66afa9",
    "next_date": "2026-09-01"
  }
  ```

---

### 5.8. Update Schedule
Modifies title, amount, category, frequency, start/end dates, or notes.

* **Method**: `PUT`
* **Path**: `/api/v1/recurring/{recurring_id}`
* **Request Body**: `RecurringUpdate`
* **Response `200 OK`**: Updated `RecurringResponse`.

---

### 5.9. Delete Schedule
Deletes a recurring transaction schedule permanently.

* **Method**: `DELETE`
* **Path**: `/api/v1/recurring/{recurring_id}`
* **Response `200 OK`**: Confirmation message.

---

## 6. Security & Verification

* All operations enforce user tenant checks (`user_id == current_user.id`).
* Cross-user mutation requests return `404 Not Found`.
* Validation ensures amounts > 0 and start dates <= end dates (if not never ending).

---

## 7. Test Suite & Coverage

* `tests/test_recurring_service.py` & `tests/test_recurring_transactions_api.py`:
  * `test_date_utils_frequencies`: Validates date arithmetic across DAILY, WEEKLY, MONTHLY, QUARTERLY, YEARLY.
  * `test_date_utils_month_end_clamping`: Validates 31st day rollover logic.
  * `test_create_recurring_transaction_success`: Validates schedule creation.
  * `test_create_recurring_invalid_amount`: Asserts 0 or negative amounts fail.
  * `test_pause_and_resume_recurring`: Tests lifecycle state toggling.
  * `test_skip_occurrence`: Tests date advancement without transaction creation.
  * `test_process_expense_occurrence`: Verifies actual transaction entry and ledger generation.
  * `test_list_recurring_transactions_api`, `test_get_recurring_counts_api`, `test_pause_recurring_api`, `test_resume_recurring_api`, `test_skip_recurring_api`, `test_process_due_api`.
* **Test Result**: `14/14 PASSED (100% Success)`

---

## 8. Edge Cases & Known Limitations

* **Leap Year Handling**: Feb 29 yearly recurring schedules clamp cleanly to Feb 28 on non-leap years.
* **Never-Ending Schedules**: Handled safely with `end_date: null` and `never_ending: true`, avoiding null pointer errors or indefinite loops.
* **Concurrent Execution Locks**: Background scheduler processes items in isolated async database transactions, preventing duplicate transaction entries on concurrent triggers.
