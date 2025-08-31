import { LeadService } from '../services/LeadService';
import { prisma } from '../database';

// Mock Prisma
jest.mock('../database', () => ({
  prisma: {
    lead: {
      create: jest.fn(),
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
    },
  },
}));

describe('LeadService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
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

      (prisma.lead.create as jest.Mock).mockResolvedValue(mockLead);

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
      expect(prisma.lead.create).toHaveBeenCalledWith({
        data: {
          firstName: 'Jan',
          phone: '+48123456789',
          email: 'jan@example.com',
          company: 'BMW X5',
          jobTitle: '2020',
          industry: '3d-evapremium-z-rantami',
          completeness: 'przod-tyl',
        },
      });
    });

    it('powinien utworzyć leada tylko z wymaganych pól', async () => {
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

      (prisma.lead.create as jest.Mock).mockResolvedValue(mockLead);

      const result = await LeadService.createLead({
        firstName: 'Anna',
        phone: '+48987654321',
      });

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockLead);
      expect(prisma.lead.create).toHaveBeenCalledWith({
        data: {
          firstName: 'Anna',
          phone: '+48987654321',
          email: null,
          company: null,
          jobTitle: null,
          industry: null,
          completeness: null,
        },
      });
    });

    it('powinien obsłużyć błąd podczas tworzenia leada', async () => {
      const error = new Error('Database connection failed');
      (prisma.lead.create as jest.Mock).mockRejectedValue(error);

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

      (prisma.lead.findUnique as jest.Mock).mockResolvedValue(mockLead);

      const result = await LeadService.getLeadById('test-id-123');

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockLead);
      expect(prisma.lead.findUnique).toHaveBeenCalledWith({
        where: { id: 'test-id-123' },
      });
    });

    it('powinien zwrócić null gdy lead nie istnieje', async () => {
      (prisma.lead.findUnique as jest.Mock).mockResolvedValue(null);

      const result = await LeadService.getLeadById('nieistniejace-id');

      expect(result.success).toBe(true);
      expect(result.data).toBe(null);
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

      (prisma.lead.findFirst as jest.Mock).mockResolvedValue(mockLead);

      const result = await LeadService.getLeadByPhone('+48123456789');

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockLead);
      expect(prisma.lead.findFirst).toHaveBeenCalledWith({
        where: { phone: '+48123456789' },
      });
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

      (prisma.lead.findMany as jest.Mock).mockResolvedValue(mockLeads);

      const result = await LeadService.getAllLeads();

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockLeads);
      expect(prisma.lead.findMany).toHaveBeenCalledWith({
        orderBy: { createdAt: 'desc' },
      });
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

      (prisma.lead.update as jest.Mock).mockResolvedValue(mockUpdatedLead);

      const result = await LeadService.updateLead('test-id-123', {
        email: 'jan.nowy@example.com',
        company: 'Audi A4',
        jobTitle: '2021',
        industry: '3d-evapremium-bez-rantow',
        completeness: 'przod-tyl-bagaznik',
      });

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockUpdatedLead);
      expect(prisma.lead.update).toHaveBeenCalledWith({
        where: { id: 'test-id-123' },
        data: {
          email: 'jan.nowy@example.com',
          company: 'Audi A4',
          jobTitle: '2021',
          industry: '3d-evapremium-bez-rantow',
          completeness: 'przod-tyl-bagaznik',
        },
      });
    });
  });

  describe('deleteLead', () => {
    it('powinien usunąć leada', async () => {
      (prisma.lead.delete as jest.Mock).mockResolvedValue({});

      const result = await LeadService.deleteLead('test-id-123');

      expect(result.success).toBe(true);
      expect(result.message).toBe('Lead został usunięty');
      expect(prisma.lead.delete).toHaveBeenCalledWith({
        where: { id: 'test-id-123' },
      });
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

      (prisma.lead.findMany as jest.Mock).mockResolvedValue(mockLeads);
      (prisma.lead.count as jest.Mock).mockResolvedValue(10);

      const result = await LeadService.getLeadsWithPagination(1, 2);

      expect(result.success).toBe(true);
      expect(result.data.leads).toEqual(mockLeads);
      expect(result.data.pagination).toEqual({
        page: 1,
        limit: 2,
        total: 10,
        pages: 5,
      });
      expect(prisma.lead.findMany).toHaveBeenCalledWith({
        skip: 0,
        take: 2,
        orderBy: { createdAt: 'desc' },
      });
      expect(prisma.lead.count).toHaveBeenCalled();
    });
  });
});
