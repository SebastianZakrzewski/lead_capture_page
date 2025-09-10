const { createClient } = require('@supabase/supabase-js');

// Konfiguracja Supabase
const supabaseUrl = 'https://diqbnsinhsedmvvstvvc.supabase.co';
const supabaseKey = 'sb_publishable_4usCsIa5nSJUgIsT6qCB_A_BaYOCdkE';

const supabase = createClient(supabaseUrl, supabaseKey);

async function restoreAllCarMatData() {
  try {
    console.log('🔄 Przywracam wszystkie dane CarMat do bazy danych...\n');

    // 1. Sprawdź aktualny stan tabeli CarMat
    console.log('📊 Sprawdzam aktualny stan tabeli CarMat...');
    
    const { data: currentData, error: currentError } = await supabase
      .from('CarMat')
      .select('*')
      .limit(5);

    if (currentError) {
      console.log('❌ Błąd pobierania danych z CarMat:', currentError.message);
      return;
    }

    console.log(`📋 Aktualna liczba rekordów w CarMat: ${currentData.length}`);

    // 2. Usuń wszystkie istniejące dane
    if (currentData.length > 0) {
      console.log('🗑️  Usuwam istniejące dane z tabeli CarMat...');
      
      const { error: deleteError } = await supabase
        .from('CarMat')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000');

      if (deleteError) {
        console.log('❌ Błąd usuwania danych:', deleteError.message);
        return;
      }

      console.log('✅ Usunięto istniejące dane');
    }

    // 3. Przygotuj wszystkie dane z pliku new-carmat-inserts.sql
    const allCarMatData = [
      // 3D z rantami - romby - beżowy
      { matType: '3d-with-rims', cellStructure: 'rhombus', materialColor: 'beżowy', borderColor: 'beżowy', imagePath: '/konfigurator/dywaniki/3d/romby/bezowy/5os-3d-diamonds-beige-beige.webp' },
      { matType: '3d-with-rims', cellStructure: 'rhombus', materialColor: 'czarny', borderColor: 'beżowy', imagePath: '/konfigurator/dywaniki/3d/romby/bezowy/5os-3d-diamonds-black-beige.webp' },
      { matType: '3d-with-rims', cellStructure: 'rhombus', materialColor: 'niebieski', borderColor: 'beżowy', imagePath: '/konfigurator/dywaniki/3d/romby/bezowy/5os-3d-diamonds-blue-beige.webp' },
      { matType: '3d-with-rims', cellStructure: 'rhombus', materialColor: 'brązowy', borderColor: 'beżowy', imagePath: '/konfigurator/dywaniki/3d/romby/bezowy/5os-3d-diamonds-brown-beige.webp' },
      { matType: '3d-with-rims', cellStructure: 'rhombus', materialColor: 'ciemnoniebieski', borderColor: 'beżowy', imagePath: '/konfigurator/dywaniki/3d/romby/bezowy/5os-3d-diamonds-darkblue-beige.webp' },
      { matType: '3d-with-rims', cellStructure: 'rhombus', materialColor: 'ciemnozielony', borderColor: 'beżowy', imagePath: '/konfigurator/dywaniki/3d/romby/bezowy/5os-3d-diamonds-darkgreen-beige.webp' },
      { matType: '3d-with-rims', cellStructure: 'rhombus', materialColor: 'ciemnoszary', borderColor: 'beżowy', imagePath: '/konfigurator/dywaniki/3d/romby/bezowy/5os-3d-diamonds-darkgrey-beige.webp' },
      { matType: '3d-with-rims', cellStructure: 'rhombus', materialColor: 'kość słoniowa', borderColor: 'beżowy', imagePath: '/konfigurator/dywaniki/3d/romby/bezowy/5os-3d-diamonds-ivory-beige.webp' },
      { matType: '3d-with-rims', cellStructure: 'rhombus', materialColor: 'jasnobeżowy', borderColor: 'beżowy', imagePath: '/konfigurator/dywaniki/3d/romby/bezowy/5os-3d-diamonds-lightbeige-beige.webp' },
      { matType: '3d-with-rims', cellStructure: 'rhombus', materialColor: 'limonkowy', borderColor: 'beżowy', imagePath: '/konfigurator/dywaniki/3d/romby/bezowy/5os-3d-diamonds-lime-beige.webp' },
      { matType: '3d-with-rims', cellStructure: 'rhombus', materialColor: 'bordowy', borderColor: 'beżowy', imagePath: '/konfigurator/dywaniki/3d/romby/bezowy/5os-3d-diamonds-maroon-beige.webp' },
      { matType: '3d-with-rims', cellStructure: 'rhombus', materialColor: 'pomarańczowy', borderColor: 'beżowy', imagePath: '/konfigurator/dywaniki/3d/romby/bezowy/5os-3d-diamonds-orange-beige.webp' },
      { matType: '3d-with-rims', cellStructure: 'rhombus', materialColor: 'różowy', borderColor: 'beżowy', imagePath: '/konfigurator/dywaniki/3d/romby/bezowy/5os-3d-diamonds-pink-beige.webp' },
      { matType: '3d-with-rims', cellStructure: 'rhombus', materialColor: 'fioletowy', borderColor: 'beżowy', imagePath: '/konfigurator/dywaniki/3d/romby/bezowy/5os-3d-diamonds-purple-beige.webp' },
      { matType: '3d-with-rims', cellStructure: 'rhombus', materialColor: 'czerwony', borderColor: 'beżowy', imagePath: '/konfigurator/dywaniki/3d/romby/bezowy/5os-3d-diamonds-red-beige.webp' },
      { matType: '3d-with-rims', cellStructure: 'rhombus', materialColor: 'biały', borderColor: 'beżowy', imagePath: '/konfigurator/dywaniki/3d/romby/bezowy/5os-3d-diamonds-white-beige.webp' },
      { matType: '3d-with-rims', cellStructure: 'rhombus', materialColor: 'żółty', borderColor: 'beżowy', imagePath: '/konfigurator/dywaniki/3d/romby/bezowy/5os-3d-diamonds-yellow-beige.webp' },
      
      // 3D z rantami - romby - bordowy
      { matType: '3d-with-rims', cellStructure: 'rhombus', materialColor: 'beżowy', borderColor: 'bordowy', imagePath: '/konfigurator/dywaniki/3d/romby/bordowe/5os-3d-diamonds-beige-maroon.webp' },
      { matType: '3d-with-rims', cellStructure: 'rhombus', materialColor: 'czarny', borderColor: 'bordowy', imagePath: '/konfigurator/dywaniki/3d/romby/bordowe/5os-3d-diamonds-black-maroon.webp' },
      { matType: '3d-with-rims', cellStructure: 'rhombus', materialColor: 'niebieski', borderColor: 'bordowy', imagePath: '/konfigurator/dywaniki/3d/romby/bordowe/5os-3d-diamonds-blue-maroon.webp' },
      { matType: '3d-with-rims', cellStructure: 'rhombus', materialColor: 'brązowy', borderColor: 'bordowy', imagePath: '/konfigurator/dywaniki/3d/romby/bordowe/5os-3d-diamonds-brown-maroon.webp' },
      { matType: '3d-with-rims', cellStructure: 'rhombus', materialColor: 'ciemnoniebieski', borderColor: 'bordowy', imagePath: '/konfigurator/dywaniki/3d/romby/bordowe/5os-3d-diamonds-darkblue-maroon.webp' },
      { matType: '3d-with-rims', cellStructure: 'rhombus', materialColor: 'ciemnozielony', borderColor: 'bordowy', imagePath: '/konfigurator/dywaniki/3d/romby/bordowe/5os-3d-diamonds-darkgreen-maroon.webp' },
      { matType: '3d-with-rims', cellStructure: 'rhombus', materialColor: 'ciemnoszary', borderColor: 'bordowy', imagePath: '/konfigurator/dywaniki/3d/romby/bordowe/5os-3d-diamonds-darkgrey-maroon.webp' },
      { matType: '3d-with-rims', cellStructure: 'rhombus', materialColor: 'kość słoniowa', borderColor: 'bordowy', imagePath: '/konfigurator/dywaniki/3d/romby/bordowe/5os-3d-diamonds-ivory-maroon.webp' },
      { matType: '3d-with-rims', cellStructure: 'rhombus', materialColor: 'jasnobeżowy', borderColor: 'bordowy', imagePath: '/konfigurator/dywaniki/3d/romby/bordowe/5os-3d-diamonds-lightbeige-maroon.webp' },
      { matType: '3d-with-rims', cellStructure: 'rhombus', materialColor: 'limonkowy', borderColor: 'bordowy', imagePath: '/konfigurator/dywaniki/3d/romby/bordowe/5os-3d-diamonds-lime-maroon.webp' },
      { matType: '3d-with-rims', cellStructure: 'rhombus', materialColor: 'bordowy', borderColor: 'bordowy', imagePath: '/konfigurator/dywaniki/3d/romby/bordowe/5os-3d-diamonds-maroon-maroon.webp' },
      { matType: '3d-with-rims', cellStructure: 'rhombus', materialColor: 'pomarańczowy', borderColor: 'bordowy', imagePath: '/konfigurator/dywaniki/3d/romby/bordowe/5os-3d-diamonds-orange-maroon.webp' },
      { matType: '3d-with-rims', cellStructure: 'rhombus', materialColor: 'różowy', borderColor: 'bordowy', imagePath: '/konfigurator/dywaniki/3d/romby/bordowe/5os-3d-diamonds-pink-maroon.webp' },
      { matType: '3d-with-rims', cellStructure: 'rhombus', materialColor: 'fioletowy', borderColor: 'bordowy', imagePath: '/konfigurator/dywaniki/3d/romby/bordowe/5os-3d-diamonds-purple-maroon.webp' },
      { matType: '3d-with-rims', cellStructure: 'rhombus', materialColor: 'czerwony', borderColor: 'bordowy', imagePath: '/konfigurator/dywaniki/3d/romby/bordowe/5os-3d-diamonds-red-maroon.webp' },
      { matType: '3d-with-rims', cellStructure: 'rhombus', materialColor: 'biały', borderColor: 'bordowy', imagePath: '/konfigurator/dywaniki/3d/romby/bordowe/5os-3d-diamonds-white-maroon.webp' },
      { matType: '3d-with-rims', cellStructure: 'rhombus', materialColor: 'żółty', borderColor: 'bordowy', imagePath: '/konfigurator/dywaniki/3d/romby/bordowe/5os-3d-diamonds-yellow-maroon.webp' }
    ];

    console.log(`💾 Wstawiam ${allCarMatData.length} rekordów do tabeli CarMat...`);

    // 4. Wstaw dane w partiach po 50 rekordów
    const batchSize = 50;
    let totalInserted = 0;

    for (let i = 0; i < allCarMatData.length; i += batchSize) {
      const batch = allCarMatData.slice(i, i + batchSize);
      
      console.log(`📦 Wstawiam partię ${Math.floor(i / batchSize) + 1}/${Math.ceil(allCarMatData.length / batchSize)} (${batch.length} rekordów)...`);
      
      const { data: insertedData, error: insertError } = await supabase
        .from('CarMat')
        .insert(batch)
        .select();

      if (insertError) {
        console.log('❌ Błąd wstawiania partii:', insertError.message);
        console.log('   Próbuję wstawić pojedynczo...');
        
        // Próbuj wstawić pojedynczo
        for (const record of batch) {
          const { error: singleError } = await supabase
            .from('CarMat')
            .insert(record);
          
          if (singleError) {
            console.log(`   ⚠️  Błąd wstawiania rekordu: ${record.materialColor} + ${record.borderColor} - ${singleError.message}`);
          } else {
            totalInserted++;
          }
        }
      } else {
        totalInserted += insertedData.length;
        console.log(`   ✅ Wstawiono ${insertedData.length} rekordów`);
      }
    }

    console.log(`\n✅ Pomyślnie wstawiono ${totalInserted} rekordów`);

    // 5. Sprawdź końcowy stan
    console.log('\n🔍 Sprawdzam końcowy stan tabeli CarMat...');
    
    const { data: finalData, error: finalError } = await supabase
      .from('CarMat')
      .select('*')
      .limit(10);

    if (finalError) {
      console.log('❌ Błąd pobierania końcowych danych:', finalError.message);
      return;
    }

    console.log(`📋 Końcowa liczba rekordów w CarMat: ${finalData.length}`);
    console.log('\n📊 Przykładowe rekordy:');
    finalData.forEach((record, index) => {
      console.log(`   ${index + 1}. ${record.matType} - ${record.materialColor} + ${record.borderColor} -> ${record.imagePath}`);
    });

    // 6. Sprawdź statystyki
    const { count: totalCount, error: countError } = await supabase
      .from('CarMat')
      .select('*', { count: 'exact', head: true });

    if (!countError) {
      console.log(`\n📊 Łączna liczba rekordów w CarMat: ${totalCount}`);
    }

    console.log('\n✅ Przywracanie wszystkich danych CarMat zakończone pomyślnie!');

  } catch (error) {
    console.error('💥 Błąd podczas przywracania danych CarMat:', error);
  }
}

// Uruchom przywracanie
restoreAllCarMatData();
