'use client';

import Image from 'next/image';
import LeadCaptureForm from '@/components/LeadCaptureForm';
import FacebookPixel from '@/components/FacebookPixel';
import CountdownTimer from '@/components/CountdownTimer';
import { useEffect, useState } from 'react';
import { saveUtmParams } from '@/utils/tracking';
import { LeadFormData } from '@/types/lead';
import { Star, Shield, Truck, Clock, Users, Award, CheckCircle } from 'lucide-react';

export default function Home() {
  const [formData, setFormData] = useState<LeadFormData>({
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

              {/* Social Proof */}
              <div className="flex justify-center items-center gap-6 mb-12">
                <div className="flex items-center gap-2">
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                    ))}
                  </div>
                  <span className="text-gray-300 text-sm">4.9/5</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-green-400" />
                  <span className="text-gray-300 text-sm">15,000+ zadowolonych klientów</span>
                </div>
                <div className="flex items-center gap-2">
                  <Award className="w-5 h-5 text-blue-400" />
                  <span className="text-gray-300 text-sm">Certyfikowane produkty</span>
                </div>
              </div>
              
              {/* Countdown Timer */}
              <div className="max-w-md mx-auto mb-16">
                <CountdownTimer />
              </div>

              {/* Benefits */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto mb-8">
                <div className="text-center">
                  <Shield className="w-8 h-8 text-red-400 mx-auto mb-2" />
                  <h3 className="text-white font-semibold mb-1">Gwarancja jakości</h3>
                  <p className="text-gray-300 text-sm">2 lata gwarancji na wszystkie produkty</p>
                </div>
                <div className="text-center">
                  <Truck className="w-8 h-8 text-red-400 mx-auto mb-2" />
                  <h3 className="text-white font-semibold mb-1">Darmowa dostawa</h3>
                  <p className="text-gray-300 text-sm">Bezpłatna wysyłka przy zamówieniach powyżej 200 zł</p>
                </div>
                <div className="text-center">
                  <CheckCircle className="w-8 h-8 text-red-400 mx-auto mb-2" />
                  <h3 className="text-white font-semibold mb-1">Gwarancja dopasowania</h3>
                  <p className="text-gray-300 text-sm">100% dopasowanie dywaników do Twojego auta</p>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="relative z-10 pb-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-center">
              <div className="max-w-2xl mx-auto w-full">
                <LeadCaptureForm 
                  formData={formData}
                  onFormDataChange={handleFormDataChange} 
                  onFormSubmission={handleFormSubmission}
                />
              </div>
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
