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
