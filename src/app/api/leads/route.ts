import { NextRequest, NextResponse } from 'next/server';
import { LeadService } from '@/backend/services/LeadService';
import { checkConnection } from '@/backend/database';

export async function POST(request: NextRequest) {
  try {
    // Sprawdź połączenie z bazą danych
    const dbStatus = await checkConnection();
    console.log('🔍 Status połączenia z bazą:', dbStatus);
    
    if (!dbStatus.success) {
      console.error('❌ Błąd połączenia z bazą danych:', dbStatus.error);
      return NextResponse.json(
        { error: 'Błąd połączenia z bazą danych' },
        { status: 500 }
      );
    }
    
    // Pobierz dane z body request
    const body = await request.json();
    
    console.log('📨 Otrzymano dane przez Beacon API:', body);
    
    // Walidacja wymaganych pól
    if (!body.firstName || !body.phone) {
      console.error('❌ Brak wymaganych pól:', { firstName: body.firstName, phone: body.phone });
      return NextResponse.json(
        { error: 'Brak wymaganych pól: firstName i phone' },
        { status: 400 }
      );
    }
    
    // Przygotuj dane do zapisania w bazie
    const leadData = {
      firstName: body.firstName,
      phone: body.phone,
      email: body.email || undefined,
      company: body.company || undefined,
      jobTitle: body.jobTitle || undefined,
      industry: body.industry || undefined,
      completeness: body.completeness || undefined,
      borderColor: body.borderColor || undefined,
      materialColor: body.materialColor || undefined,
    };
    
    console.log('💾 Próba zapisania leada:', leadData);
    
    // Zapisz lead w bazie danych
    const result = await LeadService.createLead(leadData);
    
    if (result.success) {
      console.log('✅ Lead zapisany w bazie:', result.data.id);
      
      // Zwróć sukces - Beacon API automatycznie obsłuży odpowiedź
      return NextResponse.json(
        { 
          success: true, 
          message: 'Lead został pomyślnie zapisany',
          leadId: result.data.id,
          timestamp: body.timestamp || new Date().toISOString()
        },
        { status: 200 }
      );
    } else {
      console.error('❌ Błąd podczas zapisywania leada:', result.error);
      return NextResponse.json(
        { error: 'Nie udało się zapisać leada w bazie danych' },
        { status: 500 }
      );
    }
    
  } catch (error) {
    console.error('❌ Błąd w API /api/leads:', error);
    
    // Zwróć błąd - Beacon API automatycznie obsłuży odpowiedź
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
