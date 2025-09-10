const fs = require('fs');
const path = require('path');
require('dotenv').config();

// Import Supabase client
const { createClient } = require('@supabase/supabase-js');

// Konfiguracja Supabase
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://your-project.supabase.co';
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'your-anon-key';

// Inicjalizacja klienta Supabase
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Mapowanie kolorów z polskiego na angielski
const colorMapping = {
  'bezowy': 'beige',
  'bordowe': 'maroon', 
  'brazowy': 'brown',
  'ciemnoszary': 'darkgrey',
  'czarne': 'black',
  'czerwone': 'red',
  'fioletowe': 'purple',
  'granatowy': 'darkblue',
  'jasnoszary': 'lightgrey',
  'niebieski': 'blue',
  'pomaranczowe': 'orange',
  'rozowe': 'pink',
  'zielony': 'green',
  'zolte': 'yellow'
};

// Kolory materiału dostępne w systemie
const materialColors = [
  'black', 'blue', 'brown', 'darkblue', 'darkgreen', 
  'darkgrey', 'ivory', 'lightbeige', 'maroon', 'red'
];

// Kolory obszycia dostępne w systemie
const borderColors = [
  'bezowy', 'bordowe', 'brazowy', 'ciemnoszary', 'czarne', 
  'czerwone', 'fioletowe', 'granatowy', 'jasnoszary', 'niebieski', 
  'pomaranczowe', 'rozowe', 'zielony', 'zolte'
];

// Funkcja do generowania wszystkich kombinacji CarMat
function generateAllCarMatCombinations() {
  const combinations = [];
  
  console.log('🔄 Generowanie wszystkich kombinacji CarMat...');
  
  // 1. 3D Plaster miodu
  console.log('📦 Generowanie 3D Plaster miodu...');
  borderColors.forEach(borderColor => {
    materialColors.forEach(materialColor => {
      const imagePath = `/konfigurator/dywaniki/3d/plaster/${borderColor}/5os-3d-honey-${materialColor}-${colorMapping[borderColor]}.webp`;
      combinations.push({
        matType: '3d-with-rims',
        cellStructure: 'honeycomb',
        materialColor: materialColor,
        borderColor: borderColor,
        imagePath: imagePath
      });
    });
  });
  
  // Dodaj dodatkową kombinację dla granatowy (ma 11 plików)
  const extraImagePath = `/konfigurator/dywaniki/3d/plaster/granatowy/5os-3d-honey-${materialColors[0]}-${colorMapping['granatowy']}.webp`;
  combinations.push({
    matType: '3d-with-rims',
    cellStructure: 'honeycomb', 
    materialColor: materialColors[0],
    borderColor: 'granatowy',
    imagePath: extraImagePath
  });
  
  // 2. 3D Romby
  console.log('📦 Generowanie 3D Romby...');
  borderColors.forEach(borderColor => {
    // Dla rombów generujemy 17 kombinacji na kolor
    for (let i = 0; i < 17; i++) {
      const materialColor = materialColors[i % materialColors.length];
      const imagePath = `/konfigurator/dywaniki/3d/romby/${borderColor}/5os-3d-diamonds-${materialColor}-${colorMapping[borderColor]}.webp`;
      combinations.push({
        matType: '3d-with-rims',
        cellStructure: 'rhombus',
        materialColor: materialColor,
        borderColor: borderColor,
        imagePath: imagePath
      });
    }
  });
  
  // 3. Klasyczne Plaster miodu
  console.log('📦 Generowanie Klasyczne Plaster miodu...');
  borderColors.forEach(borderColor => {
    materialColors.forEach(materialColor => {
      const imagePath = `/konfigurator/dywaniki/klasyczne/plaster miodu/plaster ${borderColor} obszycie/5os-classic-honey-${materialColor}-${colorMapping[borderColor]}.webp`;
      combinations.push({
        matType: '3d-without-rims',
        cellStructure: 'honeycomb',
        materialColor: materialColor,
        borderColor: borderColor,
        imagePath: imagePath
      });
    });
  });
  
  // 4. Klasyczne Romby
  console.log('📦 Generowanie Klasyczne Romby...');
  borderColors.forEach(borderColor => {
    // Dla rombów klasycznych generujemy 17 kombinacji na kolor (oprócz ciemnoszare - 15)
    const count = borderColor === 'ciemnoszary' ? 15 : 17;
    for (let i = 0; i < count; i++) {
      const materialColor = materialColors[i % materialColors.length];
      const imagePath = `/konfigurator/dywaniki/klasyczne/romby/romby ${borderColor}/5os-classic-diamonds-${materialColor}-${colorMapping[borderColor]}.webp`;
      combinations.push({
        matType: '3d-without-rims',
        cellStructure: 'rhombus',
        materialColor: materialColor,
        borderColor: borderColor,
        imagePath: imagePath
      });
    }
  });
  
  console.log(`✅ Wygenerowano ${combinations.length} kombinacji`);
  return combinations;
}

