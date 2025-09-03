const http = require('http');

// Test if CarMat table exists and is accessible
async function testCarMatTable() {
  try {
    console.log('🔄 Testowanie tabeli CarMat...');
    
    const options = {
      hostname: 'localhost',
      port: 3001,
      path: '/api/carmat',
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
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
      
      req.end();
    });

  } catch (error) {
    console.error('❌ Błąd podczas testowania tabeli CarMat:', error);
    throw error;
  }
}

// Uruchomienie
if (require.main === module) {
  testCarMatTable()
    .then(result => {
      console.log('✅ Test zakończony:', result);
    })
    .catch(error => {
      console.error('❌ Test nieudany:', error);
    });
}

module.exports = { testCarMatTable };
