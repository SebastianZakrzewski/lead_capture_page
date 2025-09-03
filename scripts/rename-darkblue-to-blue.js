const fs = require('fs');
const path = require('path');

// Funkcja do zmiany nazw plików z darkblue na blue
function renameDarkblueToBlue() {
  const niebieskieDir = path.join(__dirname, '../public/konfigurator/dywaniki/3d/romby/niebieskie');
  
  try {
    console.log('🔄 Zmienianie nazw plików z "darkblue" na "blue" w katalogu niebieskie...');
    
    const files = fs.readdirSync(niebieskieDir);
    let renamedCount = 0;
    
    files.forEach(file => {
      if (file.includes('darkblue')) {
        const oldPath = path.join(niebieskieDir, file);
        const newFileName = file.replace(/darkblue/g, 'blue');
        const newPath = path.join(niebieskieDir, newFileName);
        
        try {
          fs.renameSync(oldPath, newPath);
          console.log(`✅ ${file} → ${newFileName}`);
          renamedCount++;
        } catch (error) {
          console.error(`❌ Błąd przy zmianie ${file}:`, error.message);
        }
      }
    });
    
    console.log(`\n🎉 Zakończono! Zmieniono ${renamedCount} plików.`);
    
  } catch (error) {
    console.error('❌ Błąd podczas zmiany nazw plików:', error);
  }
}

// Uruchomienie
if (require.main === module) {
  renameDarkblueToBlue();
}

module.exports = { renameDarkblueToBlue };
