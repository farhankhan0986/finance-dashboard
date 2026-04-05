import { successResponse, errorResponse } from '@/lib/api';
import { withAuth } from '@/lib/guards';
import { validateRequiredFields, isValidEmail } from '@/lib/validate';
import supabase from '@/lib/db';
import bcrypt from 'bcryptjs';

export const GET = withAuth(async (req) => {
  try {
    const { data: users, error } = await supabase
      .from('users')
      .select('id, name, email, role, status, created_at, updated_at')
      .order('created_at', { ascending: false });

    if (error) throw error;
    
    return successResponse(users);
  } catch (error) {
    console.error('List users error:', error);
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

    const { data: existing } = await supabase
      .from('users')
      .select('id')
      .eq('email', body.email.toLowerCase())
      .single();

    if (existing) {
      return errorResponse('Email already exists', 409);
    }

    const hash = await bcrypt.hash(body.password, 10);
    
    const { data: newUser, error: insertError } = await supabase
      .from('users')
      .insert({
        name: body.name,
        email: body.email.toLowerCase(),
        password_hash: hash,
        role: body.role,
        status: body.status || 'active'
      })
      .select('id, name, email, role, status, created_at, updated_at')
      .single();

    if (insertError) throw insertError;

    return successResponse(newUser, 'User created successfully', 201);
  } catch (error) {
    console.error('Create user error:', error);
    return errorResponse('Internal server error', 500);
  }
}, ['admin']);
