# Truther v1 🛡️

**AI-powered fact-checking platform** that verifies claims, URLs, images, and videos using intelligent web scraping and Google's Gemini AI.

---

## Features

- **Multi-Source Verification**: Analyzes URLs from social media, news sites, and blogs
- **Media Analysis**: Supports image and video uploads for content verification
- **Intelligent Scraping**: Bypasses paywalls and JavaScript-rendered content using Puppeteer
- **Fast Results**: Optimized for 5-10 second scraping and 3-8 second AI analysis
- **Smart Routing**: Automatically chooses between direct API calls or deep web scraping
- **Content Filtering**: Blocks adult content and validates meaningful URLs

---

## Tech Stack

- **Frontend**: Next.js 16, React 19, Tailwind CSS
- **AI Model**: Google Gemini 2.0 Flash
- **Web Scraping**: Puppeteer + Cheerio
- **Deployment**: Vercel-ready with serverless support

---

## Quick Start

```bash
# Install dependencies
npm install

# Add your Gemini API key to .env.local
GEMINI_API_KEY=your_key_here

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## How It Works

### Analysis Pipeline

```
User Input → URL Detection → Route Decision → Scraping (if needed) → Gemini Analysis → Verdict
```

**Routing Logic:**

1. **Fast Path** (Public URLs): YouTube, Reddit, News sites → Direct Gemini API
2. **Deep Scrape** (Protected): Facebook, Twitter, Paywalls → Puppeteer → Gemini
3. **Direct Analysis**: Text claims, images, videos → Gemini multimodal

### Web Scraping

- Launches headless Chrome with Puppeteer
- Blocks images/fonts/CSS for 2-4x speed improvement
- Extracts metadata (title, author, date, description)
- Returns clean text content limited to 8KB

### Gemini Integration

- Model: `gemini-2.0-flash-exp`
- Temperature: 0.4
- Max tokens: 1024
- Supports text, image, and video analysis

---

## Project Structure

```
app/
├── api/
│   ├── analyze/route.ts    # Gemini AI endpoint
│   └── scrape/route.ts     # Web scraping endpoint
├── components/             # UI components
├── services/
│   └── geminiService.ts   # Analysis orchestrator
└── page.tsx               # Main page

lib/
├── browser.ts             # Puppeteer config
└── scrape.ts             # Scraping logic
```

---

## API Endpoints

### POST `/api/scrape`

Scrapes web pages using Puppeteer.

**Request:**
```json
{
  "url": "https://example.com/article"
}
```

**Response:**
```json
{
  "success": true,
  "text": "Article content...",
  "metadata": {
    "title": "Article Title",
    "author": "John Doe",
    "date": "2024-01-15",
    "description": "Brief description"
  }
}
```

### POST `/api/analyze`

Analyzes content with Gemini AI.

**Request (FormData):**
```
textInput: "URL or claim to verify"
fileInput: File (optional)
```

**Response:**
```json
{
  "verdict": "TRUE" | "FALSE" | "UNVERIFIED",
  "explanation": "Detailed analysis...",
  "confidence": 0.85
}
```

---

## Configuration

### Environment Variables

```env
GEMINI_API_KEY=your_gemini_api_key
VERCEL=false  # Set true for production
```

### Puppeteer Modes

**Local Development:**
- Visible browser window
- Stealth plugin enabled
- Full debugging

**Production (Vercel):**
- Headless mode
- @sparticuz/chromium
- Optimized for serverless

---

## Performance

| Operation | Time |
|-----------|------|
| Web Scraping | 5-10s |
| Gemini Analysis | 3-8s |
| **Total** | **8-18s** |

**Optimizations Applied:**
- Changed `networkidle0` → `domcontentloaded`
- Block images, fonts, CSS
- Truncate content to 8KB
- Use Gemini Flash model
- Reduced timeout from 45s → 15s

---

## Deployment

### Vercel

1. Push to GitHub
2. Import in Vercel
3. Add `GEMINI_API_KEY` environment variable
4. Deploy

**Note**: Hobby plan has 10s timeout limit. Upgrade for longer scraping tasks.

---

## Known Issues

**Stealth Plugin Error**: `utils.typeOf is not a function`
- Caused by version mismatch between puppeteer-extra and puppeteer
- Solution: Remove stealth plugin or use puppeteer@21.11.0

**Vercel Timeouts**: Long scraping tasks may timeout
- Solution: Upgrade plan or optimize target URLs

---

## License

MIT License - Use freely for personal and commercial projects.