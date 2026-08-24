const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  // Inject token
  await page.addInitScript(() => {
    localStorage.setItem('zenith_token', 'dummy-token');
    localStorage.setItem('zenith_user', JSON.stringify({
      id: "test", name: "Test User", email: "test@test.com", role: "user"
    }));
  });

  // Login properly
  await page.goto('http://localhost:3000/');
  await page.click('text="Sign In"');
  await page.waitForTimeout(1000);
  await page.fill('input[type="email"]', 'test@example.com');
  await page.fill('input[type="password"]', 'password123');
  await page.click('button[type="submit"]');
  await page.waitForTimeout(2000);

  await page.goto('http://localhost:3000/budget');
  await page.waitForTimeout(2000);

  const btn = await page.$('#budget-view-grid');
  if (btn) {
    const box = await btn.boundingBox();
    console.log('Button box:', box);
    if (box) {
      const el = await page.evaluate(({x, y}) => {
        const e = document.elementFromPoint(x, y);
        if (!e) return null;
        
        // Find if any parent is AIFloatingWidget or TopNavbar
        let current = e;
        let parents = [];
        while(current && current !== document.documentElement) {
          parents.push(`${current.tagName.toLowerCase()}${current.id ? '#'+current.id : ''}${current.className ? '.'+current.className.split(' ').join('.') : ''}`);
          current = current.parentElement;
        }
        
        return {
          tag: e.tagName,
          id: e.id,
          classes: e.className,
          hierarchy: parents
        };
      }, { x: box.x + box.width / 2, y: box.y + box.height / 2 });
      
      console.log('Element at center:', JSON.stringify(el, null, 2));
    }
  } else {
    console.log('Button not found');
  }

  await browser.close();
})();
