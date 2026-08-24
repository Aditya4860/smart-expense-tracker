import asyncio
from playwright.async_api import async_playwright
import uuid
import time
import os

async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True, channel="msedge")
        # Use a larger viewport to make it look like a nice desktop screenshot
        context = await browser.new_context(viewport={"width": 1280, "height": 800}, color_scheme="dark")
        page = await context.new_page()

        print("Navigating to landing page...")
        await page.goto("http://localhost:3000/")
        await page.wait_for_timeout(2000)
        os.makedirs("../docs/screenshots", exist_ok=True)
        await page.screenshot(path="../docs/screenshots/landing.png")
        print("Captured landing.png")

        print("Navigating to register...")
        await page.goto("http://localhost:3000/register")
        test_email = f"test_{uuid.uuid4().hex[:6]}@example.com"
        
        await page.wait_for_selector('input[name="name"]')
        await page.fill('input[name="name"]', "Demo User")
        await page.fill('input[name="email"]', test_email)
        await page.fill('input[name="password"]', "DemoPassword123!")
        await page.fill('input[name="confirmPassword"]', "DemoPassword123!")
        
        await page.click('button[type="submit"]')
        
        print("Waiting for login page redirection...")
        await page.wait_for_url("**/login", timeout=10000)
        
        print("Logging in...")
        await page.fill('input[type="email"]', test_email)
        await page.fill('input[type="password"]', "DemoPassword123!")
        await page.click('button[type="submit"]')

        print("Waiting for dashboard to load...")
        # wait for some elements that indicate the dashboard is fully loaded
        await page.wait_for_url("**/dashboard", timeout=10000)
        await page.wait_for_timeout(3000)

        # Before screenshotting the dashboard, let's add an expense to make it look real
        print("Adding an expense...")
        await page.goto("http://localhost:3000/expenses")
        await page.wait_for_timeout(2000)
        # Assuming there is an "Add Expense" button
        try:
            add_button = await page.wait_for_selector('button:has-text("Add Expense"), button:has-text("New Expense")', timeout=3000)
            if add_button:
                await add_button.click()
                await page.wait_for_timeout(1000)
                # Fill amount, description (basic guessing based on standard forms)
                await page.fill('input[name="amount"], input[type="number"]', "120.50")
                await page.fill('input[name="description"], input[type="text"]:not([name="amount"])', "Weekly Groceries")
                await page.click('button:has-text("Save"), button:has-text("Add"), button[type="submit"]')
                await page.wait_for_timeout(2000)
        except Exception as e:
            print("Could not easily add expense through UI, proceeding with blank slate.", e)

        print("Capturing expense.png")
        await page.screenshot(path="../docs/screenshots/expense.png")

        print("Navigating back to dashboard...")
        await page.goto("http://localhost:3000/dashboard")
        await page.wait_for_timeout(3000)
        await page.screenshot(path="../docs/screenshots/dashboard.png")
        print("Captured dashboard.png")

        print("Navigating to budget...")
        await page.goto("http://localhost:3000/budget")
        await page.wait_for_timeout(2000)
        await page.screenshot(path="../docs/screenshots/budget.png")
        print("Captured budget.png")

        await browser.close()

if __name__ == "__main__":
    asyncio.run(main())
