const { createClient } = require('@supabase/supabase-js');

// Konfiguracja Supabase
const supabaseUrl = 'https://diqbnsinhsedmvvstvvc.supabase.co';
const supabaseKey = 'sb_publishable_4usCsIa5nSJUgIsT6qCB_A_BaYOCdkE';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkSampleRecords() {
  try {
    console.log('🔍 Sprawdzam przykładowe rekordy z imagePath...\n');

    // Pobierz kilka przykładowych rekordów
    const { data: records, error } = await supabase
      .from('CarMat')
      .select('*')
      .limit(10)
      .order('createdAt', { ascending: false });

    if (error) {
      console.error('❌ Błąd pobierania rekordów:', error);
      return;
    }

    console.log(`📊 Przykładowe rekordy (${records.length}):\n`);

    records.forEach((record, index) => {
      console.log(`${index + 1}. ID: ${record.id}`);
      console.log(`   MatType: ${record.matType}`);
      console.log(`   CellStructure: ${record.cellStructure}`);
      console.log(`   MaterialColor: ${record.materialColor}`);
      console.log(`   BorderColor: ${record.borderColor}`);
      console.log(`   ImagePath: ${record.imagePath}`);
      console.log('');
    });

    // Sprawdź różne typy dywaników
    console.log('🎯 Sprawdzam różne typy dywaników:\n');

    // 3D z rantami
    const { data: rims3d } = await supabase
      .from('CarMat')
      .select('*')
      .eq('matType', '3d-with-rims')
      .limit(3);

    console.log('3D z rantami:');
    rims3d.forEach(record => {
      console.log(`   ${record.materialColor} + ${record.borderColor} -> ${record.imagePath}`);
    });
    console.log('');

    // 3D bez rantów - romby
    const { data: withoutRimsRhombus } = await supabase
      .from('CarMat')
      .select('*')
      .eq('matType', '3d-without-rims')
      .eq('cellStructure', 'rhombus')
      .limit(3);

    console.log('3D bez rantów - romby:');
    withoutRimsRhombus.forEach(record => {
      console.log(`   ${record.materialColor} + ${record.borderColor} -> ${record.imagePath}`);
    });
    console.log('');

    // 3D bez rantów - plaster miodu
    const { data: withoutRimsHoney } = await supabase
      .from('CarMat')
      .select('*')
      .eq('matType', '3d-without-rims')
      .eq('cellStructure', 'honeycomb')
      .limit(3);

    console.log('3D bez rantów - plaster miodu:');
    withoutRimsHoney.forEach(record => {
      console.log(`   ${record.materialColor} + ${record.borderColor} -> ${record.imagePath}`);
    });

  } catch (error) {
    console.error('💥 Błąd podczas sprawdzania rekordów:', error);
  }
}

// Uruchom sprawdzenie
checkSampleRecords();
