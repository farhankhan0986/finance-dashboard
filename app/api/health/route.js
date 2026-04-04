import pool from '@/lib/db';
import { successResponse, errorResponse } from '@/lib/api';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const res = await pool.query('SELECT NOW()');
    return successResponse({ db_time: res.rows[0].now }, 'API is healthy');
  } catch (error) {
    return errorResponse('Database connection failed', 500, error.message);
  }
}
