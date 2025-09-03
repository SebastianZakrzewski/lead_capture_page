import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/backend/database';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { carMatData } = body;

    if (!carMatData || !Array.isArray(carMatData)) {
      return NextResponse.json(
        { error: 'Brak danych CarMat lub nieprawidłowy format' },
        { status: 400 }
      );
    }

    console.log(`🔄 Dodawanie ${carMatData.length} rekordów CarMat do bazy danych...`);

    // Sprawdź czy rekordy już istnieją
    const existingRecords = await supabase
      .from('CarMat')
      .select('imagePath')
      .in('imagePath', carMatData.map(item => item.imagePath));

    if (existingRecords.error) {
      console.error('Błąd podczas sprawdzania istniejących rekordów:', existingRecords.error);
      return NextResponse.json(
        { error: 'Błąd podczas sprawdzania istniejących rekordów' },
        { status: 500 }
      );
    }

    const existingPaths = new Set(existingRecords.data?.map(record => record.imagePath) || []);
    const newRecords = carMatData.filter(record => !existingPaths.has(record.imagePath));

    if (newRecords.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'Wszystkie rekordy już istnieją w bazie danych',
        inserted: 0,
        skipped: carMatData.length
      });
    }

    console.log(`📊 Znaleziono ${newRecords.length} nowych rekordów do dodania`);

    // Dodaj nowe rekordy
    const { data, error } = await supabase
      .from('CarMat')
      .insert(newRecords)
      .select();

    if (error) {
      console.error('Błąd podczas dodawania rekordów CarMat:', error);
      return NextResponse.json(
        { error: `Błąd podczas dodawania rekordów: ${error.message}` },
        { status: 500 }
      );
    }

    console.log(`✅ Pomyślnie dodano ${data?.length || 0} rekordów CarMat`);

    return NextResponse.json({
      success: true,
      message: `Pomyślnie dodano ${data?.length || 0} rekordów CarMat`,
      inserted: data?.length || 0,
      skipped: carMatData.length - (data?.length || 0),
      data: data
    });

  } catch (error) {
    console.error('❌ Błąd w API /api/carmat/bulk-insert:', error);
    return NextResponse.json(
      { error: 'Wewnętrzny błąd serwera' },
      { status: 500 }
    );
  }
}

// Obsługa OPTIONS request (CORS preflight)
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}