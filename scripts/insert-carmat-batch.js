const fs = require('fs');
const path = require('path');

// Funkcja do dodania danych CarMat do bazy danych w partiach
async function insertCarMatInBatches() {
  try {
    // Wczytaj dane z pliku JSON
    const dataPath = path.join(__dirname, 'new-carmat-data.json');
    const carMatData = JSON.parse(fs.readFileSync(dataPath, 'utf8'));

    console.log(`🔄 Dodawanie ${carMatData.length} rekordów CarMat do bazy danych w partiach...`);

    const batchSize = 50; // Dodawaj po 50 rekordów na raz
    let totalInserted = 0;
    let totalSkipped = 0;

    for (let i = 0; i < carMatData.length; i += batchSize) {
      const batch = carMatData.slice(i, i + batchSize);
      console.log(`\n📦 Partia ${Math.floor(i / batchSize) + 1}: ${batch.length} rekordów`);

      try {
        // Zapisz partię do tymczasowego pliku
        const tempFile = path.join(__dirname, `temp-batch-${i}.json`);
        fs.writeFileSync(tempFile, JSON.stringify({ carMatData: batch }));

        // Użyj PowerShell do wywołania API
        const command = `powershell -Command "& { $body = Get-Content '${tempFile}' -Raw; Invoke-WebRequest -Uri 'http://localhost:3001/api/carmat/bulk-insert' -Method POST -Headers @{'Content-Type'='application/json'} -Body $body }"`;
        
        const { exec } = require('child_process');
        
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

  } catch (error) {
    console.error('❌ Błąd podczas dodawania danych:', error);
  }
}

// Uruchomienie
if (require.main === module) {
  insertCarMatInBatches();
}

module.exports = { insertCarMatInBatches };
