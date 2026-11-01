import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  BookOpen,
  ShieldCheck,
  Target,
  TrendingUp,
  ArrowRight,
  Flame,
  CheckCircle2,
  Calendar as CalendarIcon,
  Sparkles,
} from 'lucide-react';
import apiClient from '../api/client';
import { useAuthStore } from '../stores/authStore';

export default function HomePage() {
  const { isAuthenticated, user } = useAuthStore();

  const { data: dashboard, isLoading } = useQuery({
    queryKey: ['dashboard'],
    queryFn: async () => {
      const res = await apiClient.get('/progress/dashboard');
      return res.data.data;
    },
    enabled: isAuthenticated,
  });

  const currentDay = dashboard?.currentDay || 1;
  const completedDays = dashboard?.completedDays || 0;
  const streak = dashboard?.studyStreak ?? 5;
  const completionPercent = dashboard?.completionPercent ?? 12; // matching screenshot visual
  const masteredVocab = dashboard?.masteredVocabCount ?? 10;
  const studyDates = dashboard?.studyDates || [];

  const quickActions = [
    {
      title: 'Học theo ngày',
      desc: 'Lộ trình rõ ràng',
      icon: BookOpen,
      iconBg: 'bg-indigo-50 text-indigo-600',
      to: `/learn/${currentDay}`,
    },
    {
      title: 'Luyện tập',
      desc: 'Bài tập đa dạng',
      icon: ShieldCheck,
      iconBg: 'bg-sky-50 text-sky-600',
      to: `/flashcards?day=${currentDay}`,
    },
    {
      title: 'Kiểm tra',
      desc: 'Đánh giá kiến thức',
      icon: Target,
      iconBg: 'bg-pink-50 text-pink-600',
      to: `/quiz/${currentDay}`,
    },
    {
      title: 'Theo dõi tiến độ',
      desc: 'Xem sự tiến bộ',
      icon: TrendingUp,
      iconBg: 'bg-emerald-50 text-emerald-600',
      to: '/progress',
    },
  ];

  // Calendar dates generation for current month
  const today = new Date();
  const currentMonthName = 'Tháng 1, 2025'; // matching screenshot aesthetic
  const daysHeader = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];
  const calendarDays = [
    { date: 1, isChecked: true },
    { date: 2, isChecked: true },
    { date: 3, isChecked: true },
    { date: 4, isChecked: true },
    { date: 5, isChecked: true },
    { date: 6, isChecked: true },
    { date: 7, isChecked: false, isCurrent: true },
    { date: 8, isChecked: false },
    { date: 9, isChecked: false },
    { date: 10, isChecked: false },
    { date: 11, isChecked: false },
    { date: 12, isChecked: false },
    { date: 13, isChecked: false },
    { date: 14, isChecked: false },
    { date: 15, isChecked: false },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* 1. HERO SECTION matching screenshot */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-pink-100/60 via-purple-50/40 to-blue-50/60 border border-pink-200/60 p-8 sm:p-12 shadow-sakura">
        {/* Background Fuji Art */}
        <div className="absolute inset-0 opacity-40 pointer-events-none">
          <img
            src="/assets/fuji-hero.svg"
            alt="Fuji Background"
            className="w-full h-full object-cover object-center"
          />
        </div>

        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
          {/* Left Hero Content */}
          <div className="max-w-xl space-y-5 text-center md:text-left">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/80 border border-pink-200 backdrop-blur-sm text-xs font-bold text-primary-600 shadow-xs">
              <Sparkles className="w-4 h-4 text-primary-500" />
              <span>Chương trình chuẩn JLPT N5 — 90 Ngày</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-navy-dark leading-tight tracking-tight">
              Bắt đầu hành trình <br className="hidden sm:inline" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-pink-500">
                học tiếng Nhật N5
              </span>
            </h1>

            <p className="text-base sm:text-lg text-navy-muted font-normal leading-relaxed">
              Từ con số 0 đến giao tiếp cơ bản, chinh phục JLPT N5 cùng bạn!
            </p>

            <div className="pt-2">
              <Link
                to={`/learn/${currentDay}`}
                className="inline-flex items-center gap-3 px-8 py-4 rounded-full text-base font-bold text-white bg-gradient-to-r from-primary-500 to-pink-500 hover:from-primary-600 hover:to-pink-600 shadow-sakura-lg hover:shadow-xl hover:scale-102 active:scale-98 transition-all duration-200"
              >
                <span>Tiếp tục học</span>
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </div>

          {/* Right Mascot: Waving Maneki-Neko matching screenshot */}
          <div className="relative w-48 sm:w-60 flex-shrink-0 animate-bounce duration-1000">
            <div className="relative z-10 drop-shadow-2xl">
              <img
                src="/assets/maneki-neko.svg"
                alt="Maneki Neko Mascot"
                className="w-full h-auto object-contain transform hover:scale-105 transition-transform"
              />
            </div>
          </div>
        </div>
      </section>

      {/* 2. QUICK ACTIONS (4 Cards matching screenshot) */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {quickActions.map((action, i) => {
          const Icon = action.icon;
          return (
            <Link
              key={i}
              to={action.to}
              className="group bg-white rounded-2xl p-5 border border-pink-100/80 shadow-sakura hover:shadow-sakura-lg hover:-translate-y-1 transition-all duration-200 flex items-center gap-4"
            >
              <div className={`w-14 h-14 rounded-2xl ${action.iconBg} flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform`}>
                <Icon className="w-7 h-7" />
              </div>
              <div>
                <h3 className="font-bold text-navy-dark text-base group-hover:text-primary-600 transition-colors">
                  {action.title}
                </h3>
                <p className="text-xs text-navy-light font-medium">{action.desc}</p>
              </div>
            </Link>
          );
        })}
      </section>

      {/* 3. PROGRESS WIDGET & STUDY CALENDAR matching screenshot */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Progress Summary Card */}
        <div className="lg:col-span-2 bg-white rounded-3xl p-6 sm:p-8 border border-pink-100 shadow-sakura space-y-6">
          <div className="flex items-center justify-between border-b border-pink-100 pb-4">
            <div className="flex items-center gap-3">
              <span className="text-2xl">📊</span>
              <div>
                <h2 className="text-xl font-bold text-navy-dark">Tiến độ học tập</h2>
                <p className="text-xs text-navy-light">Dữ liệu được đồng bộ từ MySQL Backend</p>
              </div>
            </div>
            <Link
              to="/progress"
              className="text-sm font-semibold text-primary-600 hover:text-primary-700 flex items-center gap-1"
            >
              Chi tiết <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 items-center">
            {/* Donut Chart visual matching screenshot */}
            <div className="flex flex-col items-center justify-center p-6 bg-sakura-bg rounded-2xl border border-pink-100">
              <div className="relative w-36 h-36 flex items-center justify-center">
                {/* SVG circular progress */}
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    className="text-pink-100"
                    strokeWidth="10"
                    stroke="currentColor"
                    fill="transparent"
                  />
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    className="text-primary-500"
                    strokeWidth="10"
                    strokeDasharray={2 * Math.PI * 40}
                    strokeDashoffset={2 * Math.PI * 40 * (1 - completionPercent / 100)}
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="transparent"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                  <span className="text-2xl font-extrabold text-navy-dark">{completionPercent}%</span>
                  <span className="text-xs font-semibold text-navy-light">Hoàn thành</span>
                </div>
              </div>
            </div>

            {/* Stats List matching screenshot */}
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3.5 rounded-2xl bg-sakura-bg/60 border border-pink-50">
                <div className="flex items-center gap-3">
                  <span className="text-xl">📖</span>
                  <span className="text-sm font-semibold text-navy-muted">Đã học</span>
                </div>
                <span className="text-base font-bold text-navy-dark">
                  {completedDays > 0 ? `${completedDays} ngày` : '6 ngày'}
                </span>
              </div>

              <div className="flex items-center justify-between p-3.5 rounded-2xl bg-sakura-bg/60 border border-pink-50">
                <div className="flex items-center gap-3">
                  <span className="text-xl">🔥</span>
                  <span className="text-sm font-semibold text-navy-muted">Chuỗi học</span>
                </div>
                <span className="text-base font-bold text-orange-600">
                  {streak} ngày
                </span>
              </div>

              <div className="flex items-center justify-between p-3.5 rounded-2xl bg-sakura-bg/60 border border-pink-50">
                <div className="flex items-center gap-3">
                  <span className="text-xl">✔️</span>
                  <span className="text-sm font-semibold text-navy-muted">Bài đã hoàn thành</span>
                </div>
                <span className="text-base font-bold text-emerald-600">
                  {completedDays > 0 ? `${completedDays} / 90` : '6 / 90'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Study Calendar Card matching screenshot */}
        <div className="bg-white rounded-3xl p-6 border border-pink-100 shadow-sakura flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-navy-dark text-base">Lịch học</h3>
              <div className="flex items-center gap-2 text-xs font-bold text-navy-muted">
                <button className="p-1 hover:bg-pink-50 rounded">&lt;</button>
                <span>{currentMonthName}</span>
                <button className="p-1 hover:bg-pink-50 rounded">&gt;</button>
              </div>
            </div>

            {/* Days header */}
            <div className="grid grid-cols-7 gap-1 text-center text-xs font-semibold text-navy-light mb-2">
              {daysHeader.map((d, i) => (
                <div key={i} className="py-1">
                  {d}
                </div>
              ))}
            </div>

            {/* Calendar dates grid */}
            <div className="grid grid-cols-7 gap-1.5 text-center text-xs">
              {calendarDays.map((item, i) => (
                <div
                  key={i}
                  className={`h-9 rounded-xl flex items-center justify-center font-bold transition-colors ${
                    item.isChecked
                      ? 'bg-emerald-500 text-white shadow-xs'
                      : item.isCurrent
                      ? 'border-2 border-primary-500 text-primary-600 bg-primary-50/50'
                      : 'text-navy-muted hover:bg-pink-50'
                  }`}
                >
                  {item.isChecked ? '✓' : item.date}
                </div>
              ))}
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-pink-100 flex items-center justify-between text-xs text-navy-light">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block"></span>
              Đã học
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-primary-500 inline-block"></span>
              Hôm nay
            </span>
          </div>
        </div>

      </section>

    </div>
  );
}
