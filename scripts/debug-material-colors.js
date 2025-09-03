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
  
  const materialColors = new Set();
  
  records.forEach(rec => {
    materialColors.add(rec.materialColor);
  });
  
  console.log('\n📋 Wszystkie unikalne materialColor z kodami znaków:');
  Array.from(materialColors).sort().forEach(color => {
    const codes = Array.from(color).map(char => char.charCodeAt(0)).join(',');
    console.log(`  - "${color}" (kody: ${codes})`);
  });
}

if (require.main === module) {
  run();
}
