/* eslint-disable */
'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';

declare global {
  interface Window {
    fbq: ((...args: unknown[]) => void) & {
      push: (...args: unknown[]) => void;
      loaded?: boolean;
      version?: string;
      queue?: unknown[];
      callMethod?: (...args: unknown[]) => void;
    };
    _fbq?: Window['fbq'];
  }
}

interface FacebookPixelProps {
  pixelId: string;
  userEmail?: string;
  userPhone?: string;
}

export default function FacebookPixel({ pixelId, userEmail, userPhone }: FacebookPixelProps) {
  const pathname = usePathname();
  const firstRender = useRef(true);

  useEffect(() => {
    // Load Facebook Pixel script using official Meta code
    if (typeof window !== 'undefined') {
      // Official Meta Pixel initialization
      (function(f: any, b: any, e: any, v: any, n: any, t: any, s: any) {
        if (f.fbq) return;
        n = f.fbq = function() {
          n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments);
        };
        if (!f._fbq) f._fbq = n;
        n.push = n;
        n.loaded = !0;
        n.version = '2.0';
        n.queue = [];
        t = b.createElement(e);
        t.async = !0;
        t.src = v;
        s = b.getElementsByTagName(e)[0];
        s.parentNode.insertBefore(t, s);
      })(window, document, 'script', 'https://connect.facebook.net/en_US/fbevents.js', undefined, undefined, undefined);

      // Initialize pixel with Advanced Matching (if data available)
      if (userEmail || userPhone) {
        window.fbq('init', pixelId, {
          em: userEmail,
          ph: userPhone
        });
      } else {
        window.fbq('init', pixelId);
      }
      window.fbq('track', 'PageView');
    }
  }, [pixelId, userEmail, userPhone]);

  useEffect(() => {
    // Track page views on route changes (but not on first render)
    if (typeof window !== 'undefined' && window.fbq) {
      if (firstRender.current) {
        firstRender.current = false;
        return;
      }
      window.fbq('track', 'PageView');
    }
  }, [pathname]);

  return (
    <>
      {/* Noscript fallback for Meta Pixel */}
      <noscript>
        <img 
          height="1" 
          width="1" 
          style={{ display: 'none' }}
          src={`https://www.facebook.com/tr?id=${pixelId}&ev=PageView&noscript=1`}
          alt=""
        />
      </noscript>
    </>
  );
}

// Utility functions for tracking events
export const trackLeadSubmission = (value?: number, currency = 'PLN') => {
  if (typeof window !== 'undefined' && window.fbq) {
    try {
      window.fbq('track', 'Lead', {
        value: value || 0,
        currency: currency,
        content_name: 'Lead Capture Form',
        content_category: 'Car Mats',
        content_type: 'product'
      });
      console.log('📊 Pixel: Lead event sent');
    } catch (error) {
      console.error('❌ Pixel: Error sending Lead event:', error);
    }
  } else {
    console.warn('⚠️ Pixel: fbq not available');
  }
};

export const trackFormView = () => {
  if (typeof window !== 'undefined' && window.fbq) {
    try {
      window.fbq('track', 'ViewContent', {
        content_name: 'Lead Capture Form',
        content_category: 'Car Mats',
        content_type: 'product'
      });
      console.log('📊 Pixel: ViewContent event sent');
    } catch (error) {
      console.error('❌ Pixel: Error sending ViewContent event:', error);
    }
  } else {
    console.warn('⚠️ Pixel: fbq not available');
  }
};

export const trackFormStart = () => {
  if (typeof window !== 'undefined' && window.fbq) {
    try {
      window.fbq('track', 'InitiateCheckout', {
        content_name: 'Lead Capture Form',
        content_category: 'Car Mats',
        content_type: 'product'
      });
      console.log('📊 Pixel: InitiateCheckout event sent');
    } catch (error) {
      console.error('❌ Pixel: Error sending InitiateCheckout event:', error);
    }
  } else {
    console.warn('⚠️ Pixel: fbq not available');
  }
};

