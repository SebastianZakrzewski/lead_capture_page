import { useState, useEffect, useCallback } from 'react';
import { CarMatService } from '@/backend/services/CarMatService';

interface CarMatImageOptions {
  matType: string;
  cellStructure: string;
  materialColor: string;
  borderColor: string;
}

interface CarMatImageData {
  imagePath: string;
  matType: string;
  cellStructure: string;
  materialColor: string;
  borderColor: string;
}

interface UseCarMatImageReturn {
  imageData: CarMatImageData | null;
  isLoading: boolean;
  error: string | null;
  findImage: (options: CarMatImageOptions) => Promise<void>;
  clearImage: () => void;
}

export const useCarMatImage = (): UseCarMatImageReturn => {
  const [imageData, setImageData] = useState<CarMatImageData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const findImage = useCallback(async (options: CarMatImageOptions) => {
    console.log('🔍 useCarMatImage: Rozpoczynam wyszukiwanie zdjęcia:', options);
    
    // Sprawdź czy wszystkie wymagane opcje są wybrane
    if (!options.matType || !options.cellStructure || !options.materialColor || !options.borderColor) {
      console.log('❌ useCarMatImage: Brakuje wymaganych opcji:', options);
      setError('Wszystkie opcje muszą być wybrane, aby znaleźć zdjęcie');
      setImageData(null);
      return;
    }

    setIsLoading(true);
    setError(null);
    console.log('⏳ useCarMatImage: Wysyłam zapytanie do CarMatService...');

    try {
      const result = await CarMatService.findCarMatImageByOptions(options);
      console.log('📡 useCarMatImage: Otrzymałem odpowiedź:', result);
      
      if (result.success && result.data) {
        console.log('✅ useCarMatImage: Znaleziono zdjęcie:', result.data);
        setImageData(result.data);
        setError(null);
      } else {
        console.log('❌ useCarMatImage: Błąd wyszukiwania:', result.error);
        setError(result.error || 'Nie udało się znaleźć zdjęcia');
        setImageData(null);
      }
    } catch (err) {
      console.error('💥 useCarMatImage: Wystąpił błąd:', err);
      setError('Wystąpił błąd podczas wyszukiwania zdjęcia');
      setImageData(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const clearImage = useCallback(() => {
    console.log('🧹 useCarMatImage: Czyszczę stan zdjęcia');
    setImageData(null);
    setError(null);
    setIsLoading(false);
  }, []);

  return {
    imageData,
    isLoading,
    error,
    findImage,
    clearImage
  };
};
