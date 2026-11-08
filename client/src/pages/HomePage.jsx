import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";

import {
  BookOpen,
  ShieldCheck,
  Target,
  TrendingUp,
  ArrowRight,
  Sparkles,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

import apiClient from "../api/client";
import { useAuthStore } from "../stores/authStore";

// ========================================
// HELPER FUNCTIONS
// ========================================

const formatLocalDate = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

const normalizeStudyDate = (value) => {
  if (typeof value === "string") {
    const match = value.match(/^\d{4}-\d{2}-\d{2}/);
    return match ? match[0] : null;
  }

  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return formatLocalDate(value);
  }

  return null;
};

// ========================================
// HOME PAGE
// ========================================

export default function HomePage() {
  const { isAuthenticated } = useAuthStore();

  // ========================================
  // DASHBOARD DATA
  // ========================================

  const { data: dashboard } = useQuery({
    queryKey: ["dashboard"],
    queryFn: async () => {
      const res = await apiClient.get("/progress/dashboard");
      return res.data.data;
    },
    enabled: isAuthenticated,
  });

  const currentDay = dashboard?.currentDay || 1;
  const completedDays = dashboard?.completedDays || 0;
  const streak = dashboard?.studyStreak ?? 0;
  const completionPercent = dashboard?.completionPercent ?? 0;

  const studyDates = Array.isArray(dashboard?.studyDates)
    ? dashboard.studyDates
    : [];

  // ========================================
  // QUICK ACTIONS
  // ========================================

  const quickActions = [
    {
      title: "Học theo ngày",
      desc: "Lộ trình rõ ràng",
      icon: BookOpen,
      iconBg: "bg-indigo-50 text-indigo-600",
      to: `/learn/${currentDay}`,
    },
    {
      title: "Luyện tập",
      desc: "Bài tập đa dạng",
      icon: ShieldCheck,
      iconBg: "bg-sky-50 text-sky-600",
      to: `/flashcards?day=${currentDay}`,
    },
    {
      title: "Kiểm tra",
      desc: "Đánh giá kiến thức",
      icon: Target,
      iconBg: "bg-pink-50 text-pink-600",
      to: `/quiz/${currentDay}`,
    },
    {
      title: "Theo dõi tiến độ",
      desc: "Xem sự tiến bộ",
      icon: TrendingUp,
      iconBg: "bg-emerald-50 text-emerald-600",
      to: "/progress",
    },
  ];

  // ========================================
  // DYNAMIC STUDY CALENDAR
  // ========================================

  const [viewDate, setViewDate] = useState(() => new Date());

  const today = new Date();
  const todayString = formatLocalDate(today);

  const currentYear = viewDate.getFullYear();
  const currentMonth = viewDate.getMonth();

  const currentMonthName = `Tháng ${currentMonth + 1}, ${currentYear}`;

  const daysHeader = ["T2", "T3", "T4", "T5", "T6", "T7", "CN"];

  // Số ngày của tháng đang xem
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

  // Thứ của ngày đầu tiên trong tháng
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();

  // Chuyển hệ thống Chủ nhật = 0
  // thành Thứ hai = 0
  const startOffset = (firstDayOfMonth + 6) % 7;

  // Danh sách ngày đã học từ Backend
  const completedStudyDates = new Set(
    studyDates.map(normalizeStudyDate).filter(Boolean),
  );

  // Tạo các ô trống trước ngày 1
  const calendarDays = Array.from({ length: startOffset }, () => null);

  // Tạo đầy đủ ngày trong tháng
  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(currentYear, currentMonth, day);

    const dateString = formatLocalDate(date);

    calendarDays.push({
      date: day,
      dateString,
      isChecked: completedStudyDates.has(dateString),
      isCurrent: dateString === todayString,
    });
  }

  // Chuyển tháng trước
  const previousMonth = () => {
    setViewDate((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };

  // Chuyển tháng sau
  const nextMonth = () => {
    setViewDate((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

  // Quay về tháng hiện tại
  const goToToday = () => {
    setViewDate(new Date());
  };

  // ========================================
  // RENDER
  // ========================================

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* ======================================== */}
      {/* 1. HERO BANNER                           */}
      {/* ======================================== */}

      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-pink-100/60 via-purple-50/40 to-blue-50/60 border border-pink-200/60 p-8 sm:p-12 shadow-sakura">
        {/* Background */}
        <div className="absolute inset-0 pointer-events-none">
          <img
            src="/assets/hero-japan.png"
            alt=""
            className="w-full h-full object-cover object-center"
          />
        </div>

        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="max-w-xl space-y-5 text-center md:text-left">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/80 border border-pink-200 backdrop-blur-sm text-xs font-bold text-primary-600 shadow-xs">
              <Sparkles className="w-4 h-4 text-primary-500" />
              <span>Chương trình chuẩn JLPT N5 — 90 Ngày</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-navy-dark leading-tight tracking-tight">
              Bắt đầu hành trình <br className="hidden sm:inline" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-pink-500">
                học tiếng Nhật
              </span>
            </h1>

            <p className="text-base sm:text-lg text-navy-muted font-normal leading-relaxed">
              Từ con số 0 đến giao tiếp cơ bản, chinh phục JLPT cùng bạn!
            </p>

            <div className="pt-2">
              <Link
                to={`/learn/${currentDay}`}
                className="inline-flex items-center gap-3 px-8 py-4 rounded-full text-base font-bold text-white bg-gradient-to-r from-primary-500 to-pink-500 hover:from-primary-600 hover:to-pink-600 shadow-sakura-lg hover:shadow-xl transition-all duration-200"
              >
                <span>Tiếp tục học</span>
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ======================================== */}
      {/* 2. QUICK ACTIONS                         */}
      {/* ======================================== */}

      <section className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {quickActions.map((action, index) => {
          const Icon = action.icon;

          return (
            <Link
              key={index}
              to={action.to}
              className="group bg-white rounded-2xl p-5 border border-pink-100/80 shadow-sakura hover:shadow-sakura-lg hover:-translate-y-1 transition-all duration-200 flex items-center gap-4"
            >
              <div
                className={`w-14 h-14 rounded-2xl ${action.iconBg} flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform`}
              >
                <Icon className="w-7 h-7" />
              </div>

              <div>
                <h3 className="font-bold text-navy-dark text-base group-hover:text-primary-600 transition-colors">
                  {action.title}
                </h3>

                <p className="text-xs text-navy-light font-medium">
                  {action.desc}
                </p>
              </div>
            </Link>
          );
        })}
      </section>

      {/* ======================================== */}
      {/* 3. PROGRESS + CALENDAR                   */}
      {/* ======================================== */}

      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ====================================== */}
        {/* PROGRESS SUMMARY                       */}
        {/* ====================================== */}

        <div className="lg:col-span-2 bg-white rounded-3xl p-6 sm:p-8 border border-pink-100 shadow-sakura space-y-6">
          <div className="flex items-center justify-between border-b border-pink-100 pb-4">
            <div className="flex items-center gap-3">
              <span className="text-2xl">📊</span>

              <div>
                <h2 className="text-xl font-bold text-navy-dark">
                  Tiến độ học tập
                </h2>

                <p className="text-xs text-navy-light">
                  Dữ liệu được đồng bộ từ MySQL Backend
                </p>
              </div>
            </div>

            <Link
              to="/progress"
              className="text-sm font-semibold text-primary-600 hover:text-primary-700 flex items-center gap-1"
            >
              Chi tiết
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 items-center">
            {/* Donut Chart */}
            <div className="flex flex-col items-center justify-center p-6 bg-sakura-bg rounded-2xl border border-pink-100">
              <div className="relative w-36 h-36 flex items-center justify-center">
                <svg
                  className="w-full h-full transform -rotate-90"
                  viewBox="0 0 100 100"
                >
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
                    strokeDashoffset={
                      2 * Math.PI * 40 * (1 - completionPercent / 100)
                    }
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="transparent"
                  />
                </svg>

                <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                  <span className="text-2xl font-extrabold text-navy-dark">
                    {completionPercent}%
                  </span>

                  <span className="text-xs font-semibold text-navy-light">
                    Hoàn thành
                  </span>
                </div>
              </div>
            </div>

            {/* Statistics */}
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3.5 rounded-2xl bg-sakura-bg/60 border border-pink-50">
                <div className="flex items-center gap-3">
                  <span className="text-xl">📖</span>
                  <span className="text-sm font-semibold text-navy-muted">
                    Đã học
                  </span>
                </div>

                <span className="text-base font-bold text-navy-dark">
                  {completedDays} ngày
                </span>
              </div>

              <div className="flex items-center justify-between p-3.5 rounded-2xl bg-sakura-bg/60 border border-pink-50">
                <div className="flex items-center gap-3">
                  <span className="text-xl">🔥</span>
                  <span className="text-sm font-semibold text-navy-muted">
                    Chuỗi học
                  </span>
                </div>

                <span className="text-base font-bold text-orange-600">
                  {streak} ngày
                </span>
              </div>

              <div className="flex items-center justify-between p-3.5 rounded-2xl bg-sakura-bg/60 border border-pink-50">
                <div className="flex items-center gap-3">
                  <span className="text-xl">✔️</span>
                  <span className="text-sm font-semibold text-navy-muted">
                    Bài đã hoàn thành
                  </span>
                </div>

                <span className="text-base font-bold text-emerald-600">
                  {completedDays} / 90
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* ====================================== */}
        {/* DYNAMIC STUDY CALENDAR                 */}
        {/* ====================================== */}

        <div className="bg-white rounded-3xl p-6 border border-pink-100 shadow-sakura flex flex-col justify-between">
          <div>
            {/* Calendar Header */}
            <div className="flex items-center justify-between mb-6 gap-2">
              <h3 className="font-bold text-navy-dark text-base">Lịch học</h3>

              <div className="flex items-center gap-1 sm:gap-2">
                <button
                  type="button"
                  onClick={previousMonth}
                  aria-label="Tháng trước"
                  className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-pink-100 transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>

                <span className="text-xs sm:text-sm font-bold text-navy-dark min-w-[100px] text-center">
                  {currentMonthName}
                </span>

                <button
                  type="button"
                  onClick={nextMonth}
                  aria-label="Tháng sau"
                  className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-pink-100 transition-colors"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Weekdays */}
            <div className="grid grid-cols-7 gap-1 text-center text-xs font-semibold text-navy-light mb-2">
              {daysHeader.map((day) => (
                <div key={day} className="py-2">
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-1 sm:gap-1.5 text-center text-xs">
              {calendarDays.map((item, index) => {
                if (!item) {
                  return <div key={`empty-${index}`} className="h-9" />;
                }

                return (
                  <div
                    key={item.dateString}
                    title={
                      item.isChecked
                        ? "Đã học"
                        : item.isCurrent
                          ? "Hôm nay"
                          : item.dateString
                    }
                    className={`
                      h-9 rounded-xl
                      flex items-center justify-center
                      font-bold transition-colors

                      ${
                        item.isChecked
                          ? "bg-emerald-500 text-white shadow-xs"
                          : item.isCurrent
                            ? "border-2 border-primary-500 text-primary-600 bg-primary-50/50"
                            : "text-navy-muted hover:bg-pink-50"
                      }
                    `}
                  >
                    {item.isChecked ? "✓" : item.date}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Calendar Footer */}
          <div className="mt-6 pt-4 border-t border-pink-100 flex flex-wrap items-center justify-between gap-2 text-xs text-navy-light">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" />
              Đã học
            </span>

            <button
              type="button"
              onClick={goToToday}
              className="text-primary-600 font-semibold hover:underline"
            >
              Về hôm nay
            </button>

            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-primary-500 inline-block" />
              Hôm nay
            </span>
          </div>
        </div>
      </section>

      {/* ======================================== */}
      {/* 4. LEARNING ROADMAP                      */}
      {/* ======================================== */}

      <section className="space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
          <div>
            <div className="inline-flex items-center gap-2 text-primary-600 text-sm font-bold mb-2">
              <Sparkles className="w-4 h-4" />
              LỘ TRÌNH HỌC TẬP
            </div>

            <h2 className="text-2xl sm:text-3xl font-extrabold text-navy-dark">
              Chinh phục N5 từng bước nhỏ
            </h2>

            <p className="text-navy-muted mt-2">
              90 ngày học có định hướng, từ bảng chữ cái đến luyện thi JLPT N5.
            </p>
          </div>

          <Link
            to={`/learn/${currentDay}`}
            className="inline-flex items-center gap-2 text-primary-600 font-bold hover:underline"
          >
            Bắt đầu ngày {currentDay}
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          {[
            {
              step: "01",
              title: "Làm quen tiếng Nhật",
              days: "Ngày 1–15",
              desc: "Hiragana, Katakana và lời chào cơ bản.",
              icon: "🌸",
              color: "from-pink-50 to-rose-50",
              border: "border-pink-100",
            },
            {
              step: "02",
              title: "Xây dựng nền tảng",
              days: "Ngày 16–35",
              desc: "Từ vựng, Kanji và mẫu câu thông dụng.",
              icon: "📚",
              color: "from-purple-50 to-indigo-50",
              border: "border-purple-100",
            },
            {
              step: "03",
              title: "Luyện kỹ năng",
              days: "Ngày 36–65",
              desc: "Ngữ pháp, đọc hiểu và nghe cơ bản.",
              icon: "🎧",
              color: "from-sky-50 to-cyan-50",
              border: "border-sky-100",
            },
            {
              step: "04",
              title: "Ôn tập & luyện thi",
              days: "Ngày 66–90",
              desc: "Củng cố kiến thức và làm bài luyện tập.",
              icon: "🏆",
              color: "from-amber-50 to-orange-50",
              border: "border-amber-100",
            },
          ].map((stage) => (
            <div
              key={stage.step}
              className={`relative rounded-3xl border ${stage.border} bg-gradient-to-br ${stage.color} p-6 hover:-translate-y-1 hover:shadow-sakura-lg transition-all duration-200`}
            >
              <div className="flex items-start justify-between">
                <span className="text-3xl">{stage.icon}</span>

                <span className="text-3xl font-black text-navy-dark/10">
                  {stage.step}
                </span>
              </div>

              <p className="text-xs font-bold text-primary-600 mt-5">
                {stage.days}
              </p>

              <h3 className="text-lg font-extrabold text-navy-dark mt-1">
                {stage.title}
              </h3>

              <p className="text-sm text-navy-muted mt-2 leading-relaxed">
                {stage.desc}
              </p>
            </div>
          ))}
        </div>

        <p className="text-xs text-navy-light">
          Lộ trình minh họa 90 ngày; nội dung bài học hiện có phụ thuộc dữ liệu
          được nhập vào hệ thống.
        </p>
      </section>

      {/* ======================================== */}
      {/* 5. TODAY'S STUDY                         */}
      {/* ======================================== */}

      <section className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Today's Learning */}
        <div className="lg:col-span-3 rounded-3xl border border-pink-100 bg-white p-6 sm:p-8 shadow-sakura">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-12 h-12 rounded-2xl bg-pink-100 text-primary-600 flex items-center justify-center">
              <BookOpen className="w-6 h-6" />
            </div>

            <div>
              <p className="text-xs font-bold text-primary-600 uppercase tracking-wide">
                Gợi ý hôm nay
              </p>

              <h2 className="text-xl sm:text-2xl font-extrabold text-navy-dark">
                Tiếp tục hành trình của bạn
              </h2>
            </div>
          </div>

          <p className="text-navy-muted leading-relaxed mb-6">
            Dành 15–20 phút để ôn từ vựng, học bài mới và làm bài kiểm tra. Học
            đều đặn mỗi ngày sẽ giúp bạn ghi nhớ tốt hơn.
          </p>

          <div className="flex flex-wrap gap-3">
            <Link
              to={`/learn/${currentDay}`}
              className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-primary-500 to-pink-500 px-6 py-3 font-bold text-white hover:shadow-lg transition-shadow"
            >
              Học ngày {currentDay}
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              to={`/flashcards?day=${currentDay}`}
              className="inline-flex items-center gap-2 rounded-full border border-pink-200 bg-pink-50 px-6 py-3 font-bold text-primary-600 hover:bg-pink-100 transition-colors"
            >
              Ôn Flashcards
            </Link>
          </div>
        </div>

        {/* Japanese Corner */}
        <div className="lg:col-span-2 rounded-3xl border border-purple-100 bg-gradient-to-br from-purple-50 via-white to-pink-50 p-6 sm:p-8 shadow-sakura">
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="w-5 h-5 text-primary-600" />

            <h2 className="text-xl font-extrabold text-navy-dark">
              Góc tiếng Nhật
            </h2>
          </div>

          <p className="text-sm text-navy-muted mb-3">Câu giao tiếp cơ bản</p>

          <p
            lang="ja"
            className="text-3xl sm:text-4xl font-bold text-navy-dark mb-2"
          >
            こんにちは！
          </p>

          <p className="text-primary-600 font-semibold">Konnichiwa</p>

          <p className="text-navy-muted mt-3">
            Xin chào! — Một lời chào quen thuộc trong tiếng Nhật.
          </p>

          <div className="mt-6 pt-4 border-t border-purple-100 text-sm text-navy-muted">
            💡 Mẹo nhỏ: Hãy đọc to từ mới và tự đặt câu để ghi nhớ lâu hơn.
          </div>
        </div>
      </section>

      {/* ======================================== */}
      {/* 6. PRACTICE CALL TO ACTION               */}
      {/* ======================================== */}

      <section className="relative overflow-hidden rounded-3xl border border-pink-200 bg-gradient-to-r from-pink-100 via-rose-50 to-purple-100 p-7 sm:p-10">
        <div className="absolute -right-12 -top-16 h-48 w-48 rounded-full bg-white/40 pointer-events-none" />

        <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 text-primary-600 font-bold text-sm mb-2">
              <Target className="w-4 h-4" />
              LUYỆN TẬP
            </div>

            <h2 className="text-2xl sm:text-3xl font-extrabold text-navy-dark">
              Sẵn sàng kiểm tra kiến thức?
            </h2>

            <p className="text-navy-muted mt-2 max-w-xl">
              Hoàn thành bài kiểm tra để đánh giá mức độ ghi nhớ và tiếp tục lộ
              trình học.
            </p>
          </div>

          <Link
            to={`/quiz/${currentDay}`}
            className="inline-flex shrink-0 items-center justify-center gap-2 rounded-full bg-white px-7 py-3.5 text-primary-600 font-extrabold shadow-sakura hover:shadow-lg transition-shadow"
          >
            Làm bài kiểm tra
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>
    </div>
  );
}