// Oblicz wartość leada na podstawie wyboru
const calculateLeadValue = (leadData: Record<string, unknown>): number => {
  let baseValue = 0;
  
  // Wartość na podstawie kompletności
  switch (leadData.completeness) {
    case 'dywanik-kierowcy':
      baseValue = 150; // 1 szt.
      break;
    case 'przod':
      baseValue = 300; // 2 szt.
      break;
    case 'przod-tyl':
      baseValue = 600; // 4 szt.
      break;
    case 'przod-tyl-bagaznik':
      baseValue = 750; // 5 szt.
      break;
    default:
      baseValue = 300; // domyślnie
  }
  
  // Dodatkowa wartość za 3D z rantami
  if (leadData.industry === '3d-evapremium-z-rantami') {
    baseValue *= 1.2; // +20%
  }
  
  // Dodatkowa wartość za haczyki
  if (leadData.includeHooks) {
    baseValue += 50;
  }
  
  return Math.round(baseValue);
};

// Śledź wysłanie formularza z danymi trackingowymi
export const trackLeadSubmissionWithData = (leadData: Record<string, unknown>) => {
  if (typeof window !== 'undefined' && window.fbq) {
    try {
      // Oblicz wartość leada na podstawie wyboru
      const leadValue = calculateLeadValue(leadData);
      
      // Podstawowe dane Lead (bez PII)
      window.fbq('track', 'Lead', {
        value: leadValue,
        currency: 'PLN',
        content_name: 'Lead Capture Form',
        content_category: 'Car Mats',
        content_type: 'product',
        
        // Dodatkowe dane trackingowe (bez PII)
        custom_data: {
          utm_source: leadData.utmSource,
          utm_medium: leadData.utmMedium,
          utm_campaign: leadData.utmCampaign,
          utm_term: leadData.utmTerm,
          utm_content: leadData.utmContent,
          gclid: leadData.gclid,
          fbclid: leadData.fbclid,
          session_id: leadData.sessionId,
          first_visit: leadData.firstVisit,
          current_url: leadData.currentUrl,
          referrer: leadData.referrer,
          user_agent: leadData.userAgent,
          
          // Dane produktu
          product_type: leadData.industry,
          completeness: leadData.completeness,
          structure: leadData.structure,
          border_color: leadData.borderColor,
          material_color: leadData.materialColor,
          include_hooks: leadData.includeHooks,
          
          // Dane użytkownika (bez PII)
          car_model: leadData.company,
          car_year: leadData.jobTitle
        }
      });
      
      // Dodatkowe zdarzenie - CompleteRegistration
      window.fbq('track', 'CompleteRegistration', {
        value: leadValue,
        currency: 'PLN',
        content_name: 'Lead Registration Complete',
        content_category: 'Car Mats',
        registration_method: 'form_submission'
      });
      
      console.log('📊 Pixel: Wysłano dane trackingowe do Facebook:', {
        utm_source: leadData.utmSource,
        utm_campaign: leadData.utmCampaign,
        session_id: leadData.sessionId,
        lead_value: leadValue
      });
    } catch (error) {
      console.error('❌ Pixel: Error sending Lead data:', error);
    }
  } else {
    console.warn('⚠️ Pixel: fbq not available');
  }
};

// Nowa funkcja dla formularza lead capture
export const trackLeadCaptureFormView = () => {
  if (typeof window !== 'undefined' && window.fbq) {
    try {
      window.fbq('track', 'ViewContent', {
        content_name: 'Lead Capture Form - Car Mats',
        content_category: 'Lead Generation',
        content_type: 'form',
        value: 0,
        currency: 'PLN'
      });
      console.log('📊 Pixel: LeadCaptureFormView event sent');
    } catch (error) {
      console.error('❌ Pixel: Error sending LeadCaptureFormView event:', error);
    }
  } else {
    console.warn('⚠️ Pixel: fbq not available');
  }
};

