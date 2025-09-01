import { NextRequest, NextResponse } from 'next/server';
import { CarMatService } from '@/backend/services/CarMatService';
import { generateAllCarMatCombinations } from '@/utils/carmatMapper';

export async function POST(request: NextRequest) {
  try {
    const { action } = await request.json();

    if (action === 'generate-and-insert') {
      // Generuj wszystkie kombinacje
      const combinations = generateAllCarMatCombinations();
      
      console.log(`Generowanie ${combinations.length} kombinacji dywaników...`);
      
      // Wprowadź wszystkie kombinacje do bazy danych
      const result = await CarMatService.bulkInsertCarMats(combinations);
      
      if (result.success) {
        return NextResponse.json({
          success: true,
          message: result.message,
          insertedCount: result.insertedCount,
          totalCombinations: combinations.length
        });
      } else {
        return NextResponse.json({
          success: false,
          error: result.error,
          details: result.details
        }, { status: 500 });
      }
    }

    if (action === 'clear-all') {
      // Wyczyść wszystkie dane
      const result = await CarMatService.clearAllCarMats();
      
      if (result.success) {
        return NextResponse.json({
          success: true,
          message: result.message
        });
      } else {
        return NextResponse.json({
          success: false,
          error: result.error
        }, { status: 500 });
      }
    }

    if (action === 'generate-only') {
      // Tylko generuj kombinacje bez wprowadzania do bazy
      const combinations = generateAllCarMatCombinations();
      
      return NextResponse.json({
        success: true,
        combinations,
        totalCount: combinations.length,
        message: `Wygenerowano ${combinations.length} kombinacji dywaników`
      });
    }

    return NextResponse.json({
      success: false,
      error: 'Nieprawidłowa akcja. Dostępne akcje: generate-and-insert, clear-all, generate-only'
    }, { status: 400 });

  } catch (error) {
    console.error('Błąd w bulk-insert API:', error);
    return NextResponse.json({
      success: false,
      error: 'Wewnętrzny błąd serwera',
      details: error instanceof Error ? error.message : 'Nieznany błąd'
    }, { status: 500 });
  }
}

export async function GET() {
  try {
    // Pobierz statystyki z bazy danych
    const statsResult = await CarMatService.getCarMatStats();
    
    if (statsResult.success) {
      return NextResponse.json({
        success: true,
        stats: statsResult.data
      });
    } else {
      return NextResponse.json({
        success: false,
        error: statsResult.error
      }, { status: 500 });
    }
  } catch (error) {
    console.error('Błąd w bulk-insert GET API:', error);
    return NextResponse.json({
      success: false,
      error: 'Wewnętrzny błąd serwera',
      details: error instanceof Error ? error.message : 'Nieznany błąd'
    }, { status: 500 });
  }
}
