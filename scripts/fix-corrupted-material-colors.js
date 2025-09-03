const fs = require('fs');

// Mapowanie uszkodzonych nazw na poprawne
const FIX_CORRUPTED_NAMES = {
  'bia,y': 'biały',
  'br.zowy': 'brązowy', 
  'ko>?s,oniowa': 'kość słoniowa',
  'żó,ty': 'żółty'
};

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
    const originalMaterialColor = rec.materialColor;
    
    // Sprawdź, czy nazwa zawiera uszkodzone znaki (65533 to znak zastępczy Unicode)
    let fixedMaterialColor = originalMaterialColor;
    
    if (originalMaterialColor.includes('')) {
      // Napraw uszkodzone nazwy na podstawie wzorców
      if (originalMaterialColor.includes('bia') && originalMaterialColor.includes('y')) {
        fixedMaterialColor = 'biały';
      } else if (originalMaterialColor.includes('br') && originalMaterialColor.includes('zowy')) {
        fixedMaterialColor = 'brązowy';
      } else if (originalMaterialColor.includes('ko') && originalMaterialColor.includes('oniowa')) {
        fixedMaterialColor = 'kość słoniowa';
      } else if (originalMaterialColor.includes('żó') && originalMaterialColor.includes('ty')) {
        fixedMaterialColor = 'żółty';
      }
    }
    
    if (originalMaterialColor === fixedMaterialColor) {
      skipped++;
      continue;
    }
    
    console.log(`\n🛠️ ${rec.id}:`);
    console.log(`  old materialColor: ${originalMaterialColor}`);
    console.log(`  new materialColor: ${fixedMaterialColor}`);
    
    const updateData = {
      materialColor: fixedMaterialColor
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
