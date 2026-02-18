import { useState, useEffect } from 'react';
import { CardService } from '../services/CardService';
import { PdfService } from '../services/PdfService';

export const useCardGenerator = () => {
  const [loading, setLoading] = useState(false);
  const [sets, setSets] = useState([]);
  const [pokedexNumber, setPokedexNumber] = useState('');
  const [generation, setGeneration] = useState('');
  const [name, setName] = useState('');
  const [setId, setSetId] = useState('');
  const [sortBy, setSortBy] = useState('pokedex');
  const [useImages, setUseImages] = useState(false);
  const [error, setError] = useState(null);
  const [progress, setProgress] = useState(null);

  useEffect(() => {
    fetch(`${process.env.PUBLIC_URL}/data/sets/en.json`)
      .then(res => res.json())
      .then(data => {
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
        const sortedCards = CardService.sortCards(allFoundCards, sortBy);
        await PdfService.generatePdf(sortedCards, useImages);
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

  return {
    state: {
      loading,
      sets,
      pokedexNumber,
      generation,
      name,
      setId,
      sortBy,
      useImages,
      error,
      progress,
      isFormValid
    },
    actions: {
      setPokedexNumber,
      setGeneration,
      setName,
      setSetId,
      setSortBy,
      setUseImages,
      handleGenerate
    }
  };
};
