const http = require('http');

// Test with a small batch of data
async function testSmallBatch() {
  try {
    console.log('🔄 Testowanie małej partii danych...');
    
    // Test data - just 3 records
    const testData = [
      {
        matType: '3d-without-rims',
        cellStructure: 'honeycomb',
        materialColor: 'czarny',
        borderColor: 'beżowy',
        imagePath: '/konfigurator/dywaniki/klasyczne/plaster miodu/plaster bezowe obszycie/5os-classic-honey-black-beige.webp'
      },
      {
        matType: '3d-without-rims',
        cellStructure: 'rhombus',
        materialColor: 'niebieski',
        borderColor: 'czerwony',
        imagePath: '/konfigurator/dywaniki/klasyczne/romby/romby czerwone/5os-classic-diamonds-blue-red.webp'
      }
    ];
    
    const postData = JSON.stringify({ carMatData: testData });
    
    const options = {
      hostname: 'localhost',
      port: 3001,
      path: '/api/carmat/bulk-insert',
      method: 'POST',
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
          console.log('📄 Response status:', res.statusCode);
          console.log('📄 Response data:', data);
          
          try {
            const result = JSON.parse(data);
            resolve(result);
          } catch (parseError) {
            console.log('❌ Błąd parsowania JSON:', parseError.message);
            resolve({ success: false, error: 'Parse error', rawData: data });
          }
        });
      });
      
      req.on('error', (error) => {
        console.error('❌ Błąd podczas testowania:', error);
        reject(error);
      });
      
      req.write(postData);
      req.end();
    });

  } catch (error) {
    console.error('❌ Błąd podczas testowania małej partii:', error);
    throw error;
  }
}

// Uruchomienie
if (require.main === module) {
  testSmallBatch()
    .then(result => {
      console.log('✅ Test zakończony:', result);
    })
    .catch(error => {
      console.error('❌ Test nieudany:', error);
    });
}

module.exports = { testSmallBatch };
