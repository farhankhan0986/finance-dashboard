import { successResponse, errorResponse } from '@/lib/api';
import { withAuth } from '@/lib/guards';
import pool from '@/lib/db';

export const GET = withAuth(async (req, { params }) => {
  try {
    const { id } = await params;
    const { rows } = await pool.query(
      'SELECT id, name, email, role, status, created_at, updated_at FROM users WHERE id = $1',
      [id]
    );

    if (rows.length === 0) return errorResponse('User not found', 404);
    
    return successResponse(rows[0]);
  } catch (error) {
    return errorResponse('Internal server error', 500);
  }
}, ['admin']);

export const PUT = withAuth(async (req, { params }) => {
  try {
    const { id } = await params;
    const body = await req.json();
    
    const { rows: existing } = await pool.query('SELECT id FROM users WHERE id = $1', [id]);
    if (existing.length === 0) return errorResponse('User not found', 404);

    const updates = [];
    const values = [];
    let idx = 1;

    if (body.role) {
      if (!['admin', 'analyst', 'viewer'].includes(body.role)) {
        return errorResponse('Invalid role', 400);
      }
      updates.push(`role = $${idx++}`);
      values.push(body.role);
    }

    if (body.status) {
      if (!['active', 'inactive'].includes(body.status)) {
        return errorResponse('Invalid status', 400);
      }
      updates.push(`status = $${idx++}`);
      values.push(body.status);
    }

    if (updates.length === 0) {
      return errorResponse('No valid fields to update', 400);
    }

    updates.push(`updated_at = CURRENT_TIMESTAMP`);
    values.push(id);

    const { rows } = await pool.query(
      `UPDATE users SET ${updates.join(', ')} WHERE id = $${idx} RETURNING id, name, email, role, status`,
      values
    );

    return successResponse(rows[0], 'User updated successfully');
  } catch (error) {
    return errorResponse('Internal server error', 500);
  }
}, ['admin']);
