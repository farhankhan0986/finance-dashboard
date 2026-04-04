import { successResponse, errorResponse } from '@/lib/api';
import { withAuth } from '@/lib/guards';
import pool from '@/lib/db';

export const GET = withAuth(async () => {
  try {
    const { rows } = await pool.query(`
      SELECT 
        TO_CHAR(DATE_TRUNC('month', record_date), 'YYYY-MM') as month,
        COALESCE(SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END), 0) as income,
        COALESCE(SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END), 0) as expense
      FROM records
      GROUP BY DATE_TRUNC('month', record_date)
      ORDER BY month DESC
      LIMIT 12
    `);
    
    return successResponse(rows.map(row => ({
      month: row.month,
      income: parseFloat(row.income),
      expense: parseFloat(row.expense)
    })));
  } catch (error) {
    return errorResponse('Internal server error', 500);
  }
}, ['admin', 'analyst', 'viewer']);
