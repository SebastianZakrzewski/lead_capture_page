const fs = require('fs');
const path = require('path');

// Funkcja do dodania danych CarMat do bazy danych w małych partiach
async function insertCarMatSmallBatches() {
  try {
    // Wczytaj dane z pliku JSON
    const dataPath = path.join(__dirname, 'new-carmat-data.json');
    const carMatData = JSON.parse(fs.readFileSync(dataPath, 'utf8'));

    console.log(`🔄 Dodawanie ${carMatData.length} rekordów CarMat do bazy danych w małych partiach...`);

    const batchSize = 5; // Dodawaj po 5 rekordów na raz
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
        const command = `powershell -Command "& { $body = Get-Content '${tempFile}' -Raw; try { $response = Invoke-WebRequest -Uri 'http://localhost:3001/api/carmat/bulk-insert' -Method POST -Headers @{'Content-Type'='application/json'} -Body $body; $response.Content } catch { Write-Output 'ERROR: ' + $_.Exception.Message } }"`;
        
        const { exec } = require('child_process');
        
        await new Promise((resolve) => {
          exec(command, (error, stdout, stderr) => {
            // Usuń tymczasowy plik
            try {
              fs.unlinkSync(tempFile);
            } catch (e) {
              // Ignoruj błędy usuwania pliku
            }

            if (error) {
              console.error(`❌ Błąd w partii ${Math.floor(i / batchSize) + 1}:`, error.message);
              totalSkipped += batch.length;
              resolve();
              return;
            }
            
            if (stderr) {
              console.error(`❌ Błąd stderr w partii ${Math.floor(i / batchSize) + 1}:`, stderr);
              totalSkipped += batch.length;
              resolve();
              return;
            }
            
            try {
              // Parsuj odpowiedź z PowerShell
              if (stdout.includes('ERROR:')) {
                console.error(`❌ Błąd w partii ${Math.floor(i / batchSize) + 1}:`, stdout);
                totalSkipped += batch.length;
              } else {
                const responseMatch = stdout.match(/({.*})/s);
                if (responseMatch) {
                  const result = JSON.parse(responseMatch[1]);
                  console.log(`✅ Partia ${Math.floor(i / batchSize) + 1}: Dodano ${result.inserted}, Pominięto ${result.skipped}`);
                  totalInserted += result.inserted || 0;
                  totalSkipped += result.skipped || 0;
                } else {
                  console.log(`📄 Partia ${Math.floor(i / batchSize) + 1} - odpowiedź:`, stdout.substring(0, 200) + '...');
                  totalSkipped += batch.length;
                }
              }
              resolve();
            } catch (parseError) {
              console.log(`📄 Partia ${Math.floor(i / batchSize) + 1} - surowa odpowiedź:`, stdout.substring(0, 200) + '...');
              totalSkipped += batch.length;
              resolve();
            }
          });
        });

        // Krótka pauza między partiami
        await new Promise(resolve => setTimeout(resolve, 200));

      } catch (error) {
        console.error(`❌ Błąd w partii ${Math.floor(i / batchSize) + 1}:`, error.message);
        totalSkipped += batch.length;
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
  insertCarMatSmallBatches();
}

module.exports = { insertCarMatSmallBatches };
