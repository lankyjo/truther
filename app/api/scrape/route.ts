import { NextRequest, NextResponse } from 'next/server';
import puppeteer from 'puppeteer';

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { url } = body;

  if (!url) {
    return NextResponse.json({ error: 'URL is required' }, { status: 400 });
  }

  console.log(`[API] Launching Puppeteer for: ${url}`);

  try {
    // Launch Puppeteer
    // Note: For Vercel/Serverless, you might need 'puppeteer-core' and '@sparticuz/chromium'
    // This configuration works for standard Next.js servers and local development.
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });

    const page = await browser.newPage();
    
    // Set User Agent to look like a real browser to avoid basic blocking
    await page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');

    // Navigate to page with a reasonable timeout
    await page.goto(url, { 
      waitUntil: 'domcontentloaded', 
      timeout: 15000 // 15s timeout
    });

    // Extract data
    const data = await page.evaluate(() => {
      // Get metadata
      const getMeta = (prop: string) => 
        document.querySelector(`meta[property="${prop}"]`)?.getAttribute('content') ||
        document.querySelector(`meta[name="${prop}"]`)?.getAttribute('content') || 
        '';

      const title = getMeta('og:title') || getMeta('twitter:title') || document.title || '';
      const description = getMeta('og:description') || getMeta('twitter:description') || getMeta('description') || '';
      const siteName = getMeta('og:site_name') || '';
      const author = getMeta('author') || getMeta('article:author') || siteName;
      const date = getMeta('article:published_time') || getMeta('date') || '';

      // Get Body Text (Cleaning scripts/styles)
      const scripts = document.querySelectorAll('script, style, noscript, iframe, svg, nav, footer');
      scripts.forEach(node => node.remove());
      
      let bodyText = document.body.innerText || document.body.textContent || "";
      bodyText = bodyText.replace(/\s+/g, ' ').trim().substring(0, 5000); // Cap at 5000 chars

      return {
        metadata: {
          title,
          description,
          siteName,
          author,
          date
        },
        text: bodyText
      };
    });

    await browser.close();

    return NextResponse.json({ 
      success: true, 
      ...data 
    });

  } catch (error: any) {
    console.error('[API] Scrape failed:', error);
    return NextResponse.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 });
  }
}
