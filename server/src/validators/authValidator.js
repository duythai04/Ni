import { z } from 'zod';

export const registerSchema = z.object({
  full_name: z.string().min(2, 'Họ và tên tối thiểu 2 ký tự').max(100),
  email: z.string().email('Email không đúng định dạng'),
  password: z.string().min(6, 'Mật khẩu phải có ít nhất 6 ký tự'),
  avatar_url: z.string().optional(),
});

export const loginSchema = z.object({
  email: z.string().email('Email không đúng định dạng'),
  password: z.string().min(1, 'Vui lòng nhập mật khẩu'),
});

export const updateProfileSchema = z.object({
  full_name: z.string().min(2).max(100).optional(),
  avatar_url: z.string().optional(),
});
