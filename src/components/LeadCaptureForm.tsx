'use client';

import { useState, useCallback, useEffect } from 'react';
import { Mail, User, Phone, Building, CheckCircle, AlertCircle, Gift, Wifi, WifiOff } from 'lucide-react';
import { LeadFormData } from '@/types/lead';
import { prepareLeadSubmissionData } from '@/utils/tracking';
import { LeadService } from '@/backend/services/LeadService';
import { trackLeadSubmission, trackFormStart } from '@/components/FacebookPixel';

// Offline Support Hook
const useOfflineSupport = () => {
  const [isOnline, setIsOnline] = useState(true);
  const [pendingSubmissions, setPendingSubmissions] = useState<any[]>([]);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    setIsOnline(navigator.onLine);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const addPendingSubmission = (data: any) => {
    const pending = JSON.parse(localStorage.getItem('pendingSubmissions') || '[]');
    pending.push({ ...data, timestamp: Date.now() });
    localStorage.setItem('pendingSubmissions', JSON.stringify(pending));
    setPendingSubmissions(pending);
  };

  const clearPendingSubmissions = () => {
    localStorage.removeItem('pendingSubmissions');
    setPendingSubmissions([]);
  };

  const retryPendingSubmissions = async () => {
    const pending = JSON.parse(localStorage.getItem('pendingSubmissions') || '[]');
    if (pending.length === 0) return;

    for (const submission of pending) {
      try {
        const beaconSuccess = navigator.sendBeacon('/api/leads', JSON.stringify(submission));
        if (beaconSuccess) {
          console.log('✅ Retry successful for submission:', submission);
        }
      } catch (error) {
        console.error('❌ Retry failed for submission:', error);
      }
    }
    clearPendingSubmissions();
  };

  useEffect(() => {
    if (isOnline && pendingSubmissions.length > 0) {
      retryPendingSubmissions();
    }
  }, [isOnline]);

  return { isOnline, addPendingSubmission, pendingSubmissions };
};

// Phone Input with formatting and autocomplete
const PhoneInput = ({ 
  value, 
  onChange, 
  error 
}: { 
  value: string; 
  onChange: (value: string) => void; 
  error?: string; 
}) => {
  const formatPhoneNumber = (phone: string) => {
    // Remove all non-digits
    const cleaned = phone.replace(/\D/g, '');
    
    // Format based on length
    if (cleaned.length <= 3) {
      return cleaned;
    } else if (cleaned.length <= 6) {
      return `${cleaned.slice(0, 3)} ${cleaned.slice(3)}`;
    } else if (cleaned.length <= 9) {
      return `${cleaned.slice(0, 3)} ${cleaned.slice(3, 6)} ${cleaned.slice(6)}`;
    } else {
      return `${cleaned.slice(0, 3)} ${cleaned.slice(3, 6)} ${cleaned.slice(6, 9)} ${cleaned.slice(9, 11)}`;
    }
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhoneNumber(e.target.value);
    onChange(formatted);
  };

  const handlePhoneBlur = () => {
    // Auto-add country code if not present
    if (value && !value.startsWith('+48') && !value.startsWith('48')) {
      const cleaned = value.replace(/\D/g, '');
      if (cleaned.length === 9) {
        onChange(`+48 ${formatPhoneNumber(cleaned)}`);
      }
    }
  };

  return (
    <div className="space-y-2">
      <label htmlFor="phone" className="block text-sm font-medium text-gray-300">
        Numer Telefonu <span className="text-red-400">*</span>
      </label>
      <div className="relative">
        <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="tel"
          id="phone"
          name="phone"
          value={value}
          onChange={handlePhoneChange}
          onBlur={handlePhoneBlur}
          required
          className={`w-full pl-10 pr-4 py-3 bg-gray-800/50 border rounded-xl text-white placeholder-gray-400 focus:outline-none transition-all duration-200 ${
            error 
              ? 'border-red-500 focus:ring-2 focus:ring-red-500' 
              : 'border-gray-700 hover:border-red-500/50 focus:ring-2 focus:ring-red-500 focus:border-transparent'
          }`}
          placeholder="np. +48 123 456 789"
          autoComplete="tel"
        />
      </div>
      {error && (
        <div className="flex items-center gap-2 text-red-400 text-sm">
          <AlertCircle className="w-4 h-4" />
          {error}
        </div>
      )}
    </div>
  );
};

