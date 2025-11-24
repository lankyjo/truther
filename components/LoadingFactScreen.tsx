'use client';

import React, { useState, useEffect } from 'react';
import { LOADING_STATS } from '../constants';

const STEPS = [
  "Initializing Neural Net...",
  "Parsing Input Data...",
  "Dispatching Search Spiders...",
  "Cross-referencing Global Database...",
  "Analyzing Source Credibility...",
  "Checking for Time-Travel/Reposts...",
  "Scanning for AI Artifacts...",
  "Synthesizing Verdict..."
];

export const LoadingFactScreen: React.FC = () => {
  const [currentStatIndex, setCurrentStatIndex] = useState(0);
  const [logs, setLogs] = useState<string[]>([]);

  // Cycle stats
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentStatIndex((prev) => (prev + 1) % LOADING_STATS.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  // Simulate Terminal Logs (Show Your Work)
  useEffect(() => {
    let step = 0;
    const interval = setInterval(() => {
      if (step < STEPS.length) {
        setLogs(prev => [...prev, STEPS[step]]);
        step++;
      }
    }, 800);
    return () => clearInterval(interval);
  }, []);

  const currentStat = LOADING_STATS[currentStatIndex];

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center p-4 bg-white/95 backdrop-blur-md reveal-text">
      
      {/* Container */}
      <div className="w-full max-w-lg bg-white border-2 border-black shadow-hard-lg relative overflow-hidden flex flex-col">
        
        {/* TOP: Terminal / Work Log */}
        <div className="bg-black text-green-400 p-4 font-mono text-xs h-40 overflow-hidden relative border-b-2 border-black">
          <div className="absolute top-2 right-2 text-gray-500 text-[10px] uppercase">System: Active</div>
          <div className="flex flex-col justify-end h-full">
            {logs.map((log, i) => (
              <div key={i} className="mb-1 animate-pulse">
                <span className="opacity-50 mr-2">{`>`}</span>
                {log}
              </div>
            ))}
            <div className="animate-bounce mt-1">_</div>
          </div>
          {/* Scanline effect for terminal */}
          <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] z-10 pointer-events-none bg-[length:100%_2px,3px_100%]"></div>
        </div>

        {/* BOTTOM: Fact Display */}
        <div className="p-8 relative">
          {/* Background Grid */}
          <div className="absolute inset-0 opacity-10 pointer-events-none" 
             style={{ backgroundImage: 'radial-gradient(circle, #000 1px, transparent 1px)', backgroundSize: '20px 20px' }}>
          </div>

          <div className="relative z-10">
            <div className="text-xs font-bold text-black bg-gray-200 inline-block px-2 py-1 mb-4 uppercase tracking-widest font-mono">
               Historical Context / Fact #{currentStat.id}
            </div>
            
            <div className="flex gap-4 items-start reveal-text">
              <div className="text-4xl grayscale animate-bounce" style={{ animationDuration: '3s' }}>{currentStat.icon}</div>
              <div key={currentStat.id} className="reveal-text">
                <p className="text-lg font-black text-black mb-2 font-display leading-tight">{currentStat.stat}</p>
                <p className="text-gray-700 font-mono text-sm leading-relaxed">{currentStat.description}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <p className="mt-6 font-mono text-xs uppercase tracking-widest animate-pulse text-gray-500">
        Constructing Truth Verification...
      </p>
    </div>
  );
};
