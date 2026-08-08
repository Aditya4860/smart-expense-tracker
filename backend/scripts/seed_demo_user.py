import asyncio
import uuid
import json
from datetime import date, datetime, timedelta, timezone
import asyncpg
import bcrypt
from app.core.config import settings
from app.constants.default_categories import DEFAULT_CATEGORIES

DEMO_EMAIL = "user1@gmail.com"
DEMO_PASSWORD = "user123"
DEMO_FULL_NAME = "Alex Morgan"

def get_password_hash(password: str) -> str:
    salt = bcrypt.gensalt()
    return bcrypt.hashpw(password.encode('utf-8'), salt).decode('utf-8')

async def seed_demo():
    print(f"[*] Starting demo user creation and data population for {DEMO_EMAIL}...")
    dsn = str(settings.DATABASE_URL).replace("postgresql+asyncpg://", "postgresql://")
    conn = await asyncpg.connect(dsn, statement_cache_size=0)
    
    try:
        # 1. Check if user already exists; if so, delete cascade cleanly
        existing_user = await conn.fetchrow("SELECT id FROM users WHERE email = $1", DEMO_EMAIL)
        if existing_user:
            print(f"[*] Removing existing user {DEMO_EMAIL} and all associated records...")
            await conn.execute("DELETE FROM users WHERE id = $1", existing_user["id"])

        # 2. Create User
        user_id = uuid.uuid4()
        hashed_pw = get_password_hash(DEMO_PASSWORD)
        now = datetime.now(timezone.utc).replace(tzinfo=None)

        await conn.execute("""
            INSERT INTO users (id, created_at, updated_at, email, hashed_password, full_name, is_active, role, currency_preference)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        """, user_id, now, now, DEMO_EMAIL, hashed_pw, DEMO_FULL_NAME, True, "USER", "INR")
        print(f"[+] Created user: {DEMO_EMAIL} (ID: {user_id})")

        # 3. Seed Preset Categories
        category_map = {}
        for cat in DEFAULT_CATEGORIES:
            cat_id = uuid.uuid4()
            await conn.execute("""
                INSERT INTO categories (id, created_at, updated_at, user_id, name, type, icon, color)
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
            """, cat_id, now, now, user_id, cat["name"], cat["type"].value if hasattr(cat["type"], "value") else str(cat["type"]), cat.get("icon"), cat.get("color"))
            category_map[cat["name"]] = cat_id

        print(f"[+] Seeded {len(category_map)} standard categories.")

        def get_cat(name):
            if name in category_map:
                return category_map[name]
            for k, v in category_map.items():
                if name.lower() in k.lower():
                    return v
            return list(category_map.values())[0]

        # 4. Seed Income (Past 6 Months)
        today = date.today()
        income_rows = []
        for i in range(6, -1, -1):
            m = today.month - i
            y = today.year
            while m <= 0:
                m += 12
                y -= 1
            income_rows.append((
                uuid.uuid4(), now, now, user_id, 95000.00, date(y, m, 1),
                "Acme Tech Solutions (Primary Salary)",
                "Monthly corporate payroll direct deposit",
                get_cat("Salary & Wages")
            ))

        income_rows.extend([
            (uuid.uuid4(), now, now, user_id, 35000.00, today - timedelta(days=12), "Web Design Client (Stripe)", "Frontend redesign milestone 2 payment", get_cat("Freelance & Projects")),
            (uuid.uuid4(), now, now, user_id, 22000.00, today - timedelta(days=45), "Consulting Project", "Cloud architecture code review retainer", get_cat("Freelance & Projects")),
            (uuid.uuid4(), now, now, user_id, 8500.00, today - timedelta(days=25), "Mutual Funds & Stocks", "Q2 dividend payout", get_cat("Investments & Dividends")),
            (uuid.uuid4(), now, now, user_id, 14000.00, today - timedelta(days=80), "Investment Returns", "Fixed deposit interest credit", get_cat("Interest & Yields")),
        ])

        for r in income_rows:
            await conn.execute("""
                INSERT INTO incomes (id, created_at, updated_at, user_id, amount, date, source, description, category_id)
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
            """, *r)

        print(f"[+] Seeded {len(income_rows)} income entries.")

        # 5. Seed Expenses (Past 6 Months)
        expenses_data = [
            # Current Month
            (25000.00, "Housing & Rent", "Skyline Tower Apartments", "Monthly Apartment Rent", 2, "Bank Transfer"),
            (4200.00, "Food & Dining", "Fresh Basket Supermarket", "Weekly organic vegetables & pantry staples", 3, "Credit Card"),
            (1850.00, "Food & Dining", "The Artisan Bistro", "Dinner with colleagues", 4, "Debit Card"),
            (1499.00, "Bills & Utilities", "Airtel Fiber Broadband", "High-speed gigabit home fiber internet", 5, "UPI"),
            (1199.00, "Entertainment & Leisure", "Netflix 4K + Spotify Premium", "Family entertainment bundle", 6, "Credit Card"),
            (2500.00, "Personal Care & Wellness", "Gold's Fitness Gym", "Monthly gym and fitness membership", 7, "UPI"),
            (3200.00, "Transport & Fuel", "Uber / Shell Petrol", "Weekly commute and petrol top-up", 8, "Credit Card"),
            (5600.00, "Shopping & Retail", "Amazon India", "Ergonomic chair cushion & wireless mouse", 9, "Credit Card"),
            (1450.00, "Health & Medical", "Apollo Pharmacy", "Multivitamins and first-aid replenishment", 11, "Debit Card"),
            (3800.00, "Food & Dining", "Nature's Mart", "Dairy, fruits, and organic cold cuts", 14, "Credit Card"),
            (2400.00, "Food & Dining", "Brew & Crust Pizza Bar", "Weekend family dinner", 16, "UPI"),
            (1800.00, "Bills & Utilities", "State Electricity Board", "Residential electricity bill", 18, "Net Banking"),
            (750.00, "Bills & Utilities", "Municipal Water Supply", "Bi-monthly water utility bill", 20, "UPI"),

            # Month -1
            (25000.00, "Housing & Rent", "Skyline Tower Apartments", "Monthly Apartment Rent", 32, "Bank Transfer"),
            (8900.00, "Food & Dining", "SuperMart Wholesale", "Monthly bulk grocery run", 34, "Credit Card"),
            (3400.00, "Food & Dining", "Spice Route Kitchen", "Team lunch outing", 36, "Credit Card"),
            (1499.00, "Bills & Utilities", "Airtel Fiber Broadband", "Monthly fiber connection", 37, "UPI"),
            (1199.00, "Entertainment & Leisure", "Netflix & Spotify", "Digital streaming services", 38, "Credit Card"),
            (4500.00, "Transport & Fuel", "Shell Fuel Station", "Monthly vehicle fuel & servicing", 40, "Credit Card"),
            (12500.00, "Shopping & Retail", "Zara / Myntra", "Summer wardrobe & casual blazer", 42, "Credit Card"),
            (2500.00, "Personal Care & Wellness", "Gold's Fitness Gym", "Monthly gym membership", 44, "UPI"),
            (4100.00, "Entertainment & Leisure", "PVR Cinemas IMAX", "Movie night with IMAX tickets & snacks", 48, "Credit Card"),
            (2200.00, "Bills & Utilities", "State Power Corp", "Electricity bill", 50, "Net Banking"),

            # Month -2
            (25000.00, "Housing & Rent", "Skyline Tower Apartments", "Monthly Apartment Rent", 62, "Bank Transfer"),
            (9200.00, "Food & Dining", "Fresh Mart", "Groceries and kitchen essentials", 64, "Credit Card"),
            (4800.00, "Food & Dining", "Little Italy Trattoria", "Anniversary dinner celebration", 66, "Credit Card"),
            (1499.00, "Bills & Utilities", "Airtel Fiber", "Home internet bill", 68, "UPI"),
            (1199.00, "Entertainment & Leisure", "Streaming Bundle", "Media subscriptions", 69, "Credit Card"),
            (8500.00, "Travel & Vacation", "MakeMyTrip / Indigo", "Flight tickets for weekend getaway", 72, "Credit Card"),
            (6400.00, "Travel & Vacation", "Mountain View Resort", "Hotel stay for hill station trip", 74, "Credit Card"),
            (3100.00, "Transport & Fuel", "Fuel & Uber", "Commute & transit", 76, "Debit Card"),
            (2100.00, "Bills & Utilities", "Power Utility", "Summer electricity bill", 80, "UPI"),

            # Month -3
            (25000.00, "Housing & Rent", "Skyline Tower Apartments", "Monthly Apartment Rent", 92, "Bank Transfer"),
            (8400.00, "Food & Dining", "Wholesale Grocery Market", "Monthly food & essentials", 95, "Credit Card"),
            (2900.00, "Food & Dining", "Urban Cafe & Bakery", "Weekend coffee meets & brunch", 98, "UPI"),
            (15000.00, "Investments & Savings", "Zerodha Coin", "Monthly index fund SIP investment", 100, "Net Banking"),
            (1499.00, "Bills & Utilities", "Internet Provider", "Broadband internet", 102, "UPI"),
            (3600.00, "Transport & Fuel", "Fuel Station", "Petrol refills", 105, "Credit Card"),
            (2500.00, "Personal Care & Wellness", "Gym Membership", "Monthly fitness dues", 108, "UPI"),

            # Month -4
            (25000.00, "Housing & Rent", "Skyline Tower Apartments", "Monthly Apartment Rent", 122, "Bank Transfer"),
            (7800.00, "Food & Dining", "Big Bazaar", "Groceries and household supplies", 125, "Credit Card"),
            (3200.00, "Food & Dining", "The Curry Pot", "Family dinner", 128, "UPI"),
            (15000.00, "Investments & Savings", "Zerodha Coin", "SIP mutual fund investment", 130, "Net Banking"),
            (4200.00, "Health & Medical", "Dental Care Clinic", "Routine dental cleaning and checkup", 135, "Credit Card"),
            (2100.00, "Bills & Utilities", "Electricity Board", "Monthly power bill", 140, "UPI"),

            # Month -5
            (25000.00, "Housing & Rent", "Skyline Tower Apartments", "Monthly Apartment Rent", 152, "Bank Transfer"),
            (8100.00, "Food & Dining", "Daily Needs Mart", "Monthly groceries", 155, "Credit Card"),
            (4500.00, "Other Expenses", "UNICEF & Birthday Gift", "Charity donation and friend's gift", 160, "Debit Card"),
            (15000.00, "Investments & Savings", "Zerodha Coin", "SIP mutual fund investment", 165, "Net Banking"),
        ]

        for amt, cat_name, merch, desc, days_ago, pay_method in expenses_data:
            exp_date = today - timedelta(days=days_ago)
            await conn.execute("""
                INSERT INTO expenses (id, created_at, updated_at, user_id, amount, category_id, merchant, description, date, payment_method)
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
            """, uuid.uuid4(), now, now, user_id, amt, get_cat(cat_name), merch, desc, exp_date, pay_method)

        print(f"[+] Seeded {len(expenses_data)} expense entries with rich history.")

        # 6. Seed Budgets
        budgets_data = [
            ("Housing & Rent", 30000.00),
            ("Food & Dining", 15000.00),
            ("Transport & Fuel", 6000.00),
            ("Bills & Utilities", 5000.00),
            ("Shopping & Retail", 10000.00),
            ("Entertainment & Leisure", 5000.00),
            ("Health & Medical", 4000.00),
            ("Personal Care & Wellness", 4000.00),
        ]

        for cat_name, limit_amt in budgets_data:
            await conn.execute("""
                INSERT INTO budgets (id, created_at, updated_at, user_id, category_id, amount, period)
                VALUES ($1, $2, $3, $4, $5, $6, $7)
            """, uuid.uuid4(), now, now, user_id, get_cat(cat_name), limit_amt, "MONTHLY")

        print(f"[+] Seeded {len(budgets_data)} category budgets.")

        # 7. Seed Goals & Goal Contributions
        goals_data = [
            ("Emergency Fund (6 Months)", 300000.00, 225000.00, today + timedelta(days=120), "high", "Liquid emergency reserve in high-yield savings account", "ACTIVE"),
            ("New Car Down Payment", 600000.00, 320000.00, today + timedelta(days=240), "medium", "Saving up 40% down payment for EV SUV", "ACTIVE"),
            ("Dream Vacation to Japan", 250000.00, 180000.00, today + timedelta(days=180), "medium", "Flights, stay, rail pass & local tours across Tokyo and Kyoto", "ACTIVE"),
            ("Home Office Workstation Setup", 120000.00, 120000.00, today - timedelta(days=30), "low", "Curved ultrawide monitor, standing desk, ergonomic setup", "COMPLETED"),
        ]

        for title, target_amt, curr_amt, deadline, priority, desc, status in goals_data:
            goal_id = uuid.uuid4()
            await conn.execute("""
                INSERT INTO goals (id, created_at, updated_at, user_id, name, target_amount, current_amount, deadline, priority, description, status)
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
            """, goal_id, now, now, user_id, title, target_amt, curr_amt, deadline, priority, desc, status)

            # Historical Contributions
            c_rows = [
                (uuid.uuid4(), now, now, goal_id, curr_amt * 0.4, today - timedelta(days=90)),
                (uuid.uuid4(), now, now, goal_id, curr_amt * 0.35, today - timedelta(days=45)),
                (uuid.uuid4(), now, now, goal_id, curr_amt * 0.25, today - timedelta(days=10)),
            ]
            for c_id, c_cr, c_up, g_id, c_amt, c_date in c_rows:
                await conn.execute("""
                    INSERT INTO goal_contributions (id, created_at, updated_at, goal_id, amount, date)
                    VALUES ($1, $2, $3, $4, $5, $6)
                """, c_id, c_cr, c_up, g_id, c_amt, c_date)

        print(f"[+] Seeded {len(goals_data)} savings goals and contributions.")

        # 8. Seed Recurring Transactions
        recurring_data = [
            ("INCOME", 95000.00, "MONTHLY", "Salary & Wages", "Acme Tech Solutions", "Primary Monthly Salary", today.replace(day=1), "Bank Transfer"),
            ("INCOME", 25000.00, "MONTHLY", "Freelance & Projects", "Stripe Retainer", "Monthly UI/UX Retainer Client", today.replace(day=15), "Stripe"),
            ("EXPENSE", 25000.00, "MONTHLY", "Housing & Rent", "Skyline Tower Apartments", "Apartment Rent", today.replace(day=1), "Bank Transfer"),
            ("EXPENSE", 1499.00, "MONTHLY", "Bills & Utilities", "Airtel Fiber", "Broadband Internet", today.replace(day=5), "UPI"),
            ("EXPENSE", 1199.00, "MONTHLY", "Entertainment & Leisure", "Netflix & Spotify", "Entertainment Streaming", today.replace(day=6), "Credit Card"),
            ("EXPENSE", 2500.00, "MONTHLY", "Personal Care & Wellness", "Gold's Gym", "Fitness Membership", today.replace(day=7), "UPI"),
            ("EXPENSE", 15000.00, "MONTHLY", "Investments & Savings", "Zerodha Coin", "Index Fund Systematic Investment (SIP)", today.replace(day=10), "Net Banking"),
        ]

        for t_type, amt, freq, cat_name, merch, title, s_date, pay_m in recurring_data:
            await conn.execute("""
                INSERT INTO recurring_transactions (
                    id, created_at, updated_at, user_id, type, amount, frequency, category_id,
                    title, description, merchant, payment_method, start_date, end_date, is_never_ending,
                    next_date, last_processed_date, status, auto_process
                ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19)
            """, uuid.uuid4(), now, now, user_id, t_type, amt, freq, get_cat(cat_name),
               title, f"Recurring {title}", merch, pay_m, s_date, None, True,
               s_date + timedelta(days=30), None, "ACTIVE", True)

        print(f"[+] Seeded {len(recurring_data)} recurring transactions.")

        # 9. Seed Reminders
        reminders_data = [
            ("Electricity & Water Utility Bill", "Pay residential bill via consumer portal", 2350.00, "BILL", "MONTHLY", today + timedelta(days=3), "10:00", "Bills & Utilities", "PENDING", True),
            ("Car Loan EMI Payment", "Automated debit from primary HDFC account", 14500.00, "EMI", "MONTHLY", today + timedelta(days=7), "09:00", "Housing & Rent", "PENDING", True),
            ("Cloud Storage & Domain Renewal", "AWS & Cloudflare annual domain DNS renewal", 1850.00, "SUBSCRIPTION", "MONTHLY", today + timedelta(days=12), "11:30", "Bills & Utilities", "PENDING", True),
            ("Quarterly Mutual Fund Portfolio Rebalancing", "Review asset allocation and rebalance index holdings", None, "SAVINGS", "MONTHLY", today + timedelta(days=18), "16:00", "Investments & Savings", "PENDING", True),
            ("Health Insurance Annual Premium", "Policy renewal before grace period ends", 18000.00, "BILL", "ONCE", today + timedelta(days=28), "14:00", "Health & Medical", "PENDING", True),
            ("Last Month Credit Card Bill", "Full balance payment cleared on time", 16400.00, "BILL", "MONTHLY", today - timedelta(days=10), "10:00", "Other Expenses", "COMPLETED", False),
        ]

        for title, desc, amt, r_type, freq, d_date, d_time, cat_name, status, auto_n in reminders_data:
            rem_id = uuid.uuid4()
            await conn.execute("""
                INSERT INTO reminders (
                    id, created_at, updated_at, user_id, title, description, amount,
                    type, frequency, due_date, due_time, status, is_auto_notified, category_id
                ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
            """, rem_id, now, now, user_id, title, desc, amt, r_type, freq, d_date, d_time, status, auto_n, get_cat(cat_name))

            await conn.execute("""
                INSERT INTO reminder_histories (id, created_at, updated_at, reminder_id, user_id, action, action_date, notes)
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
            """, uuid.uuid4(), now, now, rem_id, user_id, "CREATED" if status == "PENDING" else "COMPLETED", today - timedelta(days=5), f"Reminder initialized for {d_date.isoformat()}")

        print(f"[+] Seeded {len(reminders_data)} reminders and history logs.")

        # 10. Seed Notifications
        notifications_data = [
            ("Welcome to Smart Expense Tracker!", "Your account is all set. We've populated rich sample data, recurring transactions, and reminders for you.", "MONTHLY_SUMMARY", False, 1),
            ("Emergency Fund Milestone Reached", "Congratulations! Your Emergency Fund has reached 75% of your target ₹3,00,000 goal.", "GOAL_MILESTONE", False, 2),
            ("Dining Out Budget Warning (70%)", "You have utilized ₹4,250 of your ₹15,000 Food & Dining monthly budget.", "BUDGET_WARNING", False, 3),
            ("Recurring Transaction Processed", "Executed monthly recurring transaction: Broadband Internet (₹1,499.00)", "RECURRING_EXECUTED", True, 4),
            ("Upcoming Reminder: Utility Bill Due", "Reminder: Electricity & Water Utility Bill (₹2,350.00) is due in 3 days.", "BILL_REMINDER", False, 0),
        ]

        for title, msg, n_type, is_read, hours_ago in notifications_data:
            notif_time = (datetime.now(timezone.utc) - timedelta(hours=hours_ago * 8)).replace(tzinfo=None)
            await conn.execute("""
                INSERT INTO notifications (id, created_at, updated_at, user_id, title, message, type, is_read)
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
            """, uuid.uuid4(), notif_time, notif_time, user_id, title, msg, n_type, is_read)

        print(f"[+] Seeded {len(notifications_data)} notifications.")

        print("\n" + "=" * 60)
        print("DEMO USER SETUP COMPLETED SUCCESSFULLY!")
        print(f"Login Email:    {DEMO_EMAIL}")
        print(f"Password:       {DEMO_PASSWORD}")
        print("=" * 60)

    finally:
        await conn.close()

if __name__ == "__main__":
    asyncio.run(seed_demo())
