const fs = require('fs');
const path = require('path');

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
  "Promo"
];

function getVariants(card) {
  const rarity = card.rarity || "";
  const rarityLower = rarity.toLowerCase();
  let isSpecial = ["vmax", "vstar", " v", "ex", "gx", "break", "prism star", "rainbow"].some(x => rarityLower.includes(x));

  if (rarityLower.includes("promo")) {
    return ["Promo"];
  }

  if (HOLOFOIL_ONLY_RARITIES.includes(rarity) || isSpecial) {
    return ["Holofoil"];
  } else if (rarityLower.includes("rare")) {
    return ["Holofoil", "Reverse Holofoil"];
  } else {
    return ["Normal", "Reverse Holofoil"];
  }
}

const cardsDir = path.join(__dirname, '../public/data/cards/en');
const files = fs.readdirSync(cardsDir);

const variantMap = {};

files.forEach(file => {
  if (!file.endsWith('.json')) return;

  const content = fs.readFileSync(path.join(cardsDir, file), 'utf8');
  const cards = JSON.parse(content);

  cards.forEach(card => {
    variantMap[card.id] = getVariants(card);
  });
});

const outputDir = path.join(__dirname, '../public/data');
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

fs.writeFileSync(
  path.join(outputDir, 'variants.json'),
  JSON.stringify(variantMap, null, 2)
);

console.log(`Generated variants for ${Object.keys(variantMap).length} cards.`);
