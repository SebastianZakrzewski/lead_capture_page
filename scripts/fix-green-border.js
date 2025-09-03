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

/**
 * Mapuje pliki z katalogu romby zielone na dane CarMat
 */
function mapGreenRombyFiles() {
  console.log('🔄 Mapowanie plików z katalogu romby zielone...');
  
  const granatoweDir = path.join(__dirname, '..', 'public', 'konfigurator', 'dywaniki', 'klasyczne', 'romby', 'romby zielone');
  
  if (!fs.existsSync(granatoweDir)) {
    console.error(`❌ Katalog nie istnieje: ${granatoweDir}`);
    return [];
  }
  
  const carMatData = [];
  
  try {
    const files = fs.readdirSync(granatoweDir);
    
    files.forEach(fileName => {
      if (fileName.endsWith('.webp')) {
        // Parsowanie nazwy pliku: 5os-classic-diamonds-[material]-green.webp
        const match = fileName.match(/^5os-classic-diamonds-([^-]+)-green\.webp$/);
        if (match) {
          const [, materialColor] = match;
          const fullPath = `/konfigurator/dywaniki/klasyczne/romby/romby zielone/${fileName}`;
          
          const data = {
            matType: '3d-without-rims',
            cellStructure: 'rhombus',
            materialColor: COLOR_MAPPING[materialColor] || materialColor,
            borderColor: 'zielony',
            imagePath: fullPath
          };
          
          carMatData.push(data);
          console.log(`✅ Zmapowano: ${fileName} -> ${data.materialColor} + ${data.borderColor}`);
        } else {
          console.warn(`⚠️ Nie można zmapować pliku: ${fileName}`);
        }
      }
    });
    
    console.log(`📊 Zmapowano łącznie ${carMatData.length} plików`);
    return carMatData;
    
  } catch (error) {
    console.error('❌ Błąd podczas mapowania plików:', error);
    return [];
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
            console.log(`  ✅ Dodano ${result.inserted}, pominięto ${result.skipped}`);
          } else {
            console.log(`  ❌ Błąd: ${result.error}`);
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
  console.log('🚀 Rozpoczynam naprawę obszycia zielonego...\n');
  
  // Krok 1: Mapuj pliki z katalogu romby zielone
  const greenCarMatData = mapGreenRombyFiles();
  
  if (greenCarMatData.length === 0) {
    console.log('❌ Nie znaleziono plików do dodania');
    return;
  }
  
  console.log('\n🔄 Dodawanie danych do bazy...');
  
  // Krok 2: Dodaj do bazy danych
  try {
    const result = await insertBatch(greenCarMatData);
    console.log(`\n✅ Zakończono! Dodano ${result.inserted} rekordów z obszyciem zielonym`);
  } catch (error) {
    console.error('❌ Błąd podczas dodawania do bazy:', error);
  }
}

// Uruchomienie
if (require.main === module) {
  main();
}

module.exports = { mapGreenRombyFiles, insertBatch };