// Przenoszę InputField poza główny komponent
const InputField = ({ 
  label, 
  name, 
  type = 'text', 
  required = false, 
  icon: Icon, 
  placeholder,
  error,
  value,
  onChange
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  icon?: React.ComponentType<{ className?: string }>;
  placeholder: string;
  error?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}) => (
  <div className="space-y-2">
    <label htmlFor={name} className="block text-sm font-medium text-gray-300">
      {label} {required && <span className="text-red-400">*</span>}
    </label>
    <div className="relative">
      {Icon && (
        <Icon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
      )}
      <input
        type={type}
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        className={`w-full ${Icon ? 'pl-10' : 'pl-4'} pr-4 py-3 bg-gray-800/50 border rounded-xl text-white placeholder-gray-400 focus:outline-none transition-all duration-200 ${
          error 
            ? 'border-red-500 focus:ring-2 focus:ring-red-500' 
            : 'border-gray-700 hover:border-red-500/50 focus:ring-2 focus:ring-red-500 focus:border-transparent'
        }`}
        placeholder={placeholder}
      />
    </div>
    {error && (
      <div className="flex items-center gap-2 text-red-400 text-sm">
        <AlertCircle className="w-4 h-4" />
        {error}
      </div>
    )}
  </div>
);

interface LeadCaptureFormProps {
  formData: LeadFormData;
  onFormDataChange?: (formData: LeadFormData) => void;
  onFormSubmission?: (submitted: boolean) => void;
}

