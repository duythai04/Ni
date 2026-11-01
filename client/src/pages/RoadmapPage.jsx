import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  Lock,
  CheckCircle2,
  Play,
  Clock,
  Sparkles,
  Trophy,
  BookOpen,
  MessageCircle,
  HelpCircle,
  X,
} from 'lucide-react';
import apiClient from '../api/client';
import { useAuthStore } from '../stores/authStore';

export default function RoadmapPage() {
  const { isAuthenticated } = useAuthStore();
  const [selectedComingSoonDay, setSelectedComingSoonDay] = useState(null);

  const { data: roadmapData, isLoading } = useQuery({
    queryKey: ['roadmap'],
    queryFn: async () => {
      const res = await apiClient.get('/courses/japanese-n5-beginner/roadmap');
      return res.data.data;
    },
  });

  const stages = roadmapData?.stages || [
    {
      id: 1,
      title: 'Giai đoạn 1',
      subtitle: 'Nền tảng (Ngày 1 - 14)',
      description: 'Hiragana, Katakana, phát âm',
      icon: 'torii',
      dayRange: [1, 14],
      status: 'active',
    },
    {
      id: 2,
      title: 'Giai đoạn 2',
      subtitle: 'Ngữ pháp cơ bản (Ngày 15 - 40)',
      description: 'Mẫu câu N5, từ vựng cơ bản',
      icon: 'book',
      dayRange: [15, 40],
      status: 'coming_soon',
    },
    {
      id: 3,
      title: 'Giai đoạn 3',
      subtitle: 'Giao tiếp (Ngày 41 - 70)',
      description: 'Hội thoại đời sống, luyện nghe',
      icon: 'chat',
      dayRange: [41, 70],
      status: 'coming_soon',
    },
    {
      id: 4,
      title: 'Giai đoạn 4',
      subtitle: 'Ôn tập & Thi thử (Ngày 71 - 90)',
      description: 'Tổng hợp, đề thi JLPT N5',
      icon: 'trophy',
      dayRange: [71, 90],
      status: 'coming_soon',
    },
  ];

  const days = roadmapData?.days || [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
      
      {/* 1. ROADMAP HEADER matching screenshot */}
      <div className="text-center space-y-3">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-navy-dark tracking-tight">
          Lộ trình học N5
        </h1>
        <p className="text-base text-navy-muted font-medium">
          90 ngày • Từ cơ bản đến giao tiếp và thi JLPT N5
        </p>
      </div>

      {/* 2. FOUR STAGES CARDS matching screenshot */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {stages.map((stage) => {
          const isActive = stage.id === 1;
          return (
            <div
              key={stage.id}
              className={`rounded-3xl p-6 transition-all duration-200 ${
                isActive
                  ? 'bg-white border-2 border-primary-400 shadow-sakura-lg ring-4 ring-pink-100/50'
                  : 'bg-white/80 border border-pink-100 shadow-sm opacity-90'
              }`}
            >
              <div className="flex items-center justify-between mb-4">
                <div
                  className={`w-12 h-12 rounded-2xl flex items-center justify-center p-2.5 ${
                    isActive ? 'bg-primary-100 text-primary-600' : 'bg-pink-50 text-navy-muted'
                  }`}
                >
                  {stage.icon === 'torii' && <img src="/assets/torii-icon.svg" alt="Torii" className="w-7 h-7" />}
                  {stage.icon === 'book' && <BookOpen className="w-6 h-6 text-sky-600" />}
                  {stage.icon === 'chat' && <MessageCircle className="w-6 h-6 text-indigo-600" />}
                  {stage.icon === 'trophy' && <Trophy className="w-6 h-6 text-amber-500" />}
                </div>

                {isActive ? (
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-primary-100 text-primary-600">
                    Đang học
                  </span>
                ) : (
                  <span className="px-3 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-500">
                    Sắp ra mắt
                  </span>
                )}
              </div>

              <h3 className="font-extrabold text-navy-dark text-lg mb-1">{stage.title}</h3>
              <p className="text-xs font-bold text-primary-600 mb-2">{stage.subtitle}</p>
              <p className="text-xs text-navy-light leading-relaxed">{stage.description}</p>
            </div>
          );
        })}
      </div>

      {/* 3. WINDING PATH & CHIBI GIRL BANNER matching screenshot */}
      <div className="relative rounded-3xl bg-gradient-to-r from-pink-100/70 via-rose-50/50 to-pink-100/70 p-6 sm:p-10 border border-pink-200 overflow-hidden shadow-sakura">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6 relative z-10">
          
          {/* Walking Chibi Anime Mascot Girl matching screenshot */}
          <div className="flex items-center gap-6">
            <div className="w-28 h-28 sm:w-36 sm:h-36 flex-shrink-0 animate-pulse">
              <img
                src="/assets/chibi-girl.svg"
                alt="Chibi Student"
                className="w-full h-full object-contain drop-shadow-md"
              />
            </div>
            <div>
              <span className="inline-block px-3 py-1 rounded-full text-xs font-bold bg-white text-primary-600 shadow-xs mb-2">
                Hành trình từng ngày
              </span>
              <h2 className="text-xl sm:text-2xl font-extrabold text-navy-dark">
                Hoàn thành từng ngày để mở khóa chặng tiếp theo
              </h2>
              <p className="text-xs sm:text-sm text-navy-muted mt-1">
                Vượt qua bài kiểm tra cuối ngày với điểm số yêu cầu để tiếp tục lộ trình!
              </p>
            </div>
          </div>

          <Link
            to="/learn/1"
            className="px-6 py-3.5 rounded-full bg-primary-500 text-white font-bold text-sm hover:bg-primary-600 shadow-sakura transition-all flex items-center gap-2 whitespace-nowrap"
          >
            <Play className="w-4 h-4 fill-white" />
            Vào học ngay
          </Link>
        </div>

        {/* Winding Pink Path Art in Background */}
        <svg className="absolute bottom-0 left-0 right-0 w-full h-24 opacity-30 pointer-events-none" viewBox="0 0 1000 100" fill="none">
          <path d="M0 60 Q 250 20, 500 60 T 1000 60" stroke="#EC4899" stroke-width="12" stroke-linecap="round" stroke-dasharray="16 16"/>
        </svg>
      </div>

      {/* 4. DAYS MAP (Days 1 to 5 with real content + Days 6 to 90 coming soon) */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-navy-dark flex items-center gap-2.5">
            <span>🌸</span> Danh sách ngày học (Giai đoạn 1: Nền tảng)
          </h2>
          <span className="text-xs font-semibold text-navy-light">
            5 ngày học đã sẵn sàng nội dung
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {days.slice(0, 14).map((d) => {
            const isCompleted = d.status === 'completed';
            const isAvailable = d.status === 'available' || d.status === 'in_progress';
            const isLocked = d.status === 'locked';
            const isComingSoon = d.status === 'coming_soon' || !d.hasContent;

            return (
              <div
                key={d.day}
                className={`rounded-3xl p-6 border transition-all duration-200 ${
                  isCompleted
                    ? 'bg-emerald-50/40 border-emerald-200 shadow-sm'
                    : isAvailable
                    ? 'bg-white border-primary-300 shadow-sakura hover:shadow-sakura-lg hover:-translate-y-1'
                    : 'bg-gray-50/70 border-gray-200 opacity-70'
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-bold ${
                      isCompleted
                        ? 'bg-emerald-100 text-emerald-700'
                        : isAvailable
                        ? 'bg-primary-100 text-primary-600'
                        : 'bg-gray-200 text-gray-600'
                    }`}
                  >
                    Ngày {d.day}/90
                  </span>

                  {/* Status Indicator */}
                  {isCompleted ? (
                    <span className="flex items-center gap-1 text-xs font-bold text-emerald-600">
                      <CheckCircle2 className="w-4 h-4" /> Hoàn thành
                    </span>
                  ) : isAvailable ? (
                    <span className="flex items-center gap-1 text-xs font-bold text-primary-600">
                      <Play className="w-4 h-4" /> Đang mở
                    </span>
                  ) : isComingSoon ? (
                    <span className="flex items-center gap-1 text-xs font-semibold text-gray-500">
                      <Clock className="w-4 h-4" /> Sắp ra mắt
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-xs font-semibold text-gray-400">
                      <Lock className="w-4 h-4" /> Chưa mở khóa
                    </span>
                  )}
                </div>

                <h3 className="font-extrabold text-navy-dark text-lg mb-2">
                  {d.title || `Ngày ${d.day}`}
                </h3>

                {d.hasContent ? (
                  <div className="space-y-4">
                    <div className="flex items-center gap-4 text-xs text-navy-light font-medium">
                      <span>⏱️ {d.estimatedMinutes || 60} phút</span>
                      <span>🎯 Điểm đạt: {d.passingScore}/10+</span>
                    </div>

                    <Link
                      to={`/learn/${d.day}`}
                      className={`w-full py-2.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all ${
                        isCompleted
                          ? 'bg-emerald-500 hover:bg-emerald-600 text-white'
                          : isAvailable
                          ? 'bg-primary-500 hover:bg-primary-600 text-white shadow-xs'
                          : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                      }`}
                    >
                      {isCompleted ? 'Ôn tập lại' : isAvailable ? 'Vào học ngay' : 'Hoàn thành ngày trước'}
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <p className="text-xs text-gray-500">
                      Nội dung bài học đang được biên soạn theo giáo trình JLPT N5.
                    </p>
                    <button
                      onClick={() => setSelectedComingSoonDay(d.day)}
                      className="w-full py-2.5 rounded-xl font-semibold text-xs bg-gray-100 hover:bg-gray-200 text-gray-600 transition-colors"
                    >
                      Xem chi tiết giai đoạn
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Coming Soon Modal */}
      {selectedComingSoonDay && (
        <div className="fixed inset-0 z-50 bg-navy-dark/40 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-sakura-lg border border-pink-100 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-pink-100 text-primary-600 mx-auto flex items-center justify-center text-2xl">
              🌸
            </div>
            <h3 className="text-xl font-bold text-navy-dark">
              Ngày {selectedComingSoonDay} — Sắp ra mắt!
            </h3>
            <p className="text-sm text-navy-muted leading-relaxed">
              Dữ liệu bài học cho Ngày {selectedComingSoonDay} đang được chuẩn bị và cập nhật vào hệ thống. Hiện tại, bạn có thể học tập đầy đủ từ <strong>Ngày 1 đến Ngày 5</strong> với đầy đủ Bảng chữ cái, Từ vựng, Mẫu câu, Bài tập và Bài kiểm tra!
            </p>
            <button
              onClick={() => setSelectedComingSoonDay(null)}
              className="w-full py-3 rounded-full bg-primary-500 text-white font-bold text-sm hover:bg-primary-600 transition-colors"
            >
              Đã hiểu
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
