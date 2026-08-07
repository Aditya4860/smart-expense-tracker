from datetime import date, timedelta
import calendar
from app.models.enums import RecurringFrequency

def add_months(sourcedate: date, months: int) -> date:
    """Add a specified number of months to a date, clamping days to month maximum."""
    month = sourcedate.month - 1 + months
    year = sourcedate.year + month // 12
    month = month % 12 + 1
    day = min(sourcedate.day, calendar.monthrange(year, month)[1])
    return date(year, month, day)

def add_years(sourcedate: date, years: int) -> date:
    """Add a specified number of years to a date, handling leap years."""
    try:
        return sourcedate.replace(year=sourcedate.year + years)
    except ValueError:
        # Handles Feb 29 on non-leap years
        return sourcedate.replace(year=sourcedate.year + years, day=28)

def calculate_next_occurrence(from_date: date, frequency: RecurringFrequency) -> date:
    """Calculates the subsequent occurrence date based on recurring frequency."""
    if frequency == RecurringFrequency.DAILY:
        return from_date + timedelta(days=1)
    elif frequency == RecurringFrequency.WEEKLY:
        return from_date + timedelta(weeks=1)
    elif frequency == RecurringFrequency.MONTHLY:
        return add_months(from_date, 1)
    elif frequency == RecurringFrequency.QUARTERLY:
        return add_months(from_date, 3)
    elif frequency == RecurringFrequency.YEARLY:
        return add_years(from_date, 1)
    return from_date + timedelta(days=30)
