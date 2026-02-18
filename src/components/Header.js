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
        <div className="text-[10px] md:text-sm font-medium opacity-80 bg-red-700 px-3 py-1 rounded-full border border-red-500 whitespace-nowrap ml-4">
          Binder Placeholder Generator
        </div>
      </div>
    </header>
  );
};

export default Header;
