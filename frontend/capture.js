import puppeteer from 'puppeteer';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const screenshotsDir = path.resolve(__dirname, '../docs/screenshots');

async function delay(time) {
  return new Promise(function(resolve) { 
      setTimeout(resolve, time)
  });
}

async function capture() {
  console.log("Launching browser...");
  const browser = await puppeteer.launch({ 
    headless: "new",
    defaultViewport: { width: 1280, height: 800 },
    executablePath: 'C:/Users/ASUS/.cache/puppeteer/chrome/win64-151.0.7922.77/chrome-win64/chrome.exe'
  });
  const page = await browser.newPage();
  
  try {
    console.log("Navigating to Landing...");
    await page.goto('http://localhost:3000/', { waitUntil: 'networkidle0' });
    await page.screenshot({ path: path.join(screenshotsDir, 'landing.png') });

    console.log("Navigating to Register...");
    await page.goto('http://localhost:3000/register', { waitUntil: 'networkidle0' });
    await page.screenshot({ path: path.join(screenshotsDir, 'register.png') });

    // Fill Register
    console.log("Filling register form...");
    await page.type('input[type="text"]', 'Demo User'); // Name
    await page.type('input[type="email"]', 'demo_user_123@example.com');
    await page.type('input[type="password"]', 'Password123!'); // Password
    
    // Attempt to submit register
    const submitBtn = await page.$$('button[type="submit"]');
    if (submitBtn.length > 0) {
        await submitBtn[0].click();
        await delay(2000);
    }
    
    console.log("Navigating to Login...");
    await page.goto('http://localhost:3000/login', { waitUntil: 'networkidle0' });
    await page.screenshot({ path: path.join(screenshotsDir, 'login.png') });

    // Fill Login
    console.log("Filling login form...");
    const emailInputs = await page.$$('input[type="email"]');
    if(emailInputs.length > 0) {
      // clear first
      await emailInputs[0].click({clickCount: 3});
      await emailInputs[0].type('demo_user_123@example.com');
    }
    const pwdInputs = await page.$$('input[type="password"]');
    if(pwdInputs.length > 0) {
      await pwdInputs[0].click({clickCount: 3});
      await pwdInputs[0].type('Password123!');
    }
    
    if (submitBtn.length > 0) {
      const loginBtn = await page.$$('button[type="submit"]');
      if (loginBtn.length > 0) await loginBtn[0].click();
    }
    
    console.log("Waiting for dashboard...");
    await delay(3000); // wait for login to redirect
    
    console.log("Navigating to Dashboard...");
    await page.goto('http://localhost:3000/dashboard', { waitUntil: 'networkidle0' });
    await page.screenshot({ path: path.join(screenshotsDir, 'dashboard.png') });

    console.log("Navigating to Expenses...");
    await page.goto('http://localhost:3000/expenses', { waitUntil: 'networkidle0' });
    await page.screenshot({ path: path.join(screenshotsDir, 'expenses.png') });

    console.log("Navigating to Income...");
    await page.goto('http://localhost:3000/income', { waitUntil: 'networkidle0' });
    await page.screenshot({ path: path.join(screenshotsDir, 'income.png') });

    console.log("Navigating to Budget...");
    await page.goto('http://localhost:3000/budget', { waitUntil: 'networkidle0' });
    await page.screenshot({ path: path.join(screenshotsDir, 'budget.png') });

    console.log("Navigating to Goals...");
    await page.goto('http://localhost:3000/goals', { waitUntil: 'networkidle0' });
    await page.screenshot({ path: path.join(screenshotsDir, 'goals.png') });

    console.log("Navigating to Categories...");
    await page.goto('http://localhost:3000/categories', { waitUntil: 'networkidle0' });
    await page.screenshot({ path: path.join(screenshotsDir, 'categories.png') });

    console.log("Navigating to Reminders...");
    await page.goto('http://localhost:3000/reminders', { waitUntil: 'networkidle0' });
    await page.screenshot({ path: path.join(screenshotsDir, 'reminders.png') });
    
    console.log("Navigating to Analytics...");
    await page.goto('http://localhost:3000/analytics', { waitUntil: 'networkidle0' });
    await page.screenshot({ path: path.join(screenshotsDir, 'analytics.png') });

  } catch (error) {
    console.error("Error capturing screenshots:", error);
  } finally {
    await browser.close();
    console.log("Done.");
  }
}

capture();
