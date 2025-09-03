const fs = require('fs');
const path = require('path');
const http = require('http');

// Mapowanie kolorów z nazw plików na standardowe nazwy
const COLOR_MAPPING = {
  'beige': 'beżowy',
  'black': 'czarny',
  'blue': 'niebieski',
  'brown': 'brązowy',
  'darkblue': 'ciemnoniebieski',
  'darkgreen': 'ciemnozielony',
  'darkgrey': 'ciemnoszary',
  'ivory': 'kość słoniowa',
  'lightbeige': 'jasnobeżowy',
  'lime': 'limonkowy',
  'maroon': 'bordowy',
  'orange': 'pomarańczowy',
  'pink': 'różowy',
  'purple': 'fioletowy',
  'red': 'czerwony',
  'white': 'biały',
  'yellow': 'żółty',
  'green': 'zielony'
};

// Mapowanie kolorów obszycia z polskich nazw na standardowe
const BORDER_COLOR_MAPPING = {
  'bezowe': 'beżowy',
  'bordowe': 'bordowy',
  'brazowe': 'brązowy',
  'ciemnoszare': 'ciemnoszary',
  'czerwone': 'czerwony',
  'fioletowe': 'fioletowy',
  'granatowe': 'ciemnoniebieski',
  'jasnoszare': 'jasnoszary',
  'niebieskie': 'niebieski',
  'pomaranczowe': 'pomarańczowy',
  'rozowe': 'różowy',
  'zielone': 'zielony',
  'ciemnozielone': 'zielony',
  'zolte': 'żółty',
  'czarne': 'czarny'
};

/**
 * Mapuje nazwę pliku na dane CarMat
 */
function mapFileNameToCarMatData(fileName, fullPath) {
  // Parsowanie nazwy pliku klasycznego plaster miodu: 5os-classic-honey-[material]-[border].webp
  const matchHoney = fileName.match(/^5os-classic-honey-([^-]+)-([^-]+)\.webp$/);
  if (matchHoney) {
    const [, materialColor, borderColor] = matchHoney;
    const carMatData = {
      matType: '3d-without-rims',
      cellStructure: 'honeycomb',
      materialColor: COLOR_MAPPING[materialColor] || materialColor,
      borderColor: COLOR_MAPPING[borderColor] || borderColor,
      imagePath: fullPath
    };
    return carMatData;
  }

  // Parsowanie nazwy pliku klasycznego romby: 5os-classic-diamonds-[material]-[border].webp
  const matchDiamonds = fileName.match(/^5os-classic-diamonds-([^-]+)-([^-]+)\.webp$/);
  if (matchDiamonds) {
    const [, materialColor, borderColor] = matchDiamonds;
    const carMatData = {
      matType: '3d-without-rims',
      cellStructure: 'rhombus',
      materialColor: COLOR_MAPPING[materialColor] || materialColor,
      borderColor: COLOR_MAPPING[borderColor] || borderColor,
      imagePath: fullPath
    };
    return carMatData;
  }

  return null;
}

/**
 * Skanuje katalog i znajduje wszystkie pliki .webp
 */
function scanDirectory(dirPath, basePath = '') {
  const results = [];
  
  try {
    const items = fs.readdirSync(dirPath);
    
    for (const item of items) {
      const fullPath = path.join(dirPath, item);
      const relativePath = path.join(basePath, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory()) {
        // Rekurencyjnie skanuj podkatalogi
        results.push(...scanDirectory(fullPath, relativePath));
      } else if (item.endsWith('.webp')) {
        // Znaleziono plik .webp
        const imagePath = `/konfigurator/dywaniki/klasyczne/${relativePath.replace(/\\/g, '/')}`;
        const carMatData = mapFileNameToCarMatData(item, imagePath);
        
        if (carMatData) {
          results.push(carMatData);
        } else {
          console.warn(`⚠️ Nie można zmapować pliku: ${item}`);
        }
      }
    }
  } catch (error) {
    console.error(`❌ Błąd podczas skanowania katalogu ${dirPath}:`, error.message);
  }
  
  return results;
}

/**
 * Główna funkcja do mapowania obrazów klasycznych
 */
