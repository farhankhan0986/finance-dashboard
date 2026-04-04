import { successResponse, errorResponse } from '@/lib/api';
import { withAuth } from '@/lib/guards';
import pool from '@/lib/db';

export const GET = withAuth(async () => {
  try {
    const { rows } = await pool.query(`
      SELECT 
        COALESCE(SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END), 0) as total_income,
        COALESCE(SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END), 0) as total_expenses
      FROM records
    `);
    
    const totalIncome = parseFloat(rows[0].total_income);
    const totalExpenses = parseFloat(rows[0].total_expenses);
    const netBalance = totalIncome - totalExpenses;

    return successResponse({
      totalIncome,
      totalExpenses,
      netBalance
    });
  } catch (error) {
    return errorResponse('Internal server error', 500);
  }
}, ['admin', 'analyst', 'viewer']);
