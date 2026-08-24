import asyncio
from playwright.async_api import async_playwright

async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True, channel="msedge")
        context = await browser.new_context()
        page = await context.new_page()

        # Just go to a non-protected page first to set localstorage
        await page.goto("http://localhost:3000/")
        await page.wait_for_timeout(1000)

        # We actually don't know the exact auth flow for this token.
        # Let's do a real login on the UI.
        try:
            await page.fill('input[type="email"]', 'test@test.com')
            await page.fill('input[type="password"]', 'password123')
            await page.click('button[type="submit"]')
            await page.wait_for_timeout(3000)
        except Exception as e:
            print("Login error:", e)

        print("Navigating to budget...")
        await page.goto("http://localhost:3000/budget")
        await page.wait_for_timeout(3000)

        btn_grid = await page.query_selector('#budget-view-grid')
        btn_table = await page.query_selector('#budget-view-table')
        
        if not btn_grid:
            print("Button not found! Are we logged in? URL is:", page.url)
            print("Body:", await page.content())
            await browser.close()
            return
            
        print("Clicking grid...")
        await btn_grid.click(force=True)
        await page.wait_for_timeout(1000)
        
        # Check if the class changed
        classes = await btn_grid.get_attribute("class")
        if "text-primary-400" in classes:
            print("SUCCESS! Grid button is active.")
        else:
            print("FAIL! Grid button is NOT active. Classes:", classes)

        print("Clicking table...")
        await btn_table.click(force=True)
        await page.wait_for_timeout(1000)
        
        classes = await btn_table.get_attribute("class")
        if "text-primary-400" in classes:
            print("SUCCESS! Table button is active.")
        else:
            print("FAIL! Table button is NOT active. Classes:", classes)

        await browser.close()

if __name__ == "__main__":
    asyncio.run(main())
