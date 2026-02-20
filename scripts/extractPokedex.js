const fs = require('fs');
const path = require('path');

const cardsDir = path.join(__dirname, '../public/data/cards/en');
const files = fs.readdirSync(cardsDir);

const pokedexMap = {};

files.forEach(file => {
  if (!file.endsWith('.json')) return;
  try {
    const cards = JSON.parse(fs.readFileSync(path.join(cardsDir, file), 'utf8'));
    cards.forEach(card => {
      if (card.nationalPokedexNumbers && card.nationalPokedexNumbers.length > 0) {
        card.nationalPokedexNumbers.forEach(num => {
          // Keep the first name found for each number, or maybe some more sophisticated logic?
          // Usually card names for the same number are the same species.
          if (!pokedexMap[num]) {
            // Clean up name (remove special characters if needed, but the cameo.json keys are lowercase species names)
            // Actually, we want the species name. 
            // In TCG data, card names can be "Pikachu", "Lt. Surge's Pikachu", "Flying Pikachu", etc.
            // But they usually have the species name as a base.
            // Let's just collect all names and pick the most common one for that number?
            // Or just the shortest one that is likely the species name.
            if (!pokedexMap[num]) pokedexMap[num] = new Set();
            pokedexMap[num].add(card.name);
          } else {
            pokedexMap[num].add(card.name);
          }
        });
      }
    });
  } catch (e) {
    console.error(`Error reading ${file}: ${e.message}`);
  }
});

// Refine the map: for each number, pick the shortest name that is a substring of others, 
// or just the most likely species name.
const finalMap = {};
Object.keys(pokedexMap).sort((a,b) => a-b).forEach(num => {
  const names = Array.from(pokedexMap[num]);
  // Heuristic: the shortest name is often the base species name (e.g., "Pikachu" vs "Pikachu VMAX")
  names.sort((a, b) => a.length - b.length);
  finalMap[num] = names[0];
});

// Since we need up to 1025, and card data might not have all, we might need a fallback for missing ones.
// But let's see what we get.
console.log(JSON.stringify(finalMap, null, 2));
