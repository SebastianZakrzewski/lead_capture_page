import { NextRequest, NextResponse } from 'next/server';
import { Bitrix24Service } from '@/backend/services/Bitrix24Service';
import { mapToBitrix24Contact, mapToBitrix24Deal } from '@/utils/bitrixFieldMapper';
import { LeadSubmissionData } from '@/utils/tracking';

export async function GET(request: NextRequest) {
  try {
    console.log('🧪 Testowanie mapowania danych formularza do Bitrix24...');

    // Przykładowe dane formularza z Facebook META ADS
    const sampleFormData: LeadSubmissionData = {
      firstName: 'Jan',
      lastName: 'Kowalski',
      phone: '+48 123 456 789',
      email: 'jan.kowalski@example.com',
      company: 'BMW X5',
      jobTitle: '2020',
      industry: '3d-evapremium-z-rantami',
      completeness: 'przod-tyl-bagaznik',
      structure: 'plaster-miodu',
      borderColor: 'red',
      materialColor: 'black',
      includeHooks: true,
      message: 'Dodatkowe uwagi do produkcji',
      feedbackCompleted: true,
      utmSource: 'facebook', // Źródło Facebook - powinno ustawić META
      utmMedium: 'social',
      utmCampaign: 'test-campaign-2024',
      utmTerm: 'dywaniki samochodowe',
      utmContent: 'banner-3d',
      gclid: 'test-gclid-123',
      fbclid: 'test-fbclid-456', // fbclid - dodatkowe potwierdzenie Facebook
      sessionId: 'test-session-789',
      firstVisit: new Date(),
      currentUrl: 'https://example.com/konfigurator',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      referrer: 'https://facebook.com',
      feedbackEaseOfChoice: 5,
      feedbackFormClarity: 4,
      feedbackLoadingSpeed: 5,
      feedbackOverallExperience: 4,
      feedbackWouldRecommend: 5,
      feedbackAdditionalComments: 'Świetny formularz, łatwy w użyciu'
    };

    console.log('📋 Przykładowe dane formularza:', sampleFormData);

    // Test 1: Mapowanie danych
    console.log('1️⃣ Mapowanie danych formularza...');
    const contactData = mapToBitrix24Contact(sampleFormData);
    const dealData = mapToBitrix24Deal(sampleFormData);

    console.log('📞 Dane kontaktu:', contactData);
    console.log('💼 Dane deala:', dealData);

    // Test 2: Sprawdzenie połączenia
    console.log('2️⃣ Testowanie połączenia z Bitrix24...');
    const connectionTest = await Bitrix24Service.testConnection();
    console.log(`Połączenie: ${connectionTest ? 'SUKCES' : 'BŁĄD'}`);

    if (!connectionTest) {
      return NextResponse.json({
        success: false,
        error: 'Nie można połączyć się z Bitrix24',
        step: 'connection',
        mappedData: {
          contact: contactData,
          deal: dealData
        }
      });
    }

    // Test 3: Tworzenie leada z mapowanymi danymi
    console.log('3️⃣ Tworzenie leada z mapowanymi danymi...');
    const leadResult = await Bitrix24Service.createDealWithContact(contactData, dealData);
    
    if (!leadResult.success) {
      return NextResponse.json({
        success: false,
        error: leadResult.error,
        step: 'create_lead',
        mappedData: {
          contact: contactData,
          deal: dealData
        }
      });
    }

    console.log(`✅ Lead utworzony! Contact ID: ${leadResult.contactId}, Deal ID: ${leadResult.dealId}`);

    // Test 4: Sprawdzenie utworzonego leada
    console.log('4️⃣ Sprawdzanie utworzonego leada...');
    const dealResult = await Bitrix24Service.getDealById(leadResult.dealId!);
    
    if (!dealResult.success) {
      return NextResponse.json({
        success: false,
        error: dealResult.error,
        step: 'get_lead',
        dealId: leadResult.dealId,
        mappedData: {
          contact: contactData,
          deal: dealData
        }
      });
    }

    console.log('✅ Lead znaleziony w Bitrix24:', dealResult.deal);

    return NextResponse.json({
      success: true,
      message: 'Test mapowania danych formularza zakończony pomyślnie',
      results: {
        connection: connectionTest,
        mappedData: {
          contact: contactData,
          deal: dealData
        },
        createdLead: {
          contactId: leadResult.contactId,
          dealId: leadResult.dealId,
          title: dealData.TITLE,
          category: 'Leady z Reklam (ID: 2)',
          status: 'NEW'
        },
        leadDetails: dealResult.deal,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('❌ Błąd podczas testowania mapowania:', error);
    return NextResponse.json({
      success: false,
      error: `Nieoczekiwany błąd: ${error instanceof Error ? error.message : String(error)}`,
      step: 'unexpected_error'
    }, { status: 500 });
  }
}
