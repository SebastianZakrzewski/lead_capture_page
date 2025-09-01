import { supabase } from '../database';
import { CarMat } from '../models/CarMat';
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
}
