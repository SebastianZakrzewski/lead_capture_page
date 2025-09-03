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
    let fixedMaterialColor = originalMaterialColor;
    
    // Napraw pozostałe uszkodzone nazwy
    if (originalMaterialColor.includes('rÃ³Å¼owy') || originalMaterialColor.includes('różowy')) {
      fixedMaterialColor = 'różowy';
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
