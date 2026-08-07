# Notification API Documentation

This document describes the REST API endpoints, schemas, authentication, security controls, and test coverage for the in-app Notification module of the Smart Expense Tracker (Phase 13A).

---

## 1. Overview

The Notification API provides full management for in-app alert generation, real-time unread counting, user-scoped filtering, pagination, read/unread state mutation, and demo seed populations.

* **Base URL**: `/api/v1/notifications`
* **Protocol**: HTTP/1.1 & HTTP/2 (TLS recommended in production)
* **Authentication**: JWT Bearer token required in the `Authorization` header (`Bearer <access_token>`)
* **Content-Type**: `application/json`

---

## 2. Notification Types & Trigger Events

| Notification Type | Trigger Event | Severity / Category |
| :--- | :--- | :--- |
| `BUDGET_EXCEEDED` | Total expenses in a category exceed 100% of budgeted amount | 🚨 Critical Alert |
| `BUDGET_WARNING` | Total expenses reach 80% or 90% threshold of active budget | ⚠️ Warning Alert |
| `GOAL_ACHIEVED` | Savings goal reaches 100% or more of target amount | 🏆 Achievement |
| `GOAL_MILESTONE` | Savings goal reaches 25%, 50%, or 75% progress milestone | 🎯 Milestone Alert |
| `LARGE_EXPENSE` | Expense created with amount ≥ $1,000 or user high-spend threshold | 💸 Financial Alert |
| `LARGE_INCOME` | Income created with amount ≥ $5,000 | 💰 Financial Alert |
| `RECURRING_EXECUTED` | Scheduler executes an automated recurring income or expense | 🔄 Automation Event |
| `REMINDER` | Bill, EMI, subscription, or custom reminder reaches due date | ⏰ Reminder Alert |
| `MONTHLY_SUMMARY` | 1st day of month financial health and savings summary generated | 📊 Report Alert |
| `TRANSACTION_FAILED` | Automated execution failed or database lock encountered | ❌ Error Alert |
| `INFO` | Generic system announcement or profile notification | ℹ️ Informational |

---

## 3. Data Schemas

### `NotificationResponse`
```json
{
  "id": "c1f729b4-3a72-4b36-a19e-f00a4592a101",
  "user_id": "90d1f729-3a72-4b36-a19e-f00a4592a110",
  "title": "Budget Alert: Food & Dining at 85%",
  "message": "You have spent $425.00 of your $500.00 Food & Dining budget.",
  "type": "BUDGET_WARNING",
  "is_read": false,
  "data": {
    "budget_id": "e2f729b4-3a72-4b36-a19e-f00a4592a202",
    "percentage": 85.0
  },
  "created_at": "2026-08-08T02:00:00.000Z",
  "updated_at": "2026-08-08T02:00:00.000Z"
}
```

### `NotificationCreate`
```json
{
  "title": "Custom Alert",
  "message": "Review monthly subscription renewals.",
  "type": "REMINDER",
  "data": { "ref_id": "123" }
}
```

### `NotificationCountResponse`
```json
{
  "unread_count": 3,
  "total_count": 14
}
```

---

## 4. API Endpoints

### 4.1. List Notifications
Retrieves user-scoped notifications with pagination, read-state filtering, type filtering, and sorting.

* **Method**: `GET`
* **Path**: `/api/v1/notifications`
* **Query Parameters**:
  * `skip` *(int, default=0)*: Offset for pagination.
  * `limit` *(int, default=50, max=100)*: Limit per page.
  * `is_read` *(bool, optional)*: Filter by `true` or `false`.
  * `type` *(string, optional)*: Filter by notification type enum.
  * `sort_by` *(string, default="created_at")*: Field to sort by.
  * `sort_order` *(string, default="desc")*: `asc` or `desc`.
* **Response `200 OK`**: Array of `NotificationResponse`.

---

### 4.2. Get Unread & Total Count
Returns badge count metrics for the authenticated user.

* **Method**: `GET`
* **Path**: `/api/v1/notifications/count`
* **Response `200 OK`**:
  ```json
  {
    "unread_count": 5,
    "total_count": 28
  }
  ```

---

### 4.3. Mark Single Notification Read / Unread
Toggles or updates the read state of an individual notification.

* **Method**: `PUT`
* **Path**: `/api/v1/notifications/{notification_id}/read`
* **Query Parameters**:
  * `is_read` *(bool, default=true)*: Pass `false` to mark as unread.
* **Response `200 OK`**: Updated `NotificationResponse`.
* **Response `404 Not Found`**: If notification does not exist or belongs to another user.

---

### 4.4. Mark All as Read
Marks all unread notifications of the authenticated user as read in a single batch operation.

* **Method**: `POST`
* **Path**: `/api/v1/notifications/mark-all-read`
* **Response `200 OK`**:
  ```json
  {
    "status": "success",
    "updated_count": 5
  }
  ```

---

### 4.5. Delete Notification
Deletes an individual notification.

* **Method**: `DELETE`
* **Path**: `/api/v1/notifications/{notification_id}`
* **Response `200 OK`**:
  ```json
  {
    "status": "success",
    "message": "Notification deleted successfully"
  }
  ```
* **Response `404 Not Found`**: Notification not found or unauthorized.

---

### 4.6. Clear All Read Notifications
Deletes all read notifications for the authenticated user to purge clutter.

* **Method**: `DELETE`
* **Path**: `/api/v1/notifications/clear-read`
* **Response `200 OK`**:
  ```json
  {
    "status": "success",
    "deleted_count": 12
  }
  ```

---

### 4.7. Seed Demo Notifications
Populates realistic sample notifications across all types for preview and testing.

* **Method**: `POST`
* **Path**: `/api/v1/notifications/seed-demo`
* **Response `201 Created`**: Array of newly created demo `NotificationResponse` objects.

---

## 5. Security, Authentication & Authorization

1. **User Isolation**: All repository queries filter by `user_id == current_user.id`. Users cannot view, mutate, or delete another user's notifications.
2. **JWT Validation**: Every request validates token signature, expiration (`exp`), and subject (`sub`).
3. **Input Sanitization**: Titles and messages are sanitized to strip any dangerous HTML/XSS payloads.
4. **Rate Limiting**: Protected by global and endpoint rate limiters to prevent DoS.

---

## 6. Test Suite & Coverage

* `tests/test_notifications_api.py`:
  * `test_list_notifications_api`: Validates list, pagination, and filter parameters.
  * `test_create_notification_api`: Validates creation and default unread state.
  * `test_get_unread_count_api`: Validates unread badge counting accuracy.
  * `test_mark_all_read_api`: Validates atomic bulk status update.
  * `test_seed_demo_notifications_api`: Validates batch creation across all enum categories.
* **Test Result**: `5/5 PASSED (100% Success)`

---

## 7. Edge Cases & Known Limitations

* **Edge Case - Rapid Polling**: Frontend throttles polling to 60s intervals with instantaneous state update on optimistic UI actions.
* **Edge Case - Null or Complex JSON data payloads**: The `data` JSON column gracefully falls back to `{}` when no metadata is provided.
* **Known Limitation**: In-app notifications do not push external Web Push or SMS messages in offline state (reserved for Phase 14 extensions).
