import chromium from "@sparticuz/chromium";
import puppeteer from "puppeteer";

export async function getBrowser() {
  const isServerless = !!process.env.VERCEL;

  if (isServerless) {
    const executablePath = await chromium.executablePath();

    return puppeteer.launch({
      executablePath,
      args: [
        ...chromium.args,
        "--no-sandbox",
        "--disable-dev-shm-usage",
        "--disable-gpu",
        "--disable-features=IsolateOrigins,site-per-process",
      ],
      headless: true,
      defaultViewport: { width: 1280, height: 800 },
    });
  }

  // Local - try to use puppeteer-extra with stealth
  try {
    const puppeteerExtra = require("puppeteer-extra");
    const StealthPlugin = require("puppeteer-extra-plugin-stealth");
    puppeteerExtra.use(StealthPlugin());
    
    return await puppeteerExtra.launch({
      headless: false,
      defaultViewport: { width: 1280, height: 800 },
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });
  } catch (error) {
    console.warn("Stealth plugin failed, using regular puppeteer:", error);
    // Fallback to regular puppeteer
    return puppeteer.launch({
      headless: false,
      defaultViewport: { width: 1280, height: 800 },
    });
  }
}