const fs = require('fs');
const path = require('path');

const setsDir = path.join(__dirname, '../public/data/sets');
const sets = JSON.parse(fs.readFileSync(path.join(setsDir, 'en.json'), 'utf8'));

// Map set name to ID
const setNameToId = {};
sets.forEach(s => {
  setNameToId[s.name.toLowerCase()] = s.id;
});

// Manual overrides for set names that might not match exactly
const SET_OVERRIDES = {
  "wizards promos": "basep",
  "ex-p promos": "xyp",
  "xy-p promos": "xyp",
  "s-p promos": "swshlp",
  "sm promos": "smp",
  "swsh promos": "swshlp",
  "sv promos": "svp",
  "xy promos": "xyp",
  "black star promos": "basep",
  "miscellaneous promos": "misp",
  "n-p promos": "np",
  "pop series 1": "pop1",
  "pop series 2": "pop2",
  "pop series 3": "pop3",
  "pop series 4": "pop4",
  "pop series 5": "pop5",
  "pop series 6": "pop6",
  "pop series 7": "pop7",
  "pop series 8": "pop8",
  "pop series 9": "pop9",
};

function parseCsv(filename) {
  const content = fs.readFileSync(filename, 'utf8');
  const lines = content.split('\n');
  const results = [];
  let currentPokemon = '';
  
  // Skip header: Ndex,Cameo Pokémon,Card name,Set,#,Notes
  // The header might be different if the user downloaded from the web directly, 
  // but based on previous check it was Ndex,Cameo Pokémon,Card name,Set,#,Notes
  
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    
    // Simplified CSV line parsing for this specific sheet
    const parts = [];
    let current = '';
    let inQuotes = false;
    for (let j = 0; j < line.length; j++) {
      const char = line[j];
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        parts.push(current);
        current = '';
      } else {
        current += char;
      }
    }
    parts.push(current);
    const cleanParts = parts.map(p => p.trim());
    
    if (cleanParts.length < 4) continue;
    
    let [ndex, pokemon, cardName, setName, number, notes] = cleanParts;
    
    // Handle cases where the first line might be metadata if they didn't export correctly, 
    // but usually Google Sheets export has the header on first row.
    if (ndex === 'Ndex' || pokemon === 'Cameo Pokémon') continue;

    if (pokemon) {
      currentPokemon = pokemon;
    }
    
    if (!currentPokemon || !cardName || !setName) continue;

    results.push({
      pokemon: currentPokemon,
      cardName,
      setName,
      number: number || '',
      notes: notes || ''
    });
  }
  return results;
}

async function run() {
  const allCameos = {};
  const cameosDir = path.join(__dirname, '../public/data/cameos');
  
  if (!fs.existsSync(cameosDir)) {
    console.error(`Directory not found: ${cameosDir}`);
    return;
  }

  const files = fs.readdirSync(cameosDir).filter(f => f.endsWith('.csv'));

  for (const file of files) {
    console.log(`Parsing ${file}...`);
    const filePath = path.join(cameosDir, file);
    const cameos = parseCsv(filePath);
    
    cameos.forEach(c => {
      const pokemonLower = c.pokemon.toLowerCase();
      if (!allCameos[pokemonLower]) {
        allCameos[pokemonLower] = [];
      }
      
      // Try to find the set ID
      let setId = setNameToId[c.setName.toLowerCase()] || SET_OVERRIDES[c.setName.toLowerCase()];
      
      if (!setId) {
        // Try fuzzy match or partial match
        const foundSet = sets.find(s => s.name.toLowerCase().includes(c.setName.toLowerCase()) || c.setName.toLowerCase().includes(s.name.toLowerCase()));
        if (foundSet) setId = foundSet.id;
      }

      allCameos[pokemonLower].push({
        cardName: c.cardName,
        setName: c.setName,
        setId: setId || null,
        number: c.number,
        notes: c.notes
      });
    });
  }

  const outputDir = path.join(__dirname, '../public/data');
  fs.writeFileSync(
    path.join(outputDir, 'cameos.json'),
    JSON.stringify(allCameos, null, 2)
  );

  console.log(`Generated cameos.json with ${Object.keys(allCameos).length} pokemon.`);
}

run();
