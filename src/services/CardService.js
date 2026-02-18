import { Pokedex } from '../utils/pokedex';

export const CardService = {
  HOLOFoil_ONLY_RARITIES: [
    "Illustration Rare",
    "Special Illustration Rare",
    "Ultra Rare",
    "Hyper Rare",
    "Mega Hyper Rare",
    "Double Rare",
    "Radiant Rare",
    "Amazing Rare",
    "Rare Shiny GX",
    "Shiny Ultra Rare",
    "ACE SPEC Rare",
    "Promo"
  ],

  getVariants: (card) => {
    const rarity = card.rarity || "";
    const rarityLower = rarity.toLowerCase();
    let isSpecial = ["vmax", "vstar", " v", "ex", "gx", "break", "prism star", "rainbow"].some(x => rarityLower.includes(x));

    if (rarityLower.includes("promo")) {
      return ["Promo"];
    }

    if (CardService.HOLOFoil_ONLY_RARITIES.includes(rarity) || isSpecial) {
      return ["Holofoil"];
    } else if (rarityLower.includes("rare")) {
      return ["Holofoil", "Reverse Holofoil"];
    } else {
      return ["Normal", "Reverse Holofoil"];
    }
  },

  processCards: (cardsJSON, set, filters = {}) => {
    const { pokedexNumber, generation, name } = filters;
    const allCards = [];
    
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

      // Filter by name
      if (name && !cardJson.name.toLowerCase().includes(name.toLowerCase())) {
        return;
      }

      
      const pokedexNumberValue = cardPokedexNumbers[0] || (pokedexNumber || null);
      const variants = CardService.getVariants(cardJson);
      
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
          generation: Pokedex.getGenerationByNumber(pokedexNumberValue)
        });
      });
    });
    
    return allCards;
  },

  sortCards: (cards, sortBy) => {
    if (!sortBy) return cards;

    return [...cards].sort((a, b) => {
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
