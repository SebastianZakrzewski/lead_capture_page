const fs = require('fs');
const path = require('path');

// Funkcja do aktualizacji rekordów w bazie danych z ciemnoniebieski na niebieski
async function updateDarkblueToBlueInDatabase() {
  try {
    console.log('🔄 Aktualizacja rekordów w bazie danych z "ciemnoniebieski" na "niebieski"...');
    
    // Pobierz wszystkie rekordy z borderColor = "ciemnoniebieski"
    const command = `powershell -Command "& { try { $response = Invoke-WebRequest -Uri 'http://localhost:3001/api/carmat?borderColor=ciemnoniebieski&limit=100' -Method GET; $response.Content } catch { Write-Output 'ERROR: ' + $_.Exception.Message } }"`;
    
    const { exec } = require('child_process');
    
    await new Promise((resolve, reject) => {
      exec(command, (error, stdout, stderr) => {
        if (error) {
          console.error('❌ Błąd podczas pobierania rekordów:', error.message);
          reject(error);
          return;
        }
        
        if (stderr) {
          console.error('❌ Błąd stderr:', stderr);
          reject(new Error(stderr));
          return;
        }
        
        try {
          if (stdout.includes('ERROR:')) {
            console.error('❌ Błąd API:', stdout);
            reject(new Error(stdout));
            return;
          }
          
          const responseMatch = stdout.match(/({.*})/s);
          if (responseMatch) {
            const result = JSON.parse(responseMatch[1]);
            const records = result.data || [];
            
            console.log(`📊 Znaleziono ${records.length} rekordów do aktualizacji`);
            
            if (records.length === 0) {
              console.log('✅ Brak rekordów do aktualizacji');
              resolve();
              return;
            }
            
            // Aktualizuj każdy rekord
            updateRecords(records, 0, resolve);
          } else {
            console.log('📄 Surowa odpowiedź:', stdout.substring(0, 200) + '...');
            resolve();
          }
        } catch (parseError) {
          console.log('📄 Błąd parsowania odpowiedzi:', stdout.substring(0, 200) + '...');
          resolve();
        }
      });
    });
    
  } catch (error) {
    console.error('❌ Błąd podczas aktualizacji bazy danych:', error);
  }
}

// Funkcja do aktualizacji rekordów pojedynczo
async function updateRecords(records, index, resolve) {
  if (index >= records.length) {
    console.log('🎉 Zakończono aktualizację wszystkich rekordów!');
    resolve();
    return;
  }
  
  const record = records[index];
  console.log(`\n📦 Aktualizacja rekordu ${index + 1}/${records.length}: ${record.id}`);
  
  // Zaktualizuj ścieżkę obrazu - zmień darkblue na blue
  const updatedImagePath = record.imagePath.replace(/darkblue/g, 'blue');
  
  const updateData = {
    borderColor: 'niebieski',
    imagePath: updatedImagePath
  };
  
  try {
    // Zapisz dane do tymczasowego pliku
    const tempFile = path.join(__dirname, `temp-update-${index}.json`);
    fs.writeFileSync(tempFile, JSON.stringify(updateData));
    
    // Wywołaj API do aktualizacji
    const command = `powershell -Command "& { $body = Get-Content '${tempFile}' -Raw; try { $response = Invoke-WebRequest -Uri 'http://localhost:3001/api/carmat/${record.id}' -Method PUT -Headers @{'Content-Type'='application/json'} -Body $body; Write-Output 'SUCCESS' } catch { Write-Output 'ERROR: ' + $_.Exception.Message } }"`;
    
    const { exec } = require('child_process');
    
    await new Promise((updateResolve) => {
      exec(command, (error, stdout, stderr) => {
        // Usuń tymczasowy plik
        try {
          fs.unlinkSync(tempFile);
        } catch (e) {
          // Ignoruj błędy usuwania pliku
        }
        
        if (stdout.includes('SUCCESS')) {
          console.log(`✅ Rekord ${index + 1} zaktualizowany pomyślnie`);
        } else {
          console.error(`❌ Błąd przy aktualizacji rekordu ${index + 1}:`, stdout);
        }
        
        updateResolve();
      });
    });
    
    // Krótka pauza między rekordami
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // Przejdź do następnego rekordu
    updateRecords(records, index + 1, resolve);
    
  } catch (error) {
    console.error(`❌ Błąd przy aktualizacji rekordu ${index + 1}:`, error.message);
    // Kontynuuj z następnym rekordem
    updateRecords(records, index + 1, resolve);
  }
}

// Uruchomienie
if (require.main === module) {
  updateDarkblueToBlueInDatabase();
}

module.exports = { updateDarkblueToBlueInDatabase };
