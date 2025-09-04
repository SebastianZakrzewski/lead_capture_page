import { LeadSubmissionData } from '@/utils/tracking';

// Typy dla odpowiedzi API
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface LeadResponse {
  id: string;
  status: 'pending' | 'contacted' | 'converted' | 'lost';
  createdAt: Date;
  updatedAt: Date;
}

// Konfiguracja API
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const API_CONFIG = {
  baseUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api',
  timeout: 10000,
  retries: 3,
};

// Funkcja do wysyłania leada
export async function submitLead(leadData: LeadSubmissionData): Promise<ApiResponse<LeadResponse>> {
  try {
    // Symulacja API call - w rzeczywistości tutaj byłby fetch do prawdziwego API
    const response = await simulateApiCall(leadData);
    
    // Logowanie do konsoli (w produkcji byłoby to w logach serwera)
    console.log('Lead submitted successfully:', {
      id: response.data?.id,
      phone: leadData.phone,
      source: leadData.utmSource || 'organic',
      campaign: leadData.utmCampaign || 'none',
      sessionId: leadData.sessionId,
    });

    return response;
  } catch (error) {
    console.error('Error submitting lead:', error);
    return {
      success: false,
      error: 'Błąd podczas wysyłania formularza. Spróbuj ponownie.',
    };
  }
}

// Funkcja do pobierania leadów (dla panelu admina)
export async function getLeads(filters?: {
  status?: string;
  dateFrom?: Date;
  dateTo?: Date;
  source?: string;
}): Promise<ApiResponse<LeadSubmissionData[]>> {
  try {
    // Symulacja API call
    const response = await simulateGetLeads(filters);
    return response;
  } catch (error) {
    console.error('Error fetching leads:', error);
    return {
      success: false,
      error: 'Błąd podczas pobierania leadów.',
    };
  }
}

// Funkcja do aktualizacji statusu leada
export async function updateLeadStatus(
  leadId: string, 
  status: LeadResponse['status']
): Promise<ApiResponse<LeadResponse>> {
  try {
    // Symulacja API call
    const response = await simulateUpdateLeadStatus(leadId, status);
    return response;
  } catch (error) {
    console.error('Error updating lead status:', error);
    return {
      success: false,
      error: 'Błąd podczas aktualizacji statusu leada.',
    };
  }
}

// Funkcja do analizy źródeł leadów
export async function getLeadAnalytics(dateFrom: Date, dateTo: Date): Promise<ApiResponse<{
  totalLeads: number;
  bySource: Record<string, number>;
  byCampaign: Record<string, number>;
  conversionRate: number;
  averageResponseTime: number;
}>> {
  try {
    // Symulacja API call
    const response = await simulateGetAnalytics(dateFrom, dateTo);
    return response;
  } catch (error) {
    console.error('Error fetching analytics:', error);
    return {
      success: false,
      error: 'Błąd podczas pobierania analityki.',
    };
  }
}

// Funkcje pomocnicze - symulacja API
async function simulateApiCall(leadData: LeadSubmissionData): Promise<ApiResponse<LeadResponse>> {
  // Symulacja opóźnienia sieci
  await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));
  
  // Symulacja błędu (5% szans)
  if (Math.random() < 0.05) {
    throw new Error('Network error');
  }

  // Symulacja sukcesu
  const leadResponse: LeadResponse = {
    id: `lead_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    status: 'pending',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  return {
    success: true,
    data: leadResponse,
    message: 'Lead został pomyślnie wysłany!',
  };
}

async function simulateGetLeads(filters?: Record<string, unknown>): Promise<ApiResponse<LeadSubmissionData[]>> {
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // Symulacja danych
  const mockLeads: LeadSubmissionData[] = [
    {
      firstName: 'Jan',
      phone: '+48123456789',
      email: 'jan@example.com',
      company: 'BMW X5',
      jobTitle: '2020',
      industry: '3d-evapremium-z-rantami',
      completeness: 'przod-tyl',
      sessionId: 'session_123',
      utmSource: 'google',
      utmMedium: 'cpc',
      utmCampaign: 'wiosenna_promocja',
      firstVisit: new Date('2024-03-15'),
      currentUrl: 'https://evapremium.pl',
      userAgent: 'Mozilla/5.0...',
    },
    // Więcej przykładowych leadów...
  ];

  return {
    success: true,
    data: mockLeads,
  };
}

async function simulateUpdateLeadStatus(leadId: string, status: string): Promise<ApiResponse<LeadResponse>> {
  await new Promise(resolve => setTimeout(resolve, 300));
  
  const leadResponse: LeadResponse = {
    id: leadId,
    status: status as LeadResponse['status'],
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  return {
    success: true,
    data: leadResponse,
    message: 'Status leada został zaktualizowany.',
  };
}

async function simulateGetAnalytics(dateFrom: Date, dateTo: Date): Promise<ApiResponse<{
  totalLeads: number;
  bySource: Record<string, number>;
  byCampaign: Record<string, number>;
  conversionRate: number;
  averageResponseTime: number;
}>> {
  await new Promise(resolve => setTimeout(resolve, 800));
  
  const analytics = {
    totalLeads: 156,
    bySource: {
      'google': 89,
      'facebook': 45,
      'email': 12,
      'organic': 10,
    },
    byCampaign: {
      'wiosenna_promocja': 67,
      'post_marzec': 34,
      'newsletter_q1': 23,
      'none': 32,
    },
    conversionRate: 0.23, // 23%
    averageResponseTime: 2.4, // godziny
  };

  return {
    success: true,
    data: analytics,
  };
}

// Funkcja do walidacji danych leada
export function validateLeadData(leadData: LeadSubmissionData): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!leadData.phone?.trim()) {
    errors.push('Numer telefonu jest wymagany');
  }

  if (leadData.email?.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(leadData.email)) {
    errors.push('Nieprawidłowy format adresu email');
  }

  if (!leadData.firstName?.trim()) {
    errors.push('Imię jest wymagane');
  }

  if (!leadData.company?.trim()) {
    errors.push('Marka i model auta są wymagane');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

// Funkcja do czyszczenia danych leada (usuwanie wrażliwych informacji)
export function sanitizeLeadData(leadData: LeadSubmissionData): Partial<LeadSubmissionData> {
  const { phone, email, ...sanitizedData } = leadData;
  
  // Zostawiamy tylko ostatnie 4 cyfry telefonu
  if (phone) {
    const cleanPhone = phone.replace(/\D/g, '');
    (sanitizedData as Record<string, unknown>).phone = `***${cleanPhone.slice(-4)}`;
  }
  
  // Ukrywamy część emaila
  if (email) {
    const [username, domain] = email.split('@');
    const hiddenUsername = username.length > 2 
      ? `${username.slice(0, 2)}***` 
      : '***';
    (sanitizedData as Record<string, unknown>).email = `${hiddenUsername}@${domain}`;
  }
  
  return sanitizedData;
}
