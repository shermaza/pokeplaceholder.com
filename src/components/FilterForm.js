import React from 'react';

const FilterForm = ({
  name, setName,
  pokedexNumber, setPokedexNumber,
  setId, setSetId,
  sets,
  generation, setGeneration,
  useImages, setUseImages,
  allVariants, setAllVariants,
  cardsPerPage, setCardsPerPage,
  sortBy, setSortBy,
  loading,
  isFormValid,
  handleGenerate,
  error,
  progress,
  status
}) => {
  const GridIcon = ({ size }) => {
    const cells = [];
    const width = 85;
    const height = 110;
    const cellW = width / size;
    const cellH = height / size;
    const padding = 2;

    for (let i = 0; i < size * size; i++) {
      cells.push(
        <rect
          key={i}
          x={(i % size) * cellW + padding}
          y={Math.floor(i / size) * cellH + padding}
          width={cellW - padding * 2}
          height={cellH - padding * 2}
          rx="1"
          fill="currentColor"
        />
      );
    }
    return (
      <svg viewBox={`0 0 ${width} ${height}`} className="w-5 h-6.5 mb-2 opacity-80" style={{ height: '1.5rem', width: 'auto' }}>
        {cells}
      </svg>
    );
  };

  return (
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

        <div className="flex items-center space-x-3 bg-slate-50 px-4 py-3 rounded-xl border-2 border-slate-100 cursor-pointer hover:border-slate-200 transition-all duration-200 group relative" onClick={() => setAllVariants(!allVariants)}>
          <div className={`w-10 h-6 flex items-center rounded-full p-1 transition-colors duration-200 ${allVariants ? 'bg-red-500' : 'bg-slate-300'}`}>
            <div className={`bg-white w-4 h-4 rounded-full shadow-sm transform transition-transform duration-200 ${allVariants ? 'translate-x-4' : 'translate-x-0'}`}></div>
          </div>
          <span className="text-sm font-bold text-slate-700 select-none">All Variants</span>
          
          {/* Tooltip */}
          <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 w-48 p-2 bg-slate-800 text-white text-[10px] rounded shadow-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
            Include all versions of a card (e.g., Holofoil, Reverse Holofoil) instead of just the standard version.
            <div className="absolute top-full left-1/2 -translate-x-1/2 border-8 border-transparent border-t-slate-800"></div>
          </div>
        </div>

        <div className="md:col-span-2 space-y-2">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-500 ml-1">Grid Layout (Cards Per Page)</label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { id: 9, size: 3, label: '3 × 3', sub: '9 Cards' },
              { id: 16, size: 4, label: '4 × 4', sub: '16 Cards' },
              { id: 25, size: 5, label: '5 × 5', sub: '25 Cards' },
              { id: 36, size: 6, label: '6 × 6', sub: '36 Cards' }
            ].map((option) => (
              <button
                key={option.id}
                type="button"
                onClick={() => setCardsPerPage(option.id)}
                className={`flex flex-col items-center justify-center p-3 rounded-xl border-2 transition-all duration-200 ${
                  cardsPerPage === option.id
                    ? 'border-red-500 bg-red-50 text-red-700'
                    : 'border-slate-100 bg-slate-50 text-slate-600 hover:border-slate-200'
                }`}
              >
                <GridIcon size={option.size} />
                <span className="text-sm font-black">{option.label}</span>
                <span className="text-[10px] font-bold opacity-60 uppercase tracking-tighter">{option.sub}</span>
              </button>
            ))}
          </div>
          <p className="text-[11px] text-slate-400 mt-2 flex items-center">
            <svg className="w-3.5 h-3.5 mr-1.5 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Note: Increasing the number of cards per page will reduce the individual card size.
          </p>
        </div>

        <div className="md:col-span-2 space-y-1.5">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-500 ml-1">Sort By</label>
          <div className="flex space-x-4">
            <label className="flex items-center space-x-2 cursor-pointer">
              <input 
                type="radio" 
                name="sortBy" 
                value="pokedex" 
                checked={sortBy === 'pokedex'} 
                onChange={(e) => setSortBy(e.target.value)}
                className="text-red-500 focus:ring-red-500"
              />
              <span className="text-sm font-medium text-slate-700">Pokédex Number</span>
            </label>
            <label className="flex items-center space-x-2 cursor-pointer">
              <input 
                type="radio" 
                name="sortBy" 
                value="number" 
                checked={sortBy === 'number'} 
                onChange={(e) => setSortBy(e.target.value)}
                className="text-red-500 focus:ring-red-500"
              />
              <span className="text-sm font-medium text-slate-700">Card Number</span>
            </label>
          </div>
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
              <span>{status || 'Processing Data'}</span>
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
  );
};

export default FilterForm;
