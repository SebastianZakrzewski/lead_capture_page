const http = require('http');

/**
 * Aktualizuje rekordy w bazie danych z borderColor 'green' na 'zielony'
 */
async function updateGreenToZielony() {
  try {
    console.log('🔄 Aktualizowanie rekordów z borderColor "green" na "zielony"...');
    
    // Najpierw pobierz wszystkie rekordy z borderColor = 'green'
    console.log('📋 Pobieranie rekordów z borderColor = "green"...');
    
    const getOptions = {
      hostname: 'localhost',
      port: 3001,
      path: '/api/carmat?limit=1000',
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    };
    
    const allCarMats = await new Promise((resolve, reject) => {
      const req = http.request(getOptions, (res) => {
        let data = '';
        
        res.on('data', (chunk) => {
          data += chunk;
        });
        
        res.on('end', () => {
          try {
            const result = JSON.parse(data);
            resolve(result.data.carMats);
          } catch (parseError) {
            reject(parseError);
          }
        });
      });
      
      req.on('error', (error) => {
        reject(error);
      });
      
      req.end();
    });
    
    // Filtruj rekordy z borderColor = 'green'
    const greenRecords = allCarMats.filter(record => record.borderColor === 'green');
    console.log(`📊 Znaleziono ${greenRecords.length} rekordów z borderColor = "green"`);
    
    if (greenRecords.length === 0) {
      console.log('✅ Brak rekordów do aktualizacji');
      return;
    }
    
    // Wyświetl przykłady
    console.log('📋 Przykłady rekordów do aktualizacji:');
    greenRecords.slice(0, 3).forEach(record => {
      console.log(`   - ${record.matType} | ${record.cellStructure} | ${record.materialColor} | ${record.borderColor} | ${record.imagePath}`);
    });
    
    // Zaktualizuj każdy rekord
    let updatedCount = 0;
    
    for (const record of greenRecords) {
      try {
        const updateData = {
          ...record,
          borderColor: 'zielony'
        };
        
        const result = await updateRecord(record.id, updateData);
        if (result.success) {
          updatedCount++;
          if (updatedCount % 5 === 0) {
            console.log(`📊 Zaktualizowano ${updatedCount}/${greenRecords.length} rekordów...`);
          }
        }
      } catch (error) {
        console.error(`❌ Błąd podczas aktualizacji rekordu ${record.id}:`, error.message);
      }
    }
    
    console.log(`✅ Zakończono! Zaktualizowano ${updatedCount} rekordów z "green" na "zielony"`);
    
  } catch (error) {
    console.error('❌ Błąd podczas aktualizacji rekordów:', error);
  }
}

/**
 * Aktualizuje pojedynczy rekord
 */
async function updateRecord(id, data) {
  const postData = JSON.stringify(data);
  
  const options = {
    hostname: 'localhost',
    port: 3001,
    path: `/api/carmat/${id}`,
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(postData)
    }
  };
  
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const result = JSON.parse(data);
          resolve(result);
        } catch (parseError) {
          resolve({ success: false, error: 'Parse error' });
        }
      });
    });
    
    req.on('error', (error) => {
      reject(error);
    });
    
    req.write(postData);
    req.end();
  });
}

// Uruchomienie
if (require.main === module) {
  updateGreenToZielony();
}

module.exports = { updateGreenToZielony };
