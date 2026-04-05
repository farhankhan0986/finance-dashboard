import { successResponse, errorResponse } from '@/lib/api';
import { withAuth } from '@/lib/guards';
import supabase from '@/lib/db';

export const GET = withAuth(async (req) => {
  try {
    let query = supabase
      .from('records')
      .select('id, amount, type, category, record_date, notes, created_by, users(name)')
      .order('record_date', { ascending: false })
      .order('created_at', { ascending: false })
      .limit(10);

    if (req.user.role === 'viewer') {
      query = query.eq('created_by', req.user.userId);
    }

    const { data: rows, error } = await query;
    if (error) throw error;
    
    const formattedRows = rows.map(r => ({
      id: r.id,
      amount: r.amount,
      type: r.type,
      category: r.category,
      record_date: r.record_date,
      notes: r.notes,
      created_by_name: r.users?.name || 'Unknown'
    }));

    return successResponse(formattedRows);
  } catch (error) {
    console.error('Recent activity error:', error);
    return errorResponse('Internal server error', 500);
  }
}, ['admin', 'analyst', 'viewer']);
