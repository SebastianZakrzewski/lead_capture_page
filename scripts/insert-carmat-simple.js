const fs = require('fs');
const path = require('path');

// Funkcja do dodania danych CarMat przez zwykłe API (pojedynczo)
async function insertCarMatSimple() {
  try {
    // Wczytaj dane z pliku JSON
    const dataPath = path.join(__dirname, 'new-carmat-data.json');
    const carMatData = JSON.parse(fs.readFileSync(dataPath, 'utf8'));

    console.log(`🔄 Dodawanie ${carMatData.length} rekordów CarMat do bazy danych...`);

    let totalInserted = 0;
    let totalSkipped = 0;

    for (let i = 0; i < carMatData.length; i++) {
      const record = carMatData[i];
      
      if (i % 10 === 0) {
        console.log(`📦 Postęp: ${i}/${carMatData.length} (${Math.round(i/carMatData.length*100)}%)`);
      }

      try {
        // Zapisz rekord do tymczasowego pliku
        const tempFile = path.join(__dirname, `temp-record-${i}.json`);
        fs.writeFileSync(tempFile, JSON.stringify(record));

        // Użyj PowerShell do wywołania API
        const command = `powershell -Command "& { $body = Get-Content '${tempFile}' -Raw; try { $response = Invoke-WebRequest -Uri 'http://localhost:3001/api/carmat' -Method POST -Headers @{'Content-Type'='application/json'} -Body $body; Write-Output 'SUCCESS' } catch { Write-Output 'ERROR' } }"`;
        
        const { exec } = require('child_process');
        
        await new Promise((resolve) => {
          exec(command, (error, stdout, stderr) => {
            // Usuń tymczasowy plik
            try {
              fs.unlinkSync(tempFile);
            } catch (e) {
              // Ignoruj błędy usuwania pliku
            }

            if (stdout.includes('SUCCESS')) {
              totalInserted++;
            } else {
              totalSkipped++;
            }
            resolve();
          });
        });

        // Krótka pauza między rekordami
        await new Promise(resolve => setTimeout(resolve, 50));

      } catch (error) {
        console.error(`❌ Błąd w rekordzie ${i}:`, error.message);
        totalSkipped++;
      }
    }

    console.log(`\n🎉 Zakończono!`);
    console.log(`📊 Łącznie dodano: ${totalInserted} rekordów`);
    console.log(`⏭️ Łącznie pominięto: ${totalSkipped} rekordów`);

  } catch (error) {
    console.error('❌ Błąd podczas dodawania danych:', error);
  }
}

// Uruchomienie
if (require.main === module) {
  insertCarMatSimple();
}

module.exports = { insertCarMatSimple };
