import React from 'react';

const Footer = () => {
  return (
    <footer className="bg-slate-900 text-slate-500 py-10 mt-12 border-t border-slate-800">
      <div className="max-w-5xl mx-auto px-4 text-center space-y-4">
        <p className="text-sm">
          Created for the Pokémon TCG Community. All card data and images provided by the Pokémon TCG API.
        </p>
        <p className="text-xs opacity-50 uppercase tracking-widest">
          Not affiliated with The Pokémon Company or Nintendo.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
