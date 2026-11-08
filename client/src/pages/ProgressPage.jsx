import React from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';
import {
  Award,
  Flame,
  BookOpen,
  CheckCircle2,
  Calendar as CalendarIcon,
  Sparkles,
  TrendingUp,
  Target,
} from 'lucide-react';
import apiClient from '../api/client';
import { useAuthStore } from '../stores/authStore';

export default function ProgressPage() {
  const { isAuthenticated, user } = useAuthStore();

  const { data: dashboard } = useQuery({
    queryKey: ['dashboard'],
    queryFn: async () => {
      const res = await apiClient.get('/progress/dashboard');
      return res.data.data;
    },
    enabled: isAuthenticated,
  });

  const { data: stats } = useQuery({
    queryKey: ['statistics'],
    queryFn: async () => {
      const res = await apiClient.get('/progress/statistics');
      return res.data.data;
    },
    enabled: isAuthenticated,
  });

  const completionPercent = dashboard?.completionPercent ?? 12;
  const completedDays = dashboard?.completedDays || 0;
  const streak = dashboard?.studyStreak ?? 5;
  const masteredVocab = dashboard?.masteredVocabCount ?? 12;

  // Recharts data preparation
  const chartData = (stats?.activityByDate || [
    { activity_date: '2025-01-01', activities_count: 3, daily_xp: 30 },
    { activity_date: '2025-01-02', activities_count: 5, daily_xp: 60 },
    { activity_date: '2025-01-03', activities_count: 4, daily_xp: 40 },
    { activity_date: '2025-01-04', activities_count: 6, daily_xp: 70 },
    { activity_date: '2025-01-05', activities_count: 7, daily_xp: 85 },
  ]).map((item) => ({
    date: item.activity_date.substring(5), 
    xp: item.daily_xp || item.activities_count * 10,
  }));

  const achievements = [
    {
      title: 'Bước chân đầu tiên',
      desc: 'Hoàn thành bài học Ngày 1',
      icon: '🌱',
      isUnlocked: completedDays >= 1,
    },
    {
      title: 'Bền bỉ học tập',
      desc: 'Đạt chuỗi học liên tục 5 ngày',
      icon: '🔥',
      isUnlocked: streak >= 5,
    },
    {
      title: 'Nhớ từ siêu tốc',
      desc: 'Ghi nhớ hơn 10 từ vựng N5',
      icon: '💎',
      isUnlocked: masteredVocab >= 10,
    },
    {
      title: 'Thành thạo Hiragana',
      desc: 'Hoàn thành cả 5 ngày chữ Hiragana',
      icon: '🌸',
      isUnlocked: completedDays >= 5,
    },
  ];

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
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Page Title */}
      <div>
        <h1 className="text-3xl font-extrabold text-navy-dark tracking-tight">
          Báo cáo tiến độ học tập
        </h1>
        <p className="text-sm text-navy-muted">
          Theo dõi sát sao hành trình chinh phục tiếng Nhật N5 của bạn
        </p>
      </div>

      {/* 4 Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-3xl p-5 border border-pink-100 shadow-sakura space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-navy-light uppercase">Tiến độ chung</span>
            <span className="text-xl">🌸</span>
          </div>
          <p className="text-3xl font-extrabold text-primary-600">{completionPercent}%</p>
          <p className="text-xs text-navy-muted">{completedDays}/90 ngày đã hoàn thành</p>
        </div>

        <div className="bg-white rounded-3xl p-5 border border-pink-100 shadow-sakura space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-navy-light uppercase">Chuỗi ngày học</span>
            <span className="text-xl">🔥</span>
          </div>
          <p className="text-3xl font-extrabold text-orange-600">{streak} ngày</p>
          <p className="text-xs text-navy-muted">Duy trì thói quen hàng ngày</p>
        </div>

        <div className="bg-white rounded-3xl p-5 border border-pink-100 shadow-sakura space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-navy-light uppercase">Từ vựng đã nhớ</span>
            <span className="text-xl">💎</span>
          </div>
          <p className="text-3xl font-extrabold text-emerald-600">{masteredVocab}</p>
          <p className="text-xs text-navy-muted">Đã thuộc làu qua Flashcard</p>
        </div>

        <div className="bg-white rounded-3xl p-5 border border-pink-100 shadow-sakura space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-navy-light uppercase">Điểm kinh nghiệm</span>
            <span className="text-xl">⚡</span>
          </div>
          <p className="text-3xl font-extrabold text-indigo-600">{stats?.totalXp || 240} XP</p>
          <p className="text-xs text-navy-muted">Tích lũy từ bài học và kiểm tra</p>
        </div>
      </div>

      {/* Main Charts & Calendar Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Recharts Activity Graph */}
        <div className="lg:col-span-2 bg-white rounded-3xl p-6 sm:p-8 border border-pink-100 shadow-sakura space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-navy-dark flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary-500" />
              Điểm kinh nghiệm (XP) theo ngày
            </h2>
            <span className="text-xs font-semibold text-navy-light">14 ngày gần nhất</span>
          </div>

          <div className="h-64 w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#FCE7F3" vertical={false} />
                <XAxis dataKey="date" stroke="#64748B" fontSize={11} tickLine={false} />
                <YAxis stroke="#64748B" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#FFFFFF',
                    borderRadius: '16px',
                    border: '1px solid #FCE7F3',
                    boxShadow: '0 4px 20px rgba(236, 72, 153, 0.1)',
                  }}
                />
                <Bar dataKey="xp" fill="#EC4899" radius={[8, 8, 0, 0]} name="XP đạt được" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Study Calendar Card matching screenshot */}
        <div className="bg-white rounded-3xl p-6 border border-pink-100 shadow-sakura space-y-4">
          <h2 className="text-lg font-bold text-navy-dark flex items-center gap-2">
            <CalendarIcon className="w-5 h-5 text-primary-500" />
            Lịch học tập
          </h2>

          <div className="p-4 rounded-2xl bg-sakura-bg border border-pink-100">
            <div className="text-center font-bold text-sm text-navy-dark mb-3">
              Tháng 1, 2025
            </div>

            <div className="grid grid-cols-7 gap-1 text-center text-xs font-bold text-navy-light mb-2">
              <span>T2</span>
              <span>T3</span>
              <span>T4</span>
              <span>T5</span>
              <span>T6</span>
              <span>T7</span>
              <span>CN</span>
            </div>

            <div className="grid grid-cols-7 gap-1 text-center text-xs">
              {calendarDays.map((item, i) => (
                <div
                  key={i}
                  className={`h-8 rounded-lg flex items-center justify-center font-bold ${
                    item.isChecked
                      ? 'bg-emerald-500 text-white'
                      : item.isCurrent
                      ? 'border-2 border-primary-500 text-primary-600 bg-white'
                      : 'text-navy-muted'
                  }`}
                >
                  {item.isChecked ? '✓' : item.date}
                </div>
              ))}
            </div>
          </div>

          <div className="text-xs text-navy-muted space-y-1.5 pt-2">
            <p className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
              Đã hoàn thành mục tiêu ngày
            </p>
            <p className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-primary-500"></span>
              Ngày đang tiếp diễn
            </p>
          </div>
        </div>

      </div>

      {/* Achievements / Huy hiệu học tập */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-pink-100 shadow-sakura space-y-6">
        <h2 className="text-xl font-bold text-navy-dark flex items-center gap-2">
          <Award className="w-6 h-6 text-primary-500" />
          Huy hiệu thành tích
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {achievements.map((ach, i) => (
            <div
              key={i}
              className={`rounded-2xl p-5 border text-center transition-all ${
                ach.isUnlocked
                  ? 'bg-sakura-bg/80 border-pink-200 shadow-xs'
                  : 'bg-gray-50/50 border-gray-200 opacity-50 grayscale'
              }`}
            >
              <div className="text-4xl mb-3">{ach.icon}</div>
              <h3 className="font-bold text-navy-dark text-sm mb-1">{ach.title}</h3>
              <p className="text-xs text-navy-light">{ach.desc}</p>
              <span
                className={`inline-block mt-3 px-3 py-0.5 rounded-full text-xs font-bold ${
                  ach.isUnlocked
                    ? 'bg-emerald-100 text-emerald-700'
                    : 'bg-gray-200 text-gray-600'
                }`}
              >
                {ach.isUnlocked ? 'Đã đạt được' : 'Chưa mở khóa'}
              </span>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
