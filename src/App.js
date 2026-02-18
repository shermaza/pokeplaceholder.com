import React, { useState, useEffect } from 'react';
import { CardService } from './services/CardService';
import { PdfService } from './services/PdfService';

function App() {
  const [loading, setLoading] = useState(false);
  const [sets, setSets] = useState([]);
  const [pokedexNumber, setPokedexNumber] = useState('');
  const [generation, setGeneration] = useState('');
  const [name, setName] = useState('');
  const [setId, setSetId] = useState('');
  const [useImages, setUseImages] = useState(false);
  const [error, setError] = useState(null);
  const [progress, setProgress] = useState(null);

  useEffect(() => {
    fetch(`${process.env.PUBLIC_URL}/data/sets/en.json`)
      .then(res => res.json())
      .then(data => {
        // Sort sets by release date descending
        const sortedSets = [...data].sort((a, b) => 
          new Date(b.releaseDate) - new Date(a.releaseDate)
        );
        setSets(sortedSets);
      })
      .catch(err => console.error("Failed to fetch sets", err));
  }, []);

  const handleGenerate = async () => {
    setLoading(true);
    setError(null);
    setProgress(0);
    try {
      let allFoundCards = [];
      const genNum = generation ? parseInt(generation) : null;
      const pokedexNum = pokedexNumber ? parseInt(pokedexNumber) : null;

      const activeSets = setId ? sets.filter(s => s.id === setId) : sets;
      
      for (let i = 0; i < activeSets.length; i++) {
        const set = activeSets[i];
        setProgress(Math.round(((i) / activeSets.length) * 100));

        try {
          const cardsResponse = await fetch(`${process.env.PUBLIC_URL}/data/cards/en/${set.id}.json`);
          if (!cardsResponse.ok) continue;
          const cardsData = await cardsResponse.json();
          
          const filtered = CardService.processCards(cardsData, set, {
            pokedexNumber: pokedexNum,
            generation: genNum,
            name
          });
          allFoundCards = [...allFoundCards, ...filtered];
        } catch (e) {
          console.error(`Failed to fetch cards for set ${set.id}`);
        }
      }

      setProgress(100);

      if (allFoundCards.length === 0) {
        setError("No cards found for these filters.");
      } else {
        await PdfService.generatePdf(allFoundCards, useImages);
      }
    } catch (err) {
      console.error(err);
      setError("An error occurred while generating the PDF.");
    } finally {
      setLoading(false);
      setTimeout(() => setProgress(null), 2000);
    }
  };

  const isFormValid = pokedexNumber || generation || name || setId;

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
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

      {/* Main Content */}
      <main className="flex-grow max-w-5xl mx-auto w-full px-4 py-8 md:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Hero Section */}
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
                  <span>Download a ready-to-print 8.5" × 11" PDF sized for 9‑pocket binder pages (2.5" × 3.5").</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Form Section */}
          <div className="lg:col-span-7 bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 p-6 md:p-8">
            <h3 className="text-xl font-bold text-slate-900 mb-6">Filter Settings</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500 ml-1">Card Name</label>
                <div className="relative">
                  <input 
                    type="text" 
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-slate-50 border-2 border-slate-100 focus:border-red-500 focus:ring-0 rounded-xl px-4 py-3 transition-all duration-200 outline-none"
                    placeholder="e.g. Charizard"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500 ml-1">Pokédex Number</label>
                <input 
                  type="number" 
                  value={pokedexNumber}
                  onChange={(e) => setPokedexNumber(e.target.value)}
                  className="w-full bg-slate-50 border-2 border-slate-100 focus:border-red-500 focus:ring-0 rounded-xl px-4 py-3 transition-all duration-200 outline-none"
                  placeholder="e.g. 6"
                />
              </div>

              <div className="md:col-span-2 space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500 ml-1">Set Selection</label>
                <select 
                  value={setId}
                  onChange={(e) => setSetId(e.target.value)}
                  className="w-full bg-slate-50 border-2 border-slate-100 focus:border-red-500 focus:ring-0 rounded-xl px-4 py-3 transition-all duration-200 outline-none appearance-none cursor-pointer"
                >
                  <option value="">Search across all sets</option>
                  {sets.map(s => (
                    <option key={s.id} value={s.id}>{s.name} ({s.series})</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500 ml-1">Generation</label>
                <select 
                  value={generation}
                  onChange={(e) => setGeneration(e.target.value)}
                  className="w-full bg-slate-50 border-2 border-slate-100 focus:border-red-500 focus:ring-0 rounded-xl px-4 py-3 transition-all duration-200 outline-none appearance-none cursor-pointer"
                >
                  <option value="">Any Generation</option>
                  {[1,2,3,4,5,6,7,8,9].map(g => (
                    <option key={g} value={g}>Generation {g}</option>
                  ))}
                </select>
              </div>

              <div className="flex items-center space-x-3 bg-slate-50 px-4 py-3 rounded-xl border-2 border-slate-100 cursor-pointer hover:border-slate-200 transition-all duration-200" onClick={() => setUseImages(!useImages)}>
                <div className={`w-10 h-6 flex items-center rounded-full p-1 transition-colors duration-200 ${useImages ? 'bg-red-500' : 'bg-slate-300'}`}>
                  <div className={`bg-white w-4 h-4 rounded-full shadow-sm transform transition-transform duration-200 ${useImages ? 'translate-x-4' : 'translate-x-0'}`}></div>
                </div>
                <span className="text-sm font-bold text-slate-700 select-none">Include Images</span>
              </div>
            </div>

            <div className="mt-8 space-y-4">
              {error && (
                <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-xl">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm text-red-700 font-medium">{error}</p>
                    </div>
                  </div>
                </div>
              )}

              {progress !== null && (
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-xs font-bold text-slate-500 uppercase tracking-widest">
                    <span>Processing Data</span>
                    <span>{progress}%</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                    <div 
                      className="bg-red-500 h-full transition-all duration-300 ease-out"
                      style={{ width: `${progress}%` }}
                    ></div>
                  </div>
                </div>
              )}

              <button 
                onClick={handleGenerate}
                disabled={loading || !isFormValid}
                className={`w-full relative overflow-hidden group py-4 px-6 rounded-2xl font-black text-lg transition-all duration-300 transform active:scale-95 shadow-lg ${
                  loading || !isFormValid 
                    ? 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none' 
                    : 'bg-slate-900 text-white hover:bg-slate-800 hover:-translate-y-1 shadow-slate-900/20'
                }`}
              >
                <span className="relative z-10">
                  {loading ? 'GENERATING PDF...' : 'GENERATE PDF'}
                </span>
                {!loading && isFormValid && (
                  <div className="absolute inset-0 w-1/2 h-full bg-white/10 skew-x-[-20deg] group-hover:translate-x-[250%] transition-transform duration-1000"></div>
                )}
              </button>
              
              {!isFormValid && (
                <p className="text-center text-xs text-slate-400 font-medium">
                  Please provide at least one filter to begin.
                </p>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
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
    </div>
  );
}

export default App;
