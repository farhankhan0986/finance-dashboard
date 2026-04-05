import { successResponse, errorResponse } from '@/lib/api';
import { withAuth } from '@/lib/guards';
import supabase from '@/lib/db';

export const GET = withAuth(async (req) => {
  try {
    const { data: rows, error } = await supabase.rpc('get_dashboard_trends', {
      p_user_id: req.user.userId,
      p_role: req.user.role
    });
    
    if (error) throw error;
    
    return successResponse((rows || []).map(row => ({
      month: row.month,
      income: parseFloat(row.income || 0),
      expense: parseFloat(row.expense || 0)
    })));
  } catch (error) {
    console.error('Trends error:', error);
    return errorResponse('Internal server error', 500);
  }
}, ['admin', 'analyst', 'viewer']);
