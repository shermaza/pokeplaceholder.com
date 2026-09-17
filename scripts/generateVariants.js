const fs = require('fs');
const path = require('path');

// variants.json is hand-crafted. This script is ADDITIVE ONLY:
// it may add missing card IDs, but must never overwrite or remove existing entries.

// Load scraped variants if available
const scrapedPath = path.join(__dirname, '../scraped_variants.json');
const SCRAPED_VARIANTS = fs.existsSync(scrapedPath) 
  ? JSON.parse(fs.readFileSync(scrapedPath, 'utf8')) 
  : {};

const HOLOFOIL_ONLY_RARITIES = [
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
  "Rare Secret",
  "Rare Rainbow",
  "Promo"
];

// Sets where every card is foil-only (no Normal / Reverse Holofoil printings)
const HOLOFOIL_ONLY_SETS = [
  "me55",
  "me55c"
];

function getVariants(card, set) {
  const variants = [];
  const rarity = card.rarity || "";
  const rarityLower = rarity.toLowerCase();
  const setId = set.id;
  const releaseDate = set.releaseDate;
  const releaseYear = releaseDate ? parseInt(releaseDate.split('/')[0]) : 0;

  if (HOLOFOIL_ONLY_SETS.includes(setId)) {
    variants.push("Holofoil");
    return variants;
  }

  // Handle older sets (Pre-Legendary Collection 2002)
  // Reverse holos were introduced in Legendary Collection (may2002)
  const isPreReverseHolo = releaseYear < 2002 || (releaseYear === 2002 && releaseDate < "2002/05/24");

  let isSpecial = ["vmax", "vstar", " v", "ex", "gx", "break", "prism star", "rainbow"].some(x => rarityLower.includes(x));

  if (rarityLower.includes("promo")) {
    variants.push("Promo");
  } else if (HOLOFOIL_ONLY_RARITIES.includes(rarity) || isSpecial) {
    variants.push("Holofoil");
  } else {
    if (rarityLower.includes("rare holo")) {
      variants.push("Holofoil");
    } else if (rarityLower.includes("rare") || rarityLower.includes("common") || rarityLower.includes("uncommon")) {
      // For non-holo rares, and all commons/uncommons
      // They have a Normal version
      variants.push("Normal");
    } else {
      // Trainer, Energy, etc.
      variants.push("Normal");
    }

    // Reverse Holo check
    // Legendary Collection (base6) was the first set with reverse holos for every card
    if (!isPreReverseHolo) {
      variants.push("Reverse Holofoil");

      // Prismatic Evolutions specific variants
      if (setId === "sv8pt5") {
        variants.push("Pokeball");
        variants.push("Masterball");
      }

      // Ascended Hero specific variants
      if (setId === "me2pt5") {
        if (card.name.includes("Team Rocket")) {
          variants.push("Reverse Holofoil (Team Rocket)");
        } else {
          variants.push("Reverse Holofoil (Pokeball)");
        }
      }
    }
  }

  if (variants.length === 0) {
    variants.push("Normal");
  }

  // Add additional variants from scraped data
  if (SCRAPED_VARIANTS[card.id]) {
    SCRAPED_VARIANTS[card.id].forEach(v => {
      if (!variants.includes(v)) {
        variants.push(v);
      }
    });
  }

  return variants;
}

const variantsPath = path.join(__dirname, '../public/data/variants.json');
const existingVariants = fs.existsSync(variantsPath)
  ? JSON.parse(fs.readFileSync(variantsPath, 'utf8'))
  : {};

const setsDir = path.join(__dirname, '../public/data/sets');
const setsContent = fs.readFileSync(path.join(setsDir, 'en.json'), 'utf8');
const sets = JSON.parse(setsContent);
const setMap = {};
sets.forEach(s => setMap[s.id] = s);

const cardsDir = path.join(__dirname, '../public/data/cards/en');
const files = fs.readdirSync(cardsDir);

let added = 0;
let skipped = 0;
const extraIdsFound = new Set();

files.forEach(file => {
  if (!file.endsWith('.json')) return;
  const setId = file.replace('.json', '');
  const set = setMap[setId];
  
  if (!set) return;

  const content = fs.readFileSync(path.join(cardsDir, file), 'utf8');
  const cards = JSON.parse(content);

  cards.forEach(card => {
    if (Object.prototype.hasOwnProperty.call(existingVariants, card.id)) {
      skipped++;
      if (SCRAPED_VARIANTS[card.id]) {
        extraIdsFound.add(card.id);
      }
      return;
    }

    existingVariants[card.id] = getVariants(card, set);
    added++;
    if (SCRAPED_VARIANTS[card.id]) {
      extraIdsFound.add(card.id);
    }
  });
});

// Check if any IDs in SCRAPED_VARIANTS were NOT found in the cards data
Object.keys(SCRAPED_VARIANTS).forEach(id => {
  if (!extraIdsFound.has(id) && !Object.prototype.hasOwnProperty.call(existingVariants, id)) {
    console.warn(`Warning: Variant ID ${id} was not found in any card data.`);
  }
});

fs.writeFileSync(
  variantsPath,
  JSON.stringify(existingVariants, null, 2) + '\n'
);

console.log(`Variants updated additively: ${added} added, ${skipped} existing preserved, ${Object.keys(existingVariants).length} total.`);
