'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { LeadFormData, LeadSubmissionResponse } from '@/types/lead';
import { LeadService } from '@/backend/services/LeadService';
import { prepareLeadSubmissionData } from '@/utils/tracking';

import { BORDER_COLOR_OPTIONS, MATERIAL_COLOR_OPTIONS } from '@/types/lead';
import { Mail, User, Building, CheckCircle, WifiOff, Phone, AlertCircle, Package, Palette, ChevronDown, ArrowLeft, ArrowRight, Car, Shield, Loader2, Image } from 'lucide-react';
import { useCarMatImage } from '@/hooks/useCarMatImage';
import { generateImagePath, getAvailableMaterialColors } from '@/utils/carmatMapper';
import { CarMatData } from '@/types/carMat';

interface LeadCaptureFormProps {
  formData: LeadFormData;
  onFormDataChange?: (newFormData: LeadFormData) => void;
  onFormSubmission?: (submitted: boolean) => void;
}

interface InputFieldProps {
  label: string;
  name: keyof LeadFormData;
  icon?: React.ComponentType<{ className?: string }>;
  placeholder?: string;
  error?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
}

const InputField: React.FC<InputFieldProps> = ({ label, name, icon: Icon, placeholder, error, value, onChange }) => {
  return (
  <div className="space-y-2">
      <label className="flex items-center gap-2 text-white font-medium text-sm">
        {Icon && <Icon className="w-4 h-4 text-red-400" />}
        {label}
    </label>
      <input
        type="text"
        name={name}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        className={`w-full p-3 bg-gray-800/30 border rounded-lg text-white placeholder-gray-400 form-input-focus form-input-hover ${
          error ? 'border-red-500' : 'border-gray-600'
        }`}
      />
      {error && (
        <div className="flex items-center gap-2 text-red-400 text-sm">
          <AlertCircle className="w-4 h-4" />
          {error}
        </div>
      )}
    </div>
  );
};

interface PhoneInputProps {
  value: string; 
  onChange: (value: string) => void; 
  error?: string; 
}
    
