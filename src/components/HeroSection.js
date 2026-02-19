import React from 'react';

const HeroSection = () => {
  return (
    <div className="lg:col-span-5 space-y-6">
      <div className="space-y-2">
        <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 leading-tight">
          Create binder placeholder cards in seconds.
        </h2>
        <p className="text-lg text-slate-600">
          Perfect for organizing your binders and tracking missing cards. Generate printable placeholders with official artwork or clean text-only labels.
        </p>
      </div>
      
      <div className="hidden lg:block p-6 bg-slate-100 rounded-2xl border-2 border-dashed border-slate-300">
        <h3 className="font-bold text-slate-800 mb-2 flex items-center">
          <span className="w-2 h-2 bg-red-500 rounded-full mr-2"></span>
          How it works
        </h3>
        <ul className="text-sm text-slate-600 space-y-3">
          <li className="flex items-start">
            <span className="font-bold mr-2 text-slate-400">01</span>
            <span>Use the filters to find the exact cards or Pokédex numbers you’re missing.</span>
          </li>
          <li className="flex items-start">
            <span className="font-bold mr-2 text-slate-400">02</span>
            <span>Choose image placeholders or fast text-only labels.</span>
          </li>
          <li className="flex items-start">
            <span className="font-bold mr-2 text-slate-400">03</span>
            <span>Download a ready-to-print 8.5" × 11" PDF. Customize the number of cards per page to fit your needs.</span>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default HeroSection;
