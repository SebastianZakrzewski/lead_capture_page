import { Bitrix24Service } from '../services/Bitrix24Service';

// Mock fetch
global.fetch = jest.fn();

describe('Bitrix24 Empty Lead Integration Tests', () => {
  beforeEach(() => {
    (fetch as jest.Mock).mockClear();
  });

  describe('createEmptyDeal - Test dodawania pustego leada do kolumny "Leady z Reklam"', () => {
    it('should successfully create empty lead in "Leady z Reklam" category', async () => {
      const mockResponse = {
        result: 12345
      };

      (fetch as jest.Mock).mockResolvedValueOnce({
        json: async () => mockResponse
      });

      const result = await Bitrix24Service.createEmptyDeal();

      expect(result.success).toBe(true);
      expect(result.dealId).toBe(12345);
      expect(fetch).toHaveBeenCalledWith(
        'https://b24-v7jz9p.bitrix24.pl/rest/1/se41mx3ts2o2nikj/crm.deal.add',
        expect.objectContaining({
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'User-Agent': 'LeadCaptureForm/1.0'
          },
          body: expect.stringContaining('"TITLE":"Test Lead - Pusty Deal"')
        })
      );
    });

    it('should handle Bitrix24 API errors when creating empty lead', async () => {
      const mockResponse = {
        error: {
          error: 'INVALID_FIELD',
          error_description: 'Field CATEGORY_ID not found or invalid'
        }
      };

      (fetch as jest.Mock).mockResolvedValueOnce({
        json: async () => mockResponse
      });

      const result = await Bitrix24Service.createEmptyDeal();

      expect(result.success).toBe(false);
      expect(result.error).toContain('Bitrix24 deal creation failed');
      expect(result.error).toContain('Field CATEGORY_ID not found or invalid');
    });

    it('should handle network errors when creating empty lead', async () => {
      (fetch as jest.Mock).mockRejectedValueOnce(new Error('Network timeout'));

      const result = await Bitrix24Service.createEmptyDeal();

      expect(result.success).toBe(false);
      expect(result.error).toContain('Error creating empty deal');
      expect(result.error).toContain('Network timeout');
    });

    it('should verify correct category ID for "Leady z Reklam"', async () => {
      const mockResponse = {
        result: 99999
      };

      (fetch as jest.Mock).mockResolvedValueOnce({
        json: async () => mockResponse
      });

      await Bitrix24Service.createEmptyDeal();

      const callArgs = (fetch as jest.Mock).mock.calls[0];
      const requestBody = JSON.parse(callArgs[1].body);
      
      expect(requestBody.fields.CATEGORY_ID).toBe(2);
      expect(requestBody.fields.TITLE).toBe('Test Lead - Pusty Deal');
    });
  });

  describe('createEmptyLeadAfterFormSubmission - Test dodawania pustego leada po wysłaniu formularza', () => {
    it('should successfully create empty lead after form submission', async () => {
      const mockResponse = {
        result: 54321
      };

      (fetch as jest.Mock).mockResolvedValueOnce({
        json: async () => mockResponse
      });

      const result = await Bitrix24Service.createEmptyLeadAfterFormSubmission();

      expect(result.success).toBe(true);
      expect(result.dealId).toBe(54321);
      expect(fetch).toHaveBeenCalledWith(
        'https://b24-v7jz9p.bitrix24.pl/rest/1/se41mx3ts2o2nikj/crm.deal.add',
        expect.objectContaining({
          method: 'POST',
          body: expect.stringContaining('"TITLE":"Nowy Lead - Formularz"')
        })
      );
    });
  });

  describe('Integration Test - Sprawdzenie czy można dodać pustego leada', () => {
    it('should verify that empty lead can be added to "Leady z Reklam" column', async () => {
      // Test 1: Sprawdzenie połączenia
      const connectionResponse = {
        result: [{ ID: '1' }]
      };

      (fetch as jest.Mock).mockResolvedValueOnce({
        json: async () => connectionResponse
      });

      const connectionTest = await Bitrix24Service.testConnection();
      expect(connectionTest).toBe(true);

      // Test 2: Utworzenie pustego leada
      const emptyLeadResponse = {
        result: 77777
      };

      (fetch as jest.Mock).mockResolvedValueOnce({
        json: async () => emptyLeadResponse
      });

      const emptyLeadResult = await Bitrix24Service.createEmptyDeal();
      expect(emptyLeadResult.success).toBe(true);
      expect(emptyLeadResult.dealId).toBe(77777);

      // Test 3: Sprawdzenie czy lead został utworzony w odpowiedniej kategorii
      const dealDetailsResponse = {
        result: {
          ID: '77777',
          TITLE: 'Test Lead - Pusty Deal',
          CATEGORY_ID: '2',
          STAGE_ID: 'NEW'
        }
      };

      (fetch as jest.Mock).mockResolvedValueOnce({
        json: async () => dealDetailsResponse
      });

      const dealDetails = await Bitrix24Service.getDealById(77777);
      expect(dealDetails.success).toBe(true);
      expect(dealDetails.deal).toEqual(dealDetailsResponse.result);
    });
  });

  describe('Error Handling Tests', () => {
    it('should handle invalid API response format', async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({
        json: async () => ({}) // Empty response
      });

      const result = await Bitrix24Service.createEmptyDeal();

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });

    it('should handle malformed JSON response', async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({
        json: async () => {
          throw new Error('Invalid JSON');
        }
      });

      const result = await Bitrix24Service.createEmptyDeal();

      expect(result.success).toBe(false);
      expect(result.error).toContain('Error creating empty deal');
    });
  });
});
