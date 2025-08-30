'use client';

import { useState } from 'react';
import { Mail, User, Phone, Building, CheckCircle, AlertCircle } from 'lucide-react';
import { LeadFormData, INDUSTRY_OPTIONS } from '@/types/lead';

export default function LeadCaptureForm() {
  const [formData, setFormData] = useState<LeadFormData>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    company: '',
    jobTitle: '',
    industry: '',
    message: ''
  });

  const [errors, setErrors] = useState<Partial<LeadFormData>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const validateForm = (): boolean => {
    const newErrors: Partial<LeadFormData> = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (formData.phone && !/^[\+]?[1-9][\d]{0,15}$/.test(formData.phone.replace(/\s/g, ''))) {
      newErrors.phone = 'Please enter a valid phone number';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Clear error when user starts typing
    if (errors[name as keyof LeadFormData]) {
      setErrors(prev => ({
        ...prev,
        [name]: undefined
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setIsSubmitting(false);
      setIsSubmitted(true);
      
      // Reset form after 3 seconds
      setTimeout(() => {
        setIsSubmitted(false);
        setFormData({
          firstName: '',
          lastName: '',
          email: '',
          phone: '',
          company: '',
          jobTitle: '',
          industry: '',
          message: ''
        });
        setErrors({});
      }, 3000);
    } catch (error) {
      setIsSubmitting(false);
      console.error('Submission error:', error);
    }
  };

  const InputField = ({ 
    label, 
    name, 
    type = 'text', 
    required = false, 
    icon: Icon, 
    placeholder,
    error 
  }: {
    label: string;
    name: keyof LeadFormData;
    type?: string;
    required?: boolean;
    icon?: React.ComponentType<{ className?: string }>;
    placeholder: string;
    error?: string;
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
          value={formData[name]}
          onChange={handleInputChange}
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

  if (isSubmitted) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="card-glass rounded-2xl p-8 text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-red-500 to-red-600 rounded-full flex items-center justify-center mx-auto mb-6 animate-float">
            <CheckCircle className="w-8 h-8 text-white" />
          </div>
          <h3 className="text-2xl font-bold text-white mb-4">Thank You!</h3>
          <p className="text-gray-300 text-lg">
            Your information has been successfully submitted. We'll be in touch within 24 hours!
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto w-full">
      <div className="card-glass rounded-3xl p-8 shadow-2xl w-full">
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
               required
               icon={User}
               placeholder="Wprowadź swoje imię"
               error={errors.firstName}
             />
           </div>

          {/* Contact Information */}
          <div className="space-y-6">
            <InputField
              label="Adres Email"
              name="email"
              type="email"
              required
              icon={Mail}
              placeholder="Wprowadź swój adres email"
              error={errors.email}
            />

            <InputField
              label="Numer Telefonu"
              name="phone"
              type="tel"
              icon={Phone}
              placeholder="Wprowadź swój numer telefonu"
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
            />

            <InputField
              label="Rok Produkcji"
              name="jobTitle"
              placeholder="np. 2020"
            />
          </div>

          {/* Industry */}
          <div className="space-y-2">
            <label htmlFor="industry" className="block text-sm font-medium text-gray-300">
              Typ Dywaników
            </label>
            <select
              id="industry"
              name="industry"
              value={formData.industry}
              onChange={handleInputChange}
              className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-200 hover:border-red-500/50"
            >
              <option value="">Wybierz typ dywaników</option>
              <option value="standard">Standardowe</option>
              <option value="premium">Premium</option>
              <option value="custom">Indywidualne</option>
              <option value="winter">Zimowe</option>
              <option value="summer">Letnie</option>
            </select>
          </div>



          {/* Submit Button */}
          <div className="pt-4">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full btn-primary text-white font-semibold py-4 px-6 rounded-xl transition-all duration-200 transform hover:scale-105 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {isSubmitting ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Submitting...
                </div>
              ) : (
                'Wyślij i Otrzymaj Rabat -30%'
              )}
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
  );
}
