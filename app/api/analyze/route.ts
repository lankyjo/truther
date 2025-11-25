import { GoogleGenAI } from "@google/genai";
import { NextResponse } from "next/server";
import { AnalysisResult } from "@/types";

// --- SERVER-SIDE GEMINI LOGIC ---

const getGeminiClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    // This error will now correctly be thrown on the server-side.
    throw new Error("API Key not found. Please ensure process.env.API_KEY is set in your server environment.");
  }
  return new GoogleGenAI({ apiKey });
};

// Helper to convert File to Base64 on the server
const fileToGenerativePart = async (file: File): Promise<{ inlineData: { data: string; mimeType: string } }> => {
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    return {
        inlineData: {
            data: buffer.toString("base64"),
            mimeType: file.type,
        },
    };
};


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

// --- API ROUTE HANDLER ---

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const textInput = formData.get("textInput") as string | null;
    const fileInput = formData.get("fileInput") as File | null;

    if (!textInput && !fileInput) {
      return NextResponse.json({ error: "No input provided" }, { status: 400 });
    }
    
    const result = await analyzeWithGemini(textInput || "", fileInput);

    return NextResponse.json(result);
  } catch (error: any) {
    console.error("[API/ANALYZE] Error:", error);
    return NextResponse.json({ error: error.message || "An unknown error occurred." }, { status: 500 });
  }
}