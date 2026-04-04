import { successResponse, errorResponse } from '@/lib/api';
import { withAuth } from '@/lib/guards';
import pool from '@/lib/db';

export const GET = withAuth(async () => {
  try {
    const { rows } = await pool.query(`
      SELECT category, type, COALESCE(SUM(amount), 0) as total
      FROM records
      GROUP BY category, type
      ORDER BY total DESC
    `);
    
    return successResponse(rows.map(row => ({
      category: row.category,
      type: row.type,
      total: parseFloat(row.total)
    })));
  } catch (error) {
    return errorResponse('Internal server error', 500);
  }
}, ['admin', 'analyst', 'viewer']);
