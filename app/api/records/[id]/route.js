import { successResponse, errorResponse } from '@/lib/api';
import { withAuth } from '@/lib/guards';
import pool from '@/lib/db';

export const GET = withAuth(async (req, { params }) => {
  try {
    const { id } = await params;
    const { rows } = await pool.query(
      'SELECT id, amount, type, category, record_date, notes, created_by, created_at, updated_at FROM records WHERE id = $1',
      [id]
    );

    if (rows.length === 0) return errorResponse('Record not found', 404);
    
    return successResponse(rows[0]);
  } catch (error) {
    return errorResponse('Internal server error', 500);
  }
}, ['admin', 'analyst', 'viewer']);

export const PUT = withAuth(async (req, { params }) => {
  try {
    const { id } = await params;
    const body = await req.json();
    
    const { rows: existing } = await pool.query('SELECT id FROM records WHERE id = $1', [id]);
    if (existing.length === 0) return errorResponse('Record not found', 404);

    const updates = [];
    const values = [];
    let idx = 1;

    if (body.amount !== undefined) {
      if (isNaN(parseFloat(body.amount)) || parseFloat(body.amount) <= 0) return errorResponse('Invalid amount', 400);
      updates.push(`amount = $${idx++}`);
      values.push(parseFloat(body.amount));
    }

    if (body.type) {
      if (!['income', 'expense'].includes(body.type)) return errorResponse('Invalid type', 400);
      updates.push(`type = $${idx++}`);
      values.push(body.type);
    }
    
    if (body.category) {
      updates.push(`category = $${idx++}`);
      values.push(body.category);
    }

    if (body.record_date) {
      updates.push(`record_date = $${idx++}`);
      values.push(body.record_date);
    }

    if (body.notes !== undefined) {
      updates.push(`notes = $${idx++}`);
      values.push(body.notes);
    }

    if (updates.length === 0) {
      return errorResponse('No valid fields to update', 400);
    }

    updates.push(`updated_at = CURRENT_TIMESTAMP`);
    values.push(id);

    const { rows } = await pool.query(
      `UPDATE records SET ${updates.join(', ')} WHERE id = $${idx} RETURNING id, amount, type, category, record_date, notes`,
      values
    );

    return successResponse(rows[0], 'Record updated successfully');
  } catch (error) {
    return errorResponse('Internal server error', 500);
  }
}, ['admin', 'analyst']);

export const DELETE = withAuth(async (req, { params }) => {
  try {
    const { id } = await params;
    
    const { rows } = await pool.query('DELETE FROM records WHERE id = $1 RETURNING id', [id]);
    
    if (rows.length === 0) return errorResponse('Record not found', 404);
    
    return successResponse({ deletedId: id }, 'Record deleted successfully');
  } catch (error) {
    return errorResponse('Internal server error', 500);
  }
}, ['admin', 'analyst']);
