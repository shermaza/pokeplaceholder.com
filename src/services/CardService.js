import { Pokedex } from '../utils/pokedex';

export const CardService = {
  HOLOFoil_ONLY_RARITIES: [
    "Illustration Rare",
    "Special Illustration Rare",
    "Ultra Rare",
    "Hyper Rare",
    "Double Rare",
    "Radiant Rare",
    "Amazing Rare",
    "Rare Shiny GX",
    "Shiny Ultra Rare",
    "ACE SPEC Rare"
  ],

  getVariants: (card) => {
    const rarity = card.rarity || "";
    const isSpecial = ["VMAX", "VSTAR", " V", "EX", "GX", "BREAK", "Prism Star"].some(x => rarity.includes(x));
    
    if (CardService.HOLOFoil_ONLY_RARITIES.includes(rarity) || isSpecial) {
      return ["Holofoil"];
    } else if (rarity.includes("Rare")) {
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
  }
};
