'use client';

import { useState, useEffect } from 'react';
import { Car, Star, Shield, Zap, Palette, Package, ChevronDown } from 'lucide-react';
import { BORDER_COLOR_OPTIONS, MATERIAL_COLOR_OPTIONS } from '@/types/lead';

import { LeadFormData } from '@/types/lead';

interface CarMatPreviewProps {
  formData: LeadFormData;
  onFormDataChange?: (formData: LeadFormData) => void;
}

export default function CarMatPreview({ formData, onFormDataChange }: CarMatPreviewProps) {
  const [previewData, setPreviewData] = useState({
    carModel: '',
    year: '',
    matType: '',
    completeness: '',
    borderColor: '',
    materialColor: ''
  });

  const [isMatTypeOpen, setIsMatTypeOpen] = useState(false);
  const [isCompletenessOpen, setIsCompletenessOpen] = useState(false);

  useEffect(() => {
    // Update preview based on form data
    const carModel = formData.company || 'Twój samochód';
    const year = formData.jobTitle || '';
    const matType = formData.industry || '';
    const completeness = formData.completeness || '';
    const borderColor = formData.borderColor || '';
    const materialColor = formData.materialColor || '';

    setPreviewData({
      carModel,
      year,
      matType,
      completeness,
      borderColor,
      materialColor
    });
  }, [formData]);

  const getMatTypeName = (type: string) => {
    switch (type) {
      case '3d-evapremium-z-rantami':
        return '3D EVAPREMIUM Z RANTAMI';
      case '3d-evapremium-bez-rantow':
        return '3D EVAPREMIUM BEZ RANTÓW';
      default:
        return '3D EVAPREMIUM';
    }
  };

  const getCompletenessName = (completeness: string) => {
    switch (completeness) {
      case 'dywanik-kierowcy':
        return 'Dywanik Kierowcy (1 szt.)';
      case 'przod':
        return 'Przód (2 szt.)';
      case 'przod-tyl':
        return 'Przód + Tył (4 szt.)';
      case 'przod-tyl-bagaznik':
        return 'Przód + Tył + Bagażnik (5 szt.)';
      default:
        return '';
    }
  };

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

  const handleBorderColorSelect = (colorValue: string) => {
    console.log('🎨 Wybrano kolor obszycia:', colorValue);
    if (onFormDataChange) {
      const updatedFormData: LeadFormData = {
        ...formData,
        borderColor: colorValue
      };
      onFormDataChange(updatedFormData);
    }
  };

  const handleMaterialColorSelect = (colorValue: string) => {
    console.log('🎨 Wybrano kolor materiału:', colorValue);
    if (onFormDataChange) {
      const updatedFormData: LeadFormData = {
        ...formData,
        materialColor: colorValue
      };
      onFormDataChange(updatedFormData);
    }
  };

  const handleMatTypeChange = (matType: string) => {
    console.log('📦 Wybrano typ dywaników:', matType);
    if (onFormDataChange) {
      const updatedFormData: LeadFormData = {
        ...formData,
        industry: matType
      };
      onFormDataChange(updatedFormData);
    }
    setIsMatTypeOpen(false);
  };

  const handleCompletenessChange = (completeness: string) => {
    console.log('📦 Wybrano rodzaj kompletu:', completeness);
    if (onFormDataChange) {
      const updatedFormData: LeadFormData = {
        ...formData,
        completeness: completeness
      };
      onFormDataChange(updatedFormData);
    }
    setIsCompletenessOpen(false);
  };

  return (
    <div className="max-w-md mx-auto w-full">
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-red-500 via-red-600 to-red-500 rounded-3xl blur-sm opacity-25 animate-gradient-pulse"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-red-400 via-red-500 to-red-400 rounded-3xl blur-md opacity-15 animate-gradient-glow" style={{ animationDelay: '1s' }}></div>
        <div className="absolute inset-0 bg-gradient-to-r from-red-600 via-red-700 to-red-600 rounded-3xl blur-lg opacity-10 animate-gradient-shimmer" style={{ animationDelay: '2s' }}></div>
        <div className="relative card-glass glass-optimized rounded-3xl p-6 shadow-2xl w-full h-full">
          {/* Preview Header */}
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-gradient-to-r from-red-500 to-red-600 rounded-full flex items-center justify-center mx-auto mb-4 animate-float">
              <Car className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-2">Twój Dywanik</h3>
            <p className="text-gray-400 text-sm">
              Spersonalizowany podgląd dla Twojego auta
            </p>
          </div>

          {/* Car Info */}
          <div className="bg-gray-800/30 rounded-xl p-4 mb-6">
            <div className="flex items-center gap-3 mb-3">
              <Car className="w-5 h-5 text-red-400" />
              <h4 className="text-white font-semibold">
                {previewData.carModel} {previewData.year && `(${previewData.year})`}
              </h4>
            </div>
            {previewData.matType && (
              <p className="text-gray-300 text-sm">
                {getMatTypeName(previewData.matType)}
              </p>
            )}
            {previewData.completeness && (
              <p className="text-gray-300 text-sm">
                {getCompletenessName(previewData.completeness)}
              </p>
            )}
          </div>

          {/* Mat Type Selection */}
          <div className="space-y-4 mb-6">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Package className="w-5 h-5 text-red-400" />
                <h4 className="text-white font-semibold text-sm">Typ Dywaników</h4>
              </div>
              
              {/* Dropdown for Mat Type */}
              <div className="relative">
                <button
                  onClick={() => setIsMatTypeOpen(!isMatTypeOpen)}
                  className="w-full flex items-center justify-between p-3 bg-gray-800/30 border border-gray-600 rounded-lg text-white hover:border-gray-500 transition-all duration-200"
                >
                  <span className={previewData.matType ? 'text-white' : 'text-gray-400'}>
                    {previewData.matType ? getMatTypeName(previewData.matType) : 'Wybierz typ dywaników'}
                  </span>
                  <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isMatTypeOpen ? 'rotate-180' : ''}`} />
                </button>
                
                {isMatTypeOpen && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-gray-800 border border-gray-600 rounded-lg z-10 max-h-48 overflow-y-auto">
                    <button
                      onClick={() => handleMatTypeChange('3d-evapremium-z-rantami')}
                      className="w-full text-left p-3 hover:bg-gray-700 transition-colors duration-200 border-b border-gray-600 last:border-b-0"
                    >
                      <div className="text-white font-medium">3D EVAPREMIUM Z RANTAMI</div>
                      <div className="text-gray-400 text-xs">Najwyższa jakość z dodatkowym zabezpieczeniem</div>
                    </button>
                    <button
                      onClick={() => handleMatTypeChange('3d-evapremium-bez-rantow')}
                      className="w-full text-left p-3 hover:bg-gray-700 transition-colors duration-200 border-b border-gray-600 last:border-b-0"
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
              
              {/* Dropdown for Completeness */}
              <div className="relative">
                <button
                  onClick={() => setIsCompletenessOpen(!isCompletenessOpen)}
                  className="w-full flex items-center justify-between p-3 bg-gray-800/30 border border-gray-600 rounded-lg text-white hover:border-gray-500 transition-all duration-200"
                >
                  <span className={previewData.completeness ? 'text-white' : 'text-gray-400'}>
                    {previewData.completeness ? getCompletenessName(previewData.completeness) : 'Wybierz rodzaj kompletu'}
                  </span>
                  <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isCompletenessOpen ? 'rotate-180' : ''}`} />
                </button>
                
                {isCompletenessOpen && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-gray-800 border border-gray-600 rounded-lg z-10 max-h-48 overflow-y-auto">
                    <button
                      onClick={() => handleCompletenessChange('dywanik-kierowcy')}
                      className="w-full text-left p-3 hover:bg-gray-700 transition-colors duration-200 border-b border-gray-600 last:border-b-0"
                    >
                      <div className="text-white font-medium">Dywanik Kierowcy (1 szt.)</div>
                      <div className="text-gray-400 text-xs">Podstawowa ochrona</div>
                    </button>
                    <button
                      onClick={() => handleCompletenessChange('przod')}
                      className="w-full text-left p-3 hover:bg-gray-700 transition-colors duration-200 border-b border-gray-600 last:border-b-0"
                    >
                      <div className="text-white font-medium">Przód (2 szt.)</div>
                      <div className="text-gray-400 text-xs">Ochrona przednich siedzeń</div>
                    </button>
                    <button
                      onClick={() => handleCompletenessChange('przod-tyl')}
                      className="w-full text-left p-3 hover:bg-gray-700 transition-colors duration-200 border-b border-gray-600 last:border-b-0"
                    >
                      <div className="text-white font-medium">Przód + Tył (4 szt.)</div>
                      <div className="text-gray-400 text-xs">Kompletna ochrona wnętrza</div>
                    </button>
                    <button
                      onClick={() => handleCompletenessChange('przod-tyl-bagaznik')}
                      className="w-full text-left p-3 hover:bg-gray-700 transition-colors duration-200 border-b border-gray-600 last:border-b-0"
                    >
                      <div className="text-white font-medium">Przód + Tył + Bagażnik (5 szt.)</div>
                      <div className="text-gray-400 text-xs">Maksymalna ochrona całego auta</div>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Color Selection */}
          <div className="space-y-4 mb-6">
            {/* Kolor Obszycia */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Palette className="w-5 h-5 text-red-400" />
                <h4 className="text-white font-semibold text-sm">Kolor Obszycia</h4>
              </div>
              <div className="grid grid-cols-6 gap-2">
                {BORDER_COLOR_OPTIONS.map((option) => (
                  <div
                    key={option.value}
                    onClick={() => handleBorderColorSelect(option.value)}
                    className={`w-8 h-8 rounded-full border-2 cursor-pointer color-circle ${
                      previewData.borderColor === option.value
                        ? 'border-white ring-2 ring-red-500 selected'
                        : 'border-gray-600 hover:border-gray-400'
                    } ${getColorClass(option.value)}`}
                    title={option.label}
                  />
                ))}
              </div>
              {previewData.borderColor && (
                <p className="text-gray-300 text-xs mt-2">
                  Wybrane: {getColorName(previewData.borderColor, BORDER_COLOR_OPTIONS)}
                </p>
              )}
            </div>

            {/* Kolor Materiału */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Palette className="w-5 h-5 text-blue-400" />
                <h4 className="text-white font-semibold text-sm">Kolor Materiału</h4>
              </div>
              <div className="grid grid-cols-6 gap-2">
                {MATERIAL_COLOR_OPTIONS.map((option) => (
                  <div
                    key={option.value}
                    onClick={() => handleMaterialColorSelect(option.value)}
                    className={`w-8 h-8 rounded-full border-2 cursor-pointer color-circle ${
                      previewData.materialColor === option.value
                        ? 'border-white ring-2 ring-blue-500 selected'
                        : 'border-gray-600 hover:border-gray-400'
                    } ${getColorClass(option.value)}`}
                    title={option.label}
                  />
                ))}
              </div>
              {previewData.materialColor && (
                <p className="text-gray-300 text-xs mt-2">
                  Wybrane: {getColorName(previewData.materialColor, MATERIAL_COLOR_OPTIONS)}
                </p>
              )}
            </div>
          </div>

          {/* Product Preview */}
          <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-xl p-6 mb-6 text-center">
            <div className="w-32 h-32 bg-gradient-to-r from-red-500/20 to-red-600/20 rounded-xl mx-auto mb-4 flex items-center justify-center border border-red-500/30">
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-red-500 to-red-600 rounded-lg mx-auto mb-2 flex items-center justify-center">
                  <Shield className="w-8 h-8 text-white" />
                </div>
                <p className="text-white text-sm font-semibold">EVAPREMIUM</p>
              </div>
            </div>
            <p className="text-gray-300 text-sm">
              Najwyższa jakość • 3D Design • Ochrona podłogi
            </p>
          </div>

          {/* Features */}
          <div className="space-y-3 mb-6">
            <div className="flex items-center gap-3">
              <Star className="w-5 h-5 text-yellow-400" />
              <span className="text-gray-300 text-sm">Premium jakość materiałów</span>
            </div>
            <div className="flex items-center gap-3">
              <Shield className="w-5 h-5 text-blue-400" />
              <span className="text-gray-300 text-sm">Ochrona przed wilgocią</span>
            </div>
            <div className="flex items-center gap-3">
              <Zap className="w-5 h-5 text-green-400" />
              <span className="text-gray-300 text-sm">Łatwy montaż i czyszczenie</span>
            </div>
          </div>

          {/* Call to Action */}
          {!previewData.carModel && (
            <div className="text-center mt-6">
              <p className="text-gray-400 text-sm">
                Wypełnij formularz, aby zobaczyć spersonalizowany podgląd
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
