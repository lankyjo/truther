'use client';

import React from 'react';

export const Header: React.FC = () => {
  return (
    <header className="bg-white border-b-2 border-black sticky top-0 z-40">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3 reveal-down">
          {/* Logo / Icon */}
          <div className="w-10 h-10 border-2 border-black bg-black text-white flex items-center justify-center shadow-hard-sm">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
              <path fillRule="evenodd" d="M12.516 2.17a.75.75 0 00-1.032 0 11.209 11.209 0 01-7.877 3.08.75.75 0 00-.722.515A12.74 12.74 0 002.25 9.75c0 5.942 4.064 10.933 9.563 12.348a.749.749 0 00.374 0c5.499-1.415 9.563-6.406 9.563-12.348 0-1.352-.272-2.636-.759-3.985a.75.75 0 00-.722-.516l-.143.001c-2.996 0-5.717-1.17-7.734-3.08zm3.094 8.016a.75.75 0 10-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.14-.094l3.75-5.25z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="leading-tight">
            <h1 className="text-2xl font-black tracking-tighter font-display uppercase">Truther_v1</h1>
          </div>
        </div>
        <div className="hidden md:block reveal-down stagger-2">
          <span className="bg-gray-100 px-3 py-1 text-xs font-bold border border-black shadow-hard-sm uppercase tracking-wider">
            AI Powered
          </span>
        </div>
      </div>
    </header>
  );
};
