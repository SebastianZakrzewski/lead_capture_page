'use client';

import Image from 'next/image';
import LeadCaptureForm from '@/components/LeadCaptureForm';
import CarMatPreview from '@/components/CarMatPreview';
import FacebookPixel from '@/components/FacebookPixel';
import CountdownTimer from '@/components/CountdownTimer';
import { useEffect, useState } from 'react';
import { saveUtmParams } from '@/utils/tracking';
import { LeadFormData } from '@/types/lead';

export default function Home() {
  const [formData, setFormData] = useState<LeadFormData>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    company: '',
    jobTitle: '',
    industry: '',
    completeness: '',
    borderColor: '',
    materialColor: '',
    message: ''
  });

  const [isFormSubmitted, setIsFormSubmitted] = useState(false);

  useEffect(() => {
    // Inicjalizuj śledzenie przy pierwszym wejściu
    saveUtmParams();
  }, []);

  const handleFormDataChange = (newFormData: LeadFormData) => {
    setFormData(newFormData);
  };

  const handleFormSubmission = (submitted: boolean) => {
    setIsFormSubmitted(submitted);
  };

  return (
    <>
      {/* Facebook Pixel */}
      <FacebookPixel pixelId="YOUR_FACEBOOK_PIXEL_ID" />
      
      <div className="min-h-screen bg-black">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(220,38,38,0.03)_1px,transparent_0)] bg-[length:20px_20px] opacity-50"></div>
        
        {/* Header */}
        <header className="relative z-10 pt-8 pb-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              {/* Logo */}
              <div className="flex justify-center mb-8">
                <Image
                  src="/evapremium.png"
                  alt="Eva Premium Logo"
                  width={400}
                  height={160}
                  className="h-40 w-auto object-contain"
                  priority
                />
              </div>
              
              {/* Tytuł */}
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
                Dobierz dywaniki <span className="text-red-500">EVAPREMIUM</span> do swojego auta i odbierz -30% rabatu
              </h1>
              
              <p className="text-xl text-gray-300 max-w-2xl mx-auto mb-6">
                Wpisz dane swojego auta – przygotujemy indywidualną wycenę z rabatem ważnym tylko dziś.
              </p>
              
              {/* Countdown Timer */}
              <div className="max-w-md mx-auto mb-8">
                <CountdownTimer />
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="relative z-10 pb-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className={`grid gap-8 items-start layout-transition ${isFormSubmitted ? 'grid-cols-1' : 'grid-cols-1 lg:grid-cols-2'}`}>
              {/* Form */}
              <div className={`${isFormSubmitted ? 'max-w-2xl mx-auto' : 'order-2 lg:order-1'}`}>
                <LeadCaptureForm 
                  formData={formData}
                  onFormDataChange={handleFormDataChange} 
                  onFormSubmission={handleFormSubmission}
                />
              </div>
              
              {/* Preview - ukryj gdy formularz jest wysłany */}
              {!isFormSubmitted && (
                <div className="order-1 lg:order-2">
                  <CarMatPreview formData={formData} onFormDataChange={handleFormDataChange} />
                </div>
              )}
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className="relative z-10 border-t border-gray-800 bg-black/50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="grid grid-cols-1 gap-8 mb-8">
              {/* Company Info */}
              <div className="text-center">
                <div className="flex justify-center mb-4">
                  <Image
                    src="/evapremium.png"
                    alt="EVAPREMIUM CAR MATS"
                    width={200}
                    height={80}
                    className="h-20 w-auto object-contain"
                  />
                </div>
                <p className="text-gray-300 text-sm leading-relaxed max-w-md mx-auto">
                  Profesjonalne dywaniki samochodowe najwyższej jakości. 
                  Ochrona i styl dla Twojego pojazdu.
                </p>
              </div>
            </div>

            {/* Bottom Bar */}
            <div className="border-t border-gray-800 pt-8">
              <div className="flex justify-center items-center">
                <div className="text-gray-400 text-sm text-center">
                  <p>&copy; 2025 EVAPREMIUM CAR MATS. Wszystkie prawa zastrzeżone.</p>
                </div>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}
