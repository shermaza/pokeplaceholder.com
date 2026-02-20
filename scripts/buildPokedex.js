const fs = require('fs');
const path = require('path');
const https = require('https');

const OUT_PATH = path.join(__dirname, '../public/data/pokedex.json');
const START_ID = 1;
const END_ID = 1025; // Gen 9 upper bound

function fetchJson(url) {
  return new Promise((resolve, reject) => {
    https
      .get(url, { headers: { 'User-Agent': 'pokeplaceholder-pokedex-builder' } }, (res) => {
        let data = '';
        res.on('data', (chunk) => (data += chunk));
        res.on('end', () => {
          if (res.statusCode >= 200 && res.statusCode < 300) {
            try {
              resolve(JSON.parse(data));
            } catch (e) {
              reject(e);
            }
          } else {
            reject(new Error(`HTTP ${res.statusCode} for ${url}`));
          }
        });
      })
      .on('error', reject);
  });
}

function normalizeNameForRules(name) {
  // Apply user preferences:
  // - Nidoran♀/♂ -> Nidoran F/M
  // - Keep periods/spaces for Mr. Mime/Mr. Rime (PokeAPI already has 'Mr. Mime' etc.)
  // - Keep apostrophes (’ or ')
  // - Ignore forms; use the base English species name only
  if (/^Nidoran♀/i.test(name)) return 'Nidoran F';
  if (/^Nidoran♂/i.test(name)) return 'Nidoran M';
  return name;
}

async function main() {
  const map = {};
  for (let id = START_ID; id <= END_ID; id++) {
    const url = `https://pokeapi.co/api/v2/pokemon-species/${id}/`;
    try {
      const json = await fetchJson(url);
      const enNameEntry = json.names.find((n) => n.language && n.language.name === 'en');
      let name = enNameEntry ? enNameEntry.name : json.name;
      // Some english names from PokeAPI may use ASCII (e.g., Farfetch'd), keep apostrophe as-is
      name = normalizeNameForRules(name);
      map[id] = name;
      if (id % 50 === 0) {
        console.log(`Fetched ${id}/${END_ID}`);
      }
      // Be polite to API: small delay
      await new Promise((r) => setTimeout(r, 80));
    } catch (e) {
      console.error(`Failed at id ${id}: ${e.message}`);
      // Retry once after delay
      await new Promise((r) => setTimeout(r, 500));
      try {
        const json = await fetchJson(url);
        const enNameEntry = json.names.find((n) => n.language && n.language.name === 'en');
        let name = enNameEntry ? enNameEntry.name : json.name;
        name = normalizeNameForRules(name);
        map[id] = name;
      } catch (e2) {
        console.error(`Retry failed at id ${id}: ${e2.message}`);
        break;
      }
    }
  }

  // Write pretty JSON with numeric string keys, consistent with current file style
  const out = {};
  Object.keys(map)
    .sort((a, b) => Number(a) - Number(b))
    .forEach((k) => {
      out[k] = map[k];
    });

  fs.writeFileSync(OUT_PATH, JSON.stringify(out, null, 2) + '\n', 'utf8');
  console.log(`Wrote ${Object.keys(out).length} entries to ${OUT_PATH}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
