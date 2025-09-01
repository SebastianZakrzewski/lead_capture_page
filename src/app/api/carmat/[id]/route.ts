import { NextRequest, NextResponse } from 'next/server';
import { CarMatService } from '@/backend/services/CarMatService';

// GET - pobierz konfigurację dywanika po ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    if (!id) {
      return NextResponse.json(
        { success: false, error: 'ID jest wymagane' },
        { status: 400 }
      );
    }
    
    const result = await CarMatService.getCarMatById(id);
    
    if (result.success) {
      return NextResponse.json({
        success: true,
        data: result.data,
        message: 'Konfiguracja dywanika pobrana pomyślnie'
      });
    } else {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 404 }
      );
    }
  } catch (error) {
    console.error('❌ Błąd w API /api/carmat/[id] GET:', error);
    return NextResponse.json(
      { success: false, error: 'Wewnętrzny błąd serwera' },
      { status: 500 }
    );
  }
}

// PUT - aktualizuj konfigurację dywanika
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    
    if (!id) {
      return NextResponse.json(
        { success: false, error: 'ID jest wymagane' },
        { status: 400 }
      );
    }
    
    console.log('📝 Aktualizacja CarMat:', { id, body });
    
    // Przygotuj dane do aktualizacji
    const updateData = {
      matType: body.matType,
      cellStructure: body.cellStructure,
      materialColor: body.materialColor,
      borderColor: body.borderColor,
    };
    
    const result = await CarMatService.updateCarMat(id, updateData);
    
    if (result.success) {
      console.log('✅ CarMat zaktualizowany:', result.data.id);
      
      return NextResponse.json({
        success: true,
        data: result.data,
        message: 'Konfiguracja dywanika została pomyślnie zaktualizowana'
      });
    } else {
      console.error('❌ Błąd podczas aktualizacji CarMat:', result.error);
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('❌ Błąd w API /api/carmat/[id] PUT:', error);
    return NextResponse.json(
      { success: false, error: 'Wewnętrzny błąd serwera' },
      { status: 500 }
    );
  }
}

// DELETE - usuń konfigurację dywanika
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    if (!id) {
      return NextResponse.json(
        { success: false, error: 'ID jest wymagane' },
        { status: 400 }
      );
    }
    
    console.log('🗑️ Usuwanie CarMat:', id);
    
    const result = await CarMatService.deleteCarMat(id);
    
    if (result.success) {
      console.log('✅ CarMat usunięty:', id);
      
      return NextResponse.json({
        success: true,
        message: 'Konfiguracja dywanika została pomyślnie usunięta'
      });
    } else {
      console.error('❌ Błąd podczas usuwania CarMat:', result.error);
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('❌ Błąd w API /api/carmat/[id] DELETE:', error);
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
      'Access-Control-Allow-Methods': 'GET, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
