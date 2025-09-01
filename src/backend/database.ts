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