// Funkcja dla rozpoczęcia wypełniania formularza
export const trackFormInteraction = () => {
  if (typeof window !== 'undefined' && window.fbq) {
    try {
      window.fbq('track', 'InitiateCheckout', {
        content_name: 'Lead Capture Form - Car Mats',
        content_category: 'Lead Generation',
        content_type: 'form',
        value: 0,
        currency: 'PLN'
      });
      console.log('📊 Pixel: FormInteraction event sent');
    } catch (error) {
      console.error('❌ Pixel: Error sending FormInteraction event:', error);
    }
  } else {
    console.warn('⚠️ Pixel: fbq not available');
  }
};

// ===== NOWE FUNKCJE ŚLEDZENIA KROKÓW =====

// KROK 1: Dane o aucie
export const trackStep1View = () => {
  if (typeof window !== 'undefined' && window.fbq) {
    try {
      window.fbq('track', 'ViewContent', {
        content_name: 'Vehicle Information Step',
        content_category: 'Lead Generation',
        content_type: 'form_step',
        value: 0,
        currency: 'PLN'
      });
      console.log('📊 Pixel: Step 1 View event sent');
    } catch (error) {
      console.error('❌ Pixel: Error sending Step 1 View event:', error);
    }
  }
};

export const trackStep1Complete = (carData: { brand?: string; model?: string; year?: string }) => {
  if (typeof window !== 'undefined' && window.fbq) {
    try {
      window.fbq('track', 'InitiateCheckout', {
        content_name: 'Car Details Completed',
        content_category: 'Lead Generation',
        content_type: 'form_step',
        value: 0,
        currency: 'PLN',
        custom_data: {
          car_brand: carData.brand,
          car_model: carData.model,
          car_year: carData.year
        }
      });
      console.log('📊 Pixel: Step 1 Complete event sent', carData);
    } catch (error) {
      console.error('❌ Pixel: Error sending Step 1 Complete event:', error);
    }
  }
};

// KROK 2: Dane kontaktowe
export const trackStep2View = () => {
  if (typeof window !== 'undefined' && window.fbq) {
    try {
      window.fbq('track', 'ViewContent', {
        content_name: 'Contact Information Step',
        content_category: 'Lead Generation',
        content_type: 'form_step',
        value: 0,
        currency: 'PLN'
      });
      console.log('📊 Pixel: Step 2 View event sent');
    } catch (error) {
      console.error('❌ Pixel: Error sending Step 2 View event:', error);
    }
  }
};

export const trackStep2PartialLead = (contactData: { firstName?: string; phone?: string }) => {
  if (typeof window !== 'undefined' && window.fbq) {
    try {
      window.fbq('trackCustom', 'PartialLead', {
        lead_stage: 'partial',
        value: 15, // Wartość częściowego leada
        currency: 'PLN',
        content_name: 'Partial Lead Created',
        content_category: 'Lead Generation',
        content_type: 'partial_lead'
      });
      console.log('📊 Pixel: Step 2 Partial Lead event sent', contactData);
    } catch (error) {
      console.error('❌ Pixel: Error sending Step 2 Partial Lead event:', error);
    }
  }
};

export const trackStep2Complete = () => {
  if (typeof window !== 'undefined' && window.fbq) {
    try {
      window.fbq('track', 'InitiateCheckout', {
        content_name: 'Contact Data Added',
        content_category: 'Lead Generation',
        content_type: 'form_step',
        value: 15,
        currency: 'PLN'
      });
      console.log('📊 Pixel: Step 2 Complete event sent');
    } catch (error) {
      console.error('❌ Pixel: Error sending Step 2 Complete event:', error);
    }
  }
};

