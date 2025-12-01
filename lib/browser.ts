import puppeteer from "puppeteer";

export async function getBrowser() {
  const isServerless = !!process.env.VERCEL;

  if (isServerless && process.env.BROWSERLESS_TOKEN) {
    // Use Browserless.io for Vercel
    const browser = await puppeteer.connect({
      browserWSEndpoint: `wss://chrome.browserless.io?token=${process.env.BROWSERLESS_TOKEN}`,
    });
    return browser;
  }

  // Local development or fallback
  try {
    const puppeteerExtra = require("puppeteer-extra");
    const StealthPlugin = require("puppeteer-extra-plugin-stealth");
    puppeteerExtra.use(StealthPlugin());
    
    return await puppeteerExtra.launch({
      headless: true,
      defaultViewport: { width: 1280, height: 800 },
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage",
      ],
    });
  } catch (error) {
    console.warn("Stealth plugin failed, using regular puppeteer:", error);
    
    return puppeteer.launch({
      headless: true,
      defaultViewport: { width: 1280, height: 800 },
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage",
      ],
    });
  }
}
// ```

// Get free token at: https://www.browserless.io/ (1000 free requests/month)

// Add to Vercel environment variables:
// ```
// BROWSERLESS_TOKEN=your_token_here