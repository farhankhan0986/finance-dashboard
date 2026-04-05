import { successResponse, errorResponse } from '@/lib/api';
import { withAuth } from '@/lib/guards';
import { validateRequiredFields, validatePagination } from '@/lib/validate';
import supabase from '@/lib/db';

export const GET = withAuth(async (req) => {
  try {
    const url = new URL(req.url);
    const type = url.searchParams.get('type');
    const category = url.searchParams.get('category');
    const startDate = url.searchParams.get('startDate');
    const endDate = url.searchParams.get('endDate');
    const userId = url.searchParams.get('userId');
    const page = url.searchParams.get('page') || '1';
    const limit = url.searchParams.get('limit') || '10';

    const { limit: l, offset, page: p } = validatePagination(page, limit);

    let query = supabase
      .from('records')
      .select('id, amount, type, category, record_date, notes, created_by, created_at, updated_at, users(name, email)', { count: 'exact' });

    if (req.user.role === 'viewer') {
      query = query.eq('created_by', req.user.userId);
    } else if (userId) {
      query = query.eq('created_by', userId);
    }

    if (type) {
      if (!['income', 'expense'].includes(type) && type !== '') return errorResponse('Invalid type filter', 400);
      query = query.eq('type', type);
    }
    if (category) {
      query = query.ilike('category', `%${category}%`);
    }
    if (startDate) {
      query = query.gte('record_date', startDate);
    }
    if (endDate) {
      query = query.lte('record_date', endDate);
    }

    const from = offset;
    const to = offset + l - 1;

    const { data: records, count: totalCount, error } = await query
      .order('record_date', { ascending: false })
      .order('created_at', { ascending: false })
      .range(from, to);

    if (error) throw error;

    return successResponse({
      records,
      meta: {
        total: totalCount,
        page: p,
        limit: l,
        totalPages: Math.ceil(totalCount / l)
      }
    });
  } catch (error) {
    console.error('List records error:', error);
    return errorResponse('Internal server error', 500);
  }
}, ['admin', 'analyst', 'viewer']);

export const POST = withAuth(async (req) => {
  try {
    const body = await req.json();
    const missing = validateRequiredFields(body, ['amount', 'type', 'category', 'record_date']);
    
    if (missing.length > 0) {
      return errorResponse(`Missing fields: ${missing.join(', ')}`, 400);
    }

    if (!['income', 'expense'].includes(body.type)) {
      return errorResponse('Invalid type', 400);
    }

    if (isNaN(parseFloat(body.amount)) || parseFloat(body.amount) <= 0) {
      return errorResponse('Invalid amount', 400);
    }

    const { data: newRecord, error } = await supabase
      .from('records')
      .insert({
        amount: parseFloat(body.amount),
        type: body.type,
        category: body.category,
        record_date: body.record_date,
        notes: body.notes || null,
        created_by: req.user.userId
      })
      .select('id, amount, type, category, record_date, notes, created_by, created_at, updated_at')
      .single();

    if (error) throw error;

    return successResponse(newRecord, 'Record created successfully', 201);
  } catch (error) {
    console.error('Create record error:', error);
    return errorResponse('Internal server error', 500);
  }
}, ['admin', 'viewer']);
