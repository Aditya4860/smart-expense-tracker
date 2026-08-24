const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  // inject token
  await page.addInitScript(() => {
    localStorage.setItem('zenith_token', 'dummy-token');
    localStorage.setItem('zenith_user', JSON.stringify({
      id: "test", name: "Test User", email: "test@test.com", role: "user"
    }));
  });

  await page.goto('http://localhost:3000/reports');
  await page.waitForTimeout(2000);

  const select = await page.$('select');
  if (select) {
    const box = await select.boundingBox();
    console.log('Select box:', box);
    if (box) {
      const el = await page.evaluate(({x, y}) => {
        const e = document.elementFromPoint(x, y);
        return e ? { tag: e.tagName, cls: e.className } : null;
      }, { x: box.x + 5, y: box.y + 5 });
      console.log('Element on top:', el);
    }
  }

  await browser.close();
})();
