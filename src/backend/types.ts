// Typy dla backendu - EVAPREMIUM Lead Management

// Statusy leadów
export type LeadStatus = 'pending' | 'contacted' | 'converted' | 'lost' | 'spam';

// Priorytety leadów
export type LeadPriority = 'low' | 'medium' | 'high' | 'urgent';

// Źródła ruchu
export type TrafficSource = 'google' | 'facebook' | 'instagram' | 'email' | 'organic' | 'direct' | 'referral';

// Typy kampanii
export type CampaignType = 'search' | 'display' | 'social' | 'email' | 'video' | 'remarketing';

// Interfejs dla leada w bazie danych
export interface Lead {
  id: string;
  firstName: string;
  lastName?: string;
  phone: string;
  email?: string;
  company: string; // Marka i model auta
  jobTitle: string; // Rok produkcji
  industry: string; // Typ dywaników
  completeness: string; // Rodzaj kompletu
  message?: string;
  
  // Dane śledzenia
  sessionId: string;
  utmSource?: TrafficSource;
  utmMedium?: string;
  utmCampaign?: string;
  utmTerm?: string;
  utmContent?: string;
  referrer?: string;
  gclid?: string;
  fbclid?: string;
  firstVisit: Date;
  currentUrl: string;
  userAgent: string;
  
  // Status i priorytet
  status: LeadStatus;
  priority: LeadPriority;
  
  // Metadane
  createdAt: Date;
  updatedAt: Date;
  assignedTo?: string; // ID użytkownika CRM
  notes?: string[];
  
  // Analityka
  responseTime?: number; // Czas odpowiedzi w godzinach
  contactAttempts: number;
  lastContactAttempt?: Date;
  conversionValue?: number; // Wartość konwersji w PLN
}

// Interfejs dla użytkownika CRM
export interface CrmUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'admin' | 'manager' | 'agent';
  permissions: string[];
  createdAt: Date;
  lastLogin?: Date;
  isActive: boolean;
}

// Interfejs dla notatek do leada
export interface LeadNote {
  id: string;
  leadId: string;
  userId: string;
  content: string;
  type: 'general' | 'call' | 'email' | 'meeting' | 'followup';
  createdAt: Date;
  isPrivate: boolean;
}

// Interfejs dla filtrów wyszukiwania leadów
export interface LeadFilters {
  status?: LeadStatus[];
  priority?: LeadPriority[];
  source?: TrafficSource[];
  campaign?: string[];
  dateFrom?: Date;
  dateTo?: Date;
  assignedTo?: string;
  search?: string; // Wyszukiwanie tekstowe
  limit?: number;
  offset?: number;
  sortBy?: 'createdAt' | 'priority' | 'status' | 'firstName' | 'company';
  sortOrder?: 'asc' | 'desc';
}

// Interfejs dla statystyk leadów
export interface LeadStats {
  total: number;
  byStatus: Record<LeadStatus, number>;
  byPriority: Record<LeadPriority, number>;
  bySource: Record<TrafficSource, number>;
  byCampaign: Record<string, number>;
  conversionRate: number;
  averageResponseTime: number;
  totalValue: number;
  averageValue: number;
}

// Interfejs dla raportów
export interface LeadReport {
  id: string;
  name: string;
  description?: string;
  filters: LeadFilters;
  schedule?: 'daily' | 'weekly' | 'monthly';
  recipients: string[];
  lastGenerated?: Date;
  createdAt: Date;
  isActive: boolean;
}

// Interfejs dla automatyzacji
export interface LeadAutomation {
  id: string;
  name: string;
  description?: string;
  trigger: 'lead_created' | 'status_changed' | 'priority_changed' | 'time_based';
  conditions: {
    field: string;
    operator: 'equals' | 'not_equals' | 'contains' | 'greater_than' | 'less_than';
    value: any;
  }[];
  actions: {
    type: 'send_email' | 'assign_to' | 'change_status' | 'create_task' | 'send_notification';
    config: Record<string, any>;
  }[];
  isActive: boolean;
  createdAt: Date;
  lastRun?: Date;
}

// Interfejs dla szablonów emaili
export interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  body: string;
  variables: string[]; // Dostępne zmienne do podmiany
  category: 'welcome' | 'followup' | 'reminder' | 'offer' | 'custom';
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Interfejs dla zadań (tasks)
export interface Task {
  id: string;
  leadId: string;
  assignedTo: string;
  title: string;
  description?: string;
  type: 'call' | 'email' | 'meeting' | 'followup' | 'research' | 'custom';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  dueDate: Date;
  completedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

// Interfejs dla powiadomień
export interface Notification {
  id: string;
  userId: string;
  type: 'lead_assigned' | 'lead_status_changed' | 'task_due' | 'report_ready' | 'system';
  title: string;
  message: string;
  data?: Record<string, any>;
  isRead: boolean;
  createdAt: Date;
  readAt?: Date;
}

// Interfejs dla eksportu danych
export interface DataExport {
  id: string;
  userId: string;
  type: 'leads' | 'analytics' | 'reports';
  format: 'csv' | 'xlsx' | 'json';
  filters?: LeadFilters;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  fileUrl?: string;
  expiresAt: Date;
  createdAt: Date;
  completedAt?: Date;
}

// Interfejs dla audytu (logi zmian)
export interface AuditLog {
  id: string;
  userId?: string;
  action: string;
  entityType: 'lead' | 'user' | 'automation' | 'template';
  entityId: string;
  oldValues?: Record<string, any>;
  newValues?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
  createdAt: Date;
}

// Interfejs dla konfiguracji systemu
export interface SystemConfig {
  id: string;
  key: string;
  value: any;
  description?: string;
  isPublic: boolean;
  updatedAt: Date;
  updatedBy: string;
}

// Typy dla API responses
export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, any>;
  timestamp: Date;
}

// Typy dla webhooków
export interface WebhookPayload {
  event: string;
  timestamp: Date;
  data: any;
  signature?: string;
}

export interface WebhookConfig {
  id: string;
  name: string;
  url: string;
  events: string[];
  isActive: boolean;
  secretKey?: string;
  retryCount: number;
  lastDelivery?: Date;
  createdAt: Date;
}
