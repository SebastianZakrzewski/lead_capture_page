import { v4 as uuidv4 } from 'uuid';

export interface TrackingData {
  sessionId: string;
  utmSource?: string;
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
}

export interface LeadSubmissionData extends TrackingData {
  firstName: string;
  lastName?: string;
  phone: string;
  email?: string;
  company?: string;
  jobTitle?: string;
  industry?: string;
  completeness?: string;
  structure?: string;
  borderColor?: string;
  materialColor?: string;
  includeHooks?: boolean;
  message?: string;
  
  // Dane feedbackowe
  feedbackEaseOfChoice?: number;
  feedbackFormClarity?: number;
  feedbackLoadingSpeed?: number;
  feedbackOverallExperience?: number;
  feedbackWouldRecommend?: number;
  feedbackAdditionalComments?: string;
  
  // Dodatkowe pola dla częściowego/pełnego zapisu
  status?: string;
  step?: number;
  leadId?: string;
  timestamp?: string;
  isUpdate?: boolean;
}

// Pobierz UTM-y z URL
function getUtmParams(): Partial<TrackingData> {
  if (typeof window === 'undefined') return {};
  
  const urlParams = new URLSearchParams(window.location.search);
  
  return {
    utmSource: urlParams.get('utm_source') || undefined,
    utmMedium: urlParams.get('utm_medium') || undefined,
    utmCampaign: urlParams.get('utm_campaign') || undefined,
    utmTerm: urlParams.get('utm_term') || undefined,
    utmContent: urlParams.get('utm_content') || undefined,
    gclid: urlParams.get('gclid') || undefined,
    fbclid: urlParams.get('fbclid') || undefined,
  };
}

// Pobierz referrer
function getReferrer(): string | undefined {
  if (typeof window === 'undefined') return undefined;
  return document.referrer || undefined;
}

// Pobierz user agent
function getUserAgent(): string {
  if (typeof window === 'undefined') return '';
  return navigator.userAgent;
}

// Pobierz aktualny URL
function getCurrentUrl(): string {
  if (typeof window === 'undefined') return '';
  return window.location.href;
}

// Pobierz lub utwórz session ID
export function getOrCreateSessionId(): string {
  if (typeof window === 'undefined') return '';
  
  let sessionId = localStorage.getItem('session_id');
  
  if (!sessionId) {
    sessionId = uuidv4();
    localStorage.setItem('session_id', sessionId);
  }
  
  return sessionId;
}

// Pobierz lub utwórz dane śledzenia
export function getOrCreateTrackingData(): TrackingData {
  if (typeof window === 'undefined') {
    return {
      sessionId: '',
      firstVisit: new Date(),
      currentUrl: '',
      userAgent: '',
    };
  }
  
  const sessionId = getOrCreateSessionId();
  let firstVisit = localStorage.getItem('first_visit');
  
  if (!firstVisit) {
    firstVisit = new Date().toISOString();
    localStorage.setItem('first_visit', firstVisit);
  }
  
  const utmParams = getUtmParams();
  
  return {
    sessionId,
    firstVisit: new Date(firstVisit),
    currentUrl: getCurrentUrl(),
    userAgent: getUserAgent(),
    referrer: getReferrer(),
    ...utmParams,
  };
}

// Zapisz UTM-y do localStorage (tylko przy pierwszym wejściu)
export function saveUtmParams(): void {
  if (typeof window === 'undefined') return;
  
  const utmParams = getUtmParams();
  const hasUtmParams = Object.values(utmParams).some(param => param);
  
  if (hasUtmParams && !localStorage.getItem('utm_saved')) {
    localStorage.setItem('utm_source', utmParams.utmSource || '');
    localStorage.setItem('utm_medium', utmParams.utmMedium || '');
    localStorage.setItem('utm_campaign', utmParams.utmCampaign || '');
    localStorage.setItem('utm_term', utmParams.utmTerm || '');
    localStorage.setItem('utm_content', utmParams.utmContent || '');
    localStorage.setItem('gclid', utmParams.gclid || '');
    localStorage.setItem('fbclid', utmParams.fbclid || '');
    localStorage.setItem('utm_saved', 'true');
  }
}

// Pobierz zapisane UTM-y
export function getSavedUtmParams(): Partial<TrackingData> {
  if (typeof window === 'undefined') return {};
  
  return {
    utmSource: localStorage.getItem('utm_source') || undefined,
    utmMedium: localStorage.getItem('utm_medium') || undefined,
    utmCampaign: localStorage.getItem('utm_campaign') || undefined,
    utmTerm: localStorage.getItem('utm_term') || undefined,
    utmContent: localStorage.getItem('utm_content') || undefined,
    gclid: localStorage.getItem('gclid') || undefined,
    fbclid: localStorage.getItem('fbclid') || undefined,
  };
}

// Przygotuj dane do wysłania z formularzem
export function prepareLeadSubmissionData(formData: {
  firstName: string;
  lastName?: string;
  phone: string;
  email?: string;
  company?: string;
  jobTitle?: string;
  industry?: string;
  completeness?: string;
  structure?: string;
  borderColor?: string;
  materialColor?: string;
  includeHooks?: boolean;
  message?: string;
  
  // Dane feedbackowe
  feedbackEaseOfChoice?: number;
  feedbackFormClarity?: number;
  feedbackLoadingSpeed?: number;
  feedbackOverallExperience?: number;
  feedbackWouldRecommend?: number;
  feedbackAdditionalComments?: string;
  
  // Dodatkowe pola dla częściowego/pełnego zapisu
  status?: string;
  step?: number;
  leadId?: string;
  timestamp?: string;
  isUpdate?: boolean;
}): LeadSubmissionData {
  const trackingData = getOrCreateTrackingData();
  const savedUtmParams = getSavedUtmParams();
  
  const result = {
    ...formData,
    ...trackingData,
    ...savedUtmParams, // UTM-y z pierwszego wejścia
    // Zachowaj dodatkowe pola z formData
    status: formData.status,
    step: formData.step,
    leadId: formData.leadId,
    timestamp: formData.timestamp,
    isUpdate: formData.isUpdate,
  };
  
  console.log('🔍 prepareLeadSubmissionData - dane wejściowe:', formData);
  console.log('🎨 Kolory w danych:', {
    materialColor: formData.materialColor,
    borderColor: formData.borderColor
  });
  console.log('📦 Wynik prepareLeadSubmissionData:', result);
  
  return result;
}

// Wyczyść dane śledzenia (opcjonalne)
export function clearTrackingData(): void {
  if (typeof window === 'undefined') return;
  
  localStorage.removeItem('session_id');
  localStorage.removeItem('first_visit');
  localStorage.removeItem('utm_source');
  localStorage.removeItem('utm_medium');
  localStorage.removeItem('utm_campaign');
  localStorage.removeItem('utm_term');
  localStorage.removeItem('utm_content');
  localStorage.removeItem('gclid');
  localStorage.removeItem('fbclid');
  localStorage.removeItem('utm_saved');
}
