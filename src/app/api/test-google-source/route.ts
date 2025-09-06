import { NextRequest, NextResponse } from 'next/server';
import { mapFormDataToBitrix24Fields } from '@/utils/bitrixFieldMapper';
import { LeadSubmissionData } from '@/utils/tracking';

export async function GET(request: NextRequest) {
  try {
    console.log('🧪 Testowanie mapowania z Google jako źródłem...');

    // Przykładowe dane formularza z Google Ads
    const sampleFormData: LeadSubmissionData = {
      firstName: 'Anna',
      phone: '+48 987 654 321',
      email: 'anna.nowak@example.com',
      company: 'Audi A4',
      jobTitle: '2019',
      industry: 'klasyczne-evapremium',
      completeness: 'przod-tyl',
      structure: 'romb',
      borderColor: 'blue',
      materialColor: 'white',
      includeHooks: false,
      message: 'Test z Google Ads',
      feedbackCompleted: false,
      utmSource: 'google', // Źródło Google - NIE powinno ustawić META
      utmMedium: 'cpc',
      utmCampaign: 'google-campaign-2024',
      utmTerm: 'dywaniki samochodowe',
      utmContent: 'text-ad',
      gclid: 'test-gclid-google-123', // gclid z Google
      fbclid: undefined, // Brak fbclid
      sessionId: 'test-session-google-789',
      firstVisit: new Date(),
      currentUrl: 'https://example.com/konfigurator',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      referrer: 'https://google.com',
      feedbackEaseOfChoice: 0,
      feedbackFormClarity: 0,
      feedbackLoadingSpeed: 0,
      feedbackOverallExperience: 0,
      feedbackWouldRecommend: 0,
      feedbackAdditionalComments: ''
    };

    console.log('📋 Dane z Google Ads:', sampleFormData);

    // Mapowanie danych
    const mappedFields = mapFormDataToBitrix24Fields(sampleFormData);

    console.log('📊 Zmapowane pola:', mappedFields);

    return NextResponse.json({
      success: true,
      message: 'Test mapowania z Google zakończony',
      results: {
        source: sampleFormData.utmSource,
        hasFbclid: !!sampleFormData.fbclid,
        mappedSource: mappedFields.UF_CRM_1757024023213,
        shouldBeMeta: sampleFormData.utmSource === 'facebook' || sampleFormData.utmSource === 'meta' || !!sampleFormData.fbclid,
        isMetaSet: mappedFields.UF_CRM_1757024023213 === '262',
        allMappedFields: mappedFields
      }
    });

  } catch (error) {
    console.error('❌ Błąd podczas testowania:', error);
    return NextResponse.json({
      success: false,
      error: `Nieoczekiwany błąd: ${error instanceof Error ? error.message : String(error)}`
    }, { status: 500 });
  }
}
