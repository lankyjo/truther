import { GoogleGenAI } from "@google/genai";
import { AnalysisResult } from '../types';

const getGeminiClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API Key not found. Please ensure process.env.API_KEY is set.");
  }
  return new GoogleGenAI({ apiKey });
};

// Helper to convert File to Base64
const fileToGenerativePart = async (file: File): Promise<{ inlineData: { data: string; mimeType: string } }> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      const base64Data = base64String.split(',')[1];
      resolve({
        inlineData: {
          data: base64Data,
          mimeType: file.type,
        },
      });
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

// --- DECISION LOGIC HELPERS ---

function extractUrl(text: string): string | null {
  const match = text.match(/(https?:\/\/[^\s]+)/);
  return match ? match[0] : null;
}

function isPublicAndIndexable(url: string): boolean {
  const u = url.toLowerCase();
  return (
    u.includes('youtube.com') ||
    u.includes('youtu.be') ||
    (u.includes('tiktok.com') && !u.includes('/photo/')) ||  // TikTok videos are usually public
    (u.includes('twitter.com') && !u.includes('/status/')) || (u.includes('/status/') && !u.includes('protected')) ||
    (u.includes('x.com') && !u.includes('/i/spaces')) ||
    u.includes('reddit.com') ||
    u.includes('news.') ||
    u.includes('.gov') ||
    u.includes('bbc.') || u.includes('reuters.') || u.includes('apnews.')
  );
}

function requiresRealBrowser(url: string): boolean {
  const u = url.toLowerCase();
  // We expand this list to catch more sites that prefer scraping over simple API inference
  return (
    u.includes('facebook.com') ||
    u.includes('instagram.com') ||
    u.includes('twitter.com') ||
    u.includes('x.com') ||
    u.includes('tiktok.com') ||
    u.includes('nytimes.com') ||
    u.includes('wsj.com') ||
    u.includes('washingtonpost.com')
  );
}

