const fs = require('fs');
const path = require('path');

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
  'yellow': 'żółty'
};

// Mapowanie kolorów obszycia z polskich nazw na standardowe
const BORDER_COLOR_MAPPING = {
  'bezowy': 'beżowy',
  'bordowe': 'bordowy',
  'brazowy': 'brązowy',
  'ciemnoszare': 'ciemnoszary',
  'czerwone': 'czerwony',
  'fioletowy': 'fioletowy',
  'granatowe': 'ciemnoniebieski',
  'jasnoszary': 'jasnoszary',
  'niebieskie': 'niebieski',
  'pomaranczowe': 'pomarańczowy',
  'rozowy': 'różowy',
  'zielone': 'zielony',
  'zolte': 'żółty',
  'czarne': 'czarny'
};

// Funkcja do generowania ścieżki obrazu
function generateImagePath(materialColor, borderColor, borderFolder) {
  const materialColorKey = Object.keys(COLOR_MAPPING).find(
    key => COLOR_MAPPING[key] === materialColor
  ) || materialColor.toLowerCase();
  
  const borderColorKey = Object.keys(COLOR_MAPPING).find(
    key => COLOR_MAPPING[key] === borderColor
  ) || borderColor.toLowerCase();

  return `/konfigurator/dywaniki/3d/romby/${borderFolder}/5os-3d-diamonds-${materialColorKey}-${borderColorKey}.webp`;
}

// Funkcja do skanowania katalogów i generowania danych CarMat
function scanCarMatDirectories() {
  const basePath = path.join(__dirname, '../public/konfigurator/dywaniki/3d/romby');
  const carMatData = [];

  try {
    const borderColorFolders = fs.readdirSync(basePath);
    
    borderColorFolders.forEach(borderFolder => {
      const borderFolderPath = path.join(basePath, borderFolder);
      
      if (fs.statSync(borderFolderPath).isDirectory()) {
        const borderColor = BORDER_COLOR_MAPPING[borderFolder] || borderFolder;
        
        const files = fs.readdirSync(borderFolderPath);
        
        files.forEach(file => {
          if (file.endsWith('.webp')) {
            // Parsowanie nazwy pliku: 5os-3d-diamonds-[material]-[border].webp
            const match = file.match(/^5os-3d-diamonds-([^-]+)-([^-]+)\.webp$/);
            
            if (match) {
              const [, materialColorKey, borderColorKey] = match;
              const materialColor = COLOR_MAPPING[materialColorKey] || materialColorKey;
              const borderColorFromFile = COLOR_MAPPING[borderColorKey] || borderColorKey;
              
              const carMatRecord = {
                matType: '3d-with-rims',
                cellStructure: 'rhombus',
                materialColor: materialColor,
                borderColor: borderColorFromFile,
                imagePath: generateImagePath(materialColor, borderColorFromFile, borderFolder)
              };
              
              carMatData.push(carMatRecord);
            }
          }
        });
      }
    });
    
    return carMatData;
  } catch (error) {
    console.error('Błąd podczas skanowania katalogów:', error);
    return [];
  }
}

// Funkcja do generowania SQL INSERT
function generateSQLInserts(carMatData) {
  const inserts = carMatData.map(record => {
    return `INSERT INTO "CarMat" ("matType", "cellStructure", "materialColor", "borderColor", "imagePath") VALUES ('${record.matType}', '${record.cellStructure}', '${record.materialColor}', '${record.borderColor}', '${record.imagePath}');`;
  });
  
  return inserts.join('\n');
}

// Funkcja do generowania JSON dla API
function generateJSONData(carMatData) {
  return JSON.stringify(carMatData, null, 2);
}

// Główna funkcja
function main() {
  console.log('🔍 Skanowanie katalogów z obrazami dywaników...');
  
  const carMatData = scanCarMatDirectories();
  
  console.log(`✅ Znaleziono ${carMatData.length} kombinacji dywaników`);
  
  // Generowanie SQL
  const sqlInserts = generateSQLInserts(carMatData);
  fs.writeFileSync(path.join(__dirname, 'new-carmat-inserts.sql'), sqlInserts);
  console.log('📄 Wygenerowano plik: new-carmat-inserts.sql');
  
  // Generowanie JSON
  const jsonData = generateJSONData(carMatData);
  fs.writeFileSync(path.join(__dirname, 'new-carmat-data.json'), jsonData);
  console.log('📄 Wygenerowano plik: new-carmat-data.json');
  
  // Statystyki
  const stats = {
    total: carMatData.length,
    byMaterialColor: {},
    byBorderColor: {}
  };
  
  carMatData.forEach(record => {
    stats.byMaterialColor[record.materialColor] = (stats.byMaterialColor[record.materialColor] || 0) + 1;
    stats.byBorderColor[record.borderColor] = (stats.byBorderColor[record.borderColor] || 0) + 1;
  });
  
  console.log('\n📊 Statystyki:');
  console.log(`- Łączna liczba kombinacji: ${stats.total}`);
  console.log(`- Kolory materiału: ${Object.keys(stats.byMaterialColor).length}`);
  console.log(`- Kolory obszycia: ${Object.keys(stats.byBorderColor).length}`);
  
  console.log('\n🎨 Kolory materiału:');
  Object.entries(stats.byMaterialColor).forEach(([color, count]) => {
    console.log(`  - ${color}: ${count} kombinacji`);
  });
  
  console.log('\n🎨 Kolory obszycia:');
  Object.entries(stats.byBorderColor).forEach(([color, count]) => {
    console.log(`  - ${color}: ${count} kombinacji`);
  });
}

// Uruchomienie
if (require.main === module) {
  main();
}

module.exports = { scanCarMatDirectories, generateSQLInserts, generateJSONData };
