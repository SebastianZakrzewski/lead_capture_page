import { supabase } from '../database';
// import { CarMat } from '../models/CarMat';
import { CarMatData } from '@/types/carMat';

export class CarMatService {
  // Zapisywanie nowej konfiguracji dywanika
  static async createCarMat(carMatData: CarMatData) {
    try {
      const insertData = {
        id: `carmat_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        matType: carMatData.matType,
        cellStructure: carMatData.cellStructure,
        materialColor: carMatData.materialColor,
        borderColor: carMatData.borderColor,
        imagePath: carMatData.imagePath,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      
      const { data, error } = await supabase
        .from('CarMat')
        .insert(insertData)
        .select()
        .single();

      if (error) {
        throw error;
      }
      
      return { success: true, data };
    } catch (error) {
      console.error('Błąd podczas zapisywania CarMat:', error);
      return { success: false, error: 'Nie udało się zapisać konfiguracji dywanika' };
    }
  }

  // Pobieranie konfiguracji dywanika po ID
  static async getCarMatById(id: string) {
    try {
      const { data, error } = await supabase
        .from('CarMat')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      console.error('Błąd podczas pobierania CarMat:', error);
      return { success: false, error: 'Nie udało się pobrać konfiguracji dywanika' };
    }
  }

  // Pobieranie wszystkich konfiguracji dywaników
  static async getAllCarMats() {
    try {
      const { data, error } = await supabase
        .from('CarMat')
        .select('*')
        .order('createdAt', { ascending: false });

      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      console.error('Błąd podczas pobierania CarMats:', error);
      return { success: false, error: 'Nie udało się pobrać konfiguracji dywaników' };
    }
  }

  // Aktualizacja konfiguracji dywanika
  static async updateCarMat(id: string, updateData: Partial<CarMatData>) {
    try {
      const { data, error } = await supabase
        .from('CarMat')
        .update({
          ...updateData,
          updatedAt: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      console.error('Błąd podczas aktualizacji CarMat:', error);
      return { success: false, error: 'Nie udało się zaktualizować konfiguracji dywanika' };
    }
  }

  // Usuwanie konfiguracji dywanika
  static async deleteCarMat(id: string) {
    try {
      const { error } = await supabase
        .from('CarMat')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return { success: true, message: 'Konfiguracja dywanika została usunięta' };
    } catch (error) {
      console.error('Błąd podczas usuwania CarMat:', error);
      return { success: false, error: 'Nie udało się usunąć konfiguracji dywanika' };
    }
  }

  // Pobieranie konfiguracji dywaników z filtrowaniem
  static async getCarMatsByFilter(filters: {
    matType?: string;
    cellStructure?: string;
    materialColor?: string;
    borderColor?: string;
  }) {
    try {
      let query = supabase.from('CarMat').select('*');

      if (filters.matType) {
        query = query.eq('matType', filters.matType);
      }
      if (filters.cellStructure) {
        query = query.eq('cellStructure', filters.cellStructure);
      }
      if (filters.materialColor) {
        query = query.eq('materialColor', filters.materialColor);
      }
      if (filters.borderColor) {
        query = query.eq('borderColor', filters.borderColor);
      }

      const { data, error } = await query.order('createdAt', { ascending: false });

      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      console.error('Błąd podczas filtrowania CarMats:', error);
      return { success: false, error: 'Nie udało się pobrać konfiguracji dywaników' };
    }
  }

  // Pobieranie konfiguracji dywaników z paginacją
  static async getCarMatsWithPagination(page: number = 1, limit: number = 10) {
    try {
      const from = (page - 1) * limit;
      const to = from + limit - 1;
      
      const { data: carMats, error: carMatsError, count } = await supabase
        .from('CarMat')
        .select('*', { count: 'exact' })
        .order('createdAt', { ascending: false })
        .range(from, to);

      if (carMatsError) throw carMatsError;

      const total = count || 0;
      return {
        success: true,
        data: {
          carMats: carMats || [],
          pagination: {
            page,
            limit,
            total,
            pages: Math.ceil(total / limit),
          },
        },
      };
    } catch (error) {
      console.error('Błąd podczas pobierania CarMats z paginacją:', error);
      return { success: false, error: 'Nie udało się pobrać konfiguracji dywaników' };
    }
  }

  // Pobieranie statystyk konfiguracji dywaników
  static async getCarMatStats() {
    try {
      const { data, error } = await supabase
        .from('CarMat')
        .select('matType, cellStructure, materialColor, borderColor, imagePath');

      if (error) throw error;

      // Oblicz statystyki
      const stats = {
        total: data.length,
        matTypes: {} as Record<string, number>,
        cellStructures: {} as Record<string, number>,
        materialColors: {} as Record<string, number>,
        borderColors: {} as Record<string, number>,
        imagePaths: {} as Record<string, number>,
      };

      data.forEach(item => {
        stats.matTypes[item.matType] = (stats.matTypes[item.matType] || 0) + 1;
        stats.cellStructures[item.cellStructure] = (stats.cellStructures[item.cellStructure] || 0) + 1;
        stats.materialColors[item.materialColor] = (stats.materialColors[item.materialColor] || 0) + 1;
        stats.borderColors[item.borderColor] = (stats.borderColors[item.borderColor] || 0) + 1;
        stats.imagePaths[item.imagePath] = (stats.imagePaths[item.imagePath] || 0) + 1;
      });

      return { success: true, data: stats };
    } catch (error) {
      console.error('Błąd podczas pobierania statystyk CarMat:', error);
      return { success: false, error: 'Nie udało się pobrać statystyk' };
    }
  }

  // Masowe wprowadzanie konfiguracji dywaników
  static async bulkInsertCarMats(carMatDataArray: CarMatData[]) {
    try {
      const insertData = carMatDataArray.map(carMatData => ({
        id: `carmat_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        matType: carMatData.matType,
        cellStructure: carMatData.cellStructure,
        materialColor: carMatData.materialColor,
        borderColor: carMatData.borderColor,
        imagePath: carMatData.imagePath,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }));

