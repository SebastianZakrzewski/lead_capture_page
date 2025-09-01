import { NextRequest, NextResponse } from 'next/server';
import { CarMatService } from '@/backend/services/CarMatService';
import { generateAllCarMatCombinations, getCarMatStats } from '@/utils/carmatMapper';

export async function POST(request: NextRequest) {
  try {
    console.log('🚀 Rozpoczynam proces seedowania bazy danych dywaników...');

    // 1. Sprawdź obecny stan bazy danych
    console.log('📊 Sprawdzanie obecnego stanu bazy danych...');
    const currentStats = await CarMatService.getCarMatStats();
    
    if (currentStats.success && currentStats.data.total > 0) {
      console.log(`⚠️  W bazie danych znajduje się już ${currentStats.data.total} rekordów`);
      
      // Opcjonalnie wyczyść bazę danych
      const { clearDatabase } = await request.json().catch(() => ({ clearDatabase: false }));
      
      if (clearDatabase) {
        console.log('🧹 Czyszczenie bazy danych...');
        const clearResult = await CarMatService.clearAllCarMats();
        
        if (!clearResult.success) {
          return NextResponse.json({
            success: false,
            error: 'Nie udało się wyczyścić bazy danych',
            details: clearResult.error
          }, { status: 500 });
        }
        
        console.log('✅ Baza danych została wyczyszczona');
      } else {
        return NextResponse.json({
          success: false,
          error: 'Baza danych nie jest pusta. Użyj clearDatabase: true aby wyczyścić bazę przed seedowaniem.',
          currentStats: currentStats.data
        }, { status: 400 });
      }
    }

    // 2. Generuj wszystkie kombinacje
    console.log('🔧 Generowanie wszystkich kombinacji dywaników...');
    const combinations = generateAllCarMatCombinations();
    const expectedStats = getCarMatStats();
    
    console.log(`📈 Oczekiwane statystyki:`);
    console.log(`   - Łączna liczba kombinacji: ${expectedStats.total}`);
    console.log(`   - Typy dywaników:`, expectedStats.byMatType);
    console.log(`   - Struktury komórek:`, expectedStats.byCellStructure);
    console.log(`   - Kolory materiału: ${Object.keys(expectedStats.byMaterialColor).length} unikalnych`);
    console.log(`   - Kolory obszycia: ${Object.keys(expectedStats.byBorderColor).length} unikalnych`);

    // 3. Wprowadź dane do bazy
    console.log('💾 Wprowadzanie danych do bazy danych...');
    const insertResult = await CarMatService.bulkInsertCarMats(combinations);
    
    if (!insertResult.success) {
      console.error('❌ Błąd podczas wprowadzania danych:', insertResult.error);
      return NextResponse.json({
        success: false,
        error: 'Nie udało się wprowadzić danych do bazy',
        details: insertResult.error
      }, { status: 500 });
    }

    console.log(`✅ Pomyślnie wprowadzono ${insertResult.insertedCount} rekordów`);

    // 4. Zweryfikuj wprowadzone dane
    console.log('🔍 Weryfikacja wprowadzonych danych...');
    const finalStats = await CarMatService.getCarMatStats();
    
    if (!finalStats.success) {
      console.error('❌ Błąd podczas weryfikacji:', finalStats.error);
      return NextResponse.json({
        success: false,
        error: 'Nie udało się zweryfikować wprowadzonych danych',
        details: finalStats.error
      }, { status: 500 });
    }

    console.log('📊 Finalne statystyki:');
    console.log(`   - Łączna liczba rekordów: ${finalStats.data.total}`);
    console.log(`   - Typy dywaników:`, finalStats.data.matTypes);
    console.log(`   - Struktury komórek:`, finalStats.data.cellStructures);

    // 5. Sprawdź czy liczby się zgadzają
    const isDataValid = finalStats.data.total === expectedStats.total;
    
    if (!isDataValid) {
      console.warn(`⚠️  Niezgodność danych: oczekiwano ${expectedStats.total}, otrzymano ${finalStats.data.total}`);
    }

    return NextResponse.json({
      success: true,
      message: 'Baza danych została pomyślnie zaseedowana',
      summary: {
        expectedCombinations: expectedStats.total,
        insertedRecords: insertResult.insertedCount,
        finalRecords: finalStats.data.total,
        dataValid: isDataValid
      },
      stats: finalStats.data,
      expectedStats: expectedStats
    });

  } catch (error) {
    console.error('💥 Krytyczny błąd podczas seedowania:', error);
    return NextResponse.json({
      success: false,
      error: 'Krytyczny błąd podczas seedowania bazy danych',
      details: error instanceof Error ? error.message : 'Nieznany błąd'
    }, { status: 500 });
  }
}

export async function GET() {
  try {
    // Pobierz obecne statystyki
    const stats = await CarMatService.getCarMatStats();
    const expectedStats = getCarMatStats();
    
    return NextResponse.json({
      success: true,
      current: stats.success ? stats.data : null,
      expected: expectedStats,
      ready: stats.success && stats.data.total === expectedStats.total
    });
  } catch (error) {
    console.error('Błąd w seed GET API:', error);
    return NextResponse.json({
      success: false,
      error: 'Wewnętrzny błąd serwera',
      details: error instanceof Error ? error.message : 'Nieznany błąd'
    }, { status: 500 });
  }
}
