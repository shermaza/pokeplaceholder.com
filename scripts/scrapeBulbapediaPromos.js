const fs = require('fs');
const path = require('path');
const https = require('https');

const PROMO_PAGES = [
  { url: 'https://m.bulbapedia.bulbagarden.net/wiki/SVP_Black_Star_Promos_(TCG)', prefix: 'svp-SVP' },
  { url: 'https://m.bulbapedia.bulbagarden.net/wiki/SWSH_Black_Star_Promos_(TCG)', prefix: 'swshp-SWSH' },
  { url: 'https://m.bulbapedia.bulbagarden.net/wiki/SM_Black_Star_Promos_(TCG)', prefix: 'smp-SM' },
  { url: 'https://m.bulbapedia.bulbagarden.net/wiki/XY_Black_Star_Promos_(TCG)', prefix: 'xyp-XY' },
  { url: 'https://m.bulbapedia.bulbagarden.net/wiki/BW_Black_Star_Promos_(TCG)', prefix: 'bwp-BW' },
  { url: 'https://m.bulbapedia.bulbagarden.net/wiki/HGSS_Black_Star_Promos_(TCG)', prefix: 'hsp-HGSS' },
  { url: 'https://m.bulbapedia.bulbagarden.net/wiki/DP_Black_Star_Promos_(TCG)', prefix: 'dpp-DP' },
  { url: 'https://m.bulbapedia.bulbagarden.net/wiki/Nintendo_Black_Star_Promos_(TCG)', prefix: 'npp-' },
  { url: 'https://m.bulbapedia.bulbagarden.net/wiki/Wizards_Black_Star_Promos_(TCG)', prefix: 'basep-' },
  { url: 'https://m.bulbapedia.bulbagarden.net/wiki/Team_Up_(TCG)', prefix: 'sm9-' },
  { url: 'https://m.bulbapedia.bulbagarden.net/wiki/Sword_%26_Shield_(TCG)', prefix: 'swsh1-' },
  { url: 'https://m.bulbapedia.bulbagarden.net/wiki/Evolutions_(TCG)', prefix: 'xy12-' },
];

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

async function scrape() {
  const allVariants = {};

  for (const page of PROMO_PAGES) {
    console.log(`Scraping ${page.url}...`);
    const html = await fetch(page.url);
    console.log(`HTML length: ${html.length}`);
    
    const rows = html.split('<tr>');
    console.log(`Found ${rows.length} potential rows.`);
    for (const row of rows) {
      if (!row.includes('</td>')) continue;
      
      const cells = row.split('</td>');
      // console.log(`Cells in row: ${cells.length}`);
      
      // Column 1: Number - sometimes it's inside a <td> with attributes
      const firstCell = cells[0];
      const numMatch = firstCell.match(/>\s*([A-Z0-9]+)\s*$/) || firstCell.match(/>\s*([A-Z0-9]+)\s*<|>\s*([A-Z0-9]+)\s*$/);
      if (!numMatch) continue;
      const num = numMatch[1] || numMatch[2];
      
      // Matching IDs to our project data:
      // svp: svp-1, svp-2, etc. (Bulbapedia has SVP001)
      // swshp: swshp-SWSH001, etc.
      // smp: smp-SM01, etc.
      // xyp: xyp-XY01, etc.
      // bwp: bwp-BW01, etc.
      // hsp: hsp-HGSS01, etc.
      // dpp: dpp-DP01, etc.
      // npp: npp-1, etc.
      // basep: basep-1, etc.

      let cardId;
      if (page.prefix === 'svp-SVP') {
        cardId = `svp-${parseInt(num.replace('SVP', ''), 10)}`;
      } else if (page.prefix === 'swshp-SWSH') {
        cardId = `swshp-${num}`;
      } else if (page.prefix === 'smp-SM') {
        cardId = `smp-${num}`;
      } else if (page.prefix === 'xyp-XY') {
        cardId = `xyp-${num}`;
      } else if (page.prefix === 'bwp-BW') {
        cardId = `bwp-${num}`;
      } else if (page.prefix === 'hsp-HGSS') {
        cardId = `hsp-${num}`;
      } else if (page.prefix === 'dpp-DP') {
        cardId = `dpp-${num}`;
      } else if (['sm9-', 'swsh1-', 'xy12-'].includes(page.prefix)) {
        cardId = `${page.prefix}${parseInt(num, 10)}`;
      } else {
        cardId = `${page.prefix}${parseInt(num, 10)}`;
      }

      const variants = [];
      
      // Check for [Staff]
      if (row.includes('[Staff]')) {
        variants.push('Staff');
      }
      
      // Check for Prerelease
      if (row.toLowerCase().includes('prerelease')) {
        variants.push('Prerelease');
      }
      
      // Check for other stamps in the "Promotion" column (usually cell 5 or 6)
      const promotionCell = cells.find(c => c.toLowerCase().includes('stamp') || c.toLowerCase().includes('exclusive'));
      if (promotionCell) {
        if (promotionCell.includes('EB Games')) variants.push('EB Games Stamp');
        if (promotionCell.includes('GameStop')) variants.push('GameStop Stamp');
        if (promotionCell.includes('Toys "R" Us') || promotionCell.includes('Toys R Us')) variants.push('Toys R Us Stamp');
        if (promotionCell.includes('Pokémon Center')) variants.push('Pokémon Center Stamp');
      }

      if (variants.length > 0) {
        if (!allVariants[cardId]) allVariants[cardId] = [];
        variants.forEach(v => {
          if (!allVariants[cardId].includes(v)) allVariants[cardId].push(v);
        });
      }
    }
  }

  fs.writeFileSync('bulbapedia_variants.json', JSON.stringify(allVariants, null, 2));

  // Add manual overrides that the scraper can't easily find
  const manual = {
    "basep-1": ["Ivy Pikachu Error"],
    "sm9-119": ["Staff", "Prerelease"], // Dragonite (Team Up)
    "swsh1-155": ["Staff", "Prerelease"], // Snorlax (Sword & Shield)
    "xy12-35": ["Toys R Us Stamp"], // Pikachu (Evolutions)
  };
  Object.keys(manual).forEach(id => {
    if (!allVariants[id]) allVariants[id] = [];
    manual[id].forEach(v => {
      if (!allVariants[id].includes(v)) allVariants[id].push(v);
    });
  });

  fs.writeFileSync('bulbapedia_variants.json', JSON.stringify(allVariants, null, 2));
  console.log(`Saved ${Object.keys(allVariants).length} card variants to bulbapedia_variants.json`);
}

scrape();
