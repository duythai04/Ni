import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { toast } from 'sonner';
import { User, Lock, Mail, ArrowRight, Sparkles } from 'lucide-react';

const registerSchema = z.object({
  full_name: z.string().min(2, 'Họ tên phải có ít nhất 2 ký tự').max(100),
  email: z.string().email('Email không đúng định dạng'),
  password: z.string().min(6, 'Mật khẩu phải từ 6 ký tự trở lên'),
});

export default function RegisterPage() {
  const { register: registerAuth } = useAuthStore();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data) => {
    try {
      await registerAuth(data.full_name, data.email, data.password);
      toast.success('Đăng ký tài khoản thành công! Chào mừng bạn đến với Nihongo N5 🌸');
      navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Không thể đăng ký tài khoản. Vui lòng thử lại.');
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
            Tạo tài khoản học tiếng Nhật
          </h1>
          <p className="text-xs text-navy-light">
            Bắt đầu lộ trình 90 ngày chinh phục kỳ thi JLPT N5 ngay hôm nay
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-bold text-navy-dark">Họ và tên</label>
            <div className="relative">
              <User className="w-4 h-4 text-navy-light absolute left-3.5 top-3.5" />
              <input
                {...register('full_name')}
                type="text"
                placeholder="Nguyễn Văn A"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-pink-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-400"
              />
            </div>
            {errors.full_name && <p className="text-xs text-red-500 font-semibold">{errors.full_name.message}</p>}
          </div>

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
                placeholder="Tối thiểu 6 ký tự"
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
            <span>{isSubmitting ? 'Đang tạo tài khoản...' : 'Bắt đầu học ngay'}</span>
            <Sparkles className="w-4 h-4" />
          </button>
        </form>

        <div className="text-center text-xs text-navy-light pt-2 border-t border-pink-50">
          Đã có tài khoản?{' '}
          <Link to="/login" className="font-bold text-primary-600 hover:underline">
            Đăng nhập
          </Link>
        </div>

      </div>
    </div>
  );
}
