'use client';

import React, { useState, useCallback } from 'react';
import { Header } from '../components/Header';
import { AnalysisInput } from '../components/AnalysisInput';
import { LoadingFactScreen } from '../components/LoadingFactScreen';
import { ResultDisplay } from '../components/ResultDisplay';
import { analyzeContent } from '../services/geminiService';
import { AnalysisResult, AppState } from '../types';

const Page: React.FC = () => {
  const [appState, setAppState] = useState<AppState>('IDLE');
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleAnalyze = useCallback(async (textInput: string, fileInput: File | null) => {
    // 1. Check for Generic Homepages (Social Media, News, Search Engines)
    const genericHomepageRegex = /^(https?:\/\/)?(www\.)?(facebook|instagram|twitter|x|tiktok|youtube|google|bing|yahoo|reddit|linkedin)\.com\/?$/i;
    
    // 2. Check for Adult Content Keywords in the URL or text
    const adultRegex = /\b(porn|sex|xxx|nsfw|nude|naked|xvideos|xnxx|pornhub)\b/i;

    if (textInput && genericHomepageRegex.test(textInput.trim())) {
        setError("Please provide a specific link to a post, article, or video. We cannot verify a generic homepage.");
        return;
    }

    if (textInput && adultRegex.test(textInput)) {
        setError("Content flagged. We only process public information and news verification.");
        return;
    }

    if (!textInput.trim() && !fileInput) {
      setError("Please provide a link, text, or upload an image/video.");
      return;
    }

    setAppState('LOADING');
    setError(null);
    setResult(null);

    try {
      const data = await analyzeContent(textInput, fileInput);
      setResult(data);
      setAppState('RESULT');
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Something went wrong. Please try again.");
      setAppState('IDLE');
    }
  }, []);

  const handleReset = useCallback(() => {
    setAppState('IDLE');
    setResult(null);
    setError(null);
  }, []);

  return (
    <div className="flex flex-col min-h-screen bg-white text-black font-sans selection:bg-black selection:text-white relative overflow-hidden">
      
      {/* Moving Grid Background */}
      <div className="fixed inset-0 bg-grid-moving pointer-events-none z-0 opacity-40"></div>

      <Header />

      <main className="flex-grow container mx-auto px-4 py-12 max-w-3xl flex flex-col justify-center relative z-10">
        
        {/* Loading Overlay */}
        {appState === 'LOADING' && (
          <LoadingFactScreen />
        )}

        {/* Content Wrapper with Blur Transitions */}
        <div className={`transition-all duration-700 ease-in-out transform ${
            appState === 'LOADING' 
              ? 'opacity-0 blur-lg scale-95 pointer-events-none' 
              : 'opacity-100 blur-0 scale-100'
          }`}>
          
          {appState === 'IDLE' && (
            <div className="w-full">
              <div className="text-center mb-12">
                <h2 className="text-4xl md:text-5xl font-black text-black mb-6 uppercase font-display tracking-tight leading-none reveal-text">
                  Truth Verification<br/>Protocol
                </h2>
                <p className="text-lg font-mono text-gray-600 max-w-xl mx-auto reveal-text stagger-1">
                  Paste any URL. We scan the web for context, debunking reports, and viral verification. No download needed.
                </p>
              </div>
              
              <div className="reveal-text stagger-2">
                <AnalysisInput onAnalyze={handleAnalyze} />
              </div>
              
              {error && (
                <div className="mt-8 p-4 bg-red-50 border-2 border-red-600 text-red-700 shadow-hard-sm font-mono text-sm reveal-text stagger-1" role="alert">
                  <p className="font-bold uppercase mb-1 flex items-center gap-2">
                    <span className="text-xl">🚫</span> Input Rejected
                  </p>
                  <p>{error}</p>
                </div>
              )}

              <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
                <div className="p-6 border-2 border-gray-100 bg-white hover:border-black transition-all hover:-translate-y-2 hover:shadow-hard duration-300 reveal-text stagger-3 group">
                  <div className="text-3xl mb-3 grayscale group-hover:grayscale-0 transition-all">🛡️</div>
                  <h3 className="font-bold font-display uppercase tracking-wider text-black">Secure Scan</h3>
                </div>
                <div className="p-6 border-2 border-gray-100 bg-white hover:border-black transition-all hover:-translate-y-2 hover:shadow-hard duration-300 reveal-text stagger-4 group">
                  <div className="text-3xl mb-3 grayscale group-hover:grayscale-0 transition-all">👁️</div>
                  <h3 className="font-bold font-display uppercase tracking-wider text-black">AI Detect</h3>
                </div>
                <div className="p-6 border-2 border-gray-100 bg-white hover:border-black transition-all hover:-translate-y-2 hover:shadow-hard duration-300 reveal-text stagger-5 group">
                  <div className="text-3xl mb-3 grayscale group-hover:grayscale-0 transition-all">⚡</div>
                  <h3 className="font-bold font-display uppercase tracking-wider text-black">Fast Results</h3>
                </div>
              </div>
            </div>
          )}

          {appState === 'RESULT' && result && (
            <ResultDisplay result={result} onReset={handleReset} />
          )}
        </div>
      </main>

      <footer className="border-t-2 border-black py-8 mt-auto bg-white relative z-10 reveal-text stagger-5">
        <div className="container mx-auto px-4 text-center">
          <p className="font-mono text-xs text-gray-500 uppercase tracking-widest">
            © {new Date().getFullYear()} Truther_v1 // Verified Intelligence
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Page;