const PhoneInput: React.FC<PhoneInputProps> = ({ value, onChange, error }) => {
  const formatPhoneNumber = (input: string) => {
    const cleaned = input.replace(/\D/g, '');
    if (cleaned.length <= 3) {
      return cleaned;
    } else if (cleaned.length <= 6) {
      return `${cleaned.slice(0, 3)} ${cleaned.slice(3)}`;
    } else if (cleaned.length <= 9) {
      return `${cleaned.slice(0, 3)} ${cleaned.slice(3, 6)} ${cleaned.slice(6)}`;
    } else {
      return `${cleaned.slice(0, 3)} ${cleaned.slice(3, 6)} ${cleaned.slice(6, 9)}`;
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhoneNumber(e.target.value);
    onChange(formatted);
  };

  return (
    <div className="space-y-2">
      <label className="flex items-center gap-2 text-white font-medium text-sm">
        <Phone className="w-4 h-4 text-red-400" />
        Numer Telefonu
      </label>
        <input
          type="tel"
        placeholder="123 456 789"
          value={value}
        onChange={handleChange}
        className={`w-full p-3 bg-gray-800/30 border rounded-lg text-white placeholder-gray-400 form-input-focus form-input-hover ${
          error ? 'border-red-500' : 'border-gray-600'
        }`}
      />
    {error && (
      <div className="flex items-center gap-2 text-red-400 text-sm">
        <AlertCircle className="w-4 h-4" />
        {error}
      </div>
    )}
  </div>
);
};

const ProgressBar: React.FC<{ currentStep: number; totalSteps: number }> = ({ currentStep, totalSteps }) => {
  const progress = (currentStep / totalSteps) * 100;
  
  return (
    <div className="mb-8">
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm text-gray-300">Krok {currentStep} z {totalSteps}</span>
        <span className="text-sm text-gray-300">{Math.round(progress)}%</span>
      </div>
      <div className="w-full bg-gray-700 rounded-full h-2">
        <div 
          className="bg-gradient-to-r from-red-500 to-red-600 h-2 rounded-full transition-all duration-500 ease-out"
          style={{ width: `${progress}%` }}
      />
    </div>
  </div>
);
};

export default function LeadCaptureForm({ formData, onFormDataChange, onFormSubmission }: LeadCaptureFormProps) {
  const [errors, setErrors] = useState<Partial<LeadFormData>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isOnline, setIsOnline] = useState(true);
  const [showStep3Errors, setShowStep3Errors] = useState(false);
  const [touchedMatType, setTouchedMatType] = useState(false);
  const [touchedCompleteness, setTouchedCompleteness] = useState(false);
  const [touchedStructure, setTouchedStructure] = useState(false);

  
  // Step management
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 3;
  
  // Dropdown states
  const [isMatTypeOpen, setIsMatTypeOpen] = useState(false);
  const [isCompletenessOpen, setIsCompletenessOpen] = useState(false);
  const [isStructureOpen, setIsStructureOpen] = useState(false);

  // Hook do zarządzania zdjęciami dywaników
  const { imageData, isLoading: isImageLoading, error: imageError, findImage, clearImage } = useCarMatImage();

  const mapUiColorToPl = useCallback((formColor: string): string => {
    const colorMapping: Record<string, string> = {
      red: 'czerwony',
      black: 'czarny',
      blue: 'niebieski',
      yellow: 'żółty',
      lime: 'zielony',
      orange: 'pomarańczowy',
      purple: 'fioletowy',
      brown: 'brązowy',
      maroon: 'bordowy',
      pink: 'różowy',
      darkblue: 'ciemnoniebieski',
      darkgreen: 'ciemnozielony',
      darkgrey: 'ciemnoszary',
      lightgrey: 'jasnoszary',
      beige: 'beżowy',
      lightbeige: 'jasnobeżowy',
      white: 'biały',
      ivory: 'kość słoniowa',
    };
    return colorMapping[formColor] || formColor;
  }, []);

  const fallbackImagePath = React.useMemo(() => {
    if (!formData.industry || !formData.structure || !formData.materialColor || !formData.borderColor) {
      return '';
    }
    const matType = formData.industry === '3d-evapremium-z-rantami' ? '3d-with-rims' : '3d-without-rims';
    const cellStructure = formData.structure === 'romb' ? 'rhombus' : 'honeycomb';
    const materialColorPl = mapUiColorToPl(formData.materialColor);
    const borderColorPl = mapUiColorToPl(formData.borderColor);
    return generateImagePath({
      matType,
      cellStructure,
      materialColor: materialColorPl,
      borderColor: borderColorPl,
    } as Omit<CarMatData, 'imagePath'>);
  }, [formData.industry, formData.structure, formData.materialColor, formData.borderColor, mapUiColorToPl]);

  useEffect(() => {
    const handleOnlineStatus = () => {
      setIsOnline(navigator.onLine);
    };

    window.addEventListener('online', handleOnlineStatus);
    window.addEventListener('offline', handleOnlineStatus);
    setIsOnline(navigator.onLine);

    return () => {
      window.removeEventListener('online', handleOnlineStatus);
      window.removeEventListener('offline', handleOnlineStatus);
    };
  }, []);

  // Hide step 3 errors until the user interacts or attempts submit
  useEffect(() => {
    if (currentStep === 3) {
      setShowStep3Errors(false);
      setTouchedMatType(false);
      setTouchedCompleteness(false);
      setTouchedStructure(false);
    }
  }, [currentStep]);

  // Automatyczne wyszukiwanie zdjęcia dywanika gdy wszystkie opcje są wybrane
  useEffect(() => {
    console.log('🔄 Formularz: useEffect wywołany z opcjami:', {
      industry: formData.industry,
      structure: formData.structure,
      materialColor: formData.materialColor,
      borderColor: formData.borderColor
    });
    
    if (formData.industry && formData.structure && formData.materialColor && formData.borderColor) {
      console.log('✅ Formularz: Wszystkie opcje wybrane, wyszukuję zdjęcie...');
      findImage({
        matType: formData.industry,
        cellStructure: formData.structure,
        materialColor: formData.materialColor,
        borderColor: formData.borderColor
      });
    } else {
      console.log('❌ Formularz: Brakuje opcji, czyszczę zdjęcie...');
      clearImage();
    }
  }, [formData.industry, formData.structure, formData.materialColor, formData.borderColor, findImage, clearImage]);


  const getMatTypeName = (matType: string) => {
    const matTypes: { [key: string]: string } = {
      '3d-evapremium-z-rantami': '3D EVAPREMIUM Z RANTAMI',
      '3d-evapremium-bez-rantow': '3D EVAPREMIUM BEZ RANTÓW'
    };
    return matTypes[matType] || matType;
  };

  const getCompletenessName = (completeness: string) => {
    const completenessTypes: { [key: string]: string } = {
      'dywanik-kierowcy': 'Dywanik Kierowcy (1 szt.)',
      'przod': 'Przód (2 szt.)',
      'przod-tyl': 'Przód + Tył (4 szt.)',
      'przod-tyl-bagaznik': 'Przód + Tył + Bagażnik (5 szt.)'
    };
    return completenessTypes[completeness] || completeness;
  };

  const getStructureName = (structure: string) => {
    const structureTypes: { [key: string]: string } = {
      'romb': 'Romb',
      'plaster-miodu': 'Plaster Miodu'
    };
    return structureTypes[structure] || structure;
  };

  // Pobiera dostępne kolory materiału na podstawie wybranego typu i struktury
  const getFilteredMaterialColorOptions = () => {
    if (!formData.industry || !formData.structure) {
      return MATERIAL_COLOR_OPTIONS;
    }

    const matType = formData.industry === '3d-evapremium-z-rantami' ? '3d-with-rims' : '3d-without-rims';
    const cellStructure = formData.structure === 'romb' ? 'rhombus' : 'honeycomb';
    
    const availableColors = getAvailableMaterialColors(matType, cellStructure);
    
    return MATERIAL_COLOR_OPTIONS.filter(option => 
      availableColors.includes(option.value)
    );
  };

  // Sprawdza czy wybrany kolor materiału jest nadal dostępny i czyści go jeśli nie
  useEffect(() => {
    if (formData.materialColor && formData.industry && formData.structure) {
      const filteredOptions = getFilteredMaterialColorOptions();
      const isColorAvailable = filteredOptions.some(option => option.value === formData.materialColor);
      
      if (!isColorAvailable && onFormDataChange) {
        console.log(`🔄 Kolor materiału ${formData.materialColor} nie jest dostępny dla ${formData.industry}/${formData.structure}, czyszczę wybór`);
        onFormDataChange({
          ...formData,
          materialColor: ''
        });
      }
    }
  }, [formData.industry, formData.structure, formData.materialColor, onFormDataChange]);

  const getColorName = (colorValue: string, options: { value: string; label: string }[]) => {
    const option = options.find(opt => opt.value === colorValue);
    return option ? option.label : '';
  };

  const getColorClass = (colorValue: string) => {
    const colorMap: { [key: string]: string } = {
      red: 'bg-red-500',
      black: 'bg-black',
      blue: 'bg-blue-500',
      yellow: 'bg-yellow-400',
      lime: 'bg-lime-400',
      orange: 'bg-orange-500',
      purple: 'bg-purple-500',
      brown: 'bg-amber-700',
      maroon: 'bg-red-800',
      pink: 'bg-pink-400',
      darkblue: 'bg-blue-800',
      darkgreen: 'bg-green-800',
      darkgrey: 'bg-gray-600',
      lightgrey: 'bg-gray-300',
      beige: 'bg-amber-200',
      lightbeige: 'bg-amber-100',
      white: 'bg-white',
      ivory: 'bg-amber-50'
    };
    return colorMap[colorValue] || 'bg-gray-400';
  };

    const validateCurrentStep = useCallback((): boolean => {
    const newErrors: Partial<LeadFormData> = {};

    if (currentStep === 1) {
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
    }

    if (currentStep === 2) {
      if (!formData.company.trim()) {
        newErrors.company = 'Marka i model auta są wymagane';
      }
      if (!formData.jobTitle.trim()) {
        newErrors.jobTitle = 'Rok produkcji jest wymagany';
      }
    }

    if (currentStep === 3) {
      if (!formData.industry.trim()) {
        newErrors.industry = 'Wybierz typ dywaników';
      }
      if (!formData.completeness.trim()) {
        newErrors.completeness = 'Wybierz rodzaj kompletu';
      }
      if (!formData.structure.trim()) {
        newErrors.structure = 'Wybierz strukturę komórek';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [currentStep, formData]);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    const newFormData = {
      ...formData,
      [name]: value
    };

    if (onFormDataChange) {
      onFormDataChange(newFormData);
    }

    if (errors[name as keyof LeadFormData]) {
      setErrors(prev => ({
        ...prev,
        [name]: undefined
      }));
    }

    if (name === 'firstName' && value.trim() && !formData.firstName.trim()) {
      console.log('Form started');
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

  const handleMatTypeChange = (matType: string) => {
    if (onFormDataChange) {
      const updatedFormData: LeadFormData = {
        ...formData,
        industry: matType
      };
      onFormDataChange(updatedFormData);
    }
    setIsMatTypeOpen(false);
    
    // Clear error if exists
    if (errors.industry) {
      setErrors(prev => ({
        ...prev,
        industry: undefined
      }));
    }
  };

  const handleCompletenessChange = (completeness: string) => {
    if (onFormDataChange) {
      const updatedFormData: LeadFormData = {
        ...formData,
        completeness: completeness
      };
      onFormDataChange(updatedFormData);
    }
    setIsCompletenessOpen(false);
    
    // Clear error if exists
    if (errors.completeness) {
      setErrors(prev => ({
        ...prev,
        completeness: undefined
      }));
    }
  };

  const handleBorderColorSelect = (colorValue: string) => {
    if (onFormDataChange) {
      const updatedFormData: LeadFormData = {
        ...formData,
        borderColor: colorValue
      };
      onFormDataChange(updatedFormData);
    }
  };

  const handleMaterialColorSelect = (colorValue: string) => {
    if (onFormDataChange) {
      const updatedFormData: LeadFormData = {
        ...formData,
        materialColor: colorValue
      };
      onFormDataChange(updatedFormData);
    }
  };

  const handleStructureChange = (structure: string) => {
    if (onFormDataChange) {
      const updatedFormData: LeadFormData = {
        ...formData,
        structure: structure
      };
      onFormDataChange(updatedFormData);
    }
    setIsStructureOpen(false);
    
    // Clear error if exists
    if (errors.structure) {
      setErrors(prev => ({
        ...prev,
        structure: undefined
      }));
    }
  };

  const nextStep = () => {
    if (validateCurrentStep()) {
      if (currentStep < totalSteps) {
        setCurrentStep(currentStep + 1);
      }
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setShowStep3Errors(true);
    
    if (!validateCurrentStep()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const leadPayload = prepareLeadSubmissionData({
        firstName: formData.firstName,
        phone: formData.phone,
        company: formData.company || undefined,
        jobTitle: formData.jobTitle || undefined,
        industry: formData.industry || undefined,
        completeness: formData.completeness || undefined,
        structure: formData.structure || undefined,
        borderColor: formData.borderColor || undefined,
        materialColor: formData.materialColor || undefined,
        includeHooks: formData.includeHooks || false
      });

      const response = await LeadService.createLead(leadPayload);
      
      if (response.success) {
        setIsSubmitted(true);
        if (onFormSubmission) {
          onFormSubmission(true);
        }
      } else {
        throw new Error(response.error || 'Unknown error');
      }
    } catch (error) {
      console.error('❌ Błąd wysyłania formularza:', error);
      setErrors({ message: 'Wystąpił błąd podczas wysyłania formularza. Spróbuj ponownie.' });
    } finally {
      setIsSubmitting(false);
    }
  }, [formData, validateCurrentStep, onFormSubmission]);

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

  const renderStep = () => {
    switch (currentStep) {
      case 1:
   return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-gradient-to-r from-red-500 to-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <User className="w-8 h-8 text-white" />
           </div>
              <h3 className="text-xl font-bold text-white mb-2">Podaj swoje dane</h3>
              <p className="text-gray-300">Zacznijmy od podstawowych informacji</p>
         </div>

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
        );

      case 2:
        return (
           <div className="space-y-6">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Building className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">O Twoim aucie</h3>
              <p className="text-gray-300">Pomóż nam dopasować idealne dywaniki</p>
            </div>

             <InputField
               label="Marka i Model Auta"
               name="company"
               icon={Building}
               placeholder="np. BMW X5, Audi A4"
              error={errors.company}
               value={formData.company}
               onChange={handleInputChange}
             />

             <InputField
               label="Rok Produkcji"
               name="jobTitle"
               placeholder="np. 2020"
              error={errors.jobTitle}
               value={formData.jobTitle}
               onChange={handleInputChange}
             />
           </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Package className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Wybór produktu</h3>
              <p className="text-gray-300">Wybierz typ, komplet i kolory dywaników</p>
            </div>

            <div className="max-w-4xl mx-auto">
              {/* Configuration with Preview */}
              <div className="bg-gray-800/30 rounded-xl p-4 border border-gray-700">
                <div className="text-center mb-6">
                  <div className="flex items-center justify-center gap-2 text-white mb-2">
                    <Package className="w-6 h-6 text-red-400" />
                    <h4 className="font-semibold text-xl">Konfigurator</h4>
                  </div>
                  <p className="text-gray-300 text-sm">Wybierz opcje i zobacz podgląd</p>
                </div>
                {/* Product Preview moved to top */}
                <div className="space-y-4 mb-4">
                  {/* Car Info removed per request */}

                  {/* Product Preview */}
                  <div className="w-full aspect-square rounded-lg mb-4 flex items-center justify-center relative overflow-hidden">
                    {isImageLoading ? (
                      <div className="flex items-center justify-center w-full h-full">
                        <Loader2 className="w-40 h-40 text-red-400 animate-spin" />
                      </div>
                    ) : (imageData?.imagePath || fallbackImagePath) ? (
                      <>
                        {fallbackImagePath && console && console.log && console.log('Fallback image path:', fallbackImagePath)}
                        <img
                          src={(imageData?.imagePath || fallbackImagePath).replace(/ /g, '%20')}
                          alt={`Dywanik ${getMatTypeName(formData.industry || '')} ${getStructureName(formData.structure || '')} ${getColorName(formData.materialColor || '', MATERIAL_COLOR_OPTIONS)} ${getColorName(formData.borderColor || '', BORDER_COLOR_OPTIONS)}`}
                          className="w-full h-full object-cover rounded-lg"
                          onError={(e) => {
                            console.error('Błąd ładowania zdjęcia:', e);
                            e.currentTarget.style.display = 'none';
                            e.currentTarget.nextElementSibling?.classList.remove('hidden');
                          }}
                        />
                        <div className="hidden w-full h-full flex items-center justify-center relative">
                          <div className={`absolute inset-0 ${getColorClass(formData.materialColor || 'black')} opacity-80`} />
                          <div 
                            className={`absolute inset-0 border-2 ${getColorClass(formData.borderColor || 'red')} opacity-90`}
                            style={{ 
                              borderRadius: 'inherit',
                              borderWidth: '3px'
                            }}
                          />
                          <div className="relative z-10 text-center">
                            <div className="w-40 h-40 bg-gradient-to-r from-red-500 to-red-600 rounded-md mx-auto mb-5 flex items-center justify-center">
                              <Shield className="w-20 h-20 text-white" />
                            </div>
                            <p className="text-white text-2xl font-semibold drop-shadow-lg">EVAPREMIUM</p>
                          </div>
                        </div>
                      </>
                    ) : imageError ? (
                      <div className="flex flex-col items-center justify-center w-full h-full text-center">
                        <AlertCircle className="w-40 h-40 text-red-400 mb-5" />
                        <p className="text-red-400 text-2xl">Błąd zdjęcia</p>
                      </div>
                    ) : (
                      <>
                        <div className={`absolute inset-0 ${getColorClass(formData.materialColor || 'black')} opacity-80`} />
                        <div 
                          className={`absolute inset-0 border-2 ${getColorClass(formData.borderColor || 'red')} opacity-90`}
                          style={{ 
                            borderRadius: 'inherit',
                            borderWidth: '3px'
                          }}
                        />
                        <div className="relative z-10 text-center">
                          <div className="w-40 h-40 bg-gradient-to-r from-red-500 to-red-600 rounded-md mx-auto mb-5 flex items-center justify-center">
                            <Shield className="w-20 h-20 text-white" />
                          </div>
                          <p className="text-white text-2xl font-semibold drop-shadow-lg">EVAPREMIUM</p>
                        </div>
                      </>
                    )}
                  </div>

                  {/* Summary removed per request */}
                </div>
                </div>
                
                <div className="grid grid-cols-1 gap-4">
                  {/* Left Side - Configuration Options */}
                  <div className="space-y-6">
                    {/* Mat Type Selection */}
                    <div>
                      <div className="flex items-center gap-2 mb-3">
                        <Package className="w-5 h-5 text-red-400" />
                        <h4 className="text-white font-semibold text-sm">Typ Dywaników</h4>
                      </div>
                      {errors.industry && (showStep3Errors || touchedMatType) && (
                        <div className="flex items-center gap-2 text-red-400 text-sm mb-2">
                          <AlertCircle className="w-4 h-4" />
                          {errors.industry}
                        </div>
                      )}
                      
                      <div className="relative">
                        <button
                          type="button"
                          onClick={() => { setIsMatTypeOpen(!isMatTypeOpen); setTouchedMatType(true); }}
                          className="w-full flex items-center justify-between p-2 bg-gray-800/30 border border-gray-600 rounded-md text-white text-sm hover:border-gray-500 transition-all duration-200"
                        >
                          <span className={formData.industry ? 'text-white' : 'text-gray-400'}>
                            {formData.industry ? getMatTypeName(formData.industry) : 'Wybierz typ dywaników'}
                          </span>
                          <ChevronDown className={`w-3 h-3 transition-transform duration-200 ${isMatTypeOpen ? 'rotate-180' : ''}`} />
                        </button>
                        
                        {isMatTypeOpen && (
                          <div className="absolute top-full left-0 right-0 mt-1 bg-gray-800 border border-gray-600 rounded-md z-10 max-h-48 overflow-y-auto">
                            <button
                              type="button"
                              onClick={() => handleMatTypeChange('3d-evapremium-z-rantami')}
                              className="w-full text-left p-2 hover:bg-gray-700 transition-colors duration-200 border-b border-gray-600 last:border-b-0 text-sm"
                            >
                              <div className="text-white font-medium">3D EVAPREMIUM Z RANTAMI</div>
                              <div className="text-gray-400 text-xs">Najwyższa jakość z dodatkowym zabezpieczeniem</div>
                            </button>
                            <button
                              type="button"
                              onClick={() => handleMatTypeChange('3d-evapremium-bez-rantow')}
                              className="w-full text-left p-2 hover:bg-gray-700 transition-colors duration-200 border-b border-gray-600 last:border-b-0 text-sm"
                            >
                              <div className="text-white font-medium">3D EVAPREMIUM BEZ RANTÓW</div>
                              <div className="text-gray-400 text-xs">Klasyczny design z nowoczesną technologią</div>
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Completeness Selection */}
                    <div>
                      <div className="flex items-center gap-2 mb-3">
                        <Package className="w-5 h-5 text-green-400" />
                        <h4 className="text-white font-semibold text-sm">Rodzaj Kompletu</h4>
                      </div>
                      {errors.completeness && (showStep3Errors || touchedCompleteness) && (
                        <div className="flex items-center gap-2 text-red-400 text-sm mb-2">
                          <AlertCircle className="w-4 h-4" />
                          {errors.completeness}
                        </div>
                      )}
                      
                      <div className="relative">
                    <button
                      type="button"
                      onClick={() => { setIsCompletenessOpen(!isCompletenessOpen); setTouchedCompleteness(true); }}
                      className="w-full flex items-center justify-between p-2 bg-gray-800/30 border border-gray-600 rounded-md text-white text-sm hover:border-gray-500 transition-all duration-200"
                    >
                      <span className={formData.completeness ? 'text-white' : 'text-gray-400'}>
                        {formData.completeness ? getCompletenessName(formData.completeness) : 'Wybierz rodzaj kompletu'}
                      </span>
                      <ChevronDown className={`w-3 h-3 transition-transform duration-200 ${isCompletenessOpen ? 'rotate-180' : ''}`} />
                    </button>
                    
                    {isCompletenessOpen && (
                      <div className="absolute top-full left-0 right-0 mt-1 bg-gray-800 border border-gray-600 rounded-md z-10 max-h-48 overflow-y-auto">
                        <button
                          type="button"
                          onClick={() => handleCompletenessChange('dywanik-kierowcy')}
                          className="w-full text-left p-2 hover:bg-gray-700 transition-colors duration-200 border-b border-gray-600 last:border-b-0 text-sm"
                        >
                          <div className="text-white font-medium">Dywanik Kierowcy (1 szt.)</div>
                          <div className="text-gray-400 text-xs">Podstawowa ochrona</div>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleCompletenessChange('przod')}
                          className="w-full text-left p-2 hover:bg-gray-700 transition-colors duration-200 border-b border-gray-600 last:border-b-0 text-sm"
                        >
                          <div className="text-white font-medium">Przód (2 szt.)</div>
                          <div className="text-gray-400 text-xs">Ochrona przednich siedzeń</div>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleCompletenessChange('przod-tyl')}
                          className="w-full text-left p-2 hover:bg-gray-700 transition-colors duration-200 border-b border-gray-600 last:border-b-0 text-sm"
                        >
                          <div className="text-white font-medium">Przód + Tył (4 szt.)</div>
                          <div className="text-gray-400 text-xs">Kompletna ochrona wnętrza</div>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleCompletenessChange('przod-tyl-bagaznik')}
                          className="w-full text-left p-2 hover:bg-gray-700 transition-colors duration-200 border-b border-gray-600 last:border-b-0 text-sm"
                        >
                          <div className="text-white font-medium">Przód + Tył + Bagażnik (5 szt.)</div>
                          <div className="text-gray-400 text-xs">Maksymalna ochrona całego auta</div>
                        </button>
                      </div>
                    )}
                    </div>
                    </div>

                    {/* Structure Selection */}
                    <div>
                      <div className="flex items-center gap-2 mb-3">
                        <Package className="w-5 h-5 text-purple-400" />
                        <h4 className="text-white font-semibold text-sm">Struktura Komórek</h4>
                      </div>
                      {errors.structure && (showStep3Errors || touchedStructure) && (
                        <div className="flex items-center gap-2 text-red-400 text-sm mb-2">
                          <AlertCircle className="w-4 h-4" />
                          {errors.structure}
                        </div>
                      )}
                      
                      <div className="relative">
                        <button
                          type="button"
                          onClick={() => { setIsStructureOpen(!isStructureOpen); setTouchedStructure(true); }}
                          className="w-full flex items-center justify-between p-2 bg-gray-800/30 border border-gray-600 rounded-md text-white text-sm hover:border-gray-500 transition-all duration-200"
                        >
                          <span className={formData.structure ? 'text-white' : 'text-gray-400'}>
                            {formData.structure ? getStructureName(formData.structure) : 'Wybierz strukturę komórek'}
                          </span>
                          <ChevronDown className={`w-3 h-3 transition-transform duration-200 ${isStructureOpen ? 'rotate-180' : ''}`} />
                        </button>
                        
                        {isStructureOpen && (
                          <div className="absolute top-full left-0 right-0 mt-1 bg-gray-800 border border-gray-600 rounded-md z-10 max-h-48 overflow-y-auto">
                            <button
                              type="button"
                              onClick={() => handleStructureChange('romb')}
                              className="w-full text-left p-2 hover:bg-gray-700 transition-colors duration-200 border-b border-gray-600 last:border-b-0 text-sm"
                            >
                              <div className="text-white font-medium">Romb</div>
                              <div className="text-gray-400 text-xs">Klasyczna struktura rombowa</div>
                            </button>
                            <button
                              type="button"
                              onClick={() => handleStructureChange('plaster-miodu')}
                              className="w-full text-left p-2 hover:bg-gray-700 transition-colors duration-200 border-b border-gray-600 last:border-b-0 text-sm"
                            >
                              <div className="text-white font-medium">Plaster Miodu</div>
                              <div className="text-gray-400 text-xs">Nowoczesna struktura sześciokątna</div>
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Color Selection */}
                    <div>
                      <div className="space-y-4">
                        {/* Kolor Obszycia */}
                        <div>
                          <div className="flex items-center gap-2 mb-3">
                            <Palette className="w-5 h-5 text-red-400" />
                            <h4 className="text-white font-semibold text-sm">Kolor Obszycia</h4>
                          </div>
                          <div className="grid grid-cols-6 gap-3">
                            {BORDER_COLOR_OPTIONS.map((option) => (
                              <div
                                key={option.value}
                                onClick={() => handleBorderColorSelect(option.value)}
                                className={`w-6 h-6 rounded-full border-2 cursor-pointer color-circle shadow-lg ${
                                  formData.borderColor === option.value
                                    ? 'border-white ring-2 ring-red-500 selected'
                                    : 'border-gray-600 hover:border-gray-400'
                                } ${getColorClass(option.value)}`}
                                title={option.label}
                              />
                            ))}
                          </div>
                          {formData.borderColor && (
                            <p className="text-gray-300 text-xs mt-2">
                              Wybrane: {getColorName(formData.borderColor, BORDER_COLOR_OPTIONS)}
                            </p>
                          )}
                        </div>

                        {/* Kolor Materiału */}
                        <div>
                          <div className="flex items-center gap-2 mb-3">
                            <Palette className="w-5 h-5 text-blue-400" />
                            <h4 className="text-white font-semibold text-sm">Kolor Materiału</h4>
                          </div>
                          <div className="grid grid-cols-6 gap-3">
                            {getFilteredMaterialColorOptions().map((option) => (
                              <div
                                key={option.value}
                                onClick={() => handleMaterialColorSelect(option.value)}
                                className={`w-6 h-6 rounded-full border-2 cursor-pointer color-circle shadow-lg ${
                                  formData.materialColor === option.value
                                    ? 'border-white ring-2 ring-blue-500 selected'
                                    : 'border-gray-600 hover:border-gray-400'
                                } ${getColorClass(option.value)}`}
                                title={option.label}
                              />
                            ))}
                          </div>
                          {formData.materialColor && (
                            <p className="text-gray-300 text-xs mt-2">
                              Wybrane: {getColorName(formData.materialColor, MATERIAL_COLOR_OPTIONS)}
                            </p>
                          )}
                        </div>
                      </div>


                  </div>

                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="max-w-7xl mx-auto w-full">
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-red-500 via-red-600 to-red-500 rounded-3xl blur-sm opacity-25 animate-gradient-pulse"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-red-400 via-red-500 to-red-400 rounded-3xl blur-md opacity-15 animate-gradient-glow" style={{ animationDelay: '1s' }}></div>
        <div className="absolute inset-0 bg-gradient-to-r from-red-600 via-red-700 to-red-600 rounded-3xl blur-lg opacity-10 animate-gradient-shimmer" style={{ animationDelay: '2s' }}></div>
        <div className="relative card-glass glass-optimized rounded-3xl p-12 shadow-2xl w-full">
          {/* Progress Bar */}
          <ProgressBar currentStep={currentStep} totalSteps={totalSteps} />

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {renderStep()}

            {/* Navigation Buttons */}
            <div className="flex justify-between items-center pt-6">
              {currentStep > 1 && (
                <button
                  type="button"
                  onClick={prevStep}
                  className="flex items-center gap-2 px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-xl transition-all duration-200"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Wstecz
                </button>
              )}
              
              <div className="flex-1" />
              
              {currentStep < totalSteps ? (
                <button
                  type="button"
                  onClick={nextStep}
                  className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white rounded-xl transition-all duration-200"
                >
                  Dalej
                  <ArrowRight className="w-4 h-4" />
                </button>
              ) : (
                                                         <button
                  type="submit"
                  disabled={!formData.firstName.trim() || !formData.phone.trim() || isSubmitting}
                  className="flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? 'Wysyłanie...' : 'Wyślij i Otrzymaj Rabat -30%'}
                </button>
              )}
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
