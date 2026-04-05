import { successResponse, errorResponse } from '@/lib/api';
import { validateRequiredFields, isValidEmail } from '@/lib/validate';
import { signToken } from '@/lib/auth';
import supabase from '@/lib/db';
import bcrypt from 'bcryptjs';

export async function POST(req) {
  try {
    const body = await req.json();
    const missing = validateRequiredFields(body, ['email', 'password']);
    if (missing.length > 0) {
      return errorResponse(`Missing required fields: ${missing.join(', ')}`, 400);
    }

    if (!isValidEmail(body.email)) {
      return errorResponse('Invalid email format', 400);
    }

    const { data: user, error: dbError } = await supabase
      .from('users')
      .select('id, name, email, password_hash, role, status')
      .eq('email', body.email.toLowerCase())
      .single();

    if (dbError && dbError.code !== 'PGRST116') { // PGRST116 is "No rows returned"
      console.error('Database error:', dbError);
      return errorResponse('Internal server error', 500);
    }

    if (!user) {
      return errorResponse('Invalid email or password', 401);
    }

    if (user.status === 'inactive') {
      return errorResponse('Account is inactive', 403);
    }

    const isMatch = await bcrypt.compare(body.password, user.password_hash);

    if (!isMatch) {
      return errorResponse('Invalid email or password', 401);
    }

    const token = signToken({ userId: user.id, role: user.role });

    return successResponse({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      }
    }, 'Login successful');

  } catch (error) {
    console.error('Login error:', error);
    return errorResponse('Internal server error', 500);
  }
}
