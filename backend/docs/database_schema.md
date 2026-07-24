# Database Schema

This document contains the Entity Relationship (ER) diagram and table definitions for the Smart Expense Tracker backend.

## ER Diagram

```mermaid
erDiagram
    users {
        UUID id PK
        DateTime created_at
        DateTime updated_at
        String email UK
        String hashed_password
        String full_name
        Boolean is_active
        String currency_preference
    }
    categories {
        UUID id PK
        DateTime created_at
        DateTime updated_at
        String name
        Enum type
        String icon
        String color
        UUID user_id FK "Nullable"
    }
    expenses {
        UUID id PK
        DateTime created_at
        DateTime updated_at
        Numeric amount
        Date date
        String description
        UUID user_id FK
        UUID category_id FK
    }
    incomes {
        UUID id PK
        DateTime created_at
        DateTime updated_at
        Numeric amount
        Date date
        String source
        UUID user_id FK
        UUID category_id FK
    }
    budgets {
        UUID id PK
        DateTime created_at
        DateTime updated_at
        Numeric amount
        Enum period
        UUID user_id FK
        UUID category_id FK
    }
    goals {
        UUID id PK
        DateTime created_at
        DateTime updated_at
        String name
        Numeric target_amount
        Numeric current_amount
        Date deadline
        Enum status
        UUID user_id FK
    }
    goal_contributions {
        UUID id PK
        DateTime created_at
        DateTime updated_at
        Numeric amount
        Date date
        UUID goal_id FK
    }
    recurring_transactions {
        UUID id PK
        DateTime created_at
        DateTime updated_at
        Numeric amount
        Enum type
        Enum frequency
        Date next_date
        UUID user_id FK
        UUID category_id FK
    }
    notifications {
        UUID id PK
        DateTime created_at
        DateTime updated_at
        String title
        String message
        Boolean is_read
        UUID user_id FK
    }
    audit_logs {
        UUID id PK
        DateTime created_at
        DateTime updated_at
        String action
        String entity_type
        UUID entity_id
        JSONB details
        UUID user_id FK "Nullable"
    }

    users ||--o{ categories : creates
    users ||--o{ expenses : incurs
    users ||--o{ incomes : receives
    users ||--o{ budgets : sets
    users ||--o{ goals : sets
    users ||--o{ recurring_transactions : creates
    users ||--o{ notifications : receives
    users ||--o{ audit_logs : generates
    
    categories ||--o{ expenses : categorizes
    categories ||--o{ incomes : categorizes
    categories ||--o{ budgets : categorizes
    categories ||--o{ recurring_transactions : categorizes
    
    goals ||--o{ goal_contributions : tracks
```

## Indexes
- `users.email` (UNIQUE)
- `expenses.user_id`, `expenses.category_id`, `expenses.date`
- `incomes.user_id`, `incomes.category_id`, `incomes.date`
- `budgets.user_id`, `budgets.category_id`
- `recurring_transactions.user_id`, `recurring_transactions.next_date`
- `audit_logs.entity_type`, `audit_logs.entity_id`

## Constraints
- Unique constraint on `budgets`: `(user_id, category_id, period)`
- Foreign keys with `ON DELETE CASCADE` generally, except for Categories which restricts deletion if assigned (`ON DELETE RESTRICT`).
