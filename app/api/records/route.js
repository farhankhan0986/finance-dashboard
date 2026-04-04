import { successResponse, errorResponse } from '@/lib/api';
import { withAuth } from '@/lib/guards';
import { validateRequiredFields, validatePagination } from '@/lib/validate';
import pool from '@/lib/db';

export const GET = withAuth(async (req) => {
  try {
    const url = new URL(req.url);
    const type = url.searchParams.get('type');
    const category = url.searchParams.get('category');
    const startDate = url.searchParams.get('startDate');
    const endDate = url.searchParams.get('endDate');
    const page = url.searchParams.get('page') || '1';
    const limit = url.searchParams.get('limit') || '10';

    const { limit: l, offset, page: p } = validatePagination(page, limit);

    let queryStr = 'SELECT id, amount, type, category, record_date, notes, created_by, created_at, updated_at FROM records WHERE 1=1';
    const params = [];
    let idx = 1;

    if (type) {
      if (!['income', 'expense'].includes(type) && type !== '') return errorResponse('Invalid type filter', 400);
      queryStr += ` AND type = $${idx++}`;
      params.push(type);
    }
    if (category) {
      queryStr += ` AND category = $${idx++}`;
      params.push(category);
    }
    if (startDate) {
      queryStr += ` AND record_date >= $${idx++}`;
      params.push(startDate);
    }
    if (endDate) {
      queryStr += ` AND record_date <= $${idx++}`;
      params.push(endDate);
    }

    const countQuery = `SELECT COUNT(*) FROM (${queryStr}) as count_query`;
    const { rows: countRows } = await pool.query(countQuery, params);
    const totalCount = parseInt(countRows[0].count, 10);

    queryStr += ` ORDER BY record_date DESC, created_at DESC LIMIT $${idx++} OFFSET $${idx++}`;
    params.push(l, offset);

    const { rows } = await pool.query(queryStr, params);

    return successResponse({
      records: rows,
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

    const { rows } = await pool.query(
      `INSERT INTO records (amount, type, category, record_date, notes, created_by) 
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING id, amount, type, category, record_date, notes, created_by, created_at, updated_at`,
      [parseFloat(body.amount), body.type, body.category, body.record_date, body.notes || null, req.user.userId]
    );

    return successResponse(rows[0], 'Record created successfully', 201);
  } catch (error) {
    return errorResponse('Internal server error', 500);
  }
}, ['admin', 'analyst']);