// KROK 3: Konfiguracja produktu
export const trackStep3View = () => {
  if (typeof window !== 'undefined' && window.fbq) {
    try {
      window.fbq('track', 'ViewContent', {
        content_name: 'Product Configuration Step',
        content_category: 'Lead Generation',
        content_type: 'form_step',
        value: 0,
        currency: 'PLN'
      });
      console.log('📊 Pixel: Step 3 View event sent');
    } catch (error) {
      console.error('❌ Pixel: Error sending Step 3 View event:', error);
    }
  }
};

export const trackStep3Configuration = (configData: { 
  industry?: string; 
  completeness?: string; 
  structure?: string; 
  materialColor?: string; 
  borderColor?: string; 
  includeHooks?: boolean 
}) => {
  if (typeof window !== 'undefined' && window.fbq) {
    try {
      const leadValue = calculateStep3LeadValue(configData);
      
      window.fbq('track', 'CustomizeProduct', {
        product_type: configData.industry,
        completeness: configData.completeness,
        structure: configData.structure,
        material_color: configData.materialColor,
        border_color: configData.borderColor,
        include_hooks: configData.includeHooks,
        value: leadValue,
        currency: 'PLN'
      });
      console.log('📊 Pixel: Step 3 Configuration event sent', configData);
    } catch (error) {
      console.error('❌ Pixel: Error sending Step 3 Configuration event:', error);
    }
  }
};

export const trackStep3CompleteLead = (fullLeadData: Record<string, unknown>) => {
  if (typeof window !== 'undefined' && window.fbq) {
    try {
      const leadValue = calculateStep3LeadValue(fullLeadData);
      
      // Główny event Lead (bez PII)
      window.fbq('track', 'Lead', {
        value: leadValue,
        currency: 'PLN',
        product_type: fullLeadData.industry,
        completeness: fullLeadData.completeness,
        structure: fullLeadData.structure,
        material_color: fullLeadData.materialColor,
        border_color: fullLeadData.borderColor,
        include_hooks: fullLeadData.includeHooks,
        custom_data: {
          lead_type: 'complete',
          utm_source: fullLeadData.utmSource,
          utm_medium: fullLeadData.utmMedium,
          utm_campaign: fullLeadData.utmCampaign,
          utm_term: fullLeadData.utmTerm,
          utm_content: fullLeadData.utmContent,
          gclid: fullLeadData.gclid,
          fbclid: fullLeadData.fbclid,
          session_id: fullLeadData.sessionId,
          first_visit: fullLeadData.firstVisit,
          current_url: fullLeadData.currentUrl,
          referrer: fullLeadData.referrer,
          user_agent: fullLeadData.userAgent,
          car_model: fullLeadData.company,
          car_year: fullLeadData.jobTitle
        }
      });
      
      // Event CompleteRegistration
      window.fbq('track', 'CompleteRegistration', {
        value: leadValue,
        currency: 'PLN'
      });
      
      console.log('📊 Pixel: Step 3 Complete Lead event sent', {
        lead_value: leadValue,
        utm_source: fullLeadData.utmSource,
        utm_campaign: fullLeadData.utmCampaign
      });
    } catch (error) {
      console.error('❌ Pixel: Error sending Step 3 Complete Lead event:', error);
    }
  }
};

// Funkcja obliczająca wartość leada dla kroku 3
const calculateStep3LeadValue = (configData: Record<string, unknown>): number => {
  let baseValue = 20; // Podstawowa wartość leada
  
  // +10 PLN za pełną konfigurację
  if (configData.industry && configData.completeness && configData.structure) {
    baseValue += 10;
  }
  
  // +15 PLN za opcje premium (3D z rantami)
  if (configData.industry === '3d-evapremium-z-rantami') {
    baseValue += 15;
  }
  
  // +5 PLN za haczyki
  if (configData.includeHooks) {
    baseValue += 5;
  }
  
  // +10 PLN za pełny komplet (przód-tył-bagażnik)
  if (configData.completeness === 'przod-tyl-bagaznik') {
    baseValue += 10;
  }
  
  return baseValue; // 20-60 PLN
};
