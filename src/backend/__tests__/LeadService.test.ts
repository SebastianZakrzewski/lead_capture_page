import { LeadService } from '../services/LeadService';

// Mock Supabase
jest.mock('../database', () => ({
  supabase: {
    from: jest.fn(() => ({
      insert: jest.fn(() => ({
        select: jest.fn(() => ({
          single: jest.fn(),
        })),
      })),
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          single: jest.fn(),
        })),
        order: jest.fn(() => ({
          range: jest.fn(() => ({
            select: jest.fn(),
          })),
        })),
      })),
      update: jest.fn(() => ({
        eq: jest.fn(() => ({
          select: jest.fn(() => ({
            single: jest.fn(),
          })),
        })),
      })),
      delete: jest.fn(() => ({
        eq: jest.fn(() => ({ error: null })),
      })),
    })),
  },
}));

describe('LeadService', () => {
  let mockSingle: jest.Mock;
  let mockRange: jest.Mock;
  let mockOrder: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Get references to mock functions
    const { supabase } = require('../database');
    mockSingle = supabase.from().insert().select().single();
    mockRange = supabase.from().select().order().range();
    mockOrder = supabase.from().select().order();
  });

  describe('createLead', () => {
    it('powinien utworzyć nowego leada z poprawnymi danymi', async () => {
      const mockLead = {
        id: 'test-id-123',
        firstName: 'Jan',
        phone: '+48123456789',
        email: 'jan@example.com',
        company: 'BMW X5',
        jobTitle: '2020',
        industry: '3d-evapremium-z-rantami',
        completeness: 'przod-tyl',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockSingle.mockResolvedValue({ data: mockLead, error: null });

      const result = await LeadService.createLead({
        firstName: 'Jan',
        phone: '+48123456789',
        email: 'jan@example.com',
        company: 'BMW X5',
        jobTitle: '2020',
        industry: '3d-evapremium-z-rantami',
        completeness: 'przod-tyl',
      });

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockLead);
    });

    it('powinien utworzyć leada tylko z wymaganymi polami', async () => {
      const mockLead = {
        id: 'test-id-456',
        firstName: 'Anna',
        phone: '+48987654321',
        email: null,
        company: null,
        jobTitle: null,
        industry: null,
        completeness: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockSingle.mockResolvedValue({ data: mockLead, error: null });

      const result = await LeadService.createLead({
        firstName: 'Anna',
        phone: '+48987654321',
      });

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockLead);
    });

    it('powinien obsłużyć błąd podczas tworzenia leada', async () => {
      mockSingle.mockResolvedValue({ data: null, error: new Error('Database connection failed') });

      const result = await LeadService.createLead({
        firstName: 'Jan',
        phone: '+48123456789',
      });

      expect(result.success).toBe(false);
      expect(result.error).toBe('Nie udało się zapisać leada');
    });
  });

  describe('getLeadById', () => {
    it('powinien pobrać leada po ID', async () => {
      const mockLead = {
        id: 'test-id-123',
        firstName: 'Jan',
        phone: '+48123456789',
        email: 'jan@example.com',
        company: 'BMW X5',
        jobTitle: '2020',
        industry: '3d-evapremium-z-rantami',
        completeness: 'przod-tyl',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockSingle.mockResolvedValue({ data: mockLead, error: null });

      const result = await LeadService.getLeadById('test-id-123');

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockLead);
    });

    it('powinien zwrócić błąd gdy lead nie istnieje', async () => {
      mockSingle.mockResolvedValue({ data: null, error: new Error('Lead not found') });

      const result = await LeadService.getLeadById('nieistniejace-id');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Nie udało się pobrać leada');
    });
  });

  describe('getLeadByPhone', () => {
    it('powinien pobrać leada po numerze telefonu', async () => {
      const mockLead = {
        id: 'test-id-123',
        firstName: 'Jan',
        phone: '+48123456789',
        email: 'jan@example.com',
        company: 'BMW X5',
        jobTitle: '2020',
        industry: '3d-evapremium-z-rantami',
        completeness: 'przod-tyl',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockSingle.mockResolvedValue({ data: mockLead, error: null });

      const result = await LeadService.getLeadByPhone('+48123456789');

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockLead);
    });
  });

  describe('getAllLeads', () => {
    it('powinien pobrać wszystkie leady posortowane po dacie utworzenia', async () => {
      const mockLeads = [
        {
          id: 'test-id-1',
          firstName: 'Jan',
          phone: '+48123456789',
          createdAt: new Date('2024-01-02'),
          updatedAt: new Date('2024-01-02'),
        },
        {
          id: 'test-id-2',
          firstName: 'Anna',
          phone: '+48987654321',
          createdAt: new Date('2024-01-01'),
          updatedAt: new Date('2024-01-01'),
        },
      ];

      mockOrder().range().select().mockResolvedValue({ data: mockLeads, error: null });

      const result = await LeadService.getAllLeads();

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockLeads);
    });
  });

  describe('updateLead', () => {
    it('powinien zaktualizować dane leada', async () => {
      const mockUpdatedLead = {
        id: 'test-id-123',
        firstName: 'Jan',
        phone: '+48123456789',
        email: 'jan.nowy@example.com',
        company: 'Audi A4',
        jobTitle: '2021',
        industry: '3d-evapremium-bez-rantow',
        completeness: 'przod-tyl-bagaznik',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockSingle.mockResolvedValue({ data: mockUpdatedLead, error: null });

      const result = await LeadService.updateLead('test-id-123', {
        email: 'jan.nowy@example.com',
        company: 'Audi A4',
        jobTitle: '2021',
        industry: '3d-evapremium-bez-rantow',
        completeness: 'przod-tyl-bagaznik',
      });

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockUpdatedLead);
    });
  });

  describe('deleteLead', () => {
    it('powinien usunąć leada', async () => {
      const result = await LeadService.deleteLead('test-id-123');

      expect(result.success).toBe(true);
      expect(result.message).toBe('Lead został usunięty');
    });
  });

  describe('getLeadsWithPagination', () => {
    it('powinien pobrać leady z paginacją', async () => {
      const mockLeads = [
        {
          id: 'test-id-1',
          firstName: 'Jan',
          phone: '+48123456789',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 'test-id-2',
          firstName: 'Anna',
          phone: '+48987654321',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      mockRange().select().mockResolvedValue({ data: mockLeads, error: null, count: 10 });

      const result = await LeadService.getLeadsWithPagination(1, 2);

      expect(result.success).toBe(true);
      if (result.success && result.data) {
        expect(result.data.leads).toEqual(mockLeads);
        expect(result.data.pagination).toEqual({
          page: 1,
          limit: 2,
          total: 10,
          pages: 5,
        });
      }
    });
  });
});