export default function LeadCaptureForm({ formData, onFormDataChange, onFormSubmission }: LeadCaptureFormProps) {
  const [errors, setErrors] = useState<Partial<LeadFormData>>({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [includeHooks, setIncludeHooks] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  const { isOnline, addPendingSubmission, pendingSubmissions } = useOfflineSupport();

  const validateForm = (): boolean => {
    const newErrors: Partial<LeadFormData> = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = 'Imię jest wymagane';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Numer telefonu jest wymagany';
    } else {
      const cleanedPhone = formData.phone.replace(/\D/g, '');
      if (cleanedPhone.length < 9) {
        newErrors.phone = 'Wprowadź poprawny numer telefonu (min. 9 cyfr)';
      }
    }

    setErrors(newErrors);
    
    console.log('Walidacja formularza:', { newErrors, hasErrors: Object.keys(newErrors).length > 0 });
    
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    const newFormData = {
      ...formData,
      [name]: value
    };

    // Log color selections
    if (name === 'borderColor' || name === 'materialColor') {
      console.log(`🎨 Kolor ${name}:`, value);
    }

    // Notify parent component about form data changes
    if (onFormDataChange) {
      onFormDataChange(newFormData);
    }

    // Clear error when user starts typing
    if (errors[name as keyof LeadFormData]) {
      setErrors(prev => ({
        ...prev,
        [name]: undefined
      }));
    }

    // Track form start when user begins filling
    if (name === 'firstName' && value.trim() && !formData.firstName.trim()) {
      trackFormStart();
    }
  }, [errors, formData, onFormDataChange]);

  const handlePhoneChange = (value: string) => {
    const newFormData = {
      ...formData,
      phone: value
    };

    if (onFormDataChange) {
      onFormDataChange(newFormData);
    }

    if (errors.phone) {
      setErrors(prev => ({
        ...prev,
        phone: undefined
      }));
    }
  };

  const submitWithRetry = async (leadPayload: any, maxRetries: number = 3): Promise<boolean> => {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.log(`📤 Próba wysłania ${attempt}/${maxRetries}:`, leadPayload);
        
        // Beacon API
        const beaconSuccess = navigator.sendBeacon('/api/leads', JSON.stringify(leadPayload));
        
        if (beaconSuccess) {
          console.log('✅ Dane wysłane przez Beacon API');
          return true;
        }

        // Fallback do LeadService
        await LeadService.createLead({
          firstName: formData.firstName,
          phone: formData.phone,
          company: formData.company || undefined,
          jobTitle: formData.jobTitle || undefined,
          industry: formData.industry || undefined,
          completeness: formData.completeness || undefined,
          borderColor: formData.borderColor || undefined,
          materialColor: formData.materialColor || undefined,
        });
        
        console.log('✅ Dane wysłane przez LeadService');
        return true;
        
      } catch (error) {
        console.error(`❌ Próba ${attempt} nieudana:`, error);
        
        if (attempt === maxRetries) {
          return false;
        }
        
        // Wait before retry (exponential backoff)
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
      }
    }
    return false;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    // Natychmiast pokaż stronę sukcesu
    setIsSubmitted(true);
    
    // Powiadom komponent nadrzędny o wysłaniu formularza
    if (onFormSubmission) {
      onFormSubmission(true);
    }
    
    try {
      // Przygotuj dane z informacjami o śledzeniu
      const leadData = prepareLeadSubmissionData(formData);
      
      console.log('Dane leada z trackingiem:', leadData);
      
      // Track lead submission for Facebook Pixel
      trackLeadSubmission(100, 'PLN'); // Assuming 100 PLN value
      
      // Przygotuj dane do wysłania przez Beacon API
      const leadPayload = {
        firstName: formData.firstName,
        phone: formData.phone,
        company: formData.company || undefined,
        jobTitle: formData.jobTitle || undefined,
        industry: formData.industry || undefined,
        completeness: formData.completeness || undefined,
        borderColor: formData.borderColor || undefined,
        materialColor: formData.materialColor || undefined,
        includeHooks: includeHooks,
        // Dodaj timestamp i tracking data
        timestamp: new Date().toISOString(),
        sessionId: leadData.sessionId,
        utmSource: leadData.utmSource,
        utmMedium: leadData.utmMedium,
        utmCampaign: leadData.utmCampaign,
        referrer: leadData.referrer,
        gclid: leadData.gclid,
        fbclid: leadData.fbclid,
      };

      console.log('📤 Dane do wysłania:', leadPayload);
      console.log('🎨 Kolory w formData:', { 
        borderColor: formData.borderColor, 
        materialColor: formData.materialColor 
      });
      
      // Try to submit with retry mechanism
      const success = await submitWithRetry(leadPayload);
      
      if (!success) {
        // If all retries failed, save to offline storage
        if (!isOnline) {
          addPendingSubmission(leadPayload);
          console.log('💾 Dane zapisane offline');
        } else {
          console.error('❌ Wszystkie próby wysłania nieudane');
        }
      }
      
      // Reset form after 3 seconds
      setTimeout(() => {
        setIsSubmitted(false);
        setIsSubmitting(false);
        setRetryCount(0);
        
        // Reset form data through parent component
        if (onFormDataChange) {
          onFormDataChange({
            firstName: '',
            lastName: '',
            phone: '',
            company: '',
            jobTitle: '',
            industry: '',
            completeness: '',
            borderColor: '',
            materialColor: '',
            message: ''
          });
        }
        
        setErrors({});
        setIncludeHooks(false);
        
        // Powiadom komponent nadrzędny o zresetowaniu formularza
        if (onFormSubmission) {
          onFormSubmission(false);
        }
      }, 3000);
    } catch (error) {
      console.error('Error in handleSubmit:', error);
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="card-glass rounded-2xl p-8 text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-red-500 to-red-600 rounded-full flex items-center justify-center mx-auto mb-6 animate-float">
            <CheckCircle className="w-8 h-8 text-white" />
          </div>
          <h3 className="text-2xl font-bold text-white mb-4">Dziękujemy!</h3>
          <p className="text-gray-300 text-lg mb-4">
            Twoje dane zostały pomyślnie wysłane. Skontaktujemy się z Tobą w ciągu 24 godzin!
          </p>
          {includeHooks && (
            <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4">
              <div className="flex items-center gap-2">
                <Gift className="w-5 h-5 text-green-400" />
                <span className="text-green-400 font-medium">Podpiętka gratis dołączona do zamówienia!</span>
              </div>
            </div>
          )}
          {!isOnline && (
            <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-4 mt-4">
              <div className="flex items-center gap-2">
                <WifiOff className="w-5 h-5 text-yellow-400" />
                <span className="text-yellow-400 font-medium">Dane zapisane offline - wyślemy gdy wróci internet</span>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto w-full">
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-red-500 via-red-600 to-red-500 rounded-3xl blur-sm opacity-25 animate-gradient-pulse"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-red-400 via-red-500 to-red-400 rounded-3xl blur-md opacity-15 animate-gradient-glow" style={{ animationDelay: '1s' }}></div>
        <div className="absolute inset-0 bg-gradient-to-r from-red-600 via-red-700 to-red-600 rounded-3xl blur-lg opacity-10 animate-gradient-shimmer" style={{ animationDelay: '2s' }}></div>
        <div className="relative card-glass glass-optimized rounded-3xl p-8 shadow-2xl w-full">
          {/* Form Header */}
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-gradient-to-r from-red-500 to-red-600 rounded-full flex items-center justify-center mx-auto mb-6 animate-float">
              <Mail className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-3xl font-bold text-white mb-4">Wypełnij formularz</h2>
            <p className="text-gray-400 text-lg">
              Podaj dane swojego auta i otrzymaj indywidualną wycenę z rabatem -30%
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Personal Information */}
            <div className="space-y-6">
              <InputField
                label="Imię"
                name="firstName"
                icon={User}
                placeholder="Wprowadź swoje imię"
                error={errors.firstName}
                value={formData.firstName}
                onChange={handleInputChange}
              />

              <PhoneInput
                value={formData.phone}
                onChange={handlePhoneChange}
                error={errors.phone}
              />
            </div>

            {/* Company Information */}
            <div className="space-y-6">
              <InputField
                label="Marka i Model Auta"
                name="company"
                icon={Building}
                placeholder="np. BMW X5, Audi A4"
                value={formData.company}
                onChange={handleInputChange}
              />

              <InputField
                label="Rok Produkcji"
                name="jobTitle"
                placeholder="np. 2020"
                value={formData.jobTitle}
                onChange={handleInputChange}
              />
            </div>

            {/* Podpiętka Gratis */}
            <div className="bg-gradient-to-r from-green-500/10 to-green-600/10 border border-green-500/20 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <input
                  type="checkbox"
                  id="includeHooks"
                  checked={includeHooks}
                  onChange={(e) => setIncludeHooks(e.target.checked)}
                  className="mt-1 w-4 h-4 text-red-500 bg-gray-800 border-gray-600 rounded focus:ring-red-500 focus:ring-2"
                />
                <div>
                  <label htmlFor="includeHooks" className="flex items-center gap-2 text-green-400 font-medium cursor-pointer">
                    <Gift className="w-5 h-5" />
                    Dodaj podpiętkę GRATIS do kompletu
                  </label>
                  <p className="text-gray-300 text-sm mt-1">
                    Otrzymasz dodatkowo podpiętkę wartą 29 zł całkowicie za darmo!
                  </p>
                </div>
              </div>
            </div>

            {/* Personalization Info */}
            <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-4 h-4 bg-blue-500 rounded-full"></div>
                <span className="text-blue-400 text-sm font-medium">Personalizacja dywanika</span>
              </div>
              <p className="text-gray-300 text-sm">
                Typ dywaników, rodzaj kompletu oraz kolory możesz wybrać w oknie podglądu po prawej stronie. 
                Spersonalizuj swój dywanik według własnych preferencji!
              </p>
            </div>

            {/* Submit Button */}
            <div className="pt-4">
              <button
                type="submit"
                disabled={!formData.firstName.trim() || !formData.phone.trim() || isSubmitting}
                className="w-full btn-primary text-white font-semibold py-4 px-6 rounded-xl hover-scale focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {isSubmitting ? 'Wysyłanie...' : 'Wyślij i Otrzymaj Rabat -30%'}
              </button>
            </div>

            {/* Privacy Notice */}
            <p className="text-xs text-gray-500 text-center">
              By submitting this form, you agree to our{' '}
              <a href="#" className="text-red-400 hover:text-red-300 underline">privacy policy</a>{' '}
              and consent to being contacted about our services.
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
