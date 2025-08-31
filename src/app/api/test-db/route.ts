import { NextResponse } from 'next/server';
import { testSupabaseConnection } from '@/backend/database';

export async function GET() {
  try {
    const result = await testSupabaseConnection();
    
    if (result.success) {
      return NextResponse.json({
        success: true,
        message: 'Połączenie z Supabase udane',
        data: result.data
      });
    } else {
      return NextResponse.json({
        success: false,
        message: 'Błąd połączenia z Supabase',
        error: result.error
      }, { status: 500 });
    }
  } catch (error) {
    console.error('Test endpoint error:', error);
    return NextResponse.json({
      success: false,
      message: 'Błąd serwera',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
