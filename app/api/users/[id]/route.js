import { successResponse, errorResponse } from '@/lib/api';
import { withAuth } from '@/lib/guards';
import supabase from '@/lib/db';

export const GET = withAuth(async (req, { params }) => {
  try {
    const { id } = await params;
    const { data: user, error } = await supabase
      .from('users')
      .select('id, name, email, role, status, created_at, updated_at')
      .eq('id', id)
      .single();

    if (error || !user) return errorResponse('User not found', 404);
    
    return successResponse(user);
  } catch (error) {
    return errorResponse('Internal server error', 500);
  }
}, ['admin']);

export const PATCH = withAuth(async (req, { params }) => {
  try {
    const { id } = await params;
    const body = await req.json();
    
    const { data: existing } = await supabase
      .from('users')
      .select('id')
      .eq('id', id)
      .single();

    if (!existing) return errorResponse('User not found', 404);

    const updates = {};

    if (body.role) {
      if (!['admin', 'analyst', 'viewer'].includes(body.role)) {
        return errorResponse('Invalid role', 400);
      }
      updates.role = body.role;
    }

    if (body.status) {
      if (!['active', 'inactive'].includes(body.status)) {
        return errorResponse('Invalid status', 400);
      }
      updates.status = body.status;
    }

    if (Object.keys(updates).length === 0) {
      return errorResponse('No valid fields to update', 400);
    }

    updates.updated_at = new Date().toISOString();

    const { data: updatedUser, error: updateError } = await supabase
      .from('users')
      .update(updates)
      .eq('id', id)
      .select('id, name, email, role, status')
      .single();

    if (updateError) throw updateError;

    return successResponse(updatedUser, 'User updated successfully');
  } catch (error) {
    console.error('Update user error:', error);
    return errorResponse('Internal server error', 500);
  }
}, ['admin']);
