import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { toast } from 'sonner';
import { Lock, Mail, ArrowRight } from 'lucide-react';

const loginSchema = z.object({
  email: z.string().email('Email không đúng định dạng'),
  password: z.string().min(1, 'Vui lòng nhập mật khẩu'),
});

export default function LoginPage() {
  const { login } = useAuthStore();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data) => {
    try {
      await login(data.email, data.password);
      toast.success('Đăng nhập thành công! 🌸');
      navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Email hoặc mật khẩu không chính xác.');
    }
  };

  return (
    <div className="min-h-[calc(100vh-10rem)] flex items-center justify-center px-4 py-12">
      <div className="bg-white rounded-3xl p-8 sm:p-10 max-w-md w-full border border-pink-100 shadow-sakura-lg space-y-6">
        
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-primary-100 mx-auto flex items-center justify-center p-2.5">
            <img src="/assets/torii-icon.svg" alt="Torii" className="w-full h-full object-contain" />
          </div>
          <h1 className="text-2xl font-extrabold text-navy-dark tracking-tight">
            Đăng nhập Nihongo N5
          </h1>
          <p className="text-xs text-navy-light">
            Chào mừng bạn quay lại với hành trình học tiếng Nhật!
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-bold text-navy-dark">Email</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-navy-light absolute left-3.5 top-3.5" />
              <input
                {...register('email')}
                type="email"
                placeholder="tenban@example.com"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-pink-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-400"
              />
            </div>
            {errors.email && <p className="text-xs text-red-500 font-semibold">{errors.email.message}</p>}
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-navy-dark">Mật khẩu</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-navy-light absolute left-3.5 top-3.5" />
              <input
                {...register('password')}
                type="password"
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-pink-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-400"
              />
            </div>
            {errors.password && <p className="text-xs text-red-500 font-semibold">{errors.password.message}</p>}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3.5 rounded-full bg-gradient-to-r from-primary-500 to-pink-500 hover:from-primary-600 hover:to-pink-600 text-white font-bold text-sm shadow-sakura flex items-center justify-center gap-2 transition-all mt-6"
          >
            <span>{isSubmitting ? 'Đang đăng nhập...' : 'Đăng nhập'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="text-center text-xs text-navy-light pt-2 border-t border-pink-50">
          Chưa có tài khoản?{' '}
          <Link to="/register" className="font-bold text-primary-600 hover:underline">
            Đăng ký ngay
          </Link>
        </div>

      </div>
    </div>
  );
}
