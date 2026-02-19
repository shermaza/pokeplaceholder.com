import React from 'react';
import Header from './components/Header';
import HeroSection from './components/HeroSection';
import FilterForm from './components/FilterForm';
import Footer from './components/Footer';
import { useCardGenerator } from './hooks/useCardGenerator';

function App() {
  const { state, actions } = useCardGenerator();

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      {/* Main Content */}
      <main className="flex-grow max-w-5xl mx-auto w-full px-4 py-8 md:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          <HeroSection />

          <FilterForm 
            name={state.name} setName={actions.setName}
            pokedexNumber={state.pokedexNumber} setPokedexNumber={actions.setPokedexNumber}
            setId={state.setId} setSetId={actions.setSetId}
            sets={state.sets}
            generation={state.generation} setGeneration={actions.setGeneration}
            useImages={state.useImages} setUseImages={actions.setUseImages}
            allVariants={state.allVariants} setAllVariants={actions.setAllVariants}
            cardsPerPage={state.cardsPerPage} setCardsPerPage={actions.setCardsPerPage}
            sortBy={state.sortBy} setSortBy={actions.setSortBy}
            loading={state.loading}
            isFormValid={state.isFormValid}
            handleGenerate={actions.handleGenerate}
            error={state.error}
            progress={state.progress}
            status={state.status}
          />
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default App;
