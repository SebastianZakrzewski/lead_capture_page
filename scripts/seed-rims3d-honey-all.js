const fs = require('fs');
const path = require('path');

const ROOT_DIR = path.join(__dirname, '../public/konfigurator/dywaniki/3d/plaster');

// file token -> polish color
const FILE_TOKEN_TO_PL = {
  beige: 'beżowy',
  black: 'czarny',
  blue: 'niebieski',
  brown: 'brązowy',
  darkblue: 'ciemnoniebieski',
  darkgreen: 'ciemnozielony',
  darkgrey: 'ciemnoszary',
  ivory: 'kość słoniowa',
  lightbeige: 'jasnobeżowy',
  lime: 'limonkowy',
  maroon: 'bordowy',
  orange: 'pomarańczowy',
  pink: 'różowy',
  purple: 'fioletowy',
  red: 'czerwony',
  white: 'biały',
  yellow: 'żółty',
};

// folder name (border) -> polish color
const BORDER_FOLDER_TO_PL = {
  czarne: 'czarny',
  bezowy: 'beżowy',
  bordowe: 'bordowy',
  brazowy: 'brązowy',
  ciemnoszary: 'ciemnoszary',
  czerwone: 'czerwony',
  fioletowy: 'fioletowy',
  fioletowe: 'fioletowy',
  granatowe: 'ciemnoniebieski',
  granatowy: 'ciemnoniebieski',
  jasnoszary: 'jasnoszary',
  niebieskie: 'niebieski',
  niebieski: 'niebieski',
  pomaranczowe: 'pomarańczowy',
  rozowy: 'różowy',
  rozowe: 'różowy',
  zielone: 'zielony',
  zielony: 'zielony',
  zolte: 'żółty',
};

function parse3dHoneyFile(fileName) {
  // Expect: 5os-3d-honey-<material>-<border>.webp
  const m = fileName.match(/^5os-3d-honey-([^-]+)-([^.]+)\.webp$/);
  if (!m) return null;
  const materialToken = m[1];
  const borderToken = m[2];
  return {
    materialColor: FILE_TOKEN_TO_PL[materialToken] || materialToken,
    borderToken,
  };
}

function buildImagePath(borderFolder, fileName) {
  return `/konfigurator/dywaniki/3d/plaster/${borderFolder}/${fileName}`;
}

async function postBatch(carMatDataBatch) {
  const res = await fetch('http://localhost:3001/api/carmat/bulk-insert', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ carMatData: carMatDataBatch }),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`HTTP ${res.status} ${res.statusText}: ${text}`);
  }
  return res.json();
}

async function run() {
  console.log('🔎 Skanuję wszystkie foldery 3d/plaster...');
  const borderFolders = fs.readdirSync(ROOT_DIR).filter((d) => fs.statSync(path.join(ROOT_DIR, d)).isDirectory());
  console.log(`📁 Folderów obszycia: ${borderFolders.length}`);

  const allRecords = [];
  for (const folder of borderFolders) {
    const borderColor = BORDER_FOLDER_TO_PL[folder];
    if (!borderColor) {
      console.warn(`⏭️ Pomijam nieznany folder obszycia: ${folder}`);
      continue;
    }
    const dir = path.join(ROOT_DIR, folder);
    const files = fs.readdirSync(dir).filter((f) => f.toLowerCase().endsWith('.webp'));
    for (const file of files) {
      const parsed = parse3dHoneyFile(file);
      if (!parsed) continue;
      allRecords.push({
        matType: '3d-with-rims',
        cellStructure: 'honeycomb',
        materialColor: parsed.materialColor,
        borderColor,
        imagePath: buildImagePath(folder, file),
      });
    }
  }

  console.log(`🧾 Zebrane rekordy: ${allRecords.length}`);
  let inserted = 0, skipped = 0, failed = 0;
  const batchSize = 25;
  for (let i = 0; i < allRecords.length; i += batchSize) {
    const batch = allRecords.slice(i, i + batchSize);
    try {
      const res = await postBatch(batch);
      const ins = res?.inserted ?? res?.data?.length ?? 0;
      const skip = res?.skipped ?? 0;
      inserted += ins;
      skipped += skip;
      console.log(`📦 Partia ${Math.floor(i / batchSize) + 1}: inserted=${ins}, skipped=${skip}`);
    } catch (e) {
      failed += batch.length;
      console.error(`❌ Partia nieudana:`, e.message);
    }
    await new Promise((r) => setTimeout(r, 150));
  }

  console.log('\n🎉 Gotowe');
  console.log(`✅ Wstawiono: ${inserted}`);
  console.log(`⏭️ Pominięto: ${skipped}`);
  console.log(`⚠️  Błędy: ${failed}`);
}

run().catch((e) => { console.error('❌ Fatal:', e); process.exit(1); });
