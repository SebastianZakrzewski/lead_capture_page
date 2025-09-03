const fs = require('fs');
const path = require('path');

/**
 * Naprawia nazwy plików w katalogu romby granatowe
 * Zmienia -blue.webp na -darkblue.webp
 */
function fixGranatoweFileNames() {
  console.log('🔄 Naprawianie nazw plików w katalogu romby granatowe...');
  
  const granatoweDir = path.join(__dirname, '..', 'public', 'konfigurator', 'dywaniki', 'klasyczne', 'romby', 'romby granatowe');
  
  if (!fs.existsSync(granatoweDir)) {
    console.error(`❌ Katalog nie istnieje: ${granatoweDir}`);
    return;
  }
  
  try {
    const files = fs.readdirSync(granatoweDir);
    let renamedCount = 0;
    
    files.forEach(fileName => {
      if (fileName.endsWith('-blue.webp')) {
        const newFileName = fileName.replace('-blue.webp', '-darkblue.webp');
        const oldPath = path.join(granatoweDir, fileName);
        const newPath = path.join(granatoweDir, newFileName);
        
        try {
          fs.renameSync(oldPath, newPath);
          console.log(`✅ ${fileName} → ${newFileName}`);
          renamedCount++;
        } catch (error) {
          console.error(`❌ Błąd podczas zmiany nazwy ${fileName}:`, error.message);
        }
      }
    });
    
    console.log(`🎉 Zakończono! Zmieniono nazwy ${renamedCount} plików.`);
    
  } catch (error) {
    console.error('❌ Błąd podczas naprawiania plików:', error);
  }
}

/**
 * Sprawdza czy pliki zostały poprawnie zmienione
 */
function verifyGranatoweFiles() {
  console.log('🔍 Weryfikacja plików granatowych...');
  
  const granatoweDir = path.join(__dirname, '..', 'public', 'konfigurator', 'dywaniki', 'klasyczne', 'romby', 'romby granatowe');
  
  try {
    const files = fs.readdirSync(granatoweDir);
    const blueFiles = files.filter(f => f.endsWith('-blue.webp'));
    const darkblueFiles = files.filter(f => f.endsWith('-darkblue.webp'));
    
    console.log(`📊 Pliki z -blue.webp: ${blueFiles.length}`);
    console.log(`📊 Pliki z -darkblue.webp: ${darkblueFiles.length}`);
    
    if (blueFiles.length > 0) {
      console.log('⚠️ Nadal istnieją pliki z -blue.webp:');
      blueFiles.forEach(file => console.log(`   - ${file}`));
    }
    
    if (darkblueFiles.length > 0) {
      console.log('✅ Poprawnie zmienione pliki:');
      darkblueFiles.forEach(file => console.log(`   - ${file}`));
    }
    
  } catch (error) {
    console.error('❌ Błąd podczas weryfikacji:', error);
  }
}

// Główna funkcja
function main() {
  console.log('🚀 Rozpoczynam naprawę plików granatowych...\n');
  
  // Krok 1: Napraw nazwy plików
  fixGranatoweFileNames();
  
  console.log('\n');
  
  // Krok 2: Zweryfikuj zmiany
  verifyGranatoweFiles();
  
  console.log('\n✅ Naprawa zakończona!');
}

// Uruchomienie
if (require.main === module) {
  main();
}

module.exports = { fixGranatoweFileNames, verifyGranatoweFiles };