      const { data, error } = await supabase
        .from('CarMat')
        .insert(insertData)
        .select();

      if (error) {
        throw error;
      }
      
      return { 
        success: true, 
        data, 
        insertedCount: data.length,
        message: `Pomyślnie wprowadzono ${data.length} konfiguracji dywaników`
      };
    } catch (error) {
      console.error('Błąd podczas masowego wprowadzania CarMat:', error);
      return { 
        success: false, 
        error: 'Nie udało się wprowadzić konfiguracji dywaników',
        details: error
      };
    }
  }

  // Sprawdzanie czy kombinacja już istnieje
  static async checkCarMatExists(carMatData: CarMatData) {
    try {
      const { data, error } = await supabase
        .from('CarMat')
        .select('id')
        .eq('matType', carMatData.matType)
        .eq('cellStructure', carMatData.cellStructure)
        .eq('materialColor', carMatData.materialColor)
        .eq('borderColor', carMatData.borderColor)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
        throw error;
      }
      
      return { 
        success: true, 
        exists: !!data,
        data: data || null
      };
    } catch (error) {
      console.error('Błąd podczas sprawdzania istnienia CarMat:', error);
      return { success: false, error: 'Nie udało się sprawdzić istnienia konfiguracji' };
    }
  }

  // Wyczyszczenie wszystkich danych z tabeli
  static async clearAllCarMats() {
    try {
      const { error } = await supabase
        .from('CarMat')
        .delete()
        .neq('id', ''); // Usuwa wszystkie rekordy

      if (error) throw error;
      
      return { 
        success: true, 
        message: 'Wszystkie konfiguracje dywaników zostały usunięte'
      };
    } catch (error) {
      console.error('Błąd podczas czyszczenia CarMat:', error);
      return { 
        success: false, 
        error: 'Nie udało się wyczyścić tabeli konfiguracji dywaników'
      };
    }
  }

  // Wyszukiwanie zdjęcia dywanika na podstawie opcji formularza
  static async findCarMatImageByOptions(options: {
    matType: string;
    cellStructure: string;
    materialColor: string;
    borderColor: string;
  }) {
    try {
      console.log('🔍 CarMatService: Rozpoczynam wyszukiwanie z opcjami:', options);
      
      // Mapowanie typów z formularza na typy w bazie danych
      const mapMatType = (formType: string): string => {
        switch (formType) {
          case '3d-evapremium-z-rantami':
            return '3d-with-rims';
          case '3d-evapremium-bez-rantow':
            return '3d-without-rims';
          default:
            return formType;
        }
      };

      const mapCellStructure = (formStructure: string): string => {
        switch (formStructure) {
          case 'romb':
            return 'rhombus';
          case 'plaster-miodu':
            return 'honeycomb';
          default:
            return formStructure;
        }
      };

      // Mapowanie kolorów materiału z formularza na kolory w bazie danych (angielskie)
      const mapMaterialColor = (formColor: string): string => {
        const materialColorMapping: Record<string, string> = {
          'red': 'red',
          'black': 'black',
          'blue': 'blue',
          'yellow': 'yellow',
          'lime': 'darkgreen',
          'orange': 'orange',
          'purple': 'purple',
          'brown': 'brown',
          'maroon': 'maroon',
          'pink': 'pink',
          'darkblue': 'darkblue',
          'darkgreen': 'darkgreen',
          'darkgrey': 'darkgrey',
          'lightgrey': 'darkgrey',
          'beige': 'lightbeige',
          'lightbeige': 'lightbeige',
          'white': 'ivory',
          'ivory': 'ivory'
        };
        return materialColorMapping[formColor] || formColor;
      };

      // Mapowanie kolorów obszycia z formularza na kolory w bazie danych (polskie)
      const mapBorderColor = (formColor: string): string => {
        const borderColorMapping: Record<string, string> = {
          'red': 'czerwone',
          'black': 'czarne',
          'blue': 'niebieski',
          'yellow': 'zolte',
          'lime': 'zielony',
          'orange': 'pomaranczowe',
          'purple': 'fioletowe',
          'brown': 'brazowy',
          'maroon': 'bordowe',
          'pink': 'rozowe',
          'darkblue': 'granatowy',
          'darkgreen': 'zielony',
          'darkgrey': 'ciemnoszary',
          'lightgrey': 'jasnoszary',
          'beige': 'bezowy',
          'lightbeige': 'bezowy',
          'white': 'bezowy',
          'ivory': 'bezowy'
        };
        return borderColorMapping[formColor] || formColor;
      };

      // Pomocnicze: zamiana EN->PL dla materialColor tylko dla 3D romby (zgodnie z danymi w bazie)
      const mapMaterialEnToPlFor3DRhombus = (en: string): string => {
        const mapping: Record<string, string> = {
          'black': 'czarny',
          'blue': 'niebieski',
          'brown': 'brązowy',
          'darkblue': 'ciemnoniebieski',
          'darkgreen': 'ciemnozielony',
          'darkgrey': 'ciemnoszary',
          'ivory': 'kość słoniowa',
          'lightbeige': 'beżowy',
          'maroon': 'bordowy',
          'red': 'czerwony'
        };
        return mapping[en] || en;
      };

      // Pomocnicze: warianty z/bez ogonków dla borderColor
      const toggleDiacritics = (pl: string): string => {
        const mapNoToYes: Record<string, string> = {
          'bezowy': 'beżowy',
          'brazowy': 'brązowy',
          'rozowe': 'różowe',
          'pomaranczowe': 'pomarańczowe',
          'zolte': 'żółte'
        };
        const mapYesToNo: Record<string, string> = {
          'beżowy': 'bezowy',
          'brązowy': 'brazowy',
          'różowe': 'rozowe',
          'pomarańczowe': 'pomaranczowe',
          'żółte': 'zolte'
        };
        if (mapNoToYes[pl]) return mapNoToYes[pl];
        if (mapYesToNo[pl]) return mapYesToNo[pl];
        return pl;
      };

      // Pomocnicze: warianty singular/plural dla borderColor
      const toggleNumberVariant = (pl: string): string => {
        const toPlural: Record<string, string> = {
          'bezowy': 'bezowe',
          'beżowy': 'bezowe',
          'brazowy': 'brazowe',
          'brązowy': 'brazowe',
          'granatowy': 'granatowe',
          'niebieski': 'niebieskie',
          'zielony': 'zielone'
        };
        const toSingular: Record<string, string> = {
          'bezowe': 'bezowy',
          'brazowe': 'brazowy',
          'granatowe': 'granatowy',
          'niebieskie': 'niebieski',
          'zielone': 'zielony'
        };
        if (toPlural[pl]) return toPlural[pl];
        if (toSingular[pl]) return toSingular[pl];
        // Dla kolorów już w liczbie mnogiej niezmienionych w mapie powyżej zwracamy bez zmian
        return pl;
      };

      const mappedMatType = mapMatType(options.matType);
      const mappedCellStructure = mapCellStructure(options.cellStructure);
      const mappedMaterialColor = mapMaterialColor(options.materialColor);
      const mappedBorderColor = mapBorderColor(options.borderColor);

      console.log('🔄 CarMatService: Zmapowane wartości:', {
        matType: `${options.matType} -> ${mappedMatType}`,
        cellStructure: `${options.cellStructure} -> ${mappedCellStructure}`,
        materialColor: `${options.materialColor} -> ${mappedMaterialColor}`,
        borderColor: `${options.borderColor} -> ${mappedBorderColor}`
      });

      // 1) Wyszukiwanie w bazie danych - dopasowanie ścisłe
      const { data, error } = await supabase
        .from('CarMat')
        .select('imagePath, matType, cellStructure, materialColor, borderColor')
        .eq('matType', mappedMatType)
        .eq('cellStructure', mappedCellStructure)
        .eq('materialColor', mappedMaterialColor)
        .eq('borderColor', mappedBorderColor)
        .single();

      console.log('📊 CarMatService: Wynik zapytania:', { data, error });

      if (error) {
        if (error.code !== 'PGRST116') {
          throw error;
        }

        // 2) Fallback: rozbudowane warianty mapowania
        const candidateMaterialColors: string[] = [mappedMaterialColor];
        // Dla 3D + romby spróbuj EN -> PL
        if (mappedMatType === '3d-with-rims' && mappedCellStructure === 'rhombus') {
          const plVariant = mapMaterialEnToPlFor3DRhombus(mappedMaterialColor);
          if (!candidateMaterialColors.includes(plVariant)) candidateMaterialColors.push(plVariant);
        }

        // Zbuduj warianty borderColor: oryginalny, z/bez ogonków, i singular/plural
        const candidateBorderColorsSet = new Set<string>();
        const addBorderVariant = (v: string) => { if (v) candidateBorderColorsSet.add(v); };
        addBorderVariant(mappedBorderColor);
        addBorderVariant(toggleDiacritics(mappedBorderColor));
        addBorderVariant(toggleNumberVariant(mappedBorderColor));
        // Dodaj kombinację obu transformacji
        addBorderVariant(toggleNumberVariant(toggleDiacritics(mappedBorderColor)));

        const candidateBorderColors = Array.from(candidateBorderColorsSet);

        console.log('🧭 CarMatService: Fallback warianty', {
          candidateMaterialColors,
          candidateBorderColors
        });

        const { data: fallbackData, error: fallbackError } = await supabase
          .from('CarMat')
          .select('imagePath, matType, cellStructure, materialColor, borderColor')
          .eq('matType', mappedMatType)
          .eq('cellStructure', mappedCellStructure)
          .in('materialColor', candidateMaterialColors)
          .in('borderColor', candidateBorderColors)
          .limit(1);

        if (fallbackError) {
          throw fallbackError;
        }

        const chosen = Array.isArray(fallbackData) && fallbackData.length > 0 ? fallbackData[0] : null;
        if (!chosen) {
          console.log('❌ CarMatService: Nie znaleziono rekordów (fallback)');
          return {
            success: false,
            error: 'Nie znaleziono zdjęcia dla wybranej kombinacji',
            data: null
          };
        }

        console.log('✅ CarMatService: Znaleziono zdjęcie (fallback):', chosen);
        return {
          success: true,
          data: {
            imagePath: chosen.imagePath,
            matType: chosen.matType,
            cellStructure: chosen.cellStructure,
            materialColor: chosen.materialColor,
            borderColor: chosen.borderColor
          }
        };
      }

      console.log('✅ CarMatService: Znaleziono zdjęcie:', data);
      return { 
        success: true, 
        data: {
          imagePath: data.imagePath,
          matType: data.matType,
          cellStructure: data.cellStructure,
          materialColor: data.materialColor,
          borderColor: data.borderColor
        }
      };
    } catch (error) {
      console.error('💥 CarMatService: Błąd podczas wyszukiwania:', error);
      return { 
        success: false, 
        error: 'Nie udało się wyszukać zdjęcia dywanika',
        details: error
      };
    }
  }
}
