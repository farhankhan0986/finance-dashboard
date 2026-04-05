import supabase from '@/lib/db';
import { successResponse, errorResponse } from '@/lib/api';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const { data, error } = await supabase.from('users').select('id').limit(1);
    if (error) throw error;
    
    return successResponse({ db_connected: true, timestamp: new Date().toISOString() }, 'API is healthy');
  } catch (error) {
    return errorResponse('Database connection failed', 500, error.message);
  }
}
