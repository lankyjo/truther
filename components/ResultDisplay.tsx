'use client';

import React from 'react';
import { AnalysisResult, SourceCategory } from '../types';
import { STATUS_CONFIG } from '../constants';

interface ResultDisplayProps {
  result: AnalysisResult;
  onReset: () => void;
}

const SourceBadge: React.FC<{ category: SourceCategory }> = ({ category }) => {
  const styles = {
    'OFFICIAL': 'bg-blue-100 text-blue-800 border-blue-800',
    'NEWS': 'bg-green-100 text-green-800 border-green-800',
    'OPINION': 'bg-yellow-100 text-yellow-800 border-yellow-800',
    'SATIRE': 'bg-purple-100 text-purple-800 border-purple-800',
    'SOCIAL': 'bg-gray-100 text-gray-800 border-gray-800',
    'UNCATEGORIZED': 'bg-gray-50 text-gray-500 border-gray-300',
  };

  return (
    <span className={`text-[10px] font-bold uppercase px-1 py-0.5 border ${styles[category] || styles['UNCATEGORIZED']} mr-2 align-middle`}>
      {category}
    </span>
  );
};

export const ResultDisplay: React.FC<ResultDisplayProps> = ({ result, onReset }) => {
  const config = STATUS_CONFIG[result.status] || STATUS_CONFIG['UNCERTAIN'];

  return (
    <div className="space-y-8 pb-12 w-full">
      
      {/* 1. Breaking News Warning (If applicable) */}
      {result.isBreakingNews && (
        <div className="bg-yellow-400 text-black p-4 border-2 border-black shadow-hard reveal-text">
          <div className="flex items-center gap-3">
            <span className="text-2xl animate-pulse">🚨</span>
            <div>
              <h3 className="font-black font-display uppercase tracking-wider">Developing Story</h3>
              <p className="font-mono text-xs font-bold">Details are changing rapidly. Verification confidence is lower for events &lt;24 hours old.</p>
            </div>
          </div>
        </div>
      )}

      {/* 2. Top Card: The Verdict */}
      <div className={`relative bg-white border-2 ${config.borderColor} p-8 shadow-hard text-center reveal-text stagger-1`}>
        <div className="absolute top-0 left-0 w-full h-1 bg-black"></div>
        
        <div className="text-6xl mb-4 grayscale hover:grayscale-0 transition-all duration-500 transform hover:scale-110 cursor-default inline-block">
          {config.icon}
        </div>
        
        <h2 className={`text-4xl md:text-5xl font-black ${config.color} mb-2 uppercase font-display tracking-tight`}>
          {config.label}
        </h2>
        
        <p className="text-xl font-bold text-black mt-4 border-b-2 border-gray-100 pb-4 inline-block px-4">
          {result.title}
        </p>
        
        {/* Timeline Check (Time Travel) */}
        <div className="mt-6 flex justify-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-gray-100 border border-black text-xs font-mono font-bold uppercase">
            <span>📅 Origin Date:</span>
            <span className={result.contentDate !== 'Unknown' && result.contentDate.includes('202') ? 'text-blue-600' : 'text-gray-600'}>
              {result.contentDate}
            </span>
          </div>
        </div>

        {/* Score Bar */}
        <div className="mt-6 max-w-sm mx-auto font-mono">
          <div className="flex justify-between text-xs font-bold text-black mb-2 uppercase tracking-widest">
            <span>Fake</span>
            <span>Confidence: {result.score}%</span>
            <span>Real</span>
          </div>
          <div className="h-6 border-2 border-black p-1 bg-white">
            <div 
              className={`h-full transition-all duration-1000 ease-out ${
                result.score > 70 ? 'bg-black' : result.score < 30 ? 'bg-black' : 'bg-gray-500'
              }`} 
              style={{ width: '0%', animation: `fillBar 1.5s ease-out forwards 0.5s` }}
            >
              <style>{`
                @keyframes fillBar {
                  to { width: ${result.score}%; }
                }
              `}</style>
            </div>
          </div>
        </div>
      </div>

      {/* 3. AI Detection Warning */}
      {result.isAiGenerated && (
        <div className="bg-black text-white p-4 shadow-hard-sm border-2 border-black flex items-center gap-4 reveal-text stagger-2">
          <div className="text-3xl animate-pulse">🤖</div>
          <div>
            <h3 className="font-bold font-display uppercase tracking-wider text-yellow-400">AI Artifacts Detected</h3>
            <p className="text-sm font-mono text-gray-300">Analysis suggests this content may be synthetically generated.</p>
          </div>
        </div>
      )}

      {/* 4. Grid for details */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Simple Summary */}
        <div className="bg-white border-2 border-black shadow-hard p-6 reveal-text stagger-3 hover:-translate-y-1 transition-transform duration-300 flex flex-col">
          <h3 className="text-lg font-black text-black mb-4 uppercase font-display tracking-wide border-b-2 border-black pb-2">
            01 // Briefing
          </h3>
          <p className="text-lg text-black leading-relaxed font-medium break-words overflow-y-auto max-h-64 custom-scrollbar">
            {result.simpleSummary}
          </p>
        </div>

        {/* Detailed Analysis */}
        <div className="bg-white border-2 border-black shadow-hard p-6 reveal-text stagger-4 hover:-translate-y-1 transition-transform duration-300 flex flex-col">
          <h3 className="text-lg font-black text-black mb-4 uppercase font-display tracking-wide border-b-2 border-black pb-2">
            02 // Evidence
          </h3>
          <p className="text-gray-800 leading-relaxed font-mono text-sm break-words break-all whitespace-pre-wrap overflow-y-auto max-h-64 custom-scrollbar">
            {result.detailedAnalysis}
          </p>
        </div>
      </div>

      {/* 5. Sources with Credibility Badges */}
      {result.sources.length > 0 && (
        <div className="bg-white border-2 border-black shadow-hard p-6 reveal-text stagger-5">
          <h3 className="text-lg font-black text-black mb-4 uppercase font-display tracking-wide border-b-2 border-black pb-2">
            03 // Cited Sources & Credibility
          </h3>
          <ul className="space-y-3">
            {result.sources.map((source, index) => (
              <li key={index}>
                <a 
                  href={source.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="block p-3 bg-gray-50 hover:bg-black hover:text-white border-2 border-gray-200 hover:border-black transition-all group font-mono text-sm truncate"
                >
                  <div className="flex items-center">
                    <span className="font-bold mr-3 w-6 text-center text-gray-400 group-hover:text-white">#{index + 1}</span>
                    <SourceBadge category={source.category} />
                    <span className="underline decoration-1 underline-offset-4 truncate flex-1">{source.title}</span>
                  </div>
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}

      <button 
        onClick={onReset}
        className="w-full py-4 bg-white text-black border-2 border-black font-black text-lg uppercase tracking-wider hover:bg-black hover:text-white shadow-hard hover:shadow-hard-lg hover:-translate-y-1 active:translate-y-0 active:shadow-hard transition-all reveal-text stagger-6"
      >
        Run New Scan
      </button>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f1f1f1;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #000;
          border: 1px solid white;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #333;
        }
      `}</style>
    </div>
  );
};
