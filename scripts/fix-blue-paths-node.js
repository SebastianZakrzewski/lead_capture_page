const fs = require('fs');

// Mapowanie polskich nazw na klucze angielskie
const POLISH_TO_KEY = {
  'beżowy': 'beige',
  'czarny': 'black', 
  'niebieski': 'blue',
  'brązowy': 'brown',
  'ciemnoniebieski': 'darkblue',
  'ciemnozielony': 'darkgreen',
  'ciemnoszary': 'darkgrey',
  'kość słoniowa': 'ivory',
  'jasnobeżowy': 'lightbeige',
  'limonkowy': 'lime',
  'bordowy': 'maroon',
  'pomarańczowy': 'orange',
  'różowy': 'pink',
  'fioletowy': 'purple',
  'czerwony': 'red',
  'biały': 'white',
  'żółty': 'yellow'
};

// Mapowanie uszkodzonych nazw na poprawne
const FIX_CORRUPTED_NAMES = {
  'rÃ³Å¼owy': 'różowy',
  'biaÅ‚y': 'biały', 
  'beowy': 'beżowy',
  'Å¼Ã³…,ty': 'żółty',
  'br.zowy': 'brązowy',
  'ko>? s,oniowa': 'kość słoniowa',
  'jasnobeowy': 'jasnobeżowy'
};

function expectedPath(materialColorPl, borderColorPl) {
  // Napraw uszkodzone nazwy
  const fixedMaterial = FIX_CORRUPTED_NAMES[materialColorPl] || materialColorPl;
  const materialKey = POLISH_TO_KEY[fixedMaterial] || (fixedMaterial || '').toLowerCase();
  
  // Dla 3D z rantami, romb, obszycie niebieskie - folder musi być 'niebieskie' i sufiks '-blue'
  return `/konfigurator/dywaniki/3d/romby/niebieskie/5os-3d-diamonds-${materialKey}-blue.webp`;
}

async function fetchData(url, options = {}) {
  try {
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      },
      ...options
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error(`❌ Błąd fetch ${url}:`, error.message);
    return { error: error.message };
  }
}

async function run() {
  console.log('🔎 Pobieram rekordy 3D-with-rims rhombus z obszyciem niebieskim...');
  
  const res = await fetchData('http://localhost:3001/api/carmat?matType=3d-with-rims&cellStructure=rhombus&borderColor=niebieski&limit=500');
  
  if (res.error) {
    console.error('❌ Błąd pobierania:', res.error);
    return;
  }
  
  const records = res.data?.carMats || res.data || [];
  console.log(`📊 Znaleziono ${records.length} rekordów.`);
  
  let fixed = 0, skipped = 0, errors = 0;
  
  for (const rec of records) {
    const expected = expectedPath(rec.materialColor, rec.borderColor);
    const needsFix = !rec.imagePath || 
                    rec.imagePath.includes('/klasyczne/') || 
                    rec.imagePath.includes('granatowe') || 
                    rec.imagePath.includes('-darkblue') || 
                    rec.imagePath !== expected;
    
    if (!needsFix) { 
      skipped++; 
      continue; 
    }
    
    console.log(`\n🛠️ ${rec.id}:`);
    console.log(`  old: ${rec.imagePath}`);
    console.log(`  new: ${expected}`);
    
    const updateData = {
      imagePath: expected,
      borderColor: 'niebieski'
    };
    
    const upd = await fetchData(`http://localhost:3001/api/carmat/${rec.id}`, {
      method: 'PUT',
      body: JSON.stringify(updateData)
    });
    
    if (upd.error) {
      console.error(`  ❌ Błąd update:`, upd.error);
      errors++;
    } else {
      fixed++;
      console.log(`  ✅ Zaktualizowano`);
    }
    
    // Krótka pauza między requestami
    await new Promise(r => setTimeout(r, 100));
  }
  
  console.log(`\n🎉 Gotowe!`);
  console.log(`📊 Poprawiono: ${fixed}`);
  console.log(`⏭️ Pominięto: ${skipped}`);
  console.log(`❌ Błędy: ${errors}`);
}

if (require.main === module) {
  run();
}
