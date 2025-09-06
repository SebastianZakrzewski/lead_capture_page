import { mapFormDataToBitrix24Fields, mapToBitrix24Contact, mapToBitrix24Deal } from '../bitrixFieldMapper';
import { LeadSubmissionData } from '../tracking';

describe('BitrixFieldMapper', () => {
  const sampleLeadData: LeadSubmissionData = {
    firstName: 'Jan',
    lastName: 'Kowalski',
    phone: '+48 123 456 789',
    email: 'jan@example.com',
    company: 'BMW X5',
    jobTitle: '2020',
    industry: '3d-evapremium-z-rantami',
    completeness: 'przod-tyl-bagaznik',
    structure: 'plaster-miodu',
    borderColor: 'red',
    materialColor: 'black',
    includeHooks: true,
    message: 'Dodatkowe uwagi',
    feedbackCompleted: true,
    utmSource: 'facebook',
    utmMedium: 'social',
    utmCampaign: 'test-campaign',
    utmTerm: 'dywaniki',
    utmContent: 'banner',
    gclid: 'test-gclid',
    fbclid: 'test-fbclid',
    sessionId: 'test-session',
    firstVisit: new Date(),
    currentUrl: 'https://example.com',
    userAgent: 'test-agent',
    referrer: 'https://facebook.com',
    feedbackEaseOfChoice: 5,
    feedbackFormClarity: 4,
    feedbackLoadingSpeed: 5,
    feedbackOverallExperience: 4,
    feedbackWouldRecommend: 5,
    feedbackAdditionalComments: 'Świetny formularz'
  };

  describe('mapFormDataToBitrix24Fields', () => {
    it('should map basic user fields correctly', () => {
      const result = mapFormDataToBitrix24Fields(sampleLeadData);

      expect(result.UF_CRM_1757024093869).toBe('Jan'); // Imie
      expect(result.UF_CRM_1757024079437).toBe('Kowalski'); // Nazwisko
      expect(result.UF_CRM_1757024121436).toBe(48123456789); // Telefon (converted to number)
      expect(result.UF_CRM_1757024023213).toBe('262'); // Źródło (META) - bo utmSource = 'facebook'
    });

    it('should map product fields correctly', () => {
      const result = mapFormDataToBitrix24Fields(sampleLeadData);

      expect(result.UF_CRM_1757024835301).toBe('264'); // Rodzaj kompletu (3D EVAPREMIUM)
      expect(result.UF_CRM_1757024931236).toBe('276'); // Wariant kompletu (Przód + Tył + Bagażnik)
      expect(result.UF_CRM_1757025126670).toBe('CZARNY'); // Kolor materiału
      expect(result.UF_CRM_1757177134448).toBe('358'); // Kształt komórek (Plaster Miodu)
      expect(result.UF_CRM_1757177281489).toBe('CZERWONY'); // Kolor obszycia
    });

    it('should map additional fields correctly', () => {
      const result = mapFormDataToBitrix24Fields(sampleLeadData);

      expect(result.UF_CRM_1757178018809).toBe('BMW X5'); // Marka i Model
      expect(result.UF_CRM_1757178102552).toBe('2020'); // Rok Produkcji
      expect(result.UF_CRM_1757178178553).toBe('Dodatkowe uwagi'); // Dodatkowe uwagi
      expect(result.UF_CRM_1757177926352).toBe('TAK'); // Wypełnił Ankiete
    });

    it('should handle missing fields gracefully', () => {
      const minimalData: LeadSubmissionData = {
        firstName: 'Jan',
        phone: '123456789',
        industry: '3d-evapremium-z-rantami',
        completeness: 'przod',
        structure: 'romb',
        borderColor: 'blue',
        materialColor: 'white',
        includeHooks: false,
        feedbackCompleted: false,
        utmSource: 'google',
        utmMedium: 'cpc',
        utmCampaign: 'test',
        utmTerm: 'test',
        utmContent: 'test',
        gclid: 'test',
        fbclid: 'test',
        sessionId: 'test',
        firstVisit: new Date(),
        currentUrl: 'https://test.com',
        userAgent: 'test',
        referrer: 'https://google.com',
        feedbackEaseOfChoice: 0,
        feedbackFormClarity: 0,
        feedbackLoadingSpeed: 0,
        feedbackOverallExperience: 0,
        feedbackWouldRecommend: 0,
        feedbackAdditionalComments: ''
      };

      const result = mapFormDataToBitrix24Fields(minimalData);

      expect(result.UF_CRM_1757024093869).toBe('Jan');
      expect(result.UF_CRM_1757024079437).toBeUndefined(); // lastName not provided
      expect(result.UF_CRM_1757024121436).toBe(123456789);
      expect(result.UF_CRM_1757024835301).toBe('264'); // 3D EVAPREMIUM
      expect(result.UF_CRM_1757024931236).toBe('270'); // Przód
      expect(result.UF_CRM_1757177134448).toBe('360'); // Romby
      expect(result.UF_CRM_1757025126670).toBe('BIAŁY'); // white -> BIAŁY
      expect(result.UF_CRM_1757177281489).toBe('NIEBIESKI'); // blue -> NIEBIESKI
      expect(result.UF_CRM_1757177926352).toBe('NIE'); // feedbackCompleted = false
    });

    it('should set META source only for Facebook traffic', () => {
      const baseData: LeadSubmissionData = {
        firstName: 'Jan',
        phone: '123456789',
        industry: '3d-evapremium-z-rantami',
        completeness: 'przod',
        structure: 'romb',
        borderColor: 'blue',
        materialColor: 'white',
        includeHooks: false,
        feedbackCompleted: false,
        utmSource: 'google',
        utmMedium: 'cpc',
        utmCampaign: 'test',
        utmTerm: 'test',
        utmContent: 'test',
        gclid: 'test',
        fbclid: undefined, // Brak fbclid w danych bazowych
        sessionId: 'test',
        firstVisit: new Date(),
        currentUrl: 'https://test.com',
        userAgent: 'test',
        referrer: 'https://google.com',
        feedbackEaseOfChoice: 0,
        feedbackFormClarity: 0,
        feedbackLoadingSpeed: 0,
        feedbackOverallExperience: 0,
        feedbackWouldRecommend: 0,
        feedbackAdditionalComments: ''
      };

      // Test z Facebook
      const facebookData = { ...baseData, utmSource: 'facebook' };
      const facebookResult = mapFormDataToBitrix24Fields(facebookData);
      expect(facebookResult.UF_CRM_1757024023213).toBe('262'); // META

      // Test z fbclid
      const fbclidData = { ...baseData, fbclid: 'test-fbclid-123' };
      const fbclidResult = mapFormDataToBitrix24Fields(fbclidData);
      expect(fbclidResult.UF_CRM_1757024023213).toBe('262'); // META

      // Test z meta
      const metaData = { ...baseData, utmSource: 'meta' };
      const metaResult = mapFormDataToBitrix24Fields(metaData);
      expect(metaResult.UF_CRM_1757024023213).toBe('262'); // META

      // Test z Google (nie powinno być META)
      const googleData = { ...baseData, utmSource: 'google' };
      const googleResult = mapFormDataToBitrix24Fields(googleData);
      expect(googleResult.UF_CRM_1757024023213).toBeUndefined(); // Brak źródła

      // Test bez źródła (nie powinno być META)
      const noSourceData = { ...baseData, utmSource: undefined };
      const noSourceResult = mapFormDataToBitrix24Fields(noSourceData);
      expect(noSourceResult.UF_CRM_1757024023213).toBeUndefined(); // Brak źródła
    });
  });

  describe('mapToBitrix24Contact', () => {
    it('should map contact data correctly', () => {
      const result = mapToBitrix24Contact(sampleLeadData);

      expect(result.NAME).toBe('Jan');
      expect(result.LAST_NAME).toBe('Kowalski');
      expect(result.PHONE).toEqual([{ VALUE: '+48 123 456 789', VALUE_TYPE: 'WORK' }]);
      expect(result.EMAIL).toEqual([{ VALUE: 'jan@example.com', VALUE_TYPE: 'WORK' }]);
      expect(result.SOURCE_ID).toBe('WEB'); // facebook -> WEB
      expect(result.SOURCE_DESCRIPTION).toBe('test-campaign');
    });
  });

  describe('mapToBitrix24Deal', () => {
    it('should map deal data correctly', () => {
      const result = mapToBitrix24Deal(sampleLeadData);

      expect(result.TITLE).toBe('Dywaniki EVAPREMIUM - BMW X5');
      expect(result.CATEGORY_ID).toBe(2); // "Leady z Reklam"
      expect(result.STAGE_ID).toBe('NEW');
      expect(result.STAGE_SEMANTIC_ID).toBe('P');
      expect(result.CURRENCY_ID).toBe('PLN');
      expect(result.TYPE_ID).toBe('SALE');
      
      // UTM fields
      expect(result.UTM_SOURCE).toBe('facebook');
      expect(result.UTM_MEDIUM).toBe('social');
      expect(result.UTM_CAMPAIGN).toBe('test-campaign');
      
      // Lead fields
      expect(result.UF_CRM_1757024093869).toBe('Jan');
      expect(result.UF_CRM_1757024079437).toBe('Kowalski');
      expect(result.UF_CRM_1757024121436).toBe(48123456789);
      expect(result.UF_CRM_1757024023213).toBe('262');
    });

    it('should calculate opportunity correctly', () => {
      const result = mapToBitrix24Deal(sampleLeadData);
      
      // 3D EVAPREMIUM (200) * Przód + Tył + Bagażnik (1.0) = 200
      expect(result.OPPORTUNITY).toBe(200);
    });
  });
});
