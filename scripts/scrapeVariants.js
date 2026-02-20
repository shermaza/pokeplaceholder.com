const fs = require('fs');
const path = require('path');
const https = require('https');

function fetch(url) {
  return new Promise((resolve, reject) => {
    https.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    }, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => resolve(data));
    }).on('error', reject);
  });
}

const SCRAPER_OUTPUT_PATH = path.join(__dirname, '../scraped_variants.json');
const CARDS_DIR = path.join(__dirname, '../public/data/cards/en');

// Manual overrides for variants that might not be easily scraped or are very specific
const manual = {
  "basep-1": ["Ivy Pikachu Error"],
  "sm9-119": ["Staff", "Prerelease"], // Dragonite (Team Up)
  "swsh1-155": ["Staff", "Prerelease"], // Snorlax (Sword & Shield)
  "xy12-35": ["Toys R Us Stamp"], // Pikachu (Evolutions)
};

async function scrape() {
  const allVariants = {};
  
  // Load sets to build a name-to-id mapping
  const setsData = JSON.parse(fs.readFileSync(path.join(__dirname, '../public/data/sets/en.json'), 'utf8'));
  const nameToId = {};
  setsData.forEach(s => {
    nameToId[s.name.toLowerCase()] = s.id;
    // Add some common aliases
    if (s.name.includes('—')) {
      nameToId[s.name.replace('—', '-').toLowerCase()] = s.id;
    }
    if (s.name.includes(' - ')) {
      nameToId[s.name.replace(' - ', ': ').toLowerCase()] = s.id;
    }
  });

  // Specific overrides for TCGPlayer group names that don't match our set names
  const groupNameToPrefix = {
    "sv: scarlet & violet promo cards": "svp",
    "scarlet & violet promo cards": "svp",
    "swsh: sword & shield promo cards": "swshp",
    "swsh black star promos": "swshp",
    "sm promos": "smp",
    "sm black star promos": "smp",
    "xy promos": "xyp",
    "xy black star promos": "xyp",
    "bw promos": "bwp",
    "bw black star promos": "bwp",
    "hgss promos": "hsp",
    "hgss black star promos": "hsp",
    "dp promos": "dpp",
    "dp black star promos": "dpp",
    "nintendo black star promos": "npp",
    "wizards black star promos": "basep",
    "sm - team up": "sm9",
    "sv01: scarlet & violet base set": "sv1",
    "sv02: paldea evolved": "sv2",
    "sv03: obsidian flames": "sv3",
    "sv04: paradox rift": "sv4",
    "sv05: temporal forces": "sv5",
    "sv06: twilight masquerade": "sv6",
    "sv07: stellar crown": "sv7",
    "sv08: surging sparks": "sv8",
    "sv: prismatic evolutions": "sv8pt5",
    "swsh01: sword & shield base set": "swsh1",
    "swsh02: rebel clash": "swsh2",
    "swsh03: darkness ablaze": "swsh3",
    "swsh04: vivid voltage": "swsh4",
    "swsh05: battle styles": "swsh5",
    "swsh06: chilling reign": "swsh6",
    "swsh07: evolving skies": "swsh7",
    "swsh08: fusion strike": "swsh8",
    "swsh09: brilliant stars": "swsh9",
    "swsh10: astral radiance": "swsh10",
    "swsh11: lost origin": "swsh11",
    "swsh12: silver tempest": "swsh12",
    "xy - evolutions": "xy12",
    "expedition base set": "ecard1",
    "expedition": "ecard1",
    "aquapolis": "ecard2",
    "skyridge": "ecard3",
    "shining fates: shiny vault": "swsh45sv",
    "hidden fates: shiny vault": "sma",
    "crown zenith: galarian gallery": "swsh12tg",
    "silver tempest trainer gallery": "swsh12tg",
    "lost origin trainer gallery": "swsh11tg",
    "astral radiance trainer gallery": "swsh10tg",
    "brilliant stars trainer gallery": "swsh09tg",
    "cosmic eclipse": "sm12",
    "sm - cosmic eclipse": "sm12",
    "unified minds": "sm11",
    "sm - unified minds": "sm11",
    "unbroken bonds": "sm10",
    "sm - unbroken bonds": "sm10",
    "lost thunder": "sm8",
    "sm - lost thunder": "sm8",
    "celestial storm": "sm7",
    "sm - celestial storm": "sm7",
    "forbidden light": "sm6",
    "sm - forbidden light": "sm6",
    "ultra prism": "sm5",
    "sm - ultra prism": "sm5",
    "crimson invasion": "sm4",
    "sm - crimson invasion": "sm4",
    "burning shadows": "sm3",
    "sm - burning shadows": "sm3",
    "guardians rising": "sm2",
    "sm - guardians rising": "sm2",
    "sun & moon base set": "sm1",
    "sm base set": "sm1"
  };

  console.log("Fetching TCGPlayer groups...");
  const groupsUrl = 'https://tcgcsv.com/tcgplayer/3/groups';
  let groups;
  try {
    const groupsResponse = await fetch(groupsUrl);
    groups = JSON.parse(groupsResponse).results;
    console.log(`Found ${groups.length} groups.`);
  } catch (err) {
    console.error("Failed to fetch groups:", err.message);
    return;
  }

  // Load all cards into memory for matching (by name and number)
  // This is for groups like "World Championship Decks" where we don't have a direct prefix mapping
  console.log("Loading local cards for matching...");
  const localCards = [];
  const cardFiles = fs.readdirSync(CARDS_DIR);
  for (const file of cardFiles) {
    if (!file.endsWith('.json')) continue;
    const cards = JSON.parse(fs.readFileSync(path.join(CARDS_DIR, file), 'utf8'));
    cards.forEach(c => {
      localCards.push({
        id: c.id,
        name: c.name.toLowerCase(),
        number: c.number,
        setId: file.replace('.json', '')
      });
    });
  }
  console.log(`Loaded ${localCards.length} cards.`);

  for (const group of groups) {
    const groupNameLower = group.name.toLowerCase();
    let prefix = groupNameToPrefix[groupNameLower] || nameToId[groupNameLower];

    // If it's a "Trainer Gallery" and we haven't mapped it, try to find the base set and add 'tg'
    if (!prefix && groupNameLower.includes('trainer gallery')) {
      const baseName = groupNameLower.replace('trainer gallery', '').trim();
      const basePrefix = groupNameToPrefix[baseName] || nameToId[baseName];
      if (basePrefix) {
        prefix = basePrefix + 'tg';
      }
    }

    if (!prefix && group.groupId !== 2282) { // 2282 is World Championship Decks
      // Skip groups we can't map
      continue;
    }

    console.log(`Fetching products for group ${group.name} (${group.groupId})...`);
    const url = `https://tcgcsv.com/tcgplayer/3/${group.groupId}/products`;
    try {
      const responseText = await fetch(url);
      const data = JSON.parse(responseText);
      
      if (!data.success) {
        console.error(`Failed to fetch group ${group.groupId}:`, data.errors);
        continue;
      }

      console.log(`Found ${data.results.length} products.`);

      for (const product of data.results) {
        const name = product.name;
        const numberData = product.extendedData?.find(ed => ed.name === 'Number');
        const num = numberData ? numberData.value : null;

        if (group.groupId === 2282) {
          // World Championship Decks handling
          if (!num) continue;
          // Name is usually "Oracle - 2004 (Chris Fulop)"
          const wcMatch = name.match(/^(.+?) - (\d{4} \(.*?\))/);
          if (!wcMatch) continue;
          
          const baseName = wcMatch[1].trim().toLowerCase();
          const signature = wcMatch[2]; // e.g. "2004 (Chris Fulop)"
          
          // The number in TCGPlayer for WC decks is often "138/144"
          const cleanNum = num.split('/')[0].trim();
          
          // Find matching card
          const matches = localCards.filter(c => c.name === baseName && c.number === cleanNum);
          if (matches.length > 0) {
            matches.forEach(m => {
              if (!allVariants[m.id]) allVariants[m.id] = [];
              const variantName = `${signature} Signature`;
              if (!allVariants[m.id].includes(variantName)) {
                allVariants[m.id].push(variantName);
              }
            });
          }
          continue;
        }

        if (!num) continue;
        
        // Standard group handling
        let cardId;
        if (prefix === 'svp') {
          cardId = `svp-${parseInt(num, 10)}`;
        } else if (['swshp', 'smp', 'xyp', 'bwp', 'hsp', 'dpp'].some(p => prefix === p)) {
          // Promo prefixes usually need the SWSH/SM etc. part preserved if it was there
          // But our local IDs for promos are often prefix-NUMBER
          // Check what our local IDs look like
          const possibleId = `${prefix}-${num}`;
          cardId = possibleId;
        } else {
          cardId = `${prefix}-${num}`;
        }

        const variants = [];
        if (name.includes('[Staff]')) variants.push('Staff');
        if (name.includes('(Prerelease)') || name.includes('Prerelease Promo')) variants.push('Prerelease');
        if (name.includes('Pokemon Center Exclusive') || name.includes('Pok\u00e9mon Center Exclusive') || name.includes('Pokemon Center Stamp')) {
           variants.push('Pok\u00e9mon Center Stamp');
        }
        if (name.includes('EB Games')) variants.push('EB Games Stamp');
        if (name.includes('GameStop')) variants.push('GameStop Stamp');
        if (name.includes('Toys R Us') || name.includes('Toys "R" Us')) variants.push('Toys R Us Stamp');
        if (name.includes('Best Buy')) variants.push('Best Buy Stamp');
        if (name.includes('Regionals') || name.includes('Regional Championship')) variants.push('Regionals Stamp');
        if (name.includes('Nationals') || name.includes('National Championship')) variants.push('Nationals Stamp');
        if (name.includes('Worlds') || name.includes('World Championship')) {
           if (group.groupId !== 2282) variants.push('Worlds Stamp');
        }

        if (variants.length > 0) {
          if (!allVariants[cardId]) allVariants[cardId] = [];
          variants.forEach(v => {
            if (!allVariants[cardId].includes(v)) {
              allVariants[cardId].push(v);
            }
          });
        }
      }
    } catch (err) {
      console.error(`Error processing group ${group.groupId}:`, err.message);
    }
    
    // Add a small delay to be nice to the API
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  // Add manual overrides
  Object.keys(manual).forEach(id => {
    if (!allVariants[id]) allVariants[id] = [];
    manual[id].forEach(v => {
      if (!allVariants[id].includes(v)) {
        allVariants[id].push(v);
      }
    });
  });

  fs.writeFileSync(SCRAPER_OUTPUT_PATH, JSON.stringify(allVariants, null, 2));
  console.log(`Updated variants in scraped_variants.json. Total cards with variants: ${Object.keys(allVariants).length}`);
}

scrape();
