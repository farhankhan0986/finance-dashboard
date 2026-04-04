import { successResponse, errorResponse } from '@/lib/api';
import { withAuth } from '@/lib/guards';
import pool from '@/lib/db';

export const GET = withAuth(async () => {
  try {
    const { rows } = await pool.query(`
      SELECT r.id, r.amount, r.type, r.category, r.record_date, r.notes, u.name as created_by_name
      FROM records r
      LEFT JOIN users u ON r.created_by = u.id
      ORDER BY r.record_date DESC, r.created_at DESC
      LIMIT 10
    `);
    
    return successResponse(rows);
  } catch (error) {
    return errorResponse('Internal server error', 500);
  }
}, ['admin', 'analyst', 'viewer']);