// Funkcja do dodania danych do bazy w partiach
async function insertCarMatInBatches(carMatData) {
  console.log(`🔄 Dodawanie ${carMatData.length} rekordów CarMat do bazy danych w partiach...`);
  
  const batchSize = 100; // Dodawaj po 100 rekordów na raz
  let totalInserted = 0;
  let totalSkipped = 0;
  
  for (let i = 0; i < carMatData.length; i += batchSize) {
    const batch = carMatData.slice(i, i + batchSize);
    console.log(`\n📦 Partia ${Math.floor(i / batchSize) + 1}/${Math.ceil(carMatData.length / batchSize)}: ${batch.length} rekordów`);
    
    try {
      // Sprawdź czy rekordy już istnieją
      const existingRecords = await supabase
        .from('CarMat')
        .select('imagePath')
        .in('imagePath', batch.map(item => item.imagePath));
      
      if (existingRecords.error) {
        console.error(`❌ Błąd podczas sprawdzania istniejących rekordów w partii ${Math.floor(i / batchSize) + 1}:`, existingRecords.error);
        continue;
      }
      
      const existingPaths = new Set(existingRecords.data?.map(record => record.imagePath) || []);
      const newRecords = batch.filter(record => !existingPaths.has(record.imagePath));
      
      if (newRecords.length === 0) {
        console.log(`⏭️ Partia ${Math.floor(i / batchSize) + 1}: Wszystkie rekordy już istnieją`);
        totalSkipped += batch.length;
        continue;
      }
      
      console.log(`📊 Partia ${Math.floor(i / batchSize) + 1}: ${newRecords.length} nowych rekordów do dodania`);
      
      // Dodaj nowe rekordy
      const { data, error } = await supabase
        .from('CarMat')
        .insert(newRecords)
        .select();
      
      if (error) {
        console.error(`❌ Błąd podczas dodawania rekordów w partii ${Math.floor(i / batchSize) + 1}:`, error);
        continue;
      }
      
      const inserted = data?.length || 0;
      const skipped = batch.length - inserted;
      
      console.log(`✅ Partia ${Math.floor(i / batchSize) + 1}: Dodano ${inserted}, Pominięto ${skipped}`);
      totalInserted += inserted;
      totalSkipped += skipped;
      
      // Krótka pauza między partiami
      await new Promise(resolve => setTimeout(resolve, 100));
      
    } catch (error) {
      console.error(`❌ Błąd w partii ${Math.floor(i / batchSize) + 1}:`, error.message);
      // Kontynuuj z następną partią
    }
  }
  
  console.log(`\n🎉 Zakończono!`);
  console.log(`📊 Łącznie dodano: ${totalInserted} rekordów`);
  console.log(`⏭️ Łącznie pominięto: ${totalSkipped} rekordów`);
  
  return { totalInserted, totalSkipped };
}

// Główna funkcja
async function seedAllCarMatCombinations() {
  try {
    console.log('🚀 Rozpoczynam seedowanie wszystkich kombinacji CarMat...\n');
    
    // 1. Generuj wszystkie kombinacje
    const combinations = generateAllCarMatCombinations();
    
    // 2. Zapisz do pliku JSON
    const jsonFile = path.join(__dirname, 'all-carmat-combinations.json');
    fs.writeFileSync(jsonFile, JSON.stringify(combinations, null, 2));
    console.log(`💾 Zapisano dane do pliku: ${jsonFile}`);
    
    // 3. Wyświetl statystyki
    console.log('\n📊 Statystyki kombinacji:');
    const stats = combinations.reduce((acc, item) => {
      const key = `${item.matType}-${item.cellStructure}`;
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {});
    
    Object.entries(stats).forEach(([key, count]) => {
      console.log(`  ${key}: ${count} kombinacji`);
    });
    
    console.log(`\n📈 Łączna liczba kombinacji: ${combinations.length}`);
    
    // 4. Dodaj do bazy danych
    const result = await insertCarMatInBatches(combinations);
    
    console.log('\n✅ Seedowanie zakończone pomyślnie!');
    console.log(`📁 Plik z danymi: ${jsonFile}`);
    
  } catch (error) {
    console.error('❌ Błąd podczas seedowania:', error);
  }
}

// Uruchomienie
if (require.main === module) {
  seedAllCarMatCombinations();
}

module.exports = { 
  generateAllCarMatCombinations, 
  seedAllCarMatCombinations,
  insertCarMatInBatches 
};
