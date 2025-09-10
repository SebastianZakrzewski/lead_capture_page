const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Konfiguracja Supabase
const supabaseUrl = 'https://diqbnsinhsedmvvstvvc.supabase.co';
const supabaseKey = 'sb_publishable_4usCsIa5nSJUgIsT6qCB_A_BaYOCdkE';

const supabase = createClient(supabaseUrl, supabaseKey);

// Mapowanie kolorów z bazy danych na nazwy katalogów
const colorToDirectoryMap = {
  'czarny': 'czarne',
  'czerwony': 'czerwone',
  'niebieski': 'niebieskie',
  'żółty': 'żółte',
  'zielony': 'zielone',
  'lime': 'zielone',
  'pomarańczowy': 'pomarańczowe',
  'fioletowy': 'fioletowe',
  'brązowy': 'brązowe',
  'bordowy': 'bordowe',
  'różowy': 'różowe',
  'ciemnoniebieski': 'ciemnoniebieskie',
  'ciemnozielony': 'ciemnozielone',
  'ciemnoszary': 'ciemnoszare',
  'jasnoszary': 'jasnoszare',
  'beżowy': 'beżowe',
  'jasnobeżowy': 'jasnobeżowe',
  'biały': 'białe',
  'kość słoniowa': 'kość słoniowa'
};

// Mapowanie struktur komórek na nazwy katalogów
const structureToDirectoryMap = {
  'rhombus': 'romby',
  'honeycomb': 'plaster miodu'
};

// Mapowanie typów dywaników na nazwy katalogów
const matTypeToDirectoryMap = {
  '3d-with-rims': '3d',
  '3d-without-rims': 'klasyczne'
};

function generateImagePath(record) {
  try {
    const { matType, cellStructure, materialColor, borderColor } = record;
    
    // Mapuj wartości na nazwy katalogów
    const matTypeDir = matTypeToDirectoryMap[matType] || matType;
    const structureDir = structureToDirectoryMap[cellStructure] || cellStructure;
    const materialColorDir = colorToDirectoryMap[materialColor] || materialColor;
    const borderColorDir = colorToDirectoryMap[borderColor] || borderColor;
    
    // Generuj nazwę pliku
    let fileName;
    if (matType === '3d-with-rims') {
      fileName = `5os-3d-diamonds-${materialColor}-${borderColor}.webp`;
    } else if (matType === '3d-without-rims') {
      if (cellStructure === 'rhombus') {
        fileName = `5os-classic-diamonds-${materialColor}-${borderColor}.webp`;
      } else if (cellStructure === 'honeycomb') {
        fileName = `5os-classic-honey-${materialColor}-${borderColor}.webp`;
      }
    }
    
    // Generuj ścieżkę
    const imagePath = `/konfigurator/dywaniki/${matTypeDir}/${structureDir}/${materialColorDir}/${fileName}`;
    
    return imagePath;
  } catch (error) {
    console.error('❌ Błąd generowania ścieżki dla rekordu:', record.id, error);
    return null;
  }
}

async function fixImagePaths() {
  try {
    console.log('🔧 Rozpoczynam naprawę imagePath w tabeli CarMat...\n');

    // 1. Pobierz wszystkie rekordy z pustym imagePath
    const { data: records, error: fetchError } = await supabase
      .from('CarMat')
      .select('*')
      .or('imagePath.is.null,imagePath.eq.');

    if (fetchError) {
      console.error('❌ Błąd pobierania rekordów:', fetchError);
      return;
    }

    console.log(`📊 Znaleziono ${records.length} rekordów do naprawy\n`);

    // 2. Generuj imagePath dla każdego rekordu
    const updates = [];
    let successCount = 0;
    let errorCount = 0;

    for (const record of records) {
      const imagePath = generateImagePath(record);
      
      if (imagePath) {
        updates.push({
          id: record.id,
          imagePath: imagePath
        });
        successCount++;
      } else {
        errorCount++;
        console.log(`❌ Nie udało się wygenerować ścieżki dla rekordu: ${record.id}`);
      }
    }

    console.log(`📈 Statystyki generowania:`);
    console.log(`   ✅ Pomyślnie wygenerowano: ${successCount}`);
    console.log(`   ❌ Błędy: ${errorCount}\n`);

    // 3. Aktualizuj rekordy w bazie danych (w małych partiach)
    const batchSize = 50;
    let updatedCount = 0;

    for (let i = 0; i < updates.length; i += batchSize) {
      const batch = updates.slice(i, i + batchSize);
      
      console.log(`🔄 Aktualizuję partię ${Math.floor(i / batchSize) + 1}/${Math.ceil(updates.length / batchSize)} (${batch.length} rekordów)...`);
      
      for (const update of batch) {
        const { error: updateError } = await supabase
          .from('CarMat')
          .update({ imagePath: update.imagePath })
          .eq('id', update.id);

        if (updateError) {
          console.error(`❌ Błąd aktualizacji rekordu ${update.id}:`, updateError);
        } else {
          updatedCount++;
        }
      }
      
      // Krótka pauza między partiami
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    console.log(`\n✅ Zakończono aktualizację!`);
    console.log(`   📊 Zaktualizowano: ${updatedCount} rekordów`);
    console.log(`   📈 Sukces: ${Math.round(updatedCount / records.length * 100)}%`);

    // 4. Sprawdź wyniki
    console.log(`\n🔍 Sprawdzanie wyników...`);
    const { data: updatedRecords, error: checkError } = await supabase
      .from('CarMat')
      .select('id, imagePath')
      .not('imagePath', 'is', null)
      .neq('imagePath', '');

    if (checkError) {
      console.error('❌ Błąd sprawdzania wyników:', checkError);
    } else {
      console.log(`✅ Rekordy z imagePath po aktualizacji: ${updatedRecords.length}`);
    }

  } catch (error) {
    console.error('💥 Błąd podczas naprawy imagePath:', error);
  }
}

// Uruchom naprawę
fixImagePaths();
