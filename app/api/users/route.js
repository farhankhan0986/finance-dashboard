import { successResponse, errorResponse } from '@/lib/api';
import { withAuth } from '@/lib/guards';
import { validateRequiredFields, isValidEmail } from '@/lib/validate';
import pool from '@/lib/db';
import bcrypt from 'bcryptjs';

export const GET = withAuth(async (req) => {
  try {
    const { rows } = await pool.query(
      'SELECT id, name, email, role, status, created_at, updated_at FROM users ORDER BY created_at DESC'
    );
    return successResponse(rows);
  } catch (error) {
    return errorResponse('Internal server error', 500);
  }
}, ['admin']);

export const POST = withAuth(async (req) => {
  try {
    const body = await req.json();
    const missing = validateRequiredFields(body, ['name', 'email', 'password', 'role']);
    
    if (missing.length > 0) {
      return errorResponse(`Missing fields: ${missing.join(', ')}`, 400);
    }

    if (!isValidEmail(body.email)) {
      return errorResponse('Invalid email', 400);
    }

    if (!['admin', 'analyst', 'viewer'].includes(body.role)) {
      return errorResponse('Invalid role', 400);
    }

    const { rows: existing } = await pool.query('SELECT id FROM users WHERE email = $1', [body.email.toLowerCase()]);
    if (existing.length > 0) {
      return errorResponse('Email already exists', 409);
    }

    const hash = await bcrypt.hash(body.password, 10);
    
    const { rows } = await pool.query(
      `INSERT INTO users (name, email, password_hash, role, status) 
       VALUES ($1, $2, $3, $4, $5) RETURNING id, name, email, role, status, created_at, updated_at`,
      [body.name, body.email.toLowerCase(), hash, body.role, body.status || 'active']
    );

    return successResponse(rows[0], 'User created successfully', 201);
  } catch (error) {
    console.error('Create user error:', error);
    return errorResponse('Internal server error', 500);
  }
}, ['admin']);
