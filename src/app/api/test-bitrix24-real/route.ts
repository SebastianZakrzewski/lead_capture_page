import { NextRequest, NextResponse } from 'next/server';
import { Bitrix24Service } from '@/backend/services/Bitrix24Service';

export async function GET(request: NextRequest) {
  try {
    console.log('🧪 Testowanie rzeczywistego połączenia z Bitrix24...');

    // Test 1: Sprawdzenie połączenia
    console.log('1️⃣ Testowanie połączenia...');
    const connectionTest = await Bitrix24Service.testConnection();
    console.log(`Połączenie: ${connectionTest ? 'SUKCES' : 'BŁĄD'}`);

    if (!connectionTest) {
      return NextResponse.json({
        success: false,
        error: 'Nie można połączyć się z Bitrix24',
        step: 'connection'
      });
    }

    // Test 2: Tworzenie pustego leada
    console.log('2️⃣ Tworzenie pustego leada...');
    const emptyLeadResult = await Bitrix24Service.createEmptyDeal();
    
    if (!emptyLeadResult.success) {
      return NextResponse.json({
        success: false,
        error: emptyLeadResult.error,
        step: 'create_lead'
      });
    }

    console.log(`✅ Pusty lead utworzony! ID: ${emptyLeadResult.dealId}`);

    // Test 3: Sprawdzenie czy lead został utworzony
    console.log('3️⃣ Sprawdzanie utworzonego leada...');
    const dealResult = await Bitrix24Service.getDealById(emptyLeadResult.dealId!);
    
    if (!dealResult.success) {
      return NextResponse.json({
        success: false,
        error: dealResult.error,
        step: 'get_lead',
        dealId: emptyLeadResult.dealId
      });
    }

    console.log('✅ Lead znaleziony w Bitrix24:', dealResult.deal);

    // Test 4: Pobranie listy deali z kategorii
    console.log('4️⃣ Pobieranie listy deali z kategorii "Leady z Reklam"...');
    const dealsResult = await Bitrix24Service.getDeals(5);

    return NextResponse.json({
      success: true,
      message: 'Test integracji z Bitrix24 zakończony pomyślnie',
      results: {
        connection: connectionTest,
        createdLead: {
          id: emptyLeadResult.dealId,
          title: 'Test Lead - Pusty Deal',
          category: 'Leady z Reklam (ID: 2)',
          status: 'NEW'
        },
        leadDetails: dealResult.deal,
        recentDeals: dealsResult.success ? dealsResult.deals : null,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('❌ Błąd podczas testowania Bitrix24:', error);
    return NextResponse.json({
      success: false,
      error: `Nieoczekiwany błąd: ${error instanceof Error ? error.message : String(error)}`,
      step: 'unexpected_error'
    }, { status: 500 });
  }
}
