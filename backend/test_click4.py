import asyncio
from playwright.async_api import async_playwright

async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True, channel="msedge")
        context = await browser.new_context()
        page = await context.new_page()

        print("Navigating to home...")
        await page.goto("http://localhost:3000/")
        await page.wait_for_timeout(2000)

        print("Checking if we need to login...")
        login_btn = await page.query_selector('a[href="/login"]')
        if login_btn:
            print("Clicking login link...")
            await login_btn.click()
            await page.wait_for_timeout(2000)
            
            print("Filling login form...")
            await page.fill('input[type="email"]', 'test@test.com')
            await page.fill('input[type="password"]', 'password123')
            await page.click('button[type="submit"]')
            await page.wait_for_timeout(3000)

        print("Navigating to budget...")
        await page.goto("http://localhost:3000/budget")
        await page.wait_for_timeout(3000)

        print("Page URL is now:", page.url)

        btn_grid = await page.query_selector('#budget-view-grid')
        if not btn_grid:
            print("Grid button NOT FOUND! HTML:")
            print(await page.content())
            await browser.close()
            return
            
        print("Clicking grid button...")
        await btn_grid.click()
        await page.wait_for_timeout(1000)
        
        # Take a screenshot to see what it looks like after clicking Grid
        await page.screenshot(path="budget_grid_view_test.png")
        print("Screenshot saved to budget_grid_view_test.png")

        # Check if the class changed
        classes = await btn_grid.get_attribute("class")
        if "bg-primary-500" in classes:
            print("SUCCESS! Grid button turned active.")
        else:
            print("FAIL! Grid button is NOT active. Classes:", classes)
            
        # Check if BudgetTable exists
        table = await page.query_selector('table')
        if table:
            print("BudgetTable is STILL RENDERED!")
        else:
            print("BudgetTable is GONE! (This is correct for grid view)")

        await browser.close()

if __name__ == "__main__":
    asyncio.run(main())
