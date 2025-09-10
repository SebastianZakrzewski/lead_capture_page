const fs = require('fs');
const path = require('path');

// Simple approach: read the data and use the existing seed API
async function insertCarMatData() {
  try {
    console.log('📖 Reading CarMat data from JSON file...');
    const data = JSON.parse(fs.readFileSync(path.join(__dirname, 'carmat-data.json'), 'utf8'));
    
    console.log(`📊 Found ${data.length} records to insert`);
    
    // Use the existing seed API with clearDatabase option
    const response = await fetch('http://localhost:3000/api/carmat/seed', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        clearDatabase: true,
        carMatData: data
      })
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ API Error:', response.status, errorText);
      return;
    }
    
    const result = await response.json();
    console.log('✅ Insert completed:', result);
    
  } catch (error) {
    console.error('💥 Error:', error.message);
  }
}

// Wait for server to be ready
async function waitForServer() {
  for (let i = 0; i < 30; i++) {
    try {
      const response = await fetch('http://localhost:3000/api/carmat');
      if (response.ok) {
        console.log('✅ Server is ready');
        return true;
      }
    } catch (error) {
      // Server not ready yet
    }
    console.log(`⏳ Waiting for server... (${i + 1}/30)`);
    await new Promise(resolve => setTimeout(resolve, 2000));
  }
  return false;
}

async function main() {
  console.log('🚀 Starting CarMat data insertion...');
  
  const serverReady = await waitForServer();
  if (!serverReady) {
    console.error('❌ Server did not start in time');
    return;
  }
  
  await insertCarMatData();
}

main().catch(console.error);
