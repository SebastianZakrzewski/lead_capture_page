export interface Bitrix24Response {
  result: number | string;
  error?: {
    error: string;
    error_description: string;
  };
}

export interface Bitrix24DealData {
  TITLE: string;
  CONTACT_ID?: number;
  CATEGORY_ID: number;
  STAGE_ID: string;
  STAGE_SEMANTIC_ID: string;
  CURRENCY_ID: string;
  OPPORTUNITY: number;
  COMMENTS?: string;
  SOURCE_ID?: string;
  SOURCE_DESCRIPTION?: string;
  TYPE_ID: string;
  // Pola UTM tracking
  UTM_SOURCE?: string;
  UTM_MEDIUM?: string;
  UTM_CAMPAIGN?: string;
  UTM_TERM?: string;
  UTM_CONTENT?: string;
  
  // Nowe pola z kolumny "Leady z Reklam"
  UF_CRM_1757024093869?: string; // Imie
  UF_CRM_1757024079437?: string; // Nazwisko
  UF_CRM_1757024121436?: number; // Telefon
  UF_CRM_1757024023213?: string; // Źródło
  UF_CRM_1757024835301?: string; // Rodzaj kompletu
  UF_CRM_1757024931236?: string; // Wariant kompletu
  UF_CRM_1757025126670?: string; // Kolor materiału
  UF_CRM_1757177134448?: string; // Kształt komórek
  UF_CRM_1757177281489?: string; // Kolor obszycia
  UF_CRM_1757178018809?: string; // Marka i Model
  UF_CRM_1757178102552?: string; // Rok Produkcji
  UF_CRM_1757178178553?: string; // Dodatkowe uwagi dział produkcji
  UF_CRM_1757177926352?: string; // Wypełnił Ankiete
}

export interface Bitrix24ContactData {
  NAME: string;
  LAST_NAME?: string;
  PHONE?: Array<{VALUE: string, VALUE_TYPE: string}>;
  EMAIL?: Array<{VALUE: string, VALUE_TYPE: string}>;
  COMMENTS?: string;
  SOURCE_ID?: string;
  SOURCE_DESCRIPTION?: string;
}

export class Bitrix24Service {
  private static readonly BITRIX24_URL = "https://evapremium.bitrix24.pl/rest/1/se41mx3ts2o2nikj/";
  private static readonly BITRIX24_USER_ID = "1";
  private static readonly BITRIX24_DEAL_CATEGORY_ID = 2; // "Leady z Reklam"

  /**
   * Testuje połączenie z Bitrix24
   */
  static async testConnection(): Promise<boolean> {
    try {
      console.log('🔍 Testowanie połączenia z Bitrix24...');
      console.log('🌐 URL:', this.BITRIX24_URL);

      const response = await fetch(`${this.BITRIX24_URL}crm.deal.list`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'User-Agent': 'LeadCaptureForm/1.0'
        },
        body: JSON.stringify({
          select: ['ID'],
          filter: {},
          start: 0
        })
      });

      const result: Bitrix24Response = await response.json();
      
      if (result.error) {
        console.error('❌ Błąd połączenia z Bitrix24:', result.error);
        return false;
      }

