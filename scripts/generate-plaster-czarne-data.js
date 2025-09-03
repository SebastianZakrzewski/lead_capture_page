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
  'yellow': 'żółty',
  'green': 'zielony'
};

// Kolory materiału dostępne dla plaster miodu (klasyczne)
const HONEYCOMB_MATERIAL_COLORS = [
  'czarny', 'niebieski', 'brązowy', 'ciemnoniebieski', 
  'ciemnozielony', 'ciemnoszary', 'kość słoniowa', 
  'jasnobeżowy', 'bordowy', 'czerwony'
];

/**
 * Generuje dane CarMat dla nowych plików z katalogu "plaster czarne"
 */
function generatePlasterCzarneData() {
  const carMatData = [];
  
  // Dla każdego koloru materiału dostępnego w plaster miodu
  HONEYCOMB_MATERIAL_COLORS.forEach(materialColor => {
    // Mapowanie koloru materiału na token plikowy
    const materialColorKey = Object.keys(COLOR_MAPPING).find(
      key => COLOR_MAPPING[key] === materialColor
    ) || materialColor.toLowerCase();
    
    const carMatEntry = {
      matType: '3d-without-rims',
      cellStructure: 'honeycomb',
      materialColor,
      borderColor: 'czarny',
      imagePath: `/konfigurator/dywaniki/klasyczne/plaster miodu/plaster czarne/5os-classic-honey-${materialColorKey}-black.webp`
    };
    
    carMatData.push(carMatEntry);
  });
  
  return carMatData;
}

/**
 * Główna funkcja
 */
function main() {
  try {
    console.log('🔄 Generowanie danych dla katalogu "plaster czarne"...');
    
    const carMatData = generatePlasterCzarneData();
    
    // Zapisz dane do pliku JSON
    const outputPath = path.join(__dirname, 'plaster-czarne-data.json');
    fs.writeFileSync(outputPath, JSON.stringify(carMatData, null, 2), 'utf8');
    
    console.log(`✅ Wygenerowano ${carMatData.length} rekordów CarMat`);
    console.log(`📁 Zapisano do: ${outputPath}`);
    
    // Wyświetl podgląd danych
    console.log('\n📋 Podgląd wygenerowanych danych:');
    carMatData.slice(0, 3).forEach((item, index) => {
      console.log(`${index + 1}. ${item.materialColor} z czarnym obszyciem`);
      console.log(`   Ścieżka: ${item.imagePath}`);
    });
    
    if (carMatData.length > 3) {
      console.log(`   ... i ${carMatData.length - 3} więcej`);
    }
    
  } catch (error) {
    console.error('❌ Błąd podczas generowania danych:', error);
  }
}

// Uruchom skrypt
main();
