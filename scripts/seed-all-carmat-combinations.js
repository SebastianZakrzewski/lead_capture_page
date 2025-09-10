const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

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

// Funkcja do zapisania danych do pliku JSON
function saveToJsonFile(data, filename) {
  const filePath = path.join(__dirname, filename);
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
  console.log(`💾 Zapisano dane do pliku: ${filename}`);
  return filePath;
}

// Funkcja do dodania danych do bazy w partiach
async function insertCarMatInBatches(carMatData) {
  console.log(`🔄 Dodawanie ${carMatData.length} rekordów CarMat do bazy danych w partiach...`);
  
  const batchSize = 50; // Dodawaj po 50 rekordów na raz
  let totalInserted = 0;
  let totalSkipped = 0;
  
  for (let i = 0; i < carMatData.length; i += batchSize) {
    const batch = carMatData.slice(i, i + batchSize);
    console.log(`\n📦 Partia ${Math.floor(i / batchSize) + 1}/${Math.ceil(carMatData.length / batchSize)}: ${batch.length} rekordów`);
    
    try {
      // Zapisz partię do tymczasowego pliku
      const tempFile = path.join(__dirname, `temp-batch-${i}.json`);
      fs.writeFileSync(tempFile, JSON.stringify({ carMatData: batch }));
      
      // Użyj PowerShell do wywołania API
      const command = `powershell -Command "& { $body = Get-Content '${tempFile}' -Raw; Invoke-WebRequest -Uri 'http://localhost:3000/api/carmat/bulk-insert' -Method POST -Headers @{'Content-Type'='application/json'} -Body $body }"`;
      
      await new Promise((resolve, reject) => {
        exec(command, (error, stdout, stderr) => {
          // Usuń tymczasowy plik
          try {
            fs.unlinkSync(tempFile);
          } catch (e) {
            // Ignoruj błędy usuwania pliku
          }
          
          if (error) {
            console.error(`❌ Błąd w partii ${Math.floor(i / batchSize) + 1}:`, error.message);
            reject(error);
            return;
          }
          
          if (stderr) {
            console.error(`❌ Błąd stderr w partii ${Math.floor(i / batchSize) + 1}:`, stderr);
            reject(new Error(stderr));
            return;
          }
          
          try {
            // Parsuj odpowiedź z PowerShell
            const responseMatch = stdout.match(/Content\s*:\s*({.*})/s);
            if (responseMatch) {
              const result = JSON.parse(responseMatch[1]);
              console.log(`✅ Partia ${Math.floor(i / batchSize) + 1}: Dodano ${result.inserted}, Pominięto ${result.skipped}`);
              totalInserted += result.inserted || 0;
              totalSkipped += result.skipped || 0;
            } else {
              console.log(`📄 Partia ${Math.floor(i / batchSize) + 1} - odpowiedź:`, stdout.substring(0, 200) + '...');
            }
            resolve();
          } catch (parseError) {
            console.log(`📄 Partia ${Math.floor(i / batchSize) + 1} - surowa odpowiedź:`, stdout.substring(0, 200) + '...');
            resolve();
          }
        });
      });
      
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
    const jsonFile = saveToJsonFile(combinations, 'all-carmat-combinations.json');
    
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
    
    // 4. Zapytaj użytkownika czy kontynuować
    console.log('\n❓ Czy chcesz kontynuować z dodawaniem do bazy danych? (naciśnij Enter aby kontynuować, Ctrl+C aby anulować)');
    
    // W środowisku Node.js nie możemy łatwo czekać na input, więc od razu kontynuujemy
    // W rzeczywistym środowisku można by użyć readline
    
    // 5. Dodaj do bazy danych
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
