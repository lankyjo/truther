import { getBrowser } from "./browser";
import * as cheerio from "cheerio";

export async function scrapePage(url: string) {
    let browser;

    try {
        browser = await getBrowser();
        const page = await browser?.newPage();

        // 🚀 Aggressive resource blocking
        await page?.setRequestInterception(true);
        page?.on("request", (req: any) => {
            const block = ["image", "font", "media", "stylesheet", "other"];
            if (block.includes(req.resourceType())) {
                req.abort().catch(() => { }); // ← Catch abort errors
            } else {
                req.continue().catch(() => { }); // ← Catch continue errors
            }
        });

        // ⚡ REDUCED timeouts
        page?.setDefaultTimeout(15000);
        page?.setDefaultNavigationTimeout(15000);

        let html: string | undefined = "";
        let text: string | undefined = "";

        try {
            // ⏳ Try to load the page
            await page?.goto(url, {
                waitUntil: "domcontentloaded",
                timeout: 10000,
            });

            // Wait for body
            await page?.waitForSelector("body", { timeout: 3000 }).catch(() => { });

            // Extract content
            html = await page?.content();
            text = await page?.evaluate(() => document.body.innerText);

        } catch (navError: any) {
            console.warn("Navigation issue, trying to extract what we can:", navError.message);

            // Try to get whatever content loaded
            try {
                html = await page?.content();
                text = await page?.evaluate(() => document.body?.innerText || "");
            } catch {
                html = "";
                text = "";
            }
        }

        await browser?.close();

        // Parse with Cheerio
        const $ = cheerio.load(html || "<html></html>");

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
            text: text?.slice(0, 8000),
            metadata,
        };

    } catch (error: any) {
        // Close browser if it was opened
        if (browser) {
            await browser.close().catch(() => { });
        }

        throw new Error(`Scraping failed: ${error.message}`);
    }
}