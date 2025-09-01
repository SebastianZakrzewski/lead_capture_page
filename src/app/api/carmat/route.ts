import { NextRequest, NextResponse } from 'next/server';
import { CarMatService } from '@/backend/services/CarMatService';

// GET - pobierz wszystkie konfiguracje dywaników
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const matType = searchParams.get('matType') || undefined;
    const cellStructure = searchParams.get('cellStructure') || undefined;
    const materialColor = searchParams.get('materialColor') || undefined;
    const borderColor = searchParams.get('borderColor') || undefined;

    // Jeśli są filtry, użyj filtrowania
    if (matType || cellStructure || materialColor || borderColor) {
      const result = await CarMatService.getCarMatsByFilter({
        matType,
        cellStructure,
        materialColor,
        borderColor,
      });

      if (result.success) {
        return NextResponse.json({
          success: true,
          data: result.data,
          message: 'Konfiguracje dywaników pobrane pomyślnie'
        });
      } else {
        return NextResponse.json(
          { success: false, error: result.error },
          { status: 500 }
        );
      }
    }

    // W przeciwnym razie użyj paginacji
    const result = await CarMatService.getCarMatsWithPagination(page, limit);

    if (result.success) {
      return NextResponse.json({
        success: true,
        data: result.data,
        message: 'Konfiguracje dywaników pobrane pomyślnie'
      });
    } else {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('❌ Błąd w API /api/carmat GET:', error);
    return NextResponse.json(
      { success: false, error: 'Wewnętrzny błąd serwera' },
      { status: 500 }
    );
  }
}

// POST - utwórz nową konfigurację dywanika
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    console.log('📨 Otrzymano dane CarMat:', body);
    
    // Walidacja wymaganych pól
    if (!body.matType || !body.cellStructure || !body.materialColor || !body.borderColor) {
      return NextResponse.json(
        { success: false, error: 'Brak wymaganych pól: matType, cellStructure, materialColor, borderColor' },
        { status: 400 }
      );
    }
    
    // Przygotuj dane do zapisania
    const carMatData = {
      matType: body.matType,
      cellStructure: body.cellStructure,
      materialColor: body.materialColor,
      borderColor: body.borderColor,
      imagePath: body.imagePath || '', // Dodaj pole imagePath
    };
    
    console.log('💾 Próba zapisania CarMat:', carMatData);
    
    // Zapisz konfigurację dywanika
    const result = await CarMatService.createCarMat(carMatData);
    
    if (result.success) {
      console.log('✅ CarMat zapisany:', result.data.id);
      
      return NextResponse.json(
        { 
          success: true, 
          message: 'Konfiguracja dywanika została pomyślnie zapisana',
          data: result.data,
          carMatId: result.data.id
        },
        { status: 201 }
      );
    } else {
      console.error('❌ Błąd podczas zapisywania CarMat:', result.error);
      return NextResponse.json(
        { success: false, error: 'Nie udało się zapisać konfiguracji dywanika' },
        { status: 500 }
      );
    }
    
  } catch (error) {
    console.error('❌ Błąd w API /api/carmat POST:', error);
    return NextResponse.json(
      { success: false, error: 'Wewnętrzny błąd serwera' },
      { status: 500 }
    );
  }
}

// OPTIONS - obsługa CORS preflight
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
