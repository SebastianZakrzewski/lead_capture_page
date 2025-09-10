const { createClient } = require('@supabase/supabase-js');

// Konfiguracja Supabase
const supabaseUrl = 'https://diqbnsinhsedmvvstvvc.supabase.co';
const supabaseKey = 'sb_publishable_4usCsIa5nSJUgIsT6qCB_A_BaYOCdkE';

const supabase = createClient(supabaseUrl, supabaseKey);

async function analyzeCarMatTable() {
  try {
    console.log('🔍 Analizuję tabelę CarMat...\n');

    // 1. Pobierz wszystkie rekordy
    const { data: allRecords, error: fetchError } = await supabase
      .from('CarMat')
      .select('*')
      .order('createdAt', { ascending: false });

    if (fetchError) {
      console.error('❌ Błąd pobierania danych:', fetchError);
      return;
    }

    console.log(`📊 Łączna liczba rekordów: ${allRecords.length}\n`);

    // 2. Analiza imagePath
    const imagePathAnalysis = {
      total: allRecords.length,
      withImagePath: 0,
      withoutImagePath: 0,
      emptyImagePath: 0,
      nullImagePath: 0,
      invalidImagePath: 0
    };

    const missingImagePaths = [];
    const invalidImagePaths = [];

    allRecords.forEach((record, index) => {
      if (!record.imagePath) {
        imagePathAnalysis.nullImagePath++;
        missingImagePaths.push({
          id: record.id,
          matType: record.matType,
          cellStructure: record.cellStructure,
          materialColor: record.materialColor,
          borderColor: record.borderColor,
          imagePath: record.imagePath
        });
      } else if (record.imagePath.trim() === '') {
        imagePathAnalysis.emptyImagePath++;
        missingImagePaths.push({
          id: record.id,
          matType: record.matType,
          cellStructure: record.cellStructure,
          materialColor: record.materialColor,
          borderColor: record.borderColor,
          imagePath: record.imagePath
        });
      } else if (!record.imagePath.startsWith('/konfigurator/')) {
        imagePathAnalysis.invalidImagePath++;
        invalidImagePaths.push({
          id: record.id,
          matType: record.matType,
          cellStructure: record.cellStructure,
          materialColor: record.materialColor,
          borderColor: record.borderColor,
          imagePath: record.imagePath
        });
      } else {
        imagePathAnalysis.withImagePath++;
      }
    });

    console.log('📈 Analiza imagePath:');
    console.log(`   ✅ Z poprawnym imagePath: ${imagePathAnalysis.withImagePath}`);
    console.log(`   ❌ Bez imagePath (null): ${imagePathAnalysis.nullImagePath}`);
    console.log(`   ❌ Z pustym imagePath: ${imagePathAnalysis.emptyImagePath}`);
    console.log(`   ⚠️  Z nieprawidłowym imagePath: ${imagePathAnalysis.invalidImagePath}\n`);

    // 3. Analiza według typów
    const byMatType = {};
    const byCellStructure = {};
    const byMaterialColor = {};
    const byBorderColor = {};

    allRecords.forEach(record => {
      byMatType[record.matType] = (byMatType[record.matType] || 0) + 1;
      byCellStructure[record.cellStructure] = (byCellStructure[record.cellStructure] || 0) + 1;
      byMaterialColor[record.materialColor] = (byMaterialColor[record.materialColor] || 0) + 1;
      byBorderColor[record.borderColor] = (byBorderColor[record.borderColor] || 0) + 1;
    });

    console.log('📊 Rozkład według typów:');
    console.log('   MatType:', byMatType);
    console.log('   CellStructure:', byCellStructure);
    console.log('   MaterialColor:', byMaterialColor);
    console.log('   BorderColor:', byBorderColor);
    console.log('');

    // 4. Przykłady problematycznych rekordów
    if (missingImagePaths.length > 0) {
      console.log('❌ Rekordy z brakującym imagePath (pierwsze 10):');
      missingImagePaths.slice(0, 10).forEach((record, index) => {
        console.log(`   ${index + 1}. ID: ${record.id}`);
        console.log(`      MatType: ${record.matType}, CellStructure: ${record.cellStructure}`);
        console.log(`      MaterialColor: ${record.materialColor}, BorderColor: ${record.borderColor}`);
        console.log(`      ImagePath: "${record.imagePath}"`);
        console.log('');
      });
    }

    if (invalidImagePaths.length > 0) {
      console.log('⚠️  Rekordy z nieprawidłowym imagePath (pierwsze 5):');
      invalidImagePaths.slice(0, 5).forEach((record, index) => {
        console.log(`   ${index + 1}. ID: ${record.id}`);
        console.log(`      ImagePath: "${record.imagePath}"`);
        console.log('');
      });
    }

    // 5. Podsumowanie
    console.log('📋 PODSUMOWANIE:');
    console.log(`   - Łączna liczba rekordów: ${imagePathAnalysis.total}`);
    console.log(`   - Poprawne imagePath: ${imagePathAnalysis.withImagePath} (${Math.round(imagePathAnalysis.withImagePath / imagePathAnalysis.total * 100)}%)`);
    console.log(`   - Problematyczne imagePath: ${imagePathAnalysis.nullImagePath + imagePathAnalysis.emptyImagePath + imagePathAnalysis.invalidImagePath} (${Math.round((imagePathAnalysis.nullImagePath + imagePathAnalysis.emptyImagePath + imagePathAnalysis.invalidImagePath) / imagePathAnalysis.total * 100)}%)`);

  } catch (error) {
    console.error('💥 Błąd podczas analizy:', error);
  }
}

// Uruchom analizę
analyzeCarMatTable();
