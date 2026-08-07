# Reminder Engine API Documentation

This document specifies the REST API endpoints, schemas, frequency calculations, scheduler integration, and test suite for the Reminder Engine (Phase 13C).

---

## 1. Overview

The Reminder Engine provides automated scheduling, due-date tracking, calendar aggregation, snooze actions, and occurrence completion for financial obligations (bills, subscriptions, EMIs, savings transfers, and custom alerts).

* **Base URL**: `/api/v1/reminders`
* **Authentication**: JWT Bearer token required (`Authorization: Bearer <access_token>`)
* **Content-Type**: `application/json`

---

## 2. Enums & Supported Types

### Reminder Types (`ReminderType`)
* `BILL`: Utility bills, rent, credit card statements.
* `SUBSCRIPTION`: Software services, streaming platforms, memberships.
* `EMI`: Loan installments, mortgage, car payments.
* `SAVINGS`: Scheduled deposit reminders into savings accounts.
* `BUDGET`: Periodic budget review and checkpoint warnings.
* `GOAL`: Target contribution reminders.
* `CUSTOM`: General user-defined reminders with notifications.

### Reminder Frequency (`ReminderFrequency`)
* `ONCE`: Single execution; transitions to `COMPLETED` when marked done.
* `DAILY`: Recurs every calendar day.
* `WEEKLY`: Recurs every 7 days.
* `MONTHLY`: Recurs every month with automatic month-end date clamping (e.g. Jan 31 -> Feb 28/29).

### Reminder Status (`ReminderStatus`)
* `PENDING`: Active and waiting for due date.
* `COMPLETED`: Acknowledged or paid.
* `SNOOZED`: Temporarily deferred to a later date.
* `CANCELLED`: Deactivated by user.

---

## 3. Data Schemas

### `ReminderResponse`
```json
{
  "id": "7b89f012-3a72-4b36-a19e-f00a4592a303",
  "user_id": "90d1f729-3a72-4b36-a19e-f00a4592a110",
  "title": "Internet Fiber Bill",
  "amount": 79.99,
  "category": "Utilities",
  "type": "BILL",
  "frequency": "MONTHLY",
  "status": "PENDING",
  "due_date": "2026-08-15",
  "notes": "Autopay via primary card",
  "created_at": "2026-08-01T00:00:00.000Z",
  "updated_at": "2026-08-01T00:00:00.000Z"
}
```

### `ReminderCreate`
```json
{
  "title": "Apartment Rent",
  "amount": 1500.00,
  "category": "Housing",
  "type": "BILL",
  "frequency": "MONTHLY",
  "due_date": "2026-09-01",
  "notes": "Bank wire transfer"
}
```

### `ReminderSnoozeRequest`
```json
{
  "snooze_days": 3
}
```

---

## 4. API Endpoints

### 4.1. List Reminders
Retrieves user reminders with filtering by status, type, and date range.

* **Method**: `GET`
* **Path**: `/api/v1/reminders`
* **Query Parameters**:
  * `status` *(string, optional)*: `PENDING`, `COMPLETED`, `SNOOZED`, `CANCELLED`
  * `type` *(string, optional)*: Filter by `ReminderType`
  * `start_date` *(YYYY-MM-DD, optional)*: Filter due dates starting from.
  * `end_date` *(YYYY-MM-DD, optional)*: Filter due dates ending at.
  * `skip` *(int, default=0)*
  * `limit` *(int, default=100)*
* **Response `200 OK`**: Array of `ReminderResponse`.

---

### 4.2. Create Reminder
Creates a new scheduled reminder.

* **Method**: `POST`
* **Path**: `/api/v1/reminders`
* **Request Body**: `ReminderCreate`
* **Response `201 Created`**: Newly created `ReminderResponse`.

---

### 4.3. Get Reminder Counts
Returns status summary counts for the authenticated user.

* **Method**: `GET`
* **Path**: `/api/v1/reminders/counts`
* **Response `200 OK`**:
  ```json
  {
    "total": 12,
    "pending": 4,
    "snoozed": 1,
    "completed": 7
  }
  ```

---

### 4.4. Complete Reminder Occurrence
Marks reminder occurrence as completed. If recurring (`DAILY`, `WEEKLY`, `MONTHLY`), automatically calculates and schedules the next `due_date` and resets status to `PENDING`. If `ONCE`, marks as `COMPLETED`.

* **Method**: `POST`
* **Path**: `/api/v1/reminders/{reminder_id}/complete`
* **Response `200 OK`**: Updated `ReminderResponse`.

---

### 4.5. Snooze Reminder
Postpones the reminder by a specified number of days (default: 1 day).

* **Method**: `POST`
* **Path**: `/api/v1/reminders/{reminder_id}/snooze`
* **Request Body**: `ReminderSnoozeRequest` (optional)
* **Response `200 OK`**: Updated `ReminderResponse` with updated `due_date` and `status = "SNOOZED"`.

---

### 4.6. Update Reminder
Modifies title, amount, category, frequency, due date, or notes.

* **Method**: `PUT`
* **Path**: `/api/v1/reminders/{reminder_id}`
* **Request Body**: `ReminderUpdate`
* **Response `200 OK`**: Updated `ReminderResponse`.

---

### 4.7. Delete Reminder
Deletes a reminder permanently.

* **Method**: `DELETE`
* **Path**: `/api/v1/reminders/{reminder_id}`
* **Response `200 OK`**: Success message confirmation.

---

### 4.8. Process Due Reminders (Engine Trigger)
Evaluates all reminders due today or overdue, generates corresponding in-app notifications, and prepares schedules.

* **Method**: `POST`
* **Path**: `/api/v1/reminders/process-due`
* **Response `200 OK`**:
  ```json
  {
    "status": "success",
    "processed_count": 3
  }
  ```

---

## 5. Security & Isolation

* All database queries enforce `user_id = current_user.id` filter.
* Cross-tenant access attempts return `404 Not Found`.
* String sanitization prevents injection in titles, notes, and category fields.

---

## 6. Test Suite & Coverage

* `tests/test_reminder_service.py` & `tests/test_reminders_api.py`:
  * `test_create_reminder_success`: Verifies creation with valid fields.
  * `test_create_reminder_invalid_amount`: Ensures negative amounts fail validation.
  * `test_complete_once_reminder`: Asserts transition to `COMPLETED`.
  * `test_complete_recurring_reminder_advances_date`: Asserts next due date calculation for monthly and weekly schedules.
  * `test_snooze_reminder`: Tests date deferment and snooze state.
  * `test_process_due_reminders_triggers_notification`: Validates automatic notification dispatch on due reminders.
  * `test_list_reminders_api`, `test_get_reminder_counts_api`, `test_complete_reminder_api`, `test_snooze_reminder_api`, `test_process_due_reminders_api`.
* **Test Result**: `12/12 PASSED (100% Success)`

---

## 7. Edge Cases & Known Limitations

* **Month-End Date Clamping**: Reminders due on the 31st automatically clamp to the 28th/29th in February and the 30th in April/June/September/November without skipping months or throwing date errors.
* **Overdue Snoozing**: Snoozing an overdue reminder advances the date relative to current time rather than keeping it overdue.
* **Known Limitation**: Email or SMS dispatch requires SMTP provider configuration in `.env`.
