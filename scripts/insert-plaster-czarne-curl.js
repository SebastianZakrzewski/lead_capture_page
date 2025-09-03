const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

// Funkcja do dodania danych CarMat do bazy danych przez API używając curl
async function insertPlasterCzarneToDatabase() {
  try {
    // Wczytaj dane z pliku JSON
    const dataPath = path.join(__dirname, 'plaster-czarne-data.json');
    const carMatData = JSON.parse(fs.readFileSync(dataPath, 'utf8'));

    console.log(`🔄 Dodawanie ${carMatData.length} rekordów CarMat (plaster czarne) do bazy danych...`);

    // Zapisz dane do tymczasowego pliku
    const tempFilePath = path.join(__dirname, 'temp-data.json');
    fs.writeFileSync(tempFilePath, JSON.stringify({ carMatData }), 'utf8');
    
    // Użyj curl do wywołania API
    const command = `curl -X POST -H "Content-Type: application/json" -d "@${tempFilePath}" http://localhost:3000/api/carmat/bulk-insert`;
    
    exec(command, (error, stdout, stderr) => {
      // Usuń tymczasowy plik
      try {
        fs.unlinkSync(tempFilePath);
      } catch (unlinkError) {
        console.warn('Nie udało się usunąć tymczasowego pliku:', unlinkError.message);
      }
      
      if (error) {
        console.error('❌ Błąd podczas wywołania API:', error);
        return;
      }
      
      if (stderr) {
        console.error('❌ Błąd stderr:', stderr);
        return;
      }
      
      try {
        const result = JSON.parse(stdout);
        console.log('✅ Sukces!');
        console.log(`📊 Dodano: ${result.inserted} rekordów`);
        console.log(`⏭️ Pominięto: ${result.skipped} rekordów (już istnieją)`);
        console.log(`💬 Wiadomość: ${result.message}`);
      } catch (parseError) {
        console.log('📄 Odpowiedź serwera (raw):', stdout);
      }
    });

  } catch (error) {
    console.error('❌ Błąd podczas dodawania danych:', error);
  }
}

// Uruchom funkcję
insertPlasterCzarneToDatabase();
