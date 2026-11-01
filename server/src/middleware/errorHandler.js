import { errorResponse } from '../utils/response.js';

export function errorHandler(err, req, res, next) {
  console.error('[Error Handler]', err);

  if (err.name === 'ZodError') {
    return errorResponse(res, 'Dữ liệu không hợp lệ', 400, err.errors);
  }

  const statusCode = err.statusCode || 500;
  const message = err.message || 'Lỗi hệ thống máy chủ nội bộ';

  return errorResponse(res, message, statusCode);
}