function mapKlasyczneImages() {
  console.log('🔄 Rozpoczynam mapowanie obrazów klasycznych...');
  
  const baseDir = path.join(__dirname, '..', 'public', 'konfigurator', 'dywaniki', 'klasyczne');
  
  // Sprawdź czy katalog istnieje
  if (!fs.existsSync(baseDir)) {
    console.error(`❌ Katalog nie istnieje: ${baseDir}`);
    return;
  }
  
  console.log(`📁 Skanowanie katalogu: ${baseDir}`);
  
  // Skanuj katalogi plaster miodu i romby
  const plasterMioduDir = path.join(baseDir, 'plaster miodu');
  const rombyDir = path.join(baseDir, 'romby');
  
  let allCarMatData = [];
  
  if (fs.existsSync(plasterMioduDir)) {
    console.log('🍯 Skanowanie plaster miodu...');
    const plasterData = scanDirectory(plasterMioduDir, 'plaster miodu');
    allCarMatData.push(...plasterData);
    console.log(`✅ Znaleziono ${plasterData.length} obrazów plaster miodu`);
  }
  
  if (fs.existsSync(rombyDir)) {
    console.log('💎 Skanowanie romby...');
    const rombyData = scanDirectory(rombyDir, 'romby');
    allCarMatData.push(...rombyData);
    console.log(`✅ Znaleziono ${rombyData.length} obrazów romby`);
  }
  
  console.log(`📊 Łącznie znaleziono ${allCarMatData.length} obrazów do zmapowania`);
  
  // Grupuj według typu i struktury
  const stats = {
    total: allCarMatData.length,
    byMatType: {},
    byCellStructure: {},
    byMaterialColor: {},
    byBorderColor: {}
  };
  
  allCarMatData.forEach(item => {
    stats.byMatType[item.matType] = (stats.byMatType[item.matType] || 0) + 1;
    stats.byCellStructure[item.cellStructure] = (stats.byCellStructure[item.cellStructure] || 0) + 1;
    stats.byMaterialColor[item.materialColor] = (stats.byMaterialColor[item.materialColor] || 0) + 1;
    stats.byBorderColor[item.borderColor] = (stats.byBorderColor[item.borderColor] || 0) + 1;
  });
  
  console.log('📈 Statystyki:');
  console.log(`   Typ maty: ${JSON.stringify(stats.byMatType, null, 2)}`);
  console.log(`   Struktura: ${JSON.stringify(stats.byCellStructure, null, 2)}`);
  console.log(`   Kolory materiału: ${Object.keys(stats.byMaterialColor).length} unikalnych`);
  console.log(`   Kolory obszycia: ${Object.keys(stats.byBorderColor).length} unikalnych`);
  
  // Zapisz dane do pliku JSON
  const outputPath = path.join(__dirname, 'klasyczne-carmat-data.json');
  fs.writeFileSync(outputPath, JSON.stringify(allCarMatData, null, 2));
  console.log(`💾 Dane zapisane do: ${outputPath}`);
  
  return allCarMatData;
}

/**
 * Funkcja do dodania danych CarMat do bazy danych przez API w małych partiach
 */
async function insertCarMatToDatabase(carMatData) {
  try {
    console.log(`🔄 Dodawanie ${carMatData.length} rekordów CarMat do bazy danych w partiach...`);

    const BATCH_SIZE = 50; // Przetwarzaj po 50 rekordów na raz
    let totalInserted = 0;
    let totalSkipped = 0;
    
    for (let i = 0; i < carMatData.length; i += BATCH_SIZE) {
      const batch = carMatData.slice(i, i + BATCH_SIZE);
      console.log(`📦 Przetwarzanie partii ${Math.floor(i / BATCH_SIZE) + 1}/${Math.ceil(carMatData.length / BATCH_SIZE)} (${batch.length} rekordów)...`);
      
      const result = await insertBatch(batch);
      totalInserted += result.inserted || 0;
      totalSkipped += result.skipped || 0;
      
      // Krótka przerwa między partiami
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    console.log('✅ Wszystkie partie przetworzone!');
    console.log(`📊 Łącznie dodano: ${totalInserted} rekordów`);
    console.log(`⏭️ Łącznie pominięto: ${totalSkipped} rekordów (już istnieją)`);
    
    return {
      success: true,
      inserted: totalInserted,
      skipped: totalSkipped,
      message: `Pomyślnie przetworzono ${carMatData.length} rekordów`
    };

  } catch (error) {
    console.error('❌ Błąd podczas dodawania danych:', error);
    throw error;
  }
}

/**
 * Funkcja do dodania pojedynczej partii danych
 */
async function insertBatch(batch) {
  const postData = JSON.stringify({ carMatData: batch });
  
  const options = {
    hostname: 'localhost',
    port: 3001,
    path: '/api/carmat/bulk-insert',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(postData)
    }
  };
  
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const result = JSON.parse(data);
          if (result.success) {
            console.log(`  ✅ Partia: dodano ${result.inserted}, pominięto ${result.skipped}`);
          } else {
            console.log(`  ❌ Błąd partii: ${result.error}`);
          }
          resolve(result);
        } catch (parseError) {
          console.log('❌ Błąd parsowania JSON:', parseError.message);
          console.log('📄 Odpowiedź serwera (raw):', data);
          resolve({ success: false, error: 'Parse error', inserted: 0, skipped: 0 });
        }
      });
    });
    
    req.on('error', (error) => {
      console.error('❌ Błąd podczas wywołania API:', error);
      reject(error);
    });
    
    req.write(postData);
    req.end();
  });
}

// Główna funkcja
async function main() {
  try {
    // Mapuj obrazy
    const carMatData = mapKlasyczneImages();
    
    if (carMatData.length === 0) {
      console.log('❌ Nie znaleziono żadnych obrazów do zmapowania');
      return;
    }
    
    // Dodaj do bazy danych
    await insertCarMatToDatabase(carMatData);
    
    console.log('🎉 Proces mapowania i dodawania do bazy danych zakończony pomyślnie!');
    
  } catch (error) {
    console.error('❌ Błąd podczas wykonywania głównej funkcji:', error);
  }
}

// Uruchomienie
if (require.main === module) {
  main();
}

module.exports = { mapKlasyczneImages, insertCarMatToDatabase };
