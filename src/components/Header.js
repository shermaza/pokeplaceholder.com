import React from 'react';

const Header = () => {
  return (
    <header className="bg-red-600 text-white shadow-lg">
      <div className="max-w-5xl mx-auto px-4 py-6 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-white rounded-full border-4 border-slate-900 relative overflow-hidden flex items-center justify-center shrink-0">
            <div className="absolute top-0 left-0 w-full h-1/2 bg-red-500"></div>
            <div className="absolute bottom-0 left-0 w-full h-1/2 bg-white"></div>
            <div className="absolute top-1/2 left-0 w-full h-1 bg-slate-900 -translate-y-1/2 z-10"></div>
            <div className="w-3 h-3 bg-white border-2 border-slate-900 rounded-full z-20"></div>
          </div>
          <h1 className="text-xl md:text-2xl font-black tracking-tighter italic whitespace-nowrap">POKÉPLACEHOLDER</h1>
        </div>
        <div className="flex items-center space-x-4">
          <div className="hidden md:block text-sm font-medium opacity-80 bg-red-700 px-3 py-1 rounded-full border border-red-500 whitespace-nowrap">
            Binder Placeholder Generator
          </div>
          <a 
            href="https://github.com/shermaza/pokeplaceholder.com" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-white hover:text-red-200 transition-colors"
            aria-label="GitHub Repository"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
              <path d="M9 18c-4.51 2-5-2-7-2" />
            </svg>
          </a>
        </div>
      </div>
    </header>
  );
};

export default Header;
