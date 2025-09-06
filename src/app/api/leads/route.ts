import { NextRequest, NextResponse } from 'next/server';
import { LeadService } from '@/backend/services/LeadService';
import { Bitrix24Service } from '@/backend/services/Bitrix24Service';
import { checkConnection } from '@/backend/database';
import { prepareLeadSubmissionData } from '@/utils/tracking';

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
    
    // Przygotuj dane do zapisania w bazie używając funkcji prepareLeadSubmissionData
    const leadData = prepareLeadSubmissionData({
      firstName: body.firstName,
      phone: body.phone,
      company: body.company || undefined,
      jobTitle: body.jobTitle || undefined,
      industry: body.industry || undefined,
      completeness: body.completeness || undefined,
      structure: body.structure || undefined,
      borderColor: body.borderColor || undefined,
      materialColor: body.materialColor || undefined,
      includeHooks: body.includeHooks || false,
      
      // Dane feedbackowe
      feedbackEaseOfChoice: body.feedbackEaseOfChoice || undefined,
      feedbackFormClarity: body.feedbackFormClarity || undefined,
      feedbackLoadingSpeed: body.feedbackLoadingSpeed || undefined,
      feedbackOverallExperience: body.feedbackOverallExperience || undefined,
      feedbackWouldRecommend: body.feedbackWouldRecommend || undefined,
      feedbackAdditionalComments: body.feedbackAdditionalComments || undefined,
    });
    
    console.log('💾 Próba zapisania leada:', leadData);
    
    // Utwórz lead z pełną integracją Bitrix24 (z mapowaniem danych)
    console.log('🚀 Rozpoczynam tworzenie leada z integracją Bitrix24...');
    const result = await LeadService.createLeadWithBitrix24(leadData);
    
    if (result.success) {
      console.log('✅ Lead utworzony i zsynchronizowany z Bitrix24:', result.data.id);
      if (result.data.bitrix24DealId) {
        console.log('✅ Deal Bitrix24 utworzony z ID:', result.data.bitrix24DealId);
      }
      if (result.data.bitrix24ContactId) {
        console.log('✅ Kontakt Bitrix24 utworzony z ID:', result.data.bitrix24ContactId);
      }
    } else {
      console.error('❌ Błąd tworzenia leada z integracją Bitrix24:', result.error);
      return NextResponse.json(
        { error: 'Nie udało się zapisać leada w bazie danych' },
        { status: 500 }
      );
    }
    
    // Zwróć sukces - Beacon API automatycznie obsłuży odpowiedź
    return NextResponse.json(
      { 
        success: true, 
        message: 'Lead został pomyślnie zapisany i zsynchronizowany z Bitrix24',
        leadId: result.data.id,
        bitrix24DealId: result.data.bitrix24DealId,
        bitrix24ContactId: result.data.bitrix24ContactId,
        timestamp: body.timestamp || new Date().toISOString()
      },
      { status: 200 }
    );
    
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
