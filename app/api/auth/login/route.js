import { successResponse, errorResponse } from '@/lib/api';
import { validateRequiredFields, isValidEmail } from '@/lib/validate';
import { signToken } from '@/lib/auth';
import pool from '@/lib/db';
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

    const { rows } = await pool.query(
      'SELECT id, name, email, password_hash, role, status FROM users WHERE email = $1',
      [body.email.toLowerCase()]
    );

    const user = rows[0];

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
