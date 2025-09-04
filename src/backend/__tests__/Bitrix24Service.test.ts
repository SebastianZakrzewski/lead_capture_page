import { Bitrix24Service, Bitrix24ContactData, Bitrix24DealData } from '../services/Bitrix24Service';

// Mock fetch
global.fetch = jest.fn();

describe('Bitrix24Service', () => {
  beforeEach(() => {
    (fetch as jest.Mock).mockClear();
  });

  describe('testConnection', () => {
    it('should return true when connection is successful', async () => {
      const mockResponse = {
        result: [{ ID: '1' }]
      };

      (fetch as jest.Mock).mockResolvedValueOnce({
        json: async () => mockResponse
      });

      const result = await Bitrix24Service.testConnection();

      expect(result).toBe(true);
      expect(fetch).toHaveBeenCalledWith(
        'https://b24-v7jz9p.bitrix24.pl/rest/1/se41mx3ts2o2nikj/crm.deal.list',
        expect.objectContaining({
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'User-Agent': 'LeadCaptureForm/1.0'
          }
        })
      );
    });

    it('should return false when connection fails', async () => {
      const mockResponse = {
        error: {
          error: 'INVALID_REQUEST',
          error_description: 'Invalid request'
        }
      };

      (fetch as jest.Mock).mockResolvedValueOnce({
        json: async () => mockResponse
      });

      const result = await Bitrix24Service.testConnection();

      expect(result).toBe(false);
    });

    it('should return false when network error occurs', async () => {
      (fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

      const result = await Bitrix24Service.testConnection();

      expect(result).toBe(false);
    });
  });

  describe('createEmptyDeal', () => {
    it('should create empty deal successfully', async () => {
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
          body: JSON.stringify({
            fields: expect.objectContaining({
              TITLE: 'Test Lead - Pusty Deal',
              CATEGORY_ID: 2,
              STAGE_ID: 'NEW',
              STAGE_SEMANTIC_ID: 'P',
              CURRENCY_ID: 'PLN',
              OPPORTUNITY: 0,
              TYPE_ID: 'SALE'
            })
          })
        })
      );
    });

    it('should handle error when creating deal fails', async () => {
      const mockResponse = {
        error: {
          error: 'INVALID_FIELD',
          error_description: 'Field not found'
        }
      };

      (fetch as jest.Mock).mockResolvedValueOnce({
        json: async () => mockResponse
      });

      const result = await Bitrix24Service.createEmptyDeal();

      expect(result.success).toBe(false);
      expect(result.error).toContain('Bitrix24 deal creation failed');
    });
  });

  describe('createContact', () => {
    it('should create contact successfully', async () => {
      const mockResponse = {
        result: 67890
      };

      const contactData: Bitrix24ContactData = {
        NAME: 'Jan',
        LAST_NAME: 'Kowalski',
        PHONE: [{ VALUE: '123456789', VALUE_TYPE: 'WORK' }],
        EMAIL: [{ VALUE: 'jan@example.com', VALUE_TYPE: 'WORK' }]
      };

      (fetch as jest.Mock).mockResolvedValueOnce({
        json: async () => mockResponse
      });

      const result = await Bitrix24Service.createContact(contactData);

      expect(result.success).toBe(true);
      expect(result.contactId).toBe(67890);
      expect(fetch).toHaveBeenCalledWith(
        'https://b24-v7jz9p.bitrix24.pl/rest/1/se41mx3ts2o2nikj/crm.contact.add',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({
            fields: contactData
          })
        })
      );
    });

    it('should handle error when creating contact fails', async () => {
      const mockResponse = {
        error: {
          error: 'INVALID_FIELD',
          error_description: 'Field not found'
        }
      };

      const contactData: Bitrix24ContactData = {
        NAME: 'Jan'
      };

      (fetch as jest.Mock).mockResolvedValueOnce({
        json: async () => mockResponse
      });

      const result = await Bitrix24Service.createContact(contactData);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Bitrix24 contact creation failed');
    });
  });

  describe('createDeal', () => {
    it('should create deal successfully', async () => {
      const mockResponse = {
        result: 11111
      };

      const dealData: Bitrix24DealData = {
        TITLE: 'Test Deal',
        CATEGORY_ID: 2,
        STAGE_ID: 'NEW',
        STAGE_SEMANTIC_ID: 'P',
        CURRENCY_ID: 'PLN',
        OPPORTUNITY: 1000,
        TYPE_ID: 'SALE'
      };

      (fetch as jest.Mock).mockResolvedValueOnce({
        json: async () => mockResponse
      });

      const result = await Bitrix24Service.createDeal(dealData);

      expect(result.success).toBe(true);
      expect(result.dealId).toBe(11111);
    });
  });

  describe('createDealWithContact', () => {
    it('should create deal with contact successfully', async () => {
      const contactResponse = {
        result: 22222
      };

      const dealResponse = {
        result: 33333
      };

      (fetch as jest.Mock)
        .mockResolvedValueOnce({
          json: async () => contactResponse
        })
        .mockResolvedValueOnce({
          json: async () => dealResponse
        });

      const contactData: Bitrix24ContactData = {
        NAME: 'Jan',
        LAST_NAME: 'Kowalski'
      };

      const dealData: Omit<Bitrix24DealData, 'CONTACT_ID'> = {
        TITLE: 'Test Deal with Contact',
        CATEGORY_ID: 2,
        STAGE_ID: 'NEW',
        STAGE_SEMANTIC_ID: 'P',
        CURRENCY_ID: 'PLN',
        OPPORTUNITY: 1000,
        TYPE_ID: 'SALE'
      };

      const result = await Bitrix24Service.createDealWithContact(contactData, dealData);

      expect(result.success).toBe(true);
      expect(result.contactId).toBe(22222);
      expect(result.dealId).toBe(33333);
      expect(fetch).toHaveBeenCalledTimes(2);
    });

    it('should handle error when contact creation fails', async () => {
      const mockResponse = {
        error: {
          error: 'INVALID_FIELD',
          error_description: 'Field not found'
        }
      };

      (fetch as jest.Mock).mockResolvedValueOnce({
        json: async () => mockResponse
      });

      const contactData: Bitrix24ContactData = {
        NAME: 'Jan'
      };

      const dealData: Omit<Bitrix24DealData, 'CONTACT_ID'> = {
        TITLE: 'Test Deal',
        CATEGORY_ID: 2,
        STAGE_ID: 'NEW',
        STAGE_SEMANTIC_ID: 'P',
        CURRENCY_ID: 'PLN',
        OPPORTUNITY: 1000,
        TYPE_ID: 'SALE'
      };

      const result = await Bitrix24Service.createDealWithContact(contactData, dealData);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Failed to create contact');
    });
  });

  describe('getDeals', () => {
    it('should fetch deals successfully', async () => {
      const mockResponse = {
        result: [
          { ID: '1', TITLE: 'Deal 1', STAGE_ID: 'NEW' },
          { ID: '2', TITLE: 'Deal 2', STAGE_ID: 'CONTACT' }
        ]
      };

      (fetch as jest.Mock).mockResolvedValueOnce({
        json: async () => mockResponse
      });

      const result = await Bitrix24Service.getDeals(5);

      expect(result.success).toBe(true);
      expect(result.deals).toHaveLength(2);
      expect(fetch).toHaveBeenCalledWith(
        'https://b24-v7jz9p.bitrix24.pl/rest/1/se41mx3ts2o2nikj/crm.deal.list',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({
            select: ['ID', 'TITLE', 'STAGE_ID', 'OPPORTUNITY', 'CREATED', 'CATEGORY_ID'],
            filter: {
              CATEGORY_ID: 2
            },
            order: { CREATED: 'DESC' },
            start: 0
          })
        })
      );
    });

    it('should handle error when fetching deals fails', async () => {
      const mockResponse = {
        error: {
          error: 'ACCESS_DENIED',
          error_description: 'Access denied'
        }
      };

      (fetch as jest.Mock).mockResolvedValueOnce({
        json: async () => mockResponse
      });

      const result = await Bitrix24Service.getDeals();

      expect(result.success).toBe(false);
      expect(result.error).toContain('Bitrix24 deals fetch failed');
    });
  });

  describe('getDealById', () => {
    it('should fetch deal by ID successfully', async () => {
      const mockResponse = {
        result: {
          ID: '12345',
          TITLE: 'Test Deal',
          STAGE_ID: 'NEW'
        }
      };

      (fetch as jest.Mock).mockResolvedValueOnce({
        json: async () => mockResponse
      });

      const result = await Bitrix24Service.getDealById(12345);

      expect(result.success).toBe(true);
      expect(result.deal).toEqual(mockResponse.result);
      expect(fetch).toHaveBeenCalledWith(
        'https://b24-v7jz9p.bitrix24.pl/rest/1/se41mx3ts2o2nikj/crm.deal.get',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({
            id: 12345
          })
        })
      );
    });

    it('should handle error when fetching deal by ID fails', async () => {
      const mockResponse = {
        error: {
          error: 'NOT_FOUND',
          error_description: 'Deal not found'
        }
      };

      (fetch as jest.Mock).mockResolvedValueOnce({
        json: async () => mockResponse
      });

      const result = await Bitrix24Service.getDealById(99999);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Bitrix24 deal fetch failed');
    });
  });
});
