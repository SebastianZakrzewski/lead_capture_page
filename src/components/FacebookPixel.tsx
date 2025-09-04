'use client';

import { useEffect } from 'react';
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
}

export default function FacebookPixel({ pixelId }: FacebookPixelProps) {
  const pathname = usePathname();

  useEffect(() => {
    // Load Facebook Pixel script
    if (typeof window !== 'undefined') {
      // Initialize Facebook Pixel
      window.fbq = window.fbq || function(...args: unknown[]) {
        if (window.fbq.callMethod) {
          window.fbq.callMethod(...args);
        } else if (window.fbq.queue) {
          window.fbq.queue.push(args);
        }
      } as Window['fbq'];
      
      if (!window._fbq) window._fbq = window.fbq;
      window.fbq.push = window._fbq;
      window.fbq.loaded = true;
      window.fbq.version = '2.0';
      window.fbq.queue = [];

      // Create script element
      const script = document.createElement('script');
      script.async = true;
      script.src = `https://connect.facebook.net/en_US/fbevents.js`;
      document.head.appendChild(script);

      // Initialize pixel
      window.fbq('init', pixelId);
      window.fbq('track', 'PageView');
    }
  }, [pixelId]);

  useEffect(() => {
    // Track page views on route changes
    if (typeof window !== 'undefined' && window.fbq) {
      window.fbq('track', 'PageView');
    }
  }, [pathname]);

  return null; // This component doesn't render anything
}

// Utility functions for tracking events
export const trackLeadSubmission = (value?: number, currency = 'PLN') => {
  if (typeof window !== 'undefined' && window.fbq) {
    window.fbq('track', 'Lead', {
      value: value || 0,
      currency: currency,
      content_name: 'Lead Capture Form',
      content_category: 'Car Mats',
      content_type: 'product'
    });
  }
};

export const trackFormView = () => {
  if (typeof window !== 'undefined' && window.fbq) {
    window.fbq('track', 'ViewContent', {
      content_name: 'Lead Capture Form',
      content_category: 'Car Mats',
      content_type: 'product'
    });
  }
};

export const trackFormStart = () => {
  if (typeof window !== 'undefined' && window.fbq) {
    window.fbq('track', 'InitiateCheckout', {
      content_name: 'Lead Capture Form',
      content_category: 'Car Mats',
      content_type: 'product'
    });
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
    // Oblicz wartość leada na podstawie wyboru
    const leadValue = calculateLeadValue(leadData);
    
    // Podstawowe dane Lead
    window.fbq('track', 'Lead', {
      value: leadValue,
      currency: 'PLN',
      content_name: 'Lead Capture Form',
      content_category: 'Car Mats',
      content_type: 'product',
      
      // Dodatkowe dane trackingowe
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
        
        // Dane użytkownika
        car_model: leadData.company,
        car_year: leadData.jobTitle,
        phone: leadData.phone,
        email: leadData.email
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
  }
};

// Nowa funkcja dla formularza lead capture
export const trackLeadCaptureFormView = () => {
  if (typeof window !== 'undefined' && window.fbq) {
    window.fbq('track', 'ViewContent', {
      content_name: 'Lead Capture Form - Car Mats',
      content_category: 'Lead Generation',
      content_type: 'form',
      value: 0,
      currency: 'PLN'
    });
  }
};

// Funkcja dla rozpoczęcia wypełniania formularza
export const trackFormInteraction = () => {
  if (typeof window !== 'undefined' && window.fbq) {
    window.fbq('track', 'InitiateCheckout', {
      content_name: 'Lead Capture Form - Car Mats',
      content_category: 'Lead Generation',
      content_type: 'form',
      value: 0,
      currency: 'PLN'
    });
  }
};
