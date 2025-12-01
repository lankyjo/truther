import chromium from "@sparticuz/chromium";
import puppeteer from "puppeteer-core";
import puppeteerRegular from "puppeteer";

export async function getBrowser() {
  const isServerless = !!process.env.VERCEL;

  if (isServerless) {
    // Vercel/Production
    return puppeteer.launch({
      args: chromium.args,
      defaultViewport: { width: 1280, height: 800 },
      executablePath: await chromium.executablePath(),
      headless: true,
    });
  }

  // Local development - always headless for speed
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
    
    return puppeteerRegular.launch({
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