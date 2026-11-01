import { authService } from '../services/authService.js';
import { userRepository } from '../repositories/userRepository.js';
import { registerSchema, loginSchema, updateProfileSchema } from '../validators/authValidator.js';
import { successResponse, errorResponse } from '../utils/response.js';
import { cookieOptions } from '../utils/token.js';

export const authController = {
  async register(req, res, next) {
    try {
      const validated = registerSchema.parse(req.body);
      const result = await authService.register(validated);

      res.cookie('refreshToken', result.refreshToken, cookieOptions);
      return successResponse(res, result, 'Đăng ký tài khoản thành công', 201);
    } catch (err) {
      next(err);
    }
  },

  async login(req, res, next) {
    try {
      const validated = loginSchema.parse(req.body);
      const result = await authService.login(validated);

      res.cookie('refreshToken', result.refreshToken, cookieOptions);
      return successResponse(res, result, 'Đăng nhập thành công');
    } catch (err) {
      next(err);
    }
  },

  async refresh(req, res, next) {
    try {
      const refreshToken = req.cookies?.refreshToken || req.body?.refreshToken;
      const result = await authService.refresh(refreshToken);

      res.cookie('refreshToken', result.refreshToken, cookieOptions);
      return successResponse(res, result, 'Làm mới token thành công');
    } catch (err) {
      next(err);
    }
  },

  async logout(req, res, next) {
    try {
      const refreshToken = req.cookies?.refreshToken || req.body?.refreshToken;
      await authService.logout(refreshToken);
      res.clearCookie('refreshToken');
      return successResponse(res, null, 'Đăng xuất thành công');
    } catch (err) {
      next(err);
    }
  },

  async getMe(req, res, next) {
    try {
      const user = await userRepository.findById(req.user.id);
      if (!user) {
        return errorResponse(res, 'Người dùng không tồn tại', 404);
      }
      return successResponse(res, user, 'Lấy thông tin người dùng thành công');
    } catch (err) {
      next(err);
    }
  },

  async updateProfile(req, res, next) {
    try {
      const validated = updateProfileSchema.parse(req.body);
      const updated = await userRepository.update(req.user.id, validated);
      return successResponse(res, updated, 'Cập nhật hồ sơ thành công');
    } catch (err) {
      next(err);
    }
  },
};
