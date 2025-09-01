import { NextResponse } from 'next/server';
import { runColorMigration, checkTableStructure } from '@/backend/database';

export async function POST() {
  try {
    console.log('🚀 Uruchamianie migracji przez API...');
    
    // Sprawdź strukturę przed migracją
    const beforeStructure = await checkTableStructure();
    console.log('📊 Struktura przed migracją:', beforeStructure);
    
    // Uruchom migrację
    const migrationResult = await runColorMigration();
    console.log('🔄 Wynik migracji:', migrationResult);
    
    // Sprawdź strukturę po migracji
    const afterStructure = await checkTableStructure();
    console.log('📊 Struktura po migracji:', afterStructure);
    
    if (migrationResult.success) {
      return NextResponse.json({
        success: true,
        message: migrationResult.message,
        beforeStructure,
        afterStructure,
        timestamp: new Date().toISOString()
      });
    } else {
      return NextResponse.json({
        success: false,
        error: migrationResult.error,
        beforeStructure,
        afterStructure
      }, { status: 500 });
    }
    
  } catch (error) {
    console.error('❌ Błąd w API migracji:', error);
    return NextResponse.json({
      success: false,
      error: 'Wewnętrzny błąd serwera podczas migracji',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function GET() {
  try {
    // Sprawdź tylko strukturę tabeli
    const structure = await checkTableStructure();
    
    return NextResponse.json({
      success: true,
      structure,
      message: 'Sprawdzenie struktury tabeli Lead',
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ Błąd sprawdzania struktury:', error);
    return NextResponse.json({
      success: false,
      error: 'Błąd sprawdzania struktury tabeli',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// Obsługa OPTIONS request (CORS preflight)
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
