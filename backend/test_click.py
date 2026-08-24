import asyncio
from playwright.async_api import async_playwright
import json

async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True, channel="msedge")
        context = await browser.new_context()
        page = await context.new_page()

        await page.add_init_script("""
            localStorage.setItem('zenith_token', 'dummy-token');
            localStorage.setItem('zenith_user', JSON.stringify({
              id: "test", name: "Test User", email: "test@test.com", role: "user"
            }));
        """)

        await page.goto("http://localhost:3000/reports")
        await page.wait_for_timeout(2000)

        select = await page.query_selector('select')
        if select:
            box = await select.bounding_box()
            if box:
                print("Select box:", box)
                x = box['x'] + 5
                y = box['y'] + 5
                el = await page.evaluate(f"""
                    () => {{
                        const e = document.elementFromPoint({x}, {y});
                        return e ? {{ tag: e.tagName, cls: e.className, id: e.id }} : null;
                    }}
                """)
                print("Element at top:", el)
        else:
            print("Select not found")

        await browser.close()

if __name__ == "__main__":
    asyncio.run(main())
