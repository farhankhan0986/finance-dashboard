import { errorResponse } from './api';
import { verifyToken } from './auth';

export function getAuthUser(req) {
  const authHeader = req.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return { error: 'Authentication required' };
  }

  const token = authHeader.split(' ')[1];
  const decoded = verifyToken(token);
  
  if (!decoded) {
    return { error: 'Invalid or expired token' };
  }
  
  return { user: decoded };
}

export function withAuth(handler, allowedRoles = []) {
  return async (req, ctx) => {
    const authResult = getAuthUser(req);
    
    if (authResult.error) {
      return errorResponse(authResult.error, 401);
    }

    const { user } = authResult;

    if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
      return errorResponse('Insufficient permissions', 403);
    }

    req.user = user;
    
    return handler(req, ctx);
  };
}
