/* eslint-disable */
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
  if (typeof window !== 'undefined' && window.fbq && window.fbq.loaded) {
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
    console.warn('⚠️ Pixel: fbq not available or not loaded');
  }
};

export const trackFormView = () => {
  if (typeof window !== 'undefined' && window.fbq && window.fbq.loaded) {
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
    console.warn('⚠️ Pixel: fbq not available or not loaded');
  }
};

export const trackFormStart = () => {
  if (typeof window !== 'undefined' && window.fbq && window.fbq.loaded) {
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
    console.warn('⚠️ Pixel: fbq not available or not loaded');
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
  if (typeof window !== 'undefined' && window.fbq && window.fbq.loaded) {
    try {
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
    } catch (error) {
      console.error('❌ Pixel: Error sending Lead data:', error);
    }
  } else {
    console.warn('⚠️ Pixel: fbq not available or not loaded');
  }
};

// Nowa funkcja dla formularza lead capture
export const trackLeadCaptureFormView = () => {
  if (typeof window !== 'undefined' && window.fbq && window.fbq.loaded) {
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
    console.warn('⚠️ Pixel: fbq not available or not loaded');
  }
};

// Funkcja dla rozpoczęcia wypełniania formularza
export const trackFormInteraction = () => {
  if (typeof window !== 'undefined' && window.fbq && window.fbq.loaded) {
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
    console.warn('⚠️ Pixel: fbq not available or not loaded');
  }
};
