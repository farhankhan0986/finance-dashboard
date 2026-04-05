import { successResponse, errorResponse } from '@/lib/api';
import { validateRequiredFields, isValidEmail } from '@/lib/validate';
import { signToken } from '@/lib/auth';
import supabase from '@/lib/db';
import bcrypt from 'bcryptjs';

export async function POST(req) {
  try {
    const body = await req.json();
    
    const missing = validateRequiredFields(body, ['name', 'email', 'password']);
    if (missing.length > 0) {
      return errorResponse(`Missing required fields: ${missing.join(', ')}`, 400);
    }

    if (!isValidEmail(body.email)) {
      return errorResponse('Invalid email format', 400);
    }

    if (body.password.length < 6) {
      return errorResponse('Password must be at least 6 characters long', 400);
    }

    // Check if user already exists
    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('email', body.email.toLowerCase())
      .single();

    if (existingUser) {
      return errorResponse('Email is already registered', 409);
    }

    const password_hash = await bcrypt.hash(body.password, 10);

    const { data: newUser, error: insertError } = await supabase
      .from('users')
      .insert({
        name: body.name,
        email: body.email.toLowerCase(),
        password_hash,
        role: 'viewer', // default role
        status: 'active'
      })
      .select('id, name, email, role')
      .single();

    if (insertError) {
      console.error('Insert error:', insertError);
      return errorResponse('Failed to create account', 500);
    }

    // Auto login
    const token = signToken({ userId: newUser.id, role: newUser.role });

    return successResponse({
      token,
      user: newUser
    }, 'Account created successfully', 201);

  } catch (error) {
    console.error('Signup error:', error);
    return errorResponse('Internal server error', 500);
  }
}
