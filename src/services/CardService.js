import { Pokedex } from '../utils/pokedex';

export const CardService = {
  processCards: (cardsJSON, set, variantsData = {}, filters = {}) => {
    const { pokedexNumber, generation, name, allVariants, includeCameos, cameosData = {} } = filters;
    const allCards = [];
    
    const nameLower = name?.toLowerCase();
    const setCameos = (includeCameos && nameLower) ? (cameosData[nameLower] || []) : [];

    cardsJSON.forEach(cardJson => {
      const cardPokedexNumbers = cardJson.nationalPokedexNumbers || [];
      
      // Filter by pokedexNumber
      if (pokedexNumber && !cardPokedexNumbers.includes(pokedexNumber)) {
        return;
      }
      
      // Filter by generation
      if (generation) {
        const range = Pokedex.getRangeForGeneration(generation);
        if (!range || !cardPokedexNumbers.some(num => num >= range[0] && num <= range[1])) {
          return;
        }
      }

      // Filter by name and cameo
      let nameMatch = false;
      let isCameoMatch = false;
      if (nameLower) {
        // Direct name match
        if (cardJson.name.toLowerCase().includes(nameLower)) {
          nameMatch = true;
        }
        
        // Cameo match
        if (!nameMatch && includeCameos) {
          const isCameo = setCameos.some(cameo => {
            // Match by set ID and number
            if (cameo.setId === set.id && (cameo.number === cardJson.number || cameo.number === cardJson.number?.replace(/^0+/, ''))) {
              return true;
            }
            // Fallback match by card name if set ID or number is missing/mismatched
            if (cameo.cardName.toLowerCase() === cardJson.name.toLowerCase() && cameo.setId === set.id) {
              return true;
            }
            return false;
          });
          
          if (isCameo) {
            nameMatch = true;
            isCameoMatch = true;
          }
        }

        if (!nameMatch) {
          return;
        }
      }

      
      const pokedexNumberValue = cardPokedexNumbers[0] || (pokedexNumber || null);
      let variants = variantsData[cardJson.id] || ["Normal"];
      
      if (!allVariants) {
        // If not all variants, just take the first one
        variants = [variants[0]];
      }
      
      variants.forEach(variant => {
        allCards.push({
          id: cardJson.id,
          name: cardJson.name,
          set_id: set.id,
          set_name: set.name,
          series_name: set.series,
          release_date: set.releaseDate,
          total_cards: set.total,
          national_pokedex_number: pokedexNumberValue,
          number: cardJson.number,
          rarity: cardJson.rarity || "N/A",
          image_url: cardJson.images?.small,
          holo: variant,
          generation: Pokedex.getGenerationByNumber(pokedexNumberValue),
          is_cameo: !!isCameoMatch
        });
      });
    });
    
    return allCards;
  },

  sortCards: (cards, sortBy) => {
    if (!sortBy) return cards;

    return [...cards].sort((a, b) => {
      if (sortBy === 'releaseDate') {
        const dateA = a.release_date || '0000/00/00';
        const dateB = b.release_date || '0000/00/00';
        if (dateA !== dateB) return dateA.localeCompare(dateB);
      }

      if (sortBy === 'pokedex') {
        const numA = a.national_pokedex_number || 9999;
        const numB = b.national_pokedex_number || 9999;
        if (numA !== numB) return numA - numB;
      }
      
      // Secondary sort or primary sort by card number
      // Card numbers can be like '102', '102a', 'TG01', etc.
      const parseCardNumber = (num) => {
        if (!num) return [9999, ''];
        const match = num.match(/^([A-Z]*)([0-9]+)([a-z]*)$/i);
        if (match) {
          return [parseInt(match[2], 10), match[1] || '', match[3] || ''];
        }
        return [9999, num];
      };

      const [valA, prefixA, suffixA] = parseCardNumber(a.number);
      const [valB, prefixB, suffixB] = parseCardNumber(b.number);

      if (prefixA !== prefixB) return prefixA.localeCompare(prefixB);
      if (valA !== valB) return valA - valB;
      return suffixA.localeCompare(suffixB);
    });
  }
};