// --- REAL BROWSER SCRAPER (Client-Side Implementation) ---
// Note: Actual Puppeteer/Playwright requires Node.js. 
// We implement a functional equivalent using CORS Proxy + DOMParser for the browser.

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
  console.log(`[Tool B] Executing Client-Side Scrape for: ${url}`);
  
  try {
    // 1. Use a CORS Proxy to bypass Same-Origin Policy (browser restriction)
    // We use allorigins.win (free, reliable proxy) to get the raw HTML
    const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`;
    
    const response = await fetch(proxyUrl);
    if (!response.ok) throw new Error("Network response was not ok");
    
    const htmlString = await response.text();

    // 2. Parse HTML using the browser's native DOMParser
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlString, "text/html");

    // 3. Extract Metadata (OpenGraph, Twitter Cards, Standard Meta)
    const getMeta = (prop: string) => 
      doc.querySelector(`meta[property="${prop}"]`)?.getAttribute('content') ||
      doc.querySelector(`meta[name="${prop}"]`)?.getAttribute('content') || 
      '';

    const title = getMeta('og:title') || getMeta('twitter:title') || doc.title || '';
    const description = getMeta('og:description') || getMeta('twitter:description') || getMeta('description') || '';
    const siteName = getMeta('og:site_name') || '';
    const author = getMeta('author') || getMeta('article:author') || siteName;
    const date = getMeta('article:published_time') || getMeta('date') || '';

    // 4. Extract Body Text (Simple cleaning)
    // Remove scripts, styles, and empty lines
    const scripts = doc.querySelectorAll('script, style, noscript, iframe, svg');
    scripts.forEach(node => node.remove());
    
    let bodyText = doc.body.innerText || doc.body.textContent || "";
    bodyText = bodyText.replace(/\s+/g, ' ').trim().substring(0, 3000); // Limit context window

    if (!title && !bodyText) {
      throw new Error("No readable content extracted");
    }

    return {
      success: true,
      metadata: {
        title,
        author,
        date,
        description,
        siteName
      },
      text: bodyText
    };

  } catch (error) {
    console.warn(`[Tool B] Scraping failed:`, error);
    return { success: false };
  }
}

// --- MAIN ANALYZER (Tool A: Gemini + Search) ---

async function analyzeWithGemini(textInput: string, fileInput: File | null): Promise<AnalysisResult> {
  const ai = getGeminiClient();

  const systemInstruction = `
    You are TRUTHER, a professional verified intelligence analyst.
    
    YOUR GOAL:
    Determine if the provided content is TRUE, FAKE, or AI-GENERATED.
    
    *** STRATEGIC ANALYSIS PROTOCOL ***
    
    PHASE 1: INPUT PROCESSING
    - If input contains "REAL EXTRACTED CONTENT", analyze that directly.
    - If input contains "WARNING: This appears to be behind a login wall", execute "Metadata Mining" (Phase 2).
    - If input is a standard public URL, analyze directly.
    
    PHASE 2: TECHNIQUE FOR LOGIN WALLS ("Metadata Mining")
    - DO NOT attempt to "scrape" or "read" the login page itself.
    - INSTEAD, use Google Search to find "Publicly Indexed Metadata":
      1. EXTRACT ID: Isolate the unique numeric/alphanumeric ID from the URL.
      2. SEARCH ID: Search specifically for this ID + "video" or "post".
      3. SEARCH CAPTIONS: If URL slug has keywords, search them.
      4. TARGET: Look for search snippets that contain:
         - The video title/description (often indexed).
         - "Partial Transcripts" cached by search engines.
         - Reposts on public sites (YouTube, DailyMotion).
         - Fact-check articles referencing this ID.
         
    PHASE 3: VERDICT SYNTHESIS
    - IF EXTERNAL EVIDENCE FOUND: Cross-reference findings to determine truth.
    - IF ONLY LOGIN WALL FOUND: Return "UNCERTAIN". State: "Content is behind a login wall and no publicly indexed metadata or fact-checks were found." (DO NOT HALLUCINATE).
    
    CRITICAL:
    - Return valid JSON. No Markdown code blocks.
    
    OUTPUT SCHEMA:
    {
      "status": "VERIFIED_REAL" | "LIKELY_REAL" | "UNCERTAIN" | "LIKELY_FAKE" | "CONFIRMED_FAKE",
      "score": number, // 0-100 Confidence
      "title": "Descriptive Title",
      "simpleSummary": "2 sentence summary.",
      "detailedAnalysis": "Methodology and findings.",
      "contentDate": "YYYY-MM-DD" or "Unknown", 
      "isBreakingNews": boolean,
      "isAiGenerated": boolean,
      "sources": [{ "title": "Source", "url": "URL", "category": "NEWS" }]
    }
  `;

  const parts: any[] = [];

  if (fileInput) {
    const filePart = await fileToGenerativePart(fileInput);
    parts.push(filePart);
  }

  if (textInput) {
    parts.push({ 
      text: `TARGET DATA: "${textInput}"
      
      EXECUTE PROTOCOL.
      RETURN ONLY JSON.` 
    });
  }

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: { parts: parts },
      config: {
        systemInstruction: systemInstruction,
        tools: [{ googleSearch: {} }],
      },
    });

    const responseText = response.text;
    if (!responseText) throw new Error("No response from AI.");

    let data;
    try {
      let cleanText = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
      const firstOpen = cleanText.indexOf('{');
      const lastClose = cleanText.lastIndexOf('}');
      if (firstOpen !== -1 && lastClose !== -1 && lastClose > firstOpen) {
        data = JSON.parse(cleanText.substring(firstOpen, lastClose + 1));
      } else {
        data = JSON.parse(cleanText);
      }
    } catch (e) {
      console.error("Failed to parse JSON:", responseText);
      data = {
         status: "UNCERTAIN",
         score: 0,
         title: "Analysis Parse Error",
         simpleSummary: "The AI returned a response that could not be processed automatically.",
         detailedAnalysis: "Raw Output: " + responseText.substring(0, 500) + "...",
         contentDate: "Unknown",
         isBreakingNews: false,
         isAiGenerated: false,
         sources: []
      };
    }
    
    const cleanSources = (data.sources || []).slice(0, 5).map((s: any) => ({
      title: s.title || "Reference",
      url: s.url || "#",
      category: s.category || "UNCATEGORIZED"
    }));

    return {
      status: data.status || "UNCERTAIN",
      score: typeof data.score === 'number' ? data.score : 0,
      title: data.title || "Unknown Content",
      simpleSummary: data.simpleSummary || "No summary provided.",
      detailedAnalysis: data.detailedAnalysis || "No details provided.",
      contentDate: data.contentDate || "Unknown",
      isBreakingNews: !!data.isBreakingNews,
      isAiGenerated: !!data.isAiGenerated,
      sources: cleanSources
    };

  } catch (error: any) {
    console.error("Gemini Analysis Error:", error);
    if (error.message && error.message.includes("SAFETY")) {
         throw new Error("Content flagged by safety filters.");
    }
    throw new Error(error.message || "Unable to analyze content.");
  }
}

// --- SMART ANALYZE (Orchestrator) ---

async function smartAnalyze(urlOrText: string, file: File | null): Promise<AnalysisResult> {
  const url = extractUrl(urlOrText);

  // 1. QUICK WIN: Public platforms that Google already indexes well
  if (url && isPublicAndIndexable(url)) {
    console.log("Fast path: Public & searchable → use Gemini only");
    return await analyzeWithGemini(urlOrText, file);
  }

  // 2. SCRAPER PATH: Try to get metadata via Browser Scrape (simulated Puppeteer)
  if (url && requiresRealBrowser(url)) {
    console.log("Deep content detected → Launching Browser Scraper (Tool B)");
    const scraped = await scrapeWithBrowserEngine(url);
    
    if (scraped.success && scraped.metadata) {
      console.log("Scrape successful → Feeding extracted data to Gemini");
      
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
      console.log("Scraper blocked/failed → Falling back to Metadata Mining (Tool A)");
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