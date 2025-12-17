import puppeteer from "puppeteer";

export async function getBrowser() {

  if (process.env.BROWSERLESS_TOKEN) {
    // Use Browserless.io for Vercel
    const browser = await puppeteer.connect({
      browserWSEndpoint: `wss://chrome.browserless.io?token=${process.env.BROWSERLESS_TOKEN}`,
    });
    return browser;
  }
  else {
    throw new Error("Browserless token not found");
  }
}
// ```

// Get free token at: https://www.browserless.io/ (1000 free requests/month)

// Add to Vercel environment variables:
// ```
// BROWSERLESS_TOKEN=your_token_here