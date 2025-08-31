import { LeadService } from '../services/LeadService';
import { Lead } from '../models/Lead';
import { prisma } from '../database';

// Mock Prisma dla testów integracyjnych
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

describe('Lead Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Mapowanie danych z formularza na model Lead', () => {
    it('powinien poprawnie mapować dane z formularza na model Lead', () => {
      // Dane z formularza
      const formData = {
        firstName: 'Jan',
        phone: '+48123456789',
        email: 'jan@example.com',
        company: 'BMW X5',
        jobTitle: '2020',
        industry: '3d-evapremium-z-rantami',
        completeness: 'przod-tyl',
      };

      // Utworzenie instancji modelu
      const lead = new Lead(
        formData.firstName,
        formData.phone,
        formData.email,
        formData.company,
        formData.jobTitle,
        formData.industry,
        formData.completeness
      );

      // Sprawdzenie czy dane są poprawnie mapowane
      expect(lead.firstName).toBe('Jan');
      expect(lead.phone).toBe('+48123456789');
      expect(lead.email).toBe('jan@example.com');
      expect(lead.company).toBe('BMW X5');
      expect(lead.jobTitle).toBe('2020');
      expect(lead.industry).toBe('3d-evapremium-z-rantami');
      expect(lead.completeness).toBe('przod-tyl');
    });

    it('powinien obsłużyć brakujące pola opcjonalne', () => {
      // Dane z formularza - tylko wymagane pola
      const formData = {
        firstName: 'Anna',
        phone: '+48987654321',
      };

      // Utworzenie instancji modelu
      const lead = new Lead(
        formData.firstName,
        formData.phone
      );

      // Sprawdzenie czy dane są poprawnie mapowane
      expect(lead.firstName).toBe('Anna');
      expect(lead.phone).toBe('+48987654321');
      expect(lead.email).toBe('');
      expect(lead.company).toBe('');
      expect(lead.jobTitle).toBe('');
      expect(lead.industry).toBe('');
      expect(lead.completeness).toBe('');
    });
  });

  describe('Zapisywanie modelu Lead do bazy danych', () => {
    it('powinien zapisać kompletne dane leada do bazy', async () => {
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

    it('powinien zapisać leada z tylko wymaganymi polami', async () => {
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
  });

  describe('Pobieranie i mapowanie danych z bazy na model', () => {
    it('powinien pobrać leada z bazy i poprawnie go zmapować', async () => {
      const dbLead = {
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

      (prisma.lead.findUnique as jest.Mock).mockResolvedValue(dbLead);

      const result = await LeadService.getLeadById('test-id-123');

      expect(result.success).toBe(true);
      expect(result.data).toEqual(dbLead);

      // Sprawdzenie czy dane z bazy są kompletne
      if (result.success && result.data) {
        expect(result.data.firstName).toBe('Jan');
        expect(result.data.phone).toBe('+48123456789');
        expect(result.data.email).toBe('jan@example.com');
        expect(result.data.company).toBe('BMW X5');
        expect(result.data.jobTitle).toBe('2020');
        expect(result.data.industry).toBe('3d-evapremium-z-rantami');
        expect(result.data.completeness).toBe('przod-tyl');
      }
    });

    it('powinien pobrać leada po numerze telefonu', async () => {
      const dbLead = {
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

      (prisma.lead.findFirst as jest.Mock).mockResolvedValue(dbLead);

      const result = await LeadService.getLeadByPhone('+48123456789');

      expect(result.success).toBe(true);
      expect(result.data).toEqual(dbLead);
      expect(prisma.lead.findFirst).toHaveBeenCalledWith({
        where: { phone: '+48123456789' },
      });
    });
  });

  describe('Aktualizacja danych leada', () => {
    it('powinien zaktualizować dane leada w bazie', async () => {
      const updatedLead = {
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

      (prisma.lead.update as jest.Mock).mockResolvedValue(updatedLead);

      const result = await LeadService.updateLead('test-id-123', {
        email: 'jan.nowy@example.com',
        company: 'Audi A4',
        jobTitle: '2021',
        industry: '3d-evapremium-bez-rantow',
        completeness: 'przod-tyl-bagaznik',
      });

      expect(result.success).toBe(true);
      expect(result.data).toEqual(updatedLead);
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

  describe('Pełny przepływ danych: Formularz → Model → Baza → Odczyt', () => {
    it('powinien przetworzyć pełny cykl życia leada', async () => {
      // 1. Dane z formularza
      const formData = {
        firstName: 'Jan',
        phone: '+48123456789',
        email: 'jan@example.com',
        company: 'BMW X5',
        jobTitle: '2020',
        industry: '3d-evapremium-z-rantami',
        completeness: 'przod-tyl',
      };

      // 2. Utworzenie modelu
      const lead = new Lead(
        formData.firstName,
        formData.phone,
        formData.email,
        formData.company,
        formData.jobTitle,
        formData.industry,
        formData.completeness
      );

      // 3. Zapisywanie do bazy
      const savedLead = {
        id: 'test-id-123',
        ...formData,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      (prisma.lead.create as jest.Mock).mockResolvedValue(savedLead);

      const createResult = await LeadService.createLead(formData);
      expect(createResult.success).toBe(true);
      expect(createResult.data).toEqual(savedLead);

      // 4. Pobieranie z bazy
      (prisma.lead.findUnique as jest.Mock).mockResolvedValue(savedLead);

      const getResult = await LeadService.getLeadById('test-id-123');
      expect(getResult.success).toBe(true);
      expect(getResult.data).toEqual(savedLead);

      // 5. Sprawdzenie integralności danych
      if (createResult.success && getResult.success) {
        expect(createResult.data.firstName).toBe(getResult.data.firstName);
        expect(createResult.data.phone).toBe(getResult.data.phone);
        expect(createResult.data.email).toBe(getResult.data.email);
        expect(createResult.data.company).toBe(getResult.data.company);
        expect(createResult.data.jobTitle).toBe(getResult.data.jobTitle);
        expect(createResult.data.industry).toBe(getResult.data.industry);
        expect(createResult.data.completeness).toBe(getResult.data.completeness);
      }
    });
  });

  describe('Walidacja integralności danych', () => {
    it('powinien zachować spójność typów danych', async () => {
      const formData = {
        firstName: 'Jan',
        phone: '+48123456789',
        email: 'jan@example.com',
        company: 'BMW X5',
        jobTitle: '2020',
        industry: '3d-evapremium-z-rantami',
        completeness: 'przod-tyl',
      };

      // Sprawdzenie typów
      expect(typeof formData.firstName).toBe('string');
      expect(typeof formData.phone).toBe('string');
      expect(typeof formData.email).toBe('string');
      expect(typeof formData.company).toBe('string');
      expect(typeof formData.jobTitle).toBe('string');
      expect(typeof formData.industry).toBe('string');
      expect(typeof formData.completeness).toBe('string');

      // Sprawdzenie czy nie są puste
      expect(formData.firstName.length).toBeGreaterThan(0);
      expect(formData.phone.length).toBeGreaterThan(0);

      // Sprawdzenie formatu telefonu
      expect(formData.phone).toMatch(/^\+?[1-9]\d{0,15}$/);

      // Sprawdzenie formatu emaila
      expect(formData.email).toMatch(/^[^\s@]+@[^\s@]+\.[^\s@]+$/);
    });
  });
});
