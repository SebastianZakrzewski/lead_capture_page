import { createClient } from '@supabase/supabase-js';
import { SUPABASE_CONFIG } from '../utils/constants';

// Inicjalizacja klienta Supabase
export const supabase = createClient(
  SUPABASE_CONFIG.url,
  SUPABASE_CONFIG.anonKey
);

// Inicjalizacja klienta Supabase z service role key (tylko po stronie serwera)
export const supabaseAdmin = createClient(
  SUPABASE_CONFIG.url,
  SUPABASE_CONFIG.serviceRoleKey
);

// Funkcja do sprawdzenia połączenia z bazą
export async function checkConnection() {
  try {
    const { error } = await supabase.from('Lead').select('id').limit(1);
    if (error) throw error;
    return { success: true, message: 'Połączenie z bazą danych Supabase OK' };
  } catch (error) {
    console.error('Database connection error:', error);
    return { success: false, error: 'Błąd połączenia z bazą danych Supabase' };
  }
}

// Funkcja do testowania połączenia z Supabase
export async function testSupabaseConnection() {
  try {
    const { data, error } = await supabase.from('Lead').select('*').limit(1);
    if (error) throw error;
    console.log('Supabase connection successful:', data);
    return { success: true, data };
  } catch (error) {
    console.error('Supabase connection failed:', error);
    return { success: false, error };
  }
}

// Funkcja do uruchomienia migracji - dodanie kolumn kolorów
export async function runColorMigration() {
  try {
    console.log('🔄 Uruchamianie migracji kolorów...');
    
    // Sprawdź czy kolumny już istnieją
    const { data: existingColumns, error: checkError } = await supabaseAdmin
      .rpc('get_table_columns', { table_name: 'Lead' });
    
    if (checkError) {
      console.log('Nie można sprawdzić istniejących kolumn, kontynuuję migrację...');
    } else {
      const hasBorderColor = existingColumns?.some((col: any) => col.column_name === 'borderColor');
      const hasMaterialColor = existingColumns?.some((col: any) => col.column_name === 'materialColor');
      
      if (hasBorderColor && hasMaterialColor) {
        return { 
          success: true, 
          message: 'Kolumny borderColor i materialColor już istnieją' 
        };
      }
    }
    
    // Wykonaj migrację SQL
    const migrationSQL = `
      -- Dodaj kolumnę borderColor
      ALTER TABLE "Lead" ADD COLUMN IF NOT EXISTS "borderColor" TEXT DEFAULT NULL;
      
      -- Dodaj kolumnę materialColor
      ALTER TABLE "Lead" ADD COLUMN IF NOT EXISTS "materialColor" TEXT DEFAULT NULL;
      
      -- Dodaj komentarze
      COMMENT ON COLUMN "Lead"."borderColor" IS 'Kolor obszycia dywanika wybrany przez klienta';
      COMMENT ON COLUMN "Lead"."materialColor" IS 'Kolor materiału dywanika wybrany przez klienta';
    `;
    
    const { error: migrationError } = await supabaseAdmin.rpc('exec_sql', { 
      sql: migrationSQL 
    });
    
    if (migrationError) {
      console.error('❌ Błąd migracji:', migrationError);
      return { 
        success: false, 
        error: `Błąd migracji: ${migrationError.message}` 
      };
    }
    
    console.log('✅ Migracja kolorów zakończona pomyślnie');
    return { 
      success: true, 
      message: 'Kolumny borderColor i materialColor zostały dodane do tabeli Lead' 
    };
    
  } catch (error) {
    console.error('❌ Błąd podczas migracji:', error);
    return { 
      success: false, 
      error: `Błąd migracji: ${error instanceof Error ? error.message : 'Unknown error'}` 
    };
  }
}

// Funkcja do sprawdzenia struktury tabeli Lead
export async function checkTableStructure() {
  try {
    const { data, error } = await supabaseAdmin
      .from('Lead')
      .select('*')
      .limit(1);
    
    if (error) throw error;
    
    // Sprawdź czy kolumny istnieją w danych
    const hasBorderColor = 'borderColor' in (data?.[0] || {});
    const hasMaterialColor = 'materialColor' in (data?.[0] || {});
    
    return {
      success: true,
      hasBorderColor,
      hasMaterialColor,
      message: `Struktura tabeli: borderColor=${hasBorderColor}, materialColor=${hasMaterialColor}`
    };
    
  } catch (error) {
    console.error('Błąd sprawdzania struktury tabeli:', error);
    return { 
      success: false, 
      error: `Błąd sprawdzania struktury: ${error instanceof Error ? error.message : 'Unknown error'}` 
    };
  }
}
