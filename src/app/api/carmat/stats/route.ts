import { NextRequest, NextResponse } from 'next/server';
import { CarMatService } from '@/backend/services/CarMatService';

// GET - pobierz statystyki konfiguracji dywaników
export async function GET() {
  try {
    console.log('📊 Pobieranie statystyk CarMat...');
    
    const result = await CarMatService.getCarMatStats();
    
    if (result.success) {
      console.log('✅ Statystyki CarMat pobrane:', result.data);
      
      return NextResponse.json({
        success: true,
        data: result.data,
        message: 'Statystyki konfiguracji dywaników pobrane pomyślnie'
      });
    } else {
      console.error('❌ Błąd podczas pobierania statystyk CarMat:', result.error);
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('❌ Błąd w API /api/carmat/stats GET:', error);
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
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
