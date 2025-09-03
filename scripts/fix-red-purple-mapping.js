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
  console.log('🔎 Sprawdzam mapowanie dla kolorów czerwony i fioletowy w obszyciu niebieskim...');
  
  // Pobierz rekordy z kolorami czerwony i fioletowy
  const colors = ['czerwony', 'fioletowy'];
  let allRecords = [];
  
  for (const color of colors) {
    console.log(`\n📋 Pobieram rekordy dla koloru: ${color}`);
    const res = await fetchData(`http://localhost:3001/api/carmat?matType=3d-with-rims&cellStructure=rhombus&borderColor=niebieski&materialColor=${color}&limit=10`);
    
    if (res.error) {
      console.error(`❌ Błąd pobierania dla ${color}:`, res.error);
      continue;
    }
    
    const records = res.data?.carMats || res.data || [];
    console.log(`📊 Znaleziono ${records.length} rekordów dla ${color}`);
    allRecords = allRecords.concat(records);
  }
  
  console.log(`\n📊 Łącznie znaleziono ${allRecords.length} rekordów do sprawdzenia`);
  
  let fixed = 0, skipped = 0, errors = 0;
  
  for (const rec of allRecords) {
    console.log(`\n🔍 Sprawdzam rekord: ${rec.id}`);
    console.log(`  materialColor: ${rec.materialColor}`);
    console.log(`  imagePath: ${rec.imagePath}`);
    
    // Sprawdź, czy ścieżka jest poprawna
    const expectedPath = `/konfigurator/dywaniki/3d/romby/niebieskie/5os-3d-diamonds-${rec.materialColor === 'czerwony' ? 'red' : 'purple'}-blue.webp`;
    
    if (rec.imagePath === expectedPath) {
      console.log(`  ✅ Ścieżka jest poprawna`);
      skipped++;
      continue;
    }
    
    console.log(`  ❌ Ścieżka niepoprawna`);
    console.log(`  Oczekiwana: ${expectedPath}`);
    
    // Zaktualizuj ścieżkę
    const updateData = {
      imagePath: expectedPath
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
      console.log(`  ✅ Zaktualizowano ścieżkę`);
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
