import { verifyAccessToken } from '../utils/token.js';
import { errorResponse } from '../utils/response.js';

export function authenticate(req, res, next) {
  let token = null;

  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.split(' ')[1];
  } else if (req.cookies && req.cookies.accessToken) {
    token = req.cookies.accessToken;
  }

  if (!token) {
    return errorResponse(res, 'Yêu cầu đăng nhập để truy cập tài nguyên này.', 401);
  }

  const decoded = verifyAccessToken(token);
  if (!decoded) {
    return errorResponse(res, 'Token không hợp lệ hoặc đã hết hạn.', 401);
  }

  req.user = decoded;
  next();
}

export function optionalAuth(req, res, next) {
  let token = null;
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.split(' ')[1];
  } else if (req.cookies && req.cookies.accessToken) {
    token = req.cookies.accessToken;
  }

  if (token) {
    const decoded = verifyAccessToken(token);
    if (decoded) {
      req.user = decoded;
    }
  }

  next();
}
