from app.models.enums import TransactionType

DEFAULT_CATEGORIES = [
    # ── Expense Categories (12) ───────────────────────────────────────────
    {"name": "Food & Dining", "type": TransactionType.EXPENSE, "icon": "🍽️", "color": "text-orange-400"},
    {"name": "Transport & Fuel", "type": TransactionType.EXPENSE, "icon": "🚗", "color": "text-blue-400"},
    {"name": "Shopping & Retail", "type": TransactionType.EXPENSE, "icon": "🛍️", "color": "text-pink-400"},
    {"name": "Bills & Utilities", "type": TransactionType.EXPENSE, "icon": "⚡", "color": "text-yellow-400"},
    {"name": "Entertainment & Leisure", "type": TransactionType.EXPENSE, "icon": "🎬", "color": "text-purple-400"},
    {"name": "Health & Medical", "type": TransactionType.EXPENSE, "icon": "🏥", "color": "text-red-400"},
    {"name": "Education & Learning", "type": TransactionType.EXPENSE, "icon": "📚", "color": "text-cyan-400"},
    {"name": "Travel & Vacation", "type": TransactionType.EXPENSE, "icon": "✈️", "color": "text-teal-400"},
    {"name": "Housing & Rent", "type": TransactionType.EXPENSE, "icon": "🏠", "color": "text-indigo-400"},
    {"name": "Personal Care & Wellness", "type": TransactionType.EXPENSE, "icon": "💇", "color": "text-emerald-400"},
    {"name": "Investments & Savings", "type": TransactionType.EXPENSE, "icon": "📈", "color": "text-lime-400"},
    {"name": "Other Expenses", "type": TransactionType.EXPENSE, "icon": "📦", "color": "text-slate-400"},

    # ── Income Categories (10) ────────────────────────────────────────────
    {"name": "Salary & Wages", "type": TransactionType.INCOME, "icon": "💼", "color": "text-green-400"},
    {"name": "Freelance & Projects", "type": TransactionType.INCOME, "icon": "💻", "color": "text-blue-400"},
    {"name": "Business & Sales", "type": TransactionType.INCOME, "icon": "🏢", "color": "text-purple-400"},
    {"name": "Investments & Dividends", "type": TransactionType.INCOME, "icon": "📈", "color": "text-teal-400"},
    {"name": "Rental Income", "type": TransactionType.INCOME, "icon": "🏠", "color": "text-amber-400"},
    {"name": "Interest & Yields", "type": TransactionType.INCOME, "icon": "🏦", "color": "text-cyan-400"},
    {"name": "Bonuses & Incentives", "type": TransactionType.INCOME, "icon": "🎯", "color": "text-orange-400"},
    {"name": "Gifts & Grants", "type": TransactionType.INCOME, "icon": "🎁", "color": "text-pink-400"},
    {"name": "Refunds & Reimbursements", "type": TransactionType.INCOME, "icon": "🔄", "color": "text-yellow-400"},
    {"name": "Other Income", "type": TransactionType.INCOME, "icon": "📦", "color": "text-slate-400"},
]
