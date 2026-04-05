import { successResponse, errorResponse } from '@/lib/api';
import { withAuth } from '@/lib/guards';
import supabase from '@/lib/db';

export const GET = withAuth(async (req, { params }) => {
  try {
    const { id } = await params;
    
    const { data: record, error } = await supabase
      .from('records')
      .select('id, amount, type, category, record_date, notes, created_by, created_at, updated_at')
      .eq('id', id)
      .single();

    if (error || !record) return errorResponse('Record not found', 404);

    if (req.user.role === 'viewer' && record.created_by !== req.user.userId) {
      return errorResponse('Forbidden', 403);
    }
    
    return successResponse(record);
  } catch (error) {
    return errorResponse('Internal server error', 500);
  }
}, ['admin', 'analyst', 'viewer']);

export const PUT = withAuth(async (req, { params }) => {
  try {
    const { id } = await params;
    const body = await req.json();
    
    const { data: existing } = await supabase
      .from('records')
      .select('id, created_by')
      .eq('id', id)
      .single();

    if (!existing) return errorResponse('Record not found', 404);

    const updates = {};

    if (body.amount !== undefined) {
      if (isNaN(parseFloat(body.amount)) || parseFloat(body.amount) <= 0) return errorResponse('Invalid amount', 400);
      updates.amount = parseFloat(body.amount);
    }

    if (body.type) {
      if (!['income', 'expense'].includes(body.type)) return errorResponse('Invalid type', 400);
      updates.type = body.type;
    }
    
    if (body.category) {
      updates.category = body.category;
    }

    if (body.record_date) {
      updates.record_date = body.record_date;
    }

    if (body.notes !== undefined) {
      updates.notes = body.notes;
    }

    if (Object.keys(updates).length === 0) {
      return errorResponse('No valid fields to update', 400);
    }

    updates.updated_at = new Date().toISOString();

    const { data: updatedRecord, error } = await supabase
      .from('records')
      .update(updates)
      .eq('id', id)
      .select('id, amount, type, category, record_date, notes')
      .single();

    if (error) throw error;

    return successResponse(updatedRecord, 'Record updated successfully');
  } catch (error) {
    return errorResponse('Internal server error', 500);
  }
}, ['admin']);

export const DELETE = withAuth(async (req, { params }) => {
  try {
    const { id } = await params;

    const { data: existing } = await supabase
      .from('records')
      .select('id, created_by')
      .eq('id', id)
      .single();

    if (!existing) return errorResponse('Record not found', 404);

    const { data, error } = await supabase
      .from('records')
      .delete()
      .eq('id', id)
      .select('id');
    
    if (error || !data || data.length === 0) return errorResponse('Record not found', 404);
    
    return successResponse({ deletedId: id }, 'Record deleted successfully');
  } catch (error) {
    return errorResponse('Internal server error', 500);
  }
}, ['admin']);