      console.log('✅ Połączenie z Bitrix24 działa poprawnie');
      return true;
    } catch (error) {
      console.error('❌ Błąd testowania połączenia z Bitrix24:', error);
      return false;
    }
  }

  /**
   * Tworzy pusty deal w kategorii "Leady z Reklam" (do testów)
   */
  static async createEmptyDeal(): Promise<{ success: boolean; dealId?: number; error?: string }> {
    try {
      console.log('🚀 Bitrix24Service: Tworzę pusty deal w kategorii "Leady z Reklam"');

      const dealData: Bitrix24DealData = {
        TITLE: "Test Lead - Pusty Deal",
        CATEGORY_ID: this.BITRIX24_DEAL_CATEGORY_ID,
        STAGE_ID: "NEW",
        STAGE_SEMANTIC_ID: "P",
        CURRENCY_ID: "PLN",
        OPPORTUNITY: 0,
        COMMENTS: "Pusty lead utworzony do testowania integracji",
        TYPE_ID: "SALE"
      };

      console.log('📋 Dane deala:', dealData);

      const response = await fetch(`${this.BITRIX24_URL}crm.deal.add`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'User-Agent': 'LeadCaptureForm/1.0'
        },
        body: JSON.stringify({
          fields: dealData
        })
      });

      const result: Bitrix24Response = await response.json();
      
      if (result.error) {
        console.error('❌ Błąd tworzenia deala:', result.error);
        return { 
          success: false, 
          error: `Bitrix24 deal creation failed: ${result.error.error_description}` 
        };
      }

      const dealId = result.result as number;
      console.log('✅ Pusty deal utworzony z ID:', dealId);

      return { 
        success: true, 
        dealId: dealId 
      };
    } catch (error) {
      console.error('❌ Błąd tworzenia pustego deala:', error);
      return { 
        success: false, 
        error: `Error creating empty deal: ${error instanceof Error ? error.message : String(error)}` 
      };
    }
  }

  /**
   * Tworzy pusty lead w Bitrix24 po wysłaniu formularza
   */
  static async createEmptyLeadAfterFormSubmission(): Promise<{ success: boolean; dealId?: number; error?: string }> {
    try {
      console.log('🚀 Bitrix24Service: Tworzę pusty lead po wysłaniu formularza');

      const dealData: Bitrix24DealData = {
        TITLE: "Nowy Lead - Formularz",
        CATEGORY_ID: this.BITRIX24_DEAL_CATEGORY_ID,
        STAGE_ID: "NEW",
        STAGE_SEMANTIC_ID: "P",
        CURRENCY_ID: "PLN",
        OPPORTUNITY: 0,
        COMMENTS: "Lead utworzony automatycznie po wysłaniu formularza",
        TYPE_ID: "SALE"
      };

      console.log('📋 Dane leada:', dealData);

      const response = await fetch(`${this.BITRIX24_URL}crm.deal.add`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'User-Agent': 'LeadCaptureForm/1.0'
        },
        body: JSON.stringify({
          fields: dealData
        })
      });

      const result: Bitrix24Response = await response.json();
      
      if (result.error) {
        console.error('❌ Błąd tworzenia leada:', result.error);
        return { 
          success: false, 
          error: `Bitrix24 lead creation failed: ${result.error.error_description}` 
        };
      }

      const dealId = result.result as number;
      console.log('✅ Pusty lead utworzony z ID:', dealId);

      return { 
        success: true, 
        dealId: dealId 
      };
    } catch (error) {
      console.error('❌ Błąd tworzenia pustego leada:', error);
      return { 
        success: false, 
        error: `Error creating empty lead: ${error instanceof Error ? error.message : String(error)}` 
      };
    }
  }

  /**
   * Tworzy kontakt w Bitrix24
   */
  static async createContact(contactData: Bitrix24ContactData): Promise<{ success: boolean; contactId?: number; error?: string }> {
    try {
      console.log('🚀 Bitrix24Service: Tworzę kontakt');

      console.log('📋 Dane kontaktu:', contactData);

      const response = await fetch(`${this.BITRIX24_URL}crm.contact.add`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'User-Agent': 'LeadCaptureForm/1.0'
        },
        body: JSON.stringify({
          fields: contactData
        })
      });

      const result: Bitrix24Response = await response.json();
      
      if (result.error) {
        console.error('❌ Błąd tworzenia kontaktu:', result.error);
        return { 
          success: false, 
          error: `Bitrix24 contact creation failed: ${result.error.error_description}` 
        };
      }

      const contactId = result.result as number;
      console.log('✅ Kontakt utworzony z ID:', contactId);

      return { 
        success: true, 
        contactId: contactId 
      };
    } catch (error) {
      console.error('❌ Błąd tworzenia kontaktu:', error);
      return { 
        success: false, 
        error: `Error creating contact: ${error instanceof Error ? error.message : String(error)}` 
      };
    }
  }

  /**
   * Tworzy deal w kategorii "Leady z Reklam"
   */
  static async createDeal(dealData: Bitrix24DealData): Promise<{ success: boolean; dealId?: number; error?: string }> {
    try {
      console.log('🚀 Bitrix24Service: Tworzę deal w kategorii "Leady z Reklam"');

      // Ustaw kategorię na "Leady z Reklam"
      const dealDataWithCategory = {
        ...dealData,
        CATEGORY_ID: this.BITRIX24_DEAL_CATEGORY_ID
      };

      console.log('📋 Dane deala:', dealDataWithCategory);
      console.log('🔍 Szczegóły pól deala:', {
        'UF_CRM_1757024835301 (Rodzaj kompletu)': dealDataWithCategory.UF_CRM_1757024835301,
        'UF_CRM_1757024931236 (Wariant kompletu)': dealDataWithCategory.UF_CRM_1757024931236,
        'UF_CRM_1757025126670 (Kolor materiału)': dealDataWithCategory.UF_CRM_1757025126670,
        'UF_CRM_1757177134448 (Kształt komórek)': dealDataWithCategory.UF_CRM_1757177134448,
        'UF_CRM_1757177281489 (Kolor obszycia)': dealDataWithCategory.UF_CRM_1757177281489
      });

      const response = await fetch(`${this.BITRIX24_URL}crm.deal.add`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'User-Agent': 'LeadCaptureForm/1.0'
        },
        body: JSON.stringify({
          fields: dealDataWithCategory
        })
      });

      const result: Bitrix24Response = await response.json();
      
      if (result.error) {
        console.error('❌ Błąd tworzenia deala:', result.error);
        return { 
          success: false, 
          error: `Bitrix24 deal creation failed: ${result.error.error_description}` 
        };
      }

      const dealId = result.result as number;
      console.log('✅ Deal utworzony z ID:', dealId);

      return { 
        success: true, 
        dealId: dealId 
      };
    } catch (error) {
      console.error('❌ Błąd tworzenia deala:', error);
      return { 
        success: false, 
        error: `Error creating deal: ${error instanceof Error ? error.message : String(error)}` 
      };
    }
  }

  /**
   * Tworzy deal z kontaktem w kategorii "Leady z Reklam"
   */
  static async createDealWithContact(
    contactData: Bitrix24ContactData, 
    dealData: Omit<Bitrix24DealData, 'CONTACT_ID'>
  ): Promise<{ 
    success: boolean; 
    dealId?: number; 
    contactId?: number; 
    error?: string 
  }> {
    try {
      console.log('🚀 Bitrix24Service: Tworzę deal z kontaktem w kategorii "Leady z Reklam"');

      // 1. Utwórz kontakt
      const contactResult = await this.createContact(contactData);
      if (!contactResult.success) {
        return { 
          success: false, 
          error: `Failed to create contact: ${contactResult.error}` 
        };
      }

      // 2. Utwórz deal z kontaktem
      const dealDataWithContact = {
        ...dealData,
        CONTACT_ID: contactResult.contactId
      };

      const dealResult = await this.createDeal(dealDataWithContact);
      if (!dealResult.success) {
        return { 
          success: false, 
          error: `Failed to create deal: ${dealResult.error}` 
        };
      }

      console.log('✅ Deal z kontaktem utworzony pomyślnie');

      return { 
        success: true, 
        dealId: dealResult.dealId,
        contactId: contactResult.contactId
      };
    } catch (error) {
      console.error('❌ Błąd tworzenia deala z kontaktem:', error);
      return { 
        success: false, 
        error: `Error creating deal with contact: ${error instanceof Error ? error.message : String(error)}` 
      };
    }
  }

  /**
   * Pobiera listę deali z kategorii "Leady z Reklam"
   */
  static async getDeals(_limit: number = 10): Promise<{ success: boolean; deals?: unknown[]; error?: string }> {
    try {
      console.log('🔍 Pobieranie listy deali z kategorii "Leady z Reklam"...');

      const response = await fetch(`${this.BITRIX24_URL}crm.deal.list`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'User-Agent': 'LeadCaptureForm/1.0'
        },
        body: JSON.stringify({
          select: ['ID', 'TITLE', 'STAGE_ID', 'OPPORTUNITY', 'CREATED', 'CATEGORY_ID'],
          filter: {
            CATEGORY_ID: this.BITRIX24_DEAL_CATEGORY_ID
          },
          order: { CREATED: 'DESC' },
          start: 0
        })
      });

      const result: Bitrix24Response = await response.json();
      
      if (result.error) {
        console.error('❌ Błąd pobierania deali:', result.error);
        return { 
          success: false, 
          error: `Bitrix24 deals fetch failed: ${result.error.error_description}` 
        };
      }

      const deals = Array.isArray(result.result) ? result.result : [];
      console.log('✅ Pobrano deali z kategorii "Leady z Reklam":', deals.length);

      return { 
        success: true, 
        deals: deals 
      };
    } catch (error) {
      console.error('❌ Błąd pobierania deali:', error);
      return { 
        success: false, 
        error: `Error fetching deals: ${error instanceof Error ? error.message : String(error)}` 
      };
    }
  }

  /**
   * Pobiera szczegóły deala po ID
   */
  static async getDealById(dealId: number): Promise<{ success: boolean; deal?: unknown; error?: string }> {
    try {
      console.log('🔍 Pobieranie deala z ID:', dealId);

      const response = await fetch(`${this.BITRIX24_URL}crm.deal.get`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'User-Agent': 'LeadCaptureForm/1.0'
        },
        body: JSON.stringify({
          id: dealId
        })
      });

      const result: Bitrix24Response = await response.json();
      
      if (result.error) {
        console.error('❌ Błąd pobierania deala:', result.error);
        return { 
          success: false, 
          error: `Bitrix24 deal fetch failed: ${result.error.error_description}` 
        };
      }

      const deal = result.result;
      console.log('✅ Pobrano deal:', JSON.stringify(deal, null, 2));

      return { 
        success: true, 
        deal: deal 
      };
    } catch (error) {
      console.error('❌ Błąd pobierania deala:', error);
      return { 
        success: false, 
        error: `Error fetching deal: ${error instanceof Error ? error.message : String(error)}` 
      };
    }
  }

  /**
   * Aktualizuje kontakt w Bitrix24
   */
  static async updateContact(contactId: number, contactData: Bitrix24ContactData): Promise<{ success: boolean; error?: string }> {
    try {
      console.log('🔄 Bitrix24Service: Aktualizuję kontakt z ID:', contactId);

      console.log('📋 Dane kontaktu do aktualizacji:', contactData);

      const response = await fetch(`${this.BITRIX24_URL}crm.contact.update`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'User-Agent': 'LeadCaptureForm/1.0'
        },
        body: JSON.stringify({
          id: contactId,
          fields: contactData
        })
      });

      const result: Bitrix24Response = await response.json();
      
      if (result.error) {
        console.error('❌ Błąd aktualizacji kontaktu:', result.error);
        return { 
          success: false, 
          error: `Bitrix24 contact update failed: ${result.error.error_description}` 
        };
      }

      console.log('✅ Kontakt zaktualizowany pomyślnie');

      return { 
        success: true
      };
    } catch (error) {
      console.error('❌ Błąd aktualizacji kontaktu:', error);
      return { 
        success: false, 
        error: `Error updating contact: ${error instanceof Error ? error.message : String(error)}` 
      };
    }
  }

  /**
   * Aktualizuje deal w Bitrix24
   */
  static async updateDeal(dealId: number, dealData: Bitrix24DealData): Promise<{ success: boolean; error?: string }> {
    try {
      console.log('🔄 Bitrix24Service: Aktualizuję deal z ID:', dealId);

      // Ustaw kategorię na "Leady z Reklam"
      const dealDataWithCategory = {
        ...dealData,
        CATEGORY_ID: this.BITRIX24_DEAL_CATEGORY_ID
      };

      console.log('📋 Dane deala do aktualizacji:', dealDataWithCategory);

      const response = await fetch(`${this.BITRIX24_URL}crm.deal.update`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'User-Agent': 'LeadCaptureForm/1.0'
        },
        body: JSON.stringify({
          id: dealId,
          fields: dealDataWithCategory
        })
      });

      const result: Bitrix24Response = await response.json();
      
      if (result.error) {
        console.error('❌ Błąd aktualizacji deala:', result.error);
        return { 
          success: false, 
          error: `Bitrix24 deal update failed: ${result.error.error_description}` 
        };
      }

      console.log('✅ Deal zaktualizowany pomyślnie');

      return { 
        success: true
      };
    } catch (error) {
      console.error('❌ Błąd aktualizacji deala:', error);
      return { 
        success: false, 
        error: `Error updating deal: ${error instanceof Error ? error.message : String(error)}` 
      };
    }
  }
}
