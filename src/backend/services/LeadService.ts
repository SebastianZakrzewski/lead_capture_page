import { prisma } from '../database';
import { Lead } from '../models/Lead';

export class LeadService {
  // Zapisywanie nowego leada do bazy danych
  static async createLead(leadData: {
    firstName: string;
    phone: string;
    email?: string;
    company?: string;
    jobTitle?: string;
    industry?: string;
    completeness?: string;
  }) {
    try {
      const lead = await prisma.lead.create({
        data: {
          firstName: leadData.firstName,
          phone: leadData.phone,
          email: leadData.email || null,
          company: leadData.company || null,
          jobTitle: leadData.jobTitle || null,
          industry: leadData.industry || null,
          completeness: leadData.completeness || null,
        },
      });
      return { success: true, data: lead };
    } catch (error) {
      console.error('Błąd podczas zapisywania leada:', error);
      return { success: false, error: 'Nie udało się zapisać leada' };
    }
  }

  // Pobieranie leada po ID
  static async getLeadById(id: string) {
    try {
      const lead = await prisma.lead.findUnique({
        where: { id },
      });
      return { success: true, data: lead };
    } catch (error) {
      console.error('Błąd podczas pobierania leada:', error);
      return { success: false, error: 'Nie udało się pobrać leada' };
    }
  }

  // Pobieranie leada po numerze telefonu
  static async getLeadByPhone(phone: string) {
    try {
      const lead = await prisma.lead.findFirst({
        where: { phone },
      });
      return { success: true, data: lead };
    } catch (error) {
      console.error('Błąd podczas pobierania leada po telefonie:', error);
      return { success: false, error: 'Nie udało się pobrać leada' };
    }
  }

  // Pobieranie wszystkich leadów
  static async getAllLeads() {
    try {
      const leads = await prisma.lead.findMany({
        orderBy: { createdAt: 'desc' },
      });
      return { success: true, data: leads };
    } catch (error) {
      console.error('Błąd podczas pobierania leadów:', error);
      return { success: false, error: 'Nie udało się pobrać leadów' };
    }
  }

  // Aktualizacja leada
  static async updateLead(id: string, updateData: Partial<{
    firstName: string;
    phone: string;
    email: string;
    company: string;
    jobTitle: string;
    industry: string;
    completeness: string;
  }>) {
    try {
      const lead = await prisma.lead.update({
        where: { id },
        data: updateData,
      });
      return { success: true, data: lead };
    } catch (error) {
      console.error('Błąd podczas aktualizacji leada:', error);
      return { success: false, error: 'Nie udało się zaktualizować leada' };
    }
  }

  // Usuwanie leada
  static async deleteLead(id: string) {
    try {
      await prisma.lead.delete({
        where: { id },
      });
      return { success: true, message: 'Lead został usunięty' };
    } catch (error) {
      console.error('Błąd podczas usuwania leada:', error);
      return { success: false, error: 'Nie udało się usunąć leada' };
    }
  }

  // Pobieranie leadów z paginacją
  static async getLeadsWithPagination(page: number = 1, limit: number = 10) {
    try {
      const skip = (page - 1) * limit;
      
      const [leads, total] = await Promise.all([
        prisma.lead.findMany({
          skip,
          take: limit,
          orderBy: { createdAt: 'desc' },
        }),
        prisma.lead.count(),
      ]);

      return {
        success: true,
        data: {
          leads,
          pagination: {
            page,
            limit,
            total,
            pages: Math.ceil(total / limit),
          },
        },
      };
    } catch (error) {
      console.error('Błąd podczas pobierania leadów z paginacją:', error);
      return { success: false, error: 'Nie udało się pobrać leadów' };
    }
  }
}
