const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Konfiguracja Supabase
const supabaseUrl = 'https://diqbnsinhsedmvvstvvc.supabase.co';
const supabaseKey = 'sb_publishable_4usCsIa5nSJUgIsT6qCB_A_BaYOCdkE';

const supabase = createClient(supabaseUrl, supabaseKey);

async function verifyImagePaths() {
  try {
    console.log('🔍 Weryfikuję ścieżki obrazów w tabeli CarMat...\n');

    // Pobierz kilka przykładowych rekordów
    const { data: records, error } = await supabase
      .from('CarMat')
      .select('*')
      .limit(20)
      .order('createdAt', { ascending: false });

    if (error) {
      console.error('❌ Błąd pobierania rekordów:', error);
      return;
    }

    console.log(`📊 Sprawdzam ${records.length} przykładowych rekordów:\n`);

    let validPaths = 0;
    let invalidPaths = 0;
    const invalidExamples = [];

    for (const record of records) {
      const imagePath = record.imagePath;
      const fullPath = path.join('public', imagePath);
      
      if (fs.existsSync(fullPath)) {
        validPaths++;
        console.log(`✅ ${record.matType} + ${record.cellStructure} + ${record.materialColor} + ${record.borderColor}`);
        console.log(`   -> ${imagePath}`);
      } else {
        invalidPaths++;
        invalidExamples.push({
          record: record,
          path: imagePath,
          fullPath: fullPath
        });
        console.log(`❌ ${record.matType} + ${record.cellStructure} + ${record.materialColor} + ${record.borderColor}`);
        console.log(`   -> ${imagePath}`);
        console.log(`   -> Pełna ścieżka: ${fullPath}`);
      }
      console.log('');
    }

    console.log(`📈 Statystyki weryfikacji:`);
    console.log(`   ✅ Prawidłowe ścieżki: ${validPaths}`);
    console.log(`   ❌ Nieprawidłowe ścieżki: ${invalidPaths}`);
    console.log(`   📊 Sukces: ${Math.round(validPaths / records.length * 100)}%\n`);

    if (invalidExamples.length > 0) {
      console.log('❌ Przykłady nieprawidłowych ścieżek:');
      invalidExamples.slice(0, 5).forEach((example, index) => {
        console.log(`${index + 1}. ${example.record.matType} + ${example.record.cellStructure} + ${example.record.materialColor} + ${example.record.borderColor}`);
        console.log(`   Ścieżka: ${example.path}`);
        console.log(`   Pełna ścieżka: ${example.fullPath}`);
        console.log('');
      });
    }

  } catch (error) {
    console.error('💥 Błąd podczas weryfikacji ścieżek:', error);
  }
}

// Uruchom weryfikację
verifyImagePaths();
