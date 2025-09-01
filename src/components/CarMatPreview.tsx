'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Car, Star, Shield, Zap, Palette } from 'lucide-react';
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

  return (
    <div className="max-w-md mx-auto w-full">
      <div className="card-glass rounded-3xl p-6 shadow-2xl w-full h-full">
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
                  className={`w-8 h-8 rounded-full border-2 cursor-pointer transition-all duration-200 hover:scale-110 ${
                    previewData.borderColor === option.value
                      ? 'border-white ring-2 ring-red-500'
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
                  className={`w-8 h-8 rounded-full border-2 cursor-pointer transition-all duration-200 hover:scale-110 ${
                    previewData.materialColor === option.value
                      ? 'border-white ring-2 ring-blue-500'
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
  );
}
