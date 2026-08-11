import enum

class TransactionType(str, enum.Enum):
    INCOME = "INCOME"
    EXPENSE = "EXPENSE"

class BudgetPeriod(str, enum.Enum):
    MONTHLY = "MONTHLY"
    YEARLY = "YEARLY"

class GoalStatus(str, enum.Enum):
    ACTIVE = "ACTIVE"
    COMPLETED = "COMPLETED"
    CANCELLED = "CANCELLED"

class RecurringFrequency(str, enum.Enum):
    DAILY = "DAILY"
    WEEKLY = "WEEKLY"
    MONTHLY = "MONTHLY"
    QUARTERLY = "QUARTERLY"
    YEARLY = "YEARLY"

class RecurringStatus(str, enum.Enum):
    ACTIVE = "ACTIVE"
    PAUSED = "PAUSED"
    CANCELLED = "CANCELLED"
    COMPLETED = "COMPLETED"

class Role(str, enum.Enum):
    USER = "USER"
    ADMIN = "ADMIN"

class ReminderType(str, enum.Enum):
    BILL = "BILL"
    SUBSCRIPTION = "SUBSCRIPTION"
    EMI = "EMI"
    SAVINGS = "SAVINGS"
    BUDGET = "BUDGET"
    GOAL = "GOAL"
    CUSTOM = "CUSTOM"

class ReminderFrequency(str, enum.Enum):
    ONCE = "ONCE"
    DAILY = "DAILY"
    WEEKLY = "WEEKLY"
    MONTHLY = "MONTHLY"

class ReminderStatus(str, enum.Enum):
    PENDING = "PENDING"
    COMPLETED = "COMPLETED"
    SNOOZED = "SNOOZED"
    DISMISSED = "DISMISSED"
    CANCELLED = "CANCELLED"

class NotificationType(str, enum.Enum):
    BUDGET_EXCEEDED = "BUDGET_EXCEEDED"
    BUDGET_WARNING = "BUDGET_WARNING"
    GOAL_ACHIEVED = "GOAL_ACHIEVED"
    GOAL_MILESTONE = "GOAL_MILESTONE"
    LARGE_EXPENSE = "LARGE_EXPENSE"
    LARGE_INCOME = "LARGE_INCOME"
    MONTHLY_SUMMARY = "MONTHLY_SUMMARY"
    TRANSACTION_FAILED = "TRANSACTION_FAILED"
    RECURRING_EXECUTED = "RECURRING_EXECUTED"
    REMINDER = "REMINDER"
    BILL_REMINDER = "BILL_REMINDER"
    SYSTEM = "SYSTEM"


