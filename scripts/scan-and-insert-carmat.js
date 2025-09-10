const fs = require('fs');
const path = require('path');

// Color mapping from English folder names back to database values
const FOLDER_TO_MATERIAL_COLOR = {
  'beige': 'beige',
  'black': 'black', 
  'blue': 'blue',
  'brown': 'brown',
  'darkblue': 'darkblue',
  'darkgrey': 'darkgrey',
  'green': 'lime', // Note: green folder maps to 'lime' in database
  'lightgrey': 'lightgrey',
  'maroon': 'maroon',
  'orange': 'orange',
  'pink': 'pink',
  'purple': 'purple',
  'red': 'red',
  'yellow': 'yellow'
};

const FOLDER_TO_BORDER_COLOR = {
  'beige': 'bezowy',
  'black': 'czarne',
  'blue': 'niebieski', 
  'brown': 'brazowy',
  'darkblue': 'granatowy',
  'darkgrey': 'ciemnoszary',
  'green': 'zielony',
  'lightgrey': 'jasnoszary',
  'maroon': 'bordowe',
  'orange': 'pomaranczowe',
  'pink': 'rozowe',
  'purple': 'fioletowe',
  'red': 'czerwone',
  'yellow': 'zolte'
};

function scanDirectory(dirPath) {
  const carMatRecords = [];
  
  function processDirectory(currentPath, relativePath = '') {
    const entries = fs.readdirSync(currentPath, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = path.join(currentPath, entry.name);
      const newRelativePath = relativePath ? path.join(relativePath, entry.name) : entry.name;
      
      if (entry.isDirectory()) {
        processDirectory(fullPath, newRelativePath);
      } else if (entry.isFile() && entry.name.endsWith('.webp')) {
        // Parse the image file to extract CarMat data
        const carMatData = parseImageFile(entry.name, newRelativePath);
        if (carMatData) {
          carMatRecords.push(carMatData);
        }
      }
    }
  }
  
  processDirectory(dirPath);
  return carMatRecords;
}

function parseImageFile(fileName, relativePath) {
  // Parse 3D honey files: 5os-3d-honey-[material]-[border].webp
  const honeyMatch = fileName.match(/^5os-3d-honey-([^-]+)-([^-]+)\.webp$/);
  if (honeyMatch) {
    const [, materialColor, borderColor] = honeyMatch;
    return {
      matType: '3d-with-rims',
      cellStructure: 'honeycomb',
      materialColor: materialColor,
      borderColor: FOLDER_TO_BORDER_COLOR[borderColor] || borderColor,
      imagePath: `/konfigurator/dywaniki/${relativePath.replace(/\\/g, '/')}`
    };
  }
  
  // Parse 3D diamonds files: 5os-3d-diamonds-[material]-[border].webp
  const diamondsMatch = fileName.match(/^5os-3d-diamonds-([^-]+)-([^-]+)\.webp$/);
  if (diamondsMatch) {
    const [, materialColor, borderColor] = diamondsMatch;
    return {
      matType: '3d-with-rims',
      cellStructure: 'rhombus',
      materialColor: materialColor,
      borderColor: FOLDER_TO_BORDER_COLOR[borderColor] || borderColor,
      imagePath: `/konfigurator/dywaniki/${relativePath.replace(/\\/g, '/')}`
    };
  }
  
  // Parse classic honey files: 5os-classic-honey-[material]-[border].webp
  const classicHoneyMatch = fileName.match(/^5os-classic-honey-([^-]+)-([^-]+)\.webp$/);
  if (classicHoneyMatch) {
    const [, materialColor, borderColor] = classicHoneyMatch;
    return {
      matType: '3d-without-rims',
      cellStructure: 'honeycomb',
      materialColor: materialColor,
      borderColor: FOLDER_TO_BORDER_COLOR[borderColor] || borderColor,
      imagePath: `/konfigurator/dywaniki/${relativePath.replace(/\\/g, '/')}`
    };
  }
  
  // Parse classic diamonds files: 5os-classic-diamonds-[material]-[border].webp
  const classicDiamondsMatch = fileName.match(/^5os-classic-diamonds-([^-]+)-([^-]+)\.webp$/);
  if (classicDiamondsMatch) {
    const [, materialColor, borderColor] = classicDiamondsMatch;
    return {
      matType: '3d-without-rims',
      cellStructure: 'rhombus',
      materialColor: materialColor,
      borderColor: FOLDER_TO_BORDER_COLOR[borderColor] || borderColor,
      imagePath: `/konfigurator/dywaniki/${relativePath.replace(/\\/g, '/')}`
    };
  }
  
  return null;
}

async function main() {
  try {
    console.log('🔍 Scanning dywaniki directory for image files...');
    
    const dywanikiPath = path.join(__dirname, '..', 'public', 'konfigurator', 'dywaniki');
    
    if (!fs.existsSync(dywanikiPath)) {
      console.error('❌ Directory not found:', dywanikiPath);
      return;
    }
    
    // Scan all image files
    const carMatRecords = scanDirectory(dywanikiPath);
    
    console.log(`📊 Found ${carMatRecords.length} image files`);
    
    if (carMatRecords.length === 0) {
      console.log('⚠️  No image files found to process');
      return;
    }
    
    // Show sample records
    console.log('📋 Sample records:');
    carMatRecords.slice(0, 3).forEach((record, index) => {
      console.log(`  ${index + 1}. ${record.matType} | ${record.cellStructure} | ${record.materialColor} | ${record.borderColor}`);
      console.log(`     Image: ${record.imagePath}`);
    });
    
    // Save the data to a JSON file for manual processing
    const outputFile = path.join(__dirname, 'carmat-data.json');
    fs.writeFileSync(outputFile, JSON.stringify(carMatRecords, null, 2));
    
    console.log(`💾 CarMat data saved to: ${outputFile}`);
    console.log(`📊 Total records prepared: ${carMatRecords.length}`);
    
    // Show breakdown by type
    const breakdown = carMatRecords.reduce((acc, record) => {
      const key = `${record.matType}-${record.cellStructure}`;
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {});
    
    console.log('📈 Breakdown by type:');
    Object.entries(breakdown).forEach(([key, count]) => {
      console.log(`  ${key}: ${count} records`);
    });
    
    console.log('\n🔧 To insert into database, use the bulk insert API:');
    console.log(`POST http://localhost:3000/api/carmat/bulk-insert`);
    console.log(`Body: ${JSON.stringify(carMatRecords.slice(0, 2), null, 2)}...`);
    
  } catch (error) {
    console.error('💥 Error during scan and insert:', error);
  }
}

// Run the script
main().then(() => {
  console.log('🏁 Script completed');
  process.exit(0);
}).catch(error => {
  console.error('💥 Script failed:', error);
  process.exit(1);
});
