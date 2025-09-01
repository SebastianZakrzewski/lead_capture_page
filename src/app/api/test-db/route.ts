import { NextResponse } from 'next/server';
import { testSupabaseConnection, supabase } from '@/backend/database';

export async function GET() {
  try {
    console.log('🔍 Sprawdzam połączenie z Supabase...');
    const result = await testSupabaseConnection();
    
    if (!result.success) {
      return NextResponse.json({
        success: false,
        message: 'Błąd połączenia z Supabase',
        error: result.error
      }, { status: 500 });
    }
    
    // Test INSERT dokładnie jak w LeadService
    console.log('🔍 Test INSERT dokładnie jak w LeadService...');
    const testData = {
      id: `test_${Date.now()}`,
      firstName: 'Test User',
      phone: '123456789',
      company: 'Test Company',
      jobTitle: '2023',
      industry: '3d-evapremium-z-rantami',
      completeness: 'przod',
      structure: 'romb',
      borderColor: 'red',
      materialColor: 'black',
      includeHooks: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    console.log('🔍 Dane do wstawienia:', testData);
    
    const { data: insertData, error: insertError } = await supabase
      .from('Lead')
      .insert(testData)
      .select()
      .single();
    
    console.log('🔍 Wynik INSERT:', { data: insertData, error: insertError });
    
    // Usuń testowy rekord jeśli się udało
    if (insertData && !insertError) {
      const { error: deleteError } = await supabase
        .from('Lead')
        .delete()
        .eq('id', testData.id);
      console.log('🔍 Wynik DELETE:', { error: deleteError });
    }
    
    return NextResponse.json({
      success: true,
      message: 'Test zakończony',
      connection: result,
      insertTest: {
        success: !insertError,
        error: insertError,
        data: insertData
      }
    });
    
  } catch (error) {
    console.error('❌ Test endpoint error:', error);
    return NextResponse.json({
      success: false,
      message: 'Błąd serwera',
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 });
  }
}
