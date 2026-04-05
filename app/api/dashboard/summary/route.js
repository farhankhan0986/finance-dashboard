import { successResponse, errorResponse } from '@/lib/api';
import { withAuth } from '@/lib/guards';
import supabase from '@/lib/db';

export const GET = withAuth(async (req) => {
  try {
    const { data: rows, error } = await supabase.rpc('get_dashboard_summary', {
      p_user_id: req.user.userId,
      p_role: req.user.role
    });
    
    if (error) throw error;
    
    const row = (rows && rows.length > 0) ? rows[0] : { total_income: 0, total_expenses: 0 };
    
    const totalIncome = parseFloat(row.total_income || 0);
    const totalExpenses = parseFloat(row.total_expenses || 0);
    const netBalance = totalIncome - totalExpenses;

    return successResponse({
      totalIncome,
      totalExpenses,
      netBalance
    });
  } catch (error) {
    console.error('Summary error:', error);
    return errorResponse('Internal server error', 500);
  }
}, ['admin', 'analyst', 'viewer']);
