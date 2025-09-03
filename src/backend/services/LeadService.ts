import { supabase } from '../database';
import { LeadSubmissionData } from '@/utils/tracking';
import { v4 as uuidv4 } from 'uuid';

// Funkcje do zarządzania leadami
export class LeadService {
  // Utwórz nowy lead
  static async createLead(leadData: LeadSubmissionData) {
    try {
      console.log('🔍 LeadService.createLead - dane wejściowe:', leadData);
      const { data: lead, error } = await supabase
        .from('Lead')
        .insert({
          id: uuidv4(),
          firstName: leadData.firstName,
          phone: leadData.phone,
          email: leadData.email,
          company: leadData.company,
          jobTitle: leadData.jobTitle,
          industry: leadData.industry,
          completeness: leadData.completeness,
          structure: leadData.structure,
          borderColor: leadData.borderColor,
          materialColor: leadData.materialColor,
          includeHooks: leadData.includeHooks,
          
          // Dane trackingowe - UTM-y
          utmSource: leadData.utmSource,
          utmMedium: leadData.utmMedium,
          utmCampaign: leadData.utmCampaign,
          utmTerm: leadData.utmTerm,
          utmContent: leadData.utmContent,
          
          // Identyfikatory reklam
          gclid: leadData.gclid,
          fbclid: leadData.fbclid,
          
          // Dodatkowe dane trackingowe
          sessionId: leadData.sessionId,
          firstVisit: leadData.firstVisit?.toISOString(),
          currentUrl: leadData.currentUrl,
          userAgent: leadData.userAgent,
          referrer: leadData.referrer,
          
          // Dane feedbackowe
          feedbackEaseOfChoice: leadData.feedbackEaseOfChoice,
          feedbackFormClarity: leadData.feedbackFormClarity,
          feedbackLoadingSpeed: leadData.feedbackLoadingSpeed,
          feedbackOverallExperience: leadData.feedbackOverallExperience,
          feedbackWouldRecommend: leadData.feedbackWouldRecommend,
          feedbackAdditionalComments: leadData.feedbackAdditionalComments,
          
          // Timestamps
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) {
        console.log('🔍 Błąd podczas tworzenia leada:', error); 
        return { success: false, error: 'Błąd podczas tworzenia leada' };
      }

      return { success: true, data: lead };
    } catch (error) {
      console.error('Error creating lead:', error);
      return { success: false, error: 'Błąd podczas tworzenia leada' };
    }
  }

  // Pobierz lead po ID
  static async getLeadById(id: string) {
    try {
      const { data: lead, error } = await supabase
        .from('Lead')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        console.error('Supabase error fetching lead:', error);
        return { success: false, error: 'Błąd podczas pobierania leada' };
      }

      return { success: true, data: lead };
    } catch (error) {
      console.error('Error fetching lead:', error);
      return { success: false, error: 'Błąd podczas pobierania leada' };
    }
  }

  // Pobierz wszystkie leady z filtrami
  static async getLeads(filters: {
    status?: string[];
    priority?: string[];
    source?: string[];
    campaign?: string[];
    dateFrom?: Date;
    dateTo?: Date;
    assignedTo?: string;
    search?: string;
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }) {
    try {
      const {
        status,
        priority,
        source,
        campaign,
        dateFrom,
        dateTo,
        assignedTo,
        search,
        page = 1,
        limit = 20,
        sortBy = 'createdAt',
        sortOrder = 'desc',
      } = filters;

      let query = supabase.from('Lead').select('*', { count: 'exact' });

      // Apply filters
      if (status?.length) {
        query = query.in('status', status);
      }
      if (priority?.length) {
        query = query.in('priority', priority);
      }
      if (source?.length) {
        query = query.in('utmSource', source);
      }
      if (campaign?.length) {
        query = query.in('utmCampaign', campaign);
      }
      if (assignedTo) {
        query = query.eq('assignedTo', assignedTo);
      }
      if (dateFrom) {
        query = query.gte('createdAt', dateFrom.toISOString());
      }
      if (dateTo) {
        query = query.lte('createdAt', dateTo.toISOString());
      }
      if (search) {
        query = query.or(`firstName.ilike.%${search}%,lastName.ilike.%${search}%,phone.ilike.%${search}%,email.ilike.%${search}%,company.ilike.%${search}%`);
      }

      // Apply sorting
      query = query.order(sortBy, { ascending: sortOrder === 'asc' });

      // Apply pagination
      const from = (page - 1) * limit;
      const to = from + limit - 1;
      query = query.range(from, to);

      const { data: leads, error, count } = await query;

      if (error) {
        console.error('Supabase error fetching leads:', error);
        return { success: false, error: 'Błąd podczas pobierania leadów' };
      }

      return {
        success: true,
        data: {
          leads: leads || [],
          pagination: {
            total: count || 0,
            page,
            limit,
            totalPages: Math.ceil((count || 0) / limit),
            hasNext: page * limit < (count || 0),
            hasPrev: page > 1,
          },
        },
      };
    } catch (error) {
      console.error('Error fetching leads:', error);
      return { success: false, error: 'Błąd podczas pobierania leadów' };
    }
  }

