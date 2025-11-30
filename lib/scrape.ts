import { getBrowser } from "./browser";
import * as cheerio from "cheerio";

export async function scrapePage(url: string) {
    const browser = await getBrowser();
    const page = await browser.newPage();

    // 🚀 Aggressive resource blocking
    await page.setRequestInterception(true);
    page.on("request", (req: any) => {
        const block = ["image", "font", "media", "stylesheet", "other"];
        if (block.includes(req.resourceType())) return req.abort();
        req.continue();
    });

    // Disable cache
    const client = await page.target().createCDPSession();
    await client.send("Network.setCacheDisabled", { cacheDisabled: true });

    // ⚡ REDUCED timeouts
    page.setDefaultTimeout(15000); // 15s max
    page.setDefaultNavigationTimeout(15000);

    try {
        // ⏳ Load FASTER - only wait for domcontentloaded
        await page.goto(url, {
            waitUntil: "domcontentloaded", // ← Changed from networkidle0
            timeout: 10000,
        });

        // Wait for basic content (short timeout)
        await page.waitForSelector("body", { timeout: 3000 });
    } catch (error) {
        console.warn("Page load timeout, continuing anyway:", error);
    }

    // Extract content
    const html = await page.content();
    const text = await page.evaluate(() => document.body.innerText);
    const $ = cheerio.load(html);

    await browser.close();

    // 🧠 Metadata extraction (no screenshots for now)
    const metadata = {
        title: $("title").text() || "",
        description:
            $('meta[name="description"]').attr("content") ||
            $('meta[property="og:description"]').attr("content") ||
            "",
        siteName: $('meta[property="og:site_name"]').attr("content") || "",
        author:
            $('meta[name="author"]').attr("content") ||
            $('meta[property="article:author"]').attr("content") ||
            "",
        date:
            $('meta[property="article:published_time"]').attr("content") ||
            $('meta[name="date"]').attr("content") ||
            "",
    };

    return {
        url,
        text: text.slice(0, 8000), // ← Limit text size
        metadata,
    };
}