const { createClient } = require('@supabase/supabase-js');

// Konfiguracja Supabase
const supabaseUrl = 'https://diqbnsinhsedmvvstvvc.supabase.co';
const supabaseKey = 'sb_publishable_4usCsIa5nSJUgIsT6qCB_A_BaYOCdkE';

const supabase = createClient(supabaseUrl, supabaseKey);

// Mapowanie kolorów z bazy danych na angielskie nazwy w plikach
const colorToFileNameMap = {
  'czarny': 'black',
  'czerwony': 'red',
  'niebieski': 'blue',
  'żółty': 'yellow',
  'zielony': 'green',
  'lime': 'lime',
  'pomarańczowy': 'orange',
  'fioletowy': 'purple',
  'brązowy': 'brown',
  'bordowy': 'maroon',
  'różowy': 'pink',
  'ciemnoniebieski': 'darkblue',
  'ciemnozielony': 'darkgreen',
  'ciemnoszary': 'darkgrey',
  'jasnoszary': 'lightgrey',
  'beżowy': 'beige',
  'jasnobeżowy': 'lightbeige',
  'biały': 'white',
  'kość słoniowa': 'ivory'
};

// Mapowanie kolorów na nazwy katalogów (zgodnie z rzeczywistą strukturą)
const colorToDirectoryMap = {
  'czarny': 'czarne',
  'czerwony': 'czerwone',
  'niebieski': 'niebieskie',
  'żółty': 'zolte',
  'zielony': 'zielone',
  'lime': 'zielone',
  'pomarańczowy': 'pomaranczowe',
  'fioletowy': 'fioletowe',
  'brązowy': 'brazowe',
  'bordowy': 'bordowe',
  'różowy': 'rozowe',
  'ciemnoniebieski': 'granatowe',
  'ciemnozielony': 'zielone',
  'ciemnoszary': 'ciemnoszare',
  'jasnoszary': 'jasnoszare',
  'beżowy': 'bezowe',
  'jasnobeżowy': 'bezowe',
  'biały': 'bezowe',
  'kość słoniowa': 'bezowe'
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
    
    // Mapuj kolory na angielskie nazwy dla plików
    const materialColorEn = colorToFileNameMap[materialColor] || materialColor;
    const borderColorEn = colorToFileNameMap[borderColor] || borderColor;
    
    // Generuj nazwę pliku zgodnie z rzeczywistą strukturą
    let fileName;
    let borderDir;
    
    if (matType === '3d-with-rims') {
      // 3D z rantami - struktura: /3d/{structure}/{borderColor}/
      if (cellStructure === 'rhombus') {
        borderDir = `romby ${borderColorDir}`;
        fileName = `5os-3d-diamonds-${materialColorEn}-${borderColorEn}.webp`;
      } else if (cellStructure === 'honeycomb') {
        borderDir = `plaster ${borderColorDir}`;
        fileName = `5os-3d-honey-${materialColorEn}-${borderColorEn}.webp`;
      }
    } else if (matType === '3d-without-rims') {
      // Klasyczne - struktura: /klasyczne/{structure}/{structure} {borderColor}/
      if (cellStructure === 'rhombus') {
        borderDir = `romby ${borderColorDir}`;
        fileName = `5os-classic-diamonds-${materialColorEn}-${borderColorEn}.webp`;
      } else if (cellStructure === 'honeycomb') {
        borderDir = `plaster ${borderColorDir} obszycie`;
        fileName = `5os-classic-honey-${materialColorEn}-${borderColorEn}.webp`;
      }
    }
    
    // Generuj ścieżkę
    const imagePath = `/konfigurator/dywaniki/${matTypeDir}/${structureDir}/${borderDir}/${fileName}`;
    
    return imagePath;
  } catch (error) {
    console.error('❌ Błąd generowania ścieżki dla rekordu:', record.id, error);
    return null;
  }
}

async function fixImagePaths() {
  try {
    console.log('🔧 Rozpoczynam naprawę imagePath w tabeli CarMat (ostateczna wersja)...\n');

    // 1. Pobierz wszystkie rekordy
    const { data: records, error: fetchError } = await supabase
      .from('CarMat')
      .select('*')
      .order('createdAt', { ascending: false });

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

    // 3. Pokaż przykłady wygenerowanych ścieżek
    console.log('📋 Przykłady wygenerowanych ścieżek:');
    updates.slice(0, 5).forEach((update, index) => {
      const record = records.find(r => r.id === update.id);
      console.log(`${index + 1}. ${record.matType} + ${record.cellStructure} + ${record.materialColor} + ${record.borderColor}`);
      console.log(`   -> ${update.imagePath}`);
    });
    console.log('');

    // 4. Aktualizuj rekordy w bazie danych (w małych partiach)
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

    // 5. Sprawdź wyniki
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