  // Zaktualizuj status leada
  static async updateLeadStatus(id: string, status: string, userId?: string) {
    try {
      // Get the old lead first
      const { data: oldLead, error: fetchError } = await supabase
        .from('Lead')
        .select('*')
        .eq('id', id)
        .single();

      if (fetchError || !oldLead) {
        return { success: false, error: 'Lead nie został znaleziony' };
      }

      // Update the lead
      const { data: lead, error } = await supabase
        .from('Lead')
        .update({ status })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Supabase error updating lead status:', error);
        return { success: false, error: 'Błąd podczas aktualizacji statusu' };
      }

      return { success: true, data: lead };
    } catch (error) {
      console.error('Error updating lead status:', error);
      return { success: false, error: 'Błąd podczas aktualizacji statusu' };
    }
  }

  // Zaktualizuj lead z danymi feedbacku
  static async updateLeadFeedback(id: string, feedbackData: {
    feedbackEaseOfChoice?: number;
    feedbackFormClarity?: number;
    feedbackLoadingSpeed?: number;
    feedbackOverallExperience?: number;
    feedbackWouldRecommend?: number;
    feedbackAdditionalComments?: string;
  }) {
    try {
      console.log('🔄 LeadService.updateLeadFeedback - aktualizuję lead:', id, feedbackData);
      
      const { data: lead, error } = await supabase
        .from('Lead')
        .update({
          feedbackEaseOfChoice: feedbackData.feedbackEaseOfChoice,
          feedbackFormClarity: feedbackData.feedbackFormClarity,
          feedbackLoadingSpeed: feedbackData.feedbackLoadingSpeed,
          feedbackOverallExperience: feedbackData.feedbackOverallExperience,
          feedbackWouldRecommend: feedbackData.feedbackWouldRecommend,
          feedbackAdditionalComments: feedbackData.feedbackAdditionalComments,
          updatedAt: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Supabase error updating lead feedback:', error);
        return { success: false, error: 'Błąd podczas aktualizacji feedbacku' };
      }

      console.log('✅ Lead feedback zaktualizowany pomyślnie:', lead);
      return { success: true, data: lead };
    } catch (error) {
      console.error('Error updating lead feedback:', error);
      return { success: false, error: 'Błąd podczas aktualizacji feedbacku' };
    }
  }

  // Przypisz lead do agenta
  static async assignLead(id: string, assignedTo: string, userId?: string) {
    try {
      const { data: lead, error } = await supabase
        .from('Lead')
        .update({ assignedTo })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Supabase error assigning lead:', error);
        return { success: false, error: 'Błąd podczas przypisywania leada' };
      }

      return { success: true, data: lead };
    } catch (error) {
      console.error('Error assigning lead:', error);
      return { success: false, error: 'Błąd podczas przypisywania leada' };
    }
  }

  // Pobierz leady według statusu
  static async getLeadsByStatus(status: string, limit: number = 10) {
    try {
      const { data: leads, error } = await supabase
        .from('Lead')
        .select('*')
        .eq('status', status)
        .order('createdAt', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('Supabase error fetching leads by status:', error);
        return { success: false, error: 'Błąd podczas pobierania leadów' };
      }

      return { success: true, data: leads || [] };
    } catch (error) {
      console.error('Error fetching leads by status:', error);
      return { success: false, error: 'Błąd podczas pobierania leadów' };
    }
  }

  // Pobierz leady według źródła (UTM)
  static async getLeadsBySource(source: string, limit: number = 10) {
    try {
      const { data: leads, error } = await supabase
        .from('Lead')
        .select('*')
        .eq('utmSource', source)
        .order('createdAt', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('Supabase error fetching leads by source:', error);
        return { success: false, error: 'Błąd podczas pobierania leadów' };
      }

      return { success: true, data: leads || [] };
    } catch (error) {
      console.error('Error fetching leads by source:', error);
      return { success: false, error: 'Błąd podczas pobierania leadów' };
    }
  }

  // Pobierz leady według kampanii
  static async getLeadsByCampaign(campaign: string, limit: number = 10) {
    try {
      const { data: leads, error } = await supabase
        .from('Lead')
        .select('*')
        .eq('utmCampaign', campaign)
        .order('createdAt', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('Supabase error fetching leads by campaign:', error);
        return { success: false, error: 'Błąd podczas pobierania leadów' };
      }

      return { success: true, data: leads || [] };
    } catch (error) {
      console.error('Error fetching leads by campaign:', error);
      return { success: false, error: 'Błąd podczas pobierania leadów' };
    }
  }

  // Pobierz leady według daty
  static async getLeadsByDateRange(dateFrom: Date, dateTo: Date, limit: number = 50) {
    try {
      const { data: leads, error } = await supabase
        .from('Lead')
        .select('*')
        .gte('createdAt', dateFrom.toISOString())
        .lte('createdAt', dateTo.toISOString())
        .order('createdAt', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('Supabase error fetching leads by date range:', error);
        return { success: false, error: 'Błąd podczas pobierania leadów' };
      }

      return { success: true, data: leads || [] };
    } catch (error) {
      console.error('Error fetching leads by date range:', error);
      return { success: false, error: 'Błąd podczas pobierania leadów' };
    }
  }

  // Wyszukaj leady według tekstu
  static async searchLeads(searchTerm: string, limit: number = 20) {
    try {
      const { data: leads, error } = await supabase
        .from('Lead')
        .select('*')
        .or(`firstName.ilike.%${searchTerm}%,lastName.ilike.%${searchTerm}%,phone.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%,company.ilike.%${searchTerm}%,jobTitle.ilike.%${searchTerm}%`)
        .order('createdAt', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('Supabase error searching leads:', error);
        return { success: false, error: 'Błąd podczas wyszukiwania leadów' };
      }

      return { success: true, data: leads || [] };
    } catch (error) {
      console.error('Error searching leads:', error);
      return { success: false, error: 'Błąd podczas wyszukiwania leadów' };
    }
  }

  // Pobierz statystyki leadów
  static async getLeadStats(dateFrom: Date, dateTo: Date) {
    try {
      const { data: leads, error } = await supabase
        .from('Lead')
        .select('*')
        .gte('createdAt', dateFrom.toISOString())
        .lte('createdAt', dateTo.toISOString());

      if (error) {
        console.error('Supabase error fetching lead stats:', error);
        return { success: false, error: 'Błąd podczas pobierania statystyk' };
      }

      const total = leads?.length || 0;
      const converted = leads?.filter(lead => lead.status === 'CONVERTED').length || 0;
      const rate = total > 0 ? (converted / total) * 100 : 0;

      // Group by status
      const byStatus = leads?.reduce((acc, lead) => {
        acc[lead.status] = (acc[lead.status] || 0) + 1;
        return acc;
      }, {} as Record<string, number>) || {};

      // Group by priority
      const byPriority = leads?.reduce((acc, lead) => {
        acc[lead.priority] = (acc[lead.priority] || 0) + 1;
        return acc;
      }, {} as Record<string, number>) || {};

      // Group by source
      const bySource = leads?.reduce((acc, lead) => {
        if (lead.utmSource) {
          acc[lead.utmSource] = (acc[lead.utmSource] || 0) + 1;
        }
        return acc;
      }, {} as Record<string, number>) || {};

      // Group by campaign
      const byCampaign = leads?.reduce((acc, lead) => {
        if (lead.utmCampaign) {
          acc[lead.utmCampaign] = (acc[lead.utmCampaign] || 0) + 1;
        }
        return acc;
      }, {} as Record<string, number>) || {};

      return {
        success: true,
        data: {
          total,
          byStatus,
          byPriority,
          bySource,
          byCampaign,
          conversionRate: rate,
          averageResponseTime: 0, // Not implemented in current schema
        },
      };
    } catch (error) {
      console.error('Error fetching lead stats:', error);
      return { success: false, error: 'Błąd podczas pobierania statystyk' };
    }
  }
}
