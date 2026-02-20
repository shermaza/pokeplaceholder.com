import React from 'react';

const Footer = () => {
  return (
    <footer className="bg-slate-900 text-slate-500 py-10 mt-12 border-t border-slate-800">
      <div className="max-w-5xl mx-auto px-4 text-center space-y-4">
        <p className="text-sm">
          Created for the Pokémon TCG Community. Card data and images by the <a href="https://pokemontcg.io/" target="_blank" rel="noopener noreferrer" className="hover:text-slate-300 underline underline-offset-4">Pokémon TCG API</a>.
        </p>
        <p className="text-sm">
          Cameo data provided by the <a href="https://docs.google.com/spreadsheets/d/18nIkOgqQrHZTz0TrH_gL1e1nL1RcHiCmPF5finAjToY/edit?gid=1923267969#gid=1923267969" target="_blank" rel="noopener noreferrer" className="hover:text-slate-300 underline underline-offset-4">Cameo Pokémon Card Database</a>.
        </p>
        <p className="text-xs opacity-50 uppercase tracking-widest">
          Not affiliated with The Pokémon Company or Nintendo.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
