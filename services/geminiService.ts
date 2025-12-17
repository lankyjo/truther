import { AnalysisResult } from '../types';

// --- CLIENT-SIDE ANALYSIS FUNCTION ---
// This function now calls our server-side API route instead of the Gemini API directly.

async function analyzeWithGemini(textInput: string, fileInput: File | null): Promise<AnalysisResult> {
  const formData = new FormData();
  formData.append('textInput', textInput);
  if (fileInput) {
    formData.append('fileInput', fileInput);
  }

  const response = await fetch('/api/analyze', {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Failed to analyze content.');
  }

  const result: AnalysisResult = await response.json();
  return result;
}

// --- DECISION LOGIC HELPERS ---
// These functions remain client-side as they don't require the API key.

function extractUrl(text: string): string | null {
  const match = text.match(/(https?:\/\/[^\s]+)/);
  return match ? match[0] : null;
}

function isPublicAndIndexable(url: string): boolean {
  const u = url.toLowerCase();
  return (
    u.includes('youtube.com') ||
    u.includes('youtu.be') ||
    (u.includes('tiktok.com') && !u.includes('/photo/')) ||
    u.includes('reddit.com') ||
    u.includes('news.') ||
    u.includes('.gov') ||
    u.includes('bbc.') || u.includes('reuters.') || u.includes('apnews.')
  );
}

function requiresRealBrowser(url: string): boolean {
  const u = url.toLowerCase();
  return (
    u.includes('facebook.com') ||
    u.includes('instagram.com') ||
    u.includes('twitter.com') ||
    u.includes('x.com') ||
    (u.includes('x.com') && !u.includes('/i/spaces')) ||
    (u.includes('twitter.com') && !u.includes('/status/')) || (u.includes('/status/') && !u.includes('protected')) ||
    u.includes('tiktok.com') ||
    u.includes('nytimes.com') ||
    u.includes('wsj.com') ||
    u.includes('washingtonpost.com') ||
    true // Default to browser scrape for robustness if not simple news
  );
}

// --- REAL BROWSER SCRAPER (Client-Side) ---
// This function calls the server-side scrape API route.

interface ScrapeResult {
  success: boolean;
  metadata?: {
    title: string;
    author: string;
    date: string;
    description: string;
    siteName: string;
  };
  text?: string;
}

async function scrapeWithBrowserEngine(url: string): Promise<ScrapeResult> {
  console.log(`[Tool B] Requesting Server-Side Scrape for: ${url}`);

  try {
    const response = await fetch('/api/scrape', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ url }),
    });

    if (!response.ok) throw new Error("Scrape API failed");

    const data = await response.json();

    if (!data.success) {
      throw new Error(data.error || "Unknown scrape error");
    }

    return {
      success: true,
      metadata: data.metadata,
      text: data.text
    };

  } catch (error) {
    console.warn(`[Tool B] Scraping failed:`, error);
    return { success: false };
  }
}

// --- SMART ANALYZE (Orchestrator) ---
// This function orchestrates the client-side logic and calls the appropriate API routes.

async function smartAnalyze(urlOrText: string, file: File | null): Promise<AnalysisResult> {
  const url = extractUrl(urlOrText);

  // 1. QUICK WIN: Public platforms that Google already indexes well
  if (url && isPublicAndIndexable(url)) {
    console.log("Fast path: Public & searchable → use Gemini API via server route only");
    return await analyzeWithGemini(urlOrText, file);
  }

  // 2. SERVER-SIDE SCRAPER: Use Puppeteer API route
  if (url && requiresRealBrowser(url)) {
    console.log("Deep content detected → Launching Server-Side Puppeteer");
    const scraped = await scrapeWithBrowserEngine(url);

    if (scraped.success && scraped.metadata) {
      console.log("Scrape successful → Feeding extracted data to Gemini API via server route");

      const structuredPrompt = `
        REAL EXTRACTED CONTENT (Sourced from ${url}):
        
        [METADATA]
        Title: ${scraped.metadata.title}
        Author: ${scraped.metadata.author}
        Published: ${scraped.metadata.date}
        Description: ${scraped.metadata.description}
        Site: ${scraped.metadata.siteName}
        
        [PAGE CONTENT SNIPPET]
        ${scraped.text}
        
        Original URL: ${url}
      `;

      return await analyzeWithGemini(structuredPrompt, file);
    } else {
      console.log("Scraper blocked/failed → Falling back to Gemini API via server route with warning");
      return await analyzeWithGemini(urlOrText + "\n\nWARNING: This appears to be behind a login wall. The direct scrape was blocked.", file);
    }
  }

  // 3. Everything else (text claims, no URL, etc.)
  return await analyzeWithGemini(urlOrText, file);
}

// Main Export
export const analyzeContent = async (textInput: string, fileInput: File | null): Promise<AnalysisResult> => {
  return await smartAnalyze(textInput, fileInput);
};
