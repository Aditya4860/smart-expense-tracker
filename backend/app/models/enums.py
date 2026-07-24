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
    YEARLY = "YEARLY"

class Role(str, enum.Enum):
    USER = "USER"
    ADMIN = "ADMIN"
