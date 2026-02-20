import { Pokedex } from '../utils/pokedex';

export const CardService = {
  processCards: (cardsJSON, set, variantsData = {}, filters = {}) => {
    const { pokedexNumber, generation, name, allVariants, includeCameos, cameosData = {}, pokedexMap = {} } = filters;
    const allCards = [];
    
    const nameLower = name?.toLowerCase();

    // Build target cameo lists based on filters
    let targetNames = [];
    if (nameLower) {
      targetNames.push(nameLower);
    } else if (pokedexNumber && pokedexMap && pokedexMap[String(pokedexNumber)]) {
      targetNames.push(String(pokedexMap[String(pokedexNumber)]).toLowerCase());
    } else if (generation) {
      const range = Pokedex.getRangeForGeneration(generation);
      if (range && pokedexMap) {
        for (let n = range[0]; n <= range[1]; n++) {
          const nm = pokedexMap[String(n)];
          if (nm) targetNames.push(String(nm).toLowerCase());
        }
      }
    }

    const setCameos = [];
    if (includeCameos && targetNames.length > 0) {
      targetNames.forEach(nm => {
        const list = cameosData[nm] || [];
        list.forEach(c => {
          setCameos.push({ ...c, targetPokemon: nm });
        });
      });
    }

    cardsJSON.forEach(cardJson => {
      const cardPokedexNumbers = cardJson.nationalPokedexNumbers || [];

      // Determine cameo match for this card (if enabled and we have target names)
      let matchedCameo = null;
      if (includeCameos && setCameos.length > 0) {
        matchedCameo = setCameos.find(cameo => {
          // Match by set ID and number (normalize leading zeros)
          const numMatches = (cameo.number === cardJson.number) || (cameo.number === cardJson.number?.replace(/^0+/, ''));
          if (cameo.setId === set.id && numMatches) return true;
          // Fallback match by card name if provided
          if (cameo.cardName && cameo.cardName.toLowerCase() === cardJson.name.toLowerCase() && cameo.setId === set.id) return true;
          return false;
        });
      }
      
      const isCameoMatch = !!matchedCameo;

      // Filter by pokedexNumber (allow cameo matches to pass)
      if (pokedexNumber && !cardPokedexNumbers.includes(pokedexNumber) && !isCameoMatch) {
        return;
      }
      
      // Filter by generation (allow cameo matches to pass)
      if (generation) {
        const range = Pokedex.getRangeForGeneration(generation);
        const inGen = range && cardPokedexNumbers.some(num => num >= range[0] && num <= range[1]);
        if (!isCameoMatch && !inGen) {
          return;
        }
      }

      // Filter by name (allow cameo matches to pass)
      if (nameLower) {
        const directNameMatch = cardJson.name.toLowerCase().includes(nameLower);
        if (!directNameMatch && !isCameoMatch) {
          return;
        }
      }

      
      const pokedexNumberValue = cardPokedexNumbers[0] || (pokedexNumber || null);
      let variants = variantsData[cardJson.id] || ["Normal"];
      
      if (!allVariants) {
        // If not all variants, just take the first one
        variants = [variants[0]];
      }

      // Capitalize target pokemon name for display
      const capitalize = (s) => s ? s.charAt(0).toUpperCase() + s.slice(1) : "";
      const cameoName = matchedCameo ? capitalize(matchedCameo.targetPokemon) : null;
      
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
          is_cameo: isCameoMatch,
          cameo_name: cameoName
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
