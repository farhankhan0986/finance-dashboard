import { errorResponse } from './api';
import { verifyToken } from './auth';

export function getAuthUser(req) {
  const authHeader = req.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }

  const token = authHeader.split(' ')[1];
  const decoded = verifyToken(token);
  return decoded;
}

export function withAuth(handler, allowedRoles = []) {
  return async (req, ctx) => {
    const user = getAuthUser(req);
    
    if (!user) {
      return errorResponse('Unauthenticated', 401);
    }

    if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
      return errorResponse('Forbidden: Insufficient permissions', 403);
    }

    req.user = user;
    
    return handler(req, ctx);
  };
}
