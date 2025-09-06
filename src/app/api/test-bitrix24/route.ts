import { NextRequest, NextResponse } from 'next/server';
import { Bitrix24Service } from '@/backend/services/Bitrix24Service';
import { LeadService } from '@/backend/services/LeadService';

export async function GET(request: NextRequest) {
  try {
    console.log('🧪 Testowanie integracji z Bitrix24...');

    // Test połączenia
    const connectionTest = await Bitrix24Service.testConnection();
    if (!connectionTest) {
      return NextResponse.json({
        success: false,
        error: 'Brak połączenia z Bitrix24',
        tests: {
          connection: false,
          emptyDeal: false,
          emptyLead: false
        }
      });
    }

    // Test pustego deala
    const emptyDealResult = await Bitrix24Service.createEmptyDeal();
    
    // Test pustego leada przez Bitrix24Service
    const emptyLeadResult = await Bitrix24Service.createEmptyLeadAfterFormSubmission();

    return NextResponse.json({
      success: true,
      message: 'Testy Bitrix24 zakończone',
      tests: {
        connection: true,
        emptyDeal: emptyDealResult.success,
        emptyLead: emptyLeadResult.success
      },
      results: {
        emptyDeal: emptyDealResult,
        emptyLead: emptyLeadResult
      }
    });

  } catch (error) {
    console.error('❌ Błąd testowania Bitrix24:', error);
    return NextResponse.json({
      success: false,
      error: `Błąd testowania Bitrix24: ${error instanceof Error ? error.message : 'Nieznany błąd'}`,
      tests: {
        connection: false,
        emptyDeal: false,
        emptyLead: false
      }
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { action } = await request.json();

    switch (action) {
      case 'test-connection':
        const connectionTest = await Bitrix24Service.testConnection();
        return NextResponse.json({
          success: connectionTest,
          message: connectionTest ? 'Połączenie z Bitrix24 działa' : 'Brak połączenia z Bitrix24'
        });

      case 'create-empty-deal':
        const emptyDealResult = await Bitrix24Service.createEmptyDeal();
        return NextResponse.json(emptyDealResult);

      case 'create-empty-lead':
        const emptyLeadResult = await Bitrix24Service.createEmptyLeadAfterFormSubmission();
        return NextResponse.json(emptyLeadResult);

      case 'get-deals':
        const dealsResult = await Bitrix24Service.getDeals(5);
        return NextResponse.json(dealsResult);

      default:
        return NextResponse.json({
          success: false,
          error: 'Nieznana akcja. Dostępne: test-connection, create-empty-deal, create-empty-lead, get-deals'
        }, { status: 400 });
    }

  } catch (error) {
    console.error('❌ Błąd API Bitrix24:', error);
    return NextResponse.json({
      success: false,
      error: `Błąd API Bitrix24: ${error.message}`
    }, { status: 500 });
  }
}
