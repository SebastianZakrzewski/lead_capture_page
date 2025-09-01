import { supabase } from '../database';

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
    borderColor?: string;
    materialColor?: string;
  }) {
    try {
      const { data, error } = await supabase
        .from('Lead')
        .insert({
          id: crypto.randomUUID(),
          firstName: leadData.firstName,
          phone: leadData.phone,
          email: leadData.email || null,
          company: leadData.company || null,
          jobTitle: leadData.jobTitle || null,
          industry: leadData.industry || null,
          completeness: leadData.completeness || null,
          borderColor: leadData.borderColor || null,
          materialColor: leadData.materialColor || null,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      console.error('Błąd podczas zapisywania leada:', error);
      return { success: false, error: 'Nie udało się zapisać leada' };
    }
  }

  // Pobieranie leada po ID
  static async getLeadById(id: string) {
    try {
      const { data, error } = await supabase
        .from('Lead')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      console.error('Błąd podczas pobierania leada:', error);
      return { success: false, error: 'Nie udało się pobrać leada' };
    }
  }

  // Pobieranie leada po numerze telefonu
  static async getLeadByPhone(phone: string) {
    try {
      const { data, error } = await supabase
        .from('Lead')
        .select('*')
        .eq('phone', phone)
        .single();

      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      console.error('Błąd podczas pobierania leada po telefonie:', error);
      return { success: false, error: 'Nie udało się pobrać leada' };
    }
  }

  // Pobieranie wszystkich leadów
  static async getAllLeads() {
    try {
      const { data, error } = await supabase
        .from('Lead')
        .select('*')
        .order('createdAt', { ascending: false });

      if (error) throw error;
      return { success: true, data };
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
    borderColor: string;
    materialColor: string;
  }>) {
    try {
      const { data, error } = await supabase
        .from('Lead')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      console.error('Błąd podczas aktualizacji leada:', error);
      return { success: false, error: 'Nie udało się zaktualizować leada' };
    }
  }

  // Usuwanie leada
  static async deleteLead(id: string) {
    try {
      const { error } = await supabase
        .from('Lead')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return { success: true, message: 'Lead został usunięty' };
    } catch (error) {
      console.error('Błąd podczas usuwania leada:', error);
      return { success: false, error: 'Nie udało się usunąć leada' };
    }
  }

  // Pobieranie leadów z paginacją
  static async getLeadsWithPagination(page: number = 1, limit: number = 10) {
    try {
      const from = (page - 1) * limit;
      const to = from + limit - 1;
      
      const { data: leads, error: leadsError, count } = await supabase
        .from('Lead')
        .select('*', { count: 'exact' })
        .order('createdAt', { ascending: false })
        .range(from, to);

      if (leadsError) throw leadsError;

      const total = count || 0;
      return {
        success: true,
        data: {
          leads: leads || [],
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
