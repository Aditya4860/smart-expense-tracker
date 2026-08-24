import asyncio
from playwright.async_api import async_playwright

async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True, channel="msedge")
        context = await browser.new_context()
        page = await context.new_page()

        await page.goto("http://localhost:3000/")
        # click login
        await page.click('text="Sign In"')
        await page.wait_for_timeout(1000)
        
        # fill email password
        await page.fill('input[type="email"]', 'test@example.com')
        await page.fill('input[type="password"]', 'password123')
        await page.click('button[type="submit"]')
        
        await page.wait_for_timeout(2000)
        
        # Now go to goals
        await page.goto("http://localhost:3000/goals")
        await page.wait_for_timeout(2000)

        # check if button exists
        btn = await page.query_selector('#goal-view-grid')
        if not btn:
            print("Button not found!")
            await browser.close()
            return
            
        print("Button found. Classes:", await btn.get_attribute("class"))
        
        # Click it
        print("Clicking button...")
        try:
            await btn.click(timeout=3000)
            print("Click successful!")
        except Exception as e:
            print("Click failed:", str(e))
        
        await page.wait_for_timeout(500)
        
        print("Classes after click:", await btn.get_attribute("class"))
        
        await browser.close()

if __name__ == "__main__":
    asyncio.run(main())
