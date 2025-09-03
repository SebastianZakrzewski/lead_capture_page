const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

// Funkcja do dodania danych CarMat do bazy danych przez API
async function insertCarMatToDatabase() {
  try {
    // Wczytaj dane z pliku JSON
    const dataPath = path.join(__dirname, 'new-carmat-data.json');
    const carMatData = JSON.parse(fs.readFileSync(dataPath, 'utf8'));

    console.log(`🔄 Dodawanie ${carMatData.length} rekordów CarMat do bazy danych...`);

    // Przygotuj dane do wysłania
    const requestBody = JSON.stringify({ carMatData });
    
    // Użyj PowerShell do wywołania API
    const command = `powershell -Command "Invoke-WebRequest -Uri 'http://localhost:3001/api/carmat/bulk-insert' -Method POST -Headers @{'Content-Type'='application/json'} -Body '${requestBody.replace(/'/g, "''")}'"`;
    
    exec(command, (error, stdout, stderr) => {
      if (error) {
        console.error('❌ Błąd podczas wywołania API:', error);
        return;
      }
      
      if (stderr) {
        console.error('❌ Błąd stderr:', stderr);
        return;
      }
      
      try {
        // Parsuj odpowiedź z PowerShell
        const responseMatch = stdout.match(/Content\s*:\s*({.*})/s);
        if (responseMatch) {
          const result = JSON.parse(responseMatch[1]);
          console.log('✅ Sukces!');
          console.log(`📊 Dodano: ${result.inserted} rekordów`);
          console.log(`⏭️ Pominięto: ${result.skipped} rekordów (już istnieją)`);
          console.log(`💬 Wiadomość: ${result.message}`);
        } else {
          console.log('📄 Odpowiedź serwera:', stdout);
        }
      } catch (parseError) {
        console.log('📄 Odpowiedź serwera (raw):', stdout);
      }
    });

  } catch (error) {
    console.error('❌ Błąd podczas dodawania danych:', error);
  }
}

// Uruchomienie
if (require.main === module) {
  insertCarMatToDatabase();
}

module.exports = { insertCarMatToDatabase };
