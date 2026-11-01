import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { userRepository } from '../repositories/userRepository.js';
import { getPool } from '../config/db.js';
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
  hashToken,
} from '../utils/token.js';

export const authService = {
  async register({ full_name, email, password, avatar_url }) {
    const existing = await userRepository.findByEmail(email.toLowerCase().trim());
    if (existing) {
      const err = new Error('Email này đã được sử dụng.');
      err.statusCode = 409;
      throw err;
    }

    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);
    const id = crypto.randomUUID();

    const user = await userRepository.create({
      id,
      full_name: full_name.trim(),
      email: email.toLowerCase().trim(),
      password_hash,
      avatar_url: avatar_url || 'https://api.dicebear.com/7.x/bottts/svg?seed=' + id,
      role: 'student',
    });

    // Initialize Day 1 lesson as available for this user
    try {
      const pool = await getPool();
      await pool.query(
        "INSERT OR IGNORE INTO user_lesson_progress (user_id, lesson_id, status, progress_percent) VALUES (?, 'jlpt-n5-day-01', 'available', 0)",
        [user.id]
      );
    } catch (e) {
      // ignore if already present
    }

    // Generate tokens
    const tokenPayload = { id: user.id, email: user.email, role: user.role };
    const accessToken = generateAccessToken(tokenPayload);
    const refreshToken = generateRefreshToken(tokenPayload);

    // Save refresh token hash
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
    await userRepository.saveRefreshToken(user.id, hashToken(refreshToken), expiresAt);

    return {
      user: {
        id: user.id,
        full_name: user.full_name,
        email: user.email,
        avatar_url: user.avatar_url,
        role: user.role,
      },
      accessToken,
      refreshToken,
    };
  },

  async login({ email, password }) {
    const user = await userRepository.findByEmail(email.toLowerCase().trim());
    if (!user) {
      const err = new Error('Email hoặc mật khẩu không chính xác.');
      err.statusCode = 401;
      throw err;
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      const err = new Error('Email hoặc mật khẩu không chính xác.');
      err.statusCode = 401;
      throw err;
    }

    const tokenPayload = { id: user.id, email: user.email, role: user.role };
    const accessToken = generateAccessToken(tokenPayload);
    const refreshToken = generateRefreshToken(tokenPayload);

    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
    await userRepository.saveRefreshToken(user.id, hashToken(refreshToken), expiresAt);

    return {
      user: {
        id: user.id,
        full_name: user.full_name,
        email: user.email,
        avatar_url: user.avatar_url,
        role: user.role,
      },
      accessToken,
      refreshToken,
    };
  },

  async refresh(oldRefreshToken) {
    if (!oldRefreshToken) {
      const err = new Error('Yêu cầu refresh token.');
      err.statusCode = 401;
      throw err;
    }

    const decoded = verifyRefreshToken(oldRefreshToken);
    if (!decoded) {
      const err = new Error('Refresh token không hợp lệ hoặc đã hết hạn.');
      err.statusCode = 401;
      throw err;
    }

    const tokenHash = hashToken(oldRefreshToken);
    const tokenDoc = await userRepository.findRefreshToken(tokenHash);
    if (!tokenDoc) {
      // Possible reuse attack - invalidate all user tokens
      await userRepository.deleteUserRefreshTokens(decoded.id);
      const err = new Error('Refresh token không hợp lệ hoặc đã bị thu hồi.');
      err.statusCode = 401;
      throw err;
    }

    // Invalidate old token
    await userRepository.deleteRefreshToken(tokenHash);

    const user = await userRepository.findById(decoded.id);
    if (!user) {
      const err = new Error('Người dùng không tồn tại.');
      err.statusCode = 404;
      throw err;
    }

    // Generate new tokens
    const tokenPayload = { id: user.id, email: user.email, role: user.role };
    const newAccessToken = generateAccessToken(tokenPayload);
    const newRefreshToken = generateRefreshToken(tokenPayload);

    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
    await userRepository.saveRefreshToken(user.id, hashToken(newRefreshToken), expiresAt);

    return {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
      user,
    };
  },

  async logout(refreshToken) {
    if (refreshToken) {
      const tokenHash = hashToken(refreshToken);
      await userRepository.deleteRefreshToken(tokenHash);
    }
  },
};
