import React, { useState } from 'react';
import { useParams, Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  ArrowLeft,
  Volume2,
  CheckCircle2,
  Clock,
  Sparkles,
  Award,
  ChevronRight,
  BookOpen,
  BookA,
  MessageSquare,
  PenTool,
  Target,
  Repeat,
  Check,
} from 'lucide-react';
import apiClient from '../api/client';
import Sidebar from '../components/layout/Sidebar';
import { playJapaneseAudio } from '../utils/audio';
import { useAuthStore } from '../stores/authStore';
import { toast } from 'sonner';

export default function LessonPage() {
  const { day } = useParams();
  const dayNumber = parseInt(day, 10) || 1;
  const [searchParams, setSearchParams] = useSearchParams();
  const initialTab = searchParams.get('tab') || 'study';
  const [activeTab, setActiveTab] = useState(initialTab);
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { isAuthenticated } = useAuthStore();

  // Local checklist state for practice tab
  const [completedPracticeTasks, setCompletedPracticeTasks] = useState({});

  const { data: lesson, isLoading, error } = useQuery({
    queryKey: ['lesson', dayNumber],
    queryFn: async () => {
      const res = await apiClient.get(`/lessons/day/${dayNumber}`);
      return res.data.data;
    },
  });

  // Mark section complete mutation
  const sectionMutation = useMutation({
    mutationFn: async ({ sectionKey, isCompleted }) => {
      if (!isAuthenticated) return;
      const res = await apiClient.put(`/progress/sections/${sectionKey}`, {
        lessonId: lesson.id,
        isCompleted,
      });
      return res.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lesson', dayNumber] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      toast.success('Đã lưu tiến độ phần học!');
    },
  });

  const handleTabChange = (tabKey) => {
    setActiveTab(tabKey);
    setSearchParams({ tab: tabKey });
  };

  const togglePracticeTask = (taskId) => {
    const updated = {
      ...completedPracticeTasks,
      [taskId]: !completedPracticeTasks[taskId],
    };
    setCompletedPracticeTasks(updated);

    if (updated[taskId]) {
      toast.success('Tuyệt vời! Bạn đã hoàn thành nhiệm vụ.');
      sectionMutation.mutate({ sectionKey: 'practice', isCompleted: true });
    }
  };

  if (isLoading) {
    return (
      <div className="flex">
        <Sidebar />
        <div className="flex-1 p-8 text-center text-navy-muted">Đang tải nội dung bài học...</div>
      </div>
    );
  }

  if (error || !lesson) {
    return (
      <div className="flex">
        <Sidebar />
        <div className="flex-1 p-8 text-center space-y-4">
          <h2 className="text-2xl font-bold text-navy-dark">Không tìm thấy bài học</h2>
          <p className="text-sm text-navy-muted">
            Bài học Ngày {dayNumber} chưa có nội dung hoặc đang được biên soạn.
          </p>
          <Link to="/roadmap" className="px-5 py-2.5 rounded-full bg-primary-500 text-white font-bold text-sm">
            Quay lại lộ trình
          </Link>
        </div>
      </div>
    );
  }

  const progressPercent = lesson.userProgress?.progressPercent || 0;
  const tabs = [
    { key: 'study', label: 'Học bài', icon: BookOpen },
    { key: 'vocab', label: 'Từ vựng', icon: BookA },
    { key: 'convo', label: 'Giao tiếp', icon: MessageSquare },
    { key: 'practice', label: 'Bài tập', icon: PenTool },
    { key: 'quiz', label: 'Kiểm tra', icon: Target },
  ];

  return (
    <div className="flex min-h-[calc(100vh-5rem)]">
      {/* 1. Left Vertical Sidebar matching screenshot */}
      <Sidebar />

      {/* 2. Main Lesson Content */}
      <div className="flex-1 p-4 sm:p-8 max-w-5xl mx-auto space-y-6">
        
        {/* Top Breadcrumb & Title */}
        <div className="space-y-3">
          <Link
            to="/roadmap"
            className="inline-flex items-center gap-2 text-xs font-bold text-navy-muted hover:text-primary-600 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Quay lại lộ trình</span>
          </Link>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-navy-dark tracking-tight">
                Ngày {lesson.day_number}: {lesson.title}
              </h1>

              {/* Tags matching screenshot */}
              <div className="flex flex-wrap items-center gap-2.5 mt-2.5">
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
                  🌱 Ngày {lesson.day_number}/90
                </span>
                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-navy-dark/10 text-navy-dark">
                  ⏱️ {lesson.estimated_minutes} phút
                </span>
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-sky-100 text-sky-800">
                  🏷️ Cấp độ: N5 (Cơ bản)
                </span>
              </div>
            </div>

            {/* Circular Progress Indicator matching screenshot */}
            <div className="relative w-16 h-16 flex items-center justify-center flex-shrink-0 self-end sm:self-auto">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  className="text-pink-100"
                  strokeWidth="8"
                  stroke="currentColor"
                  fill="transparent"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  className="text-primary-500"
                  strokeWidth="8"
                  strokeDasharray={2 * Math.PI * 40}
                  strokeDashoffset={2 * Math.PI * 40 * (1 - progressPercent / 100)}
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="transparent"
                />
              </svg>
              <span className="absolute text-xs font-bold text-navy-dark">{progressPercent}%</span>
            </div>
          </div>
        </div>

        {/* 3. Tab Navigation matching screenshot */}
        <div className="flex border-b border-pink-200 gap-1 sm:gap-2 overflow-x-auto pb-px">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => handleTabChange(tab.key)}
                className={`flex items-center gap-2 px-5 py-3 text-sm font-bold border-b-2 transition-all whitespace-nowrap cursor-pointer ${
                  isActive
                    ? 'border-primary-500 text-primary-600 bg-primary-50/50 rounded-t-xl'
                    : 'border-transparent text-navy-muted hover:text-navy-dark hover:border-pink-200'
                }`}
              >
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* 4. Tab Content */}
        
        {/* TAB 1: HỌC BÀI matching screenshot */}
        {activeTab === 'study' && (
          <div className="space-y-8 animate-in fade-in duration-200">
            
            {/* Card 1: Mục tiêu bài học (with chibi girl holding sign) */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-pink-100 shadow-sakura">
              <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="space-y-4 flex-1">
                  <h3 className="text-lg font-bold text-navy-dark flex items-center gap-2">
                    <span className="text-primary-500">1.</span> Mục tiêu bài học
                  </h3>

                  <ul className="space-y-3">
                    {lesson.objectives.map((obj, i) => (
                      <li key={i} className="flex items-start gap-3 text-sm font-semibold text-navy-dark">
                        <div className="w-5 h-5 rounded-full bg-pink-100 text-primary-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <Check className="w-3.5 h-3.5 stroke-[3]" />
                        </div>
                        <span>{obj}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Mascot Illustration with あいう sign matching screenshot */}
                <div className="w-36 h-36 flex-shrink-0">
                  <img
                    src="/assets/chibi-girl.svg"
                    alt="Chibi Student with Sign"
                    className="w-full h-full object-contain"
                  />
                </div>
              </div>
            </div>

            {/* Card 2: Bảng chữ cái hôm nay (Cards for Hiragana characters with sound) */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-pink-100 shadow-sakura space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-navy-dark flex items-center gap-2">
                  <span className="text-primary-500">2.</span> Bảng chữ cái hôm nay
                </h3>
                <span className="text-xs text-navy-light font-semibold">
                  Nhấn loa để nghe phát âm chuẩn
                </span>
              </div>

              {/* Grid of big character cards matching screenshot */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
                {lesson.characters.map((char) => (
                  <div
                    key={char.id}
                    className="bg-sakura-bg/80 rounded-2xl p-5 border border-pink-100 text-center flex flex-col items-center justify-between hover:shadow-md hover:border-primary-300 transition-all group"
                  >
                    <span className="text-4xl font-extrabold text-navy-dark font-jp group-hover:scale-110 transition-transform">
                      {char.character_text}
                    </span>
                    <span className="text-base font-bold text-navy-muted mt-1">
                      {char.romaji}
                    </span>

                    {/* Audio Speaker Button */}
                    <button
                      onClick={() => playJapaneseAudio(char.character_text)}
                      className="mt-3 w-9 h-9 rounded-full bg-white text-primary-500 hover:bg-primary-500 hover:text-white border border-pink-200 flex items-center justify-center transition-colors shadow-xs"
                      title="Nghe phát âm"
                    >
                      <Volume2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Next Tab Button */}
            <div className="flex justify-end pt-4">
              <button
                onClick={() => handleTabChange('vocab')}
                className="px-6 py-3 rounded-full bg-primary-500 hover:bg-primary-600 text-white font-bold text-sm shadow-sakura flex items-center gap-2 transition-all"
              >
                <span>Học từ vựng</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* TAB 2: TỪ VỰNG */}
        {activeTab === 'vocab' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-navy-dark">Từ vựng Ngày {lesson.day_number}</h2>
                <p className="text-xs text-navy-light">Học từ vựng kèm phát âm và lưu vào Flashcard để ôn tập</p>
              </div>
              <Link
                to={`/flashcards?day=${lesson.day_number}`}
                className="px-4 py-2 rounded-full text-xs font-bold bg-pink-100 text-primary-600 hover:bg-pink-200 flex items-center gap-1.5 transition-colors"
              >
                <Repeat className="w-3.5 h-3.5" /> Luyện Flashcard ({lesson.vocabulary.length} từ)
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {lesson.vocabulary.map((voc) => (
                <div
                  key={voc.id}
                  className="bg-white rounded-2xl p-5 border border-pink-100 shadow-sakura flex flex-col justify-between hover:border-primary-300 transition-all"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-2xl font-bold font-jp text-navy-dark">
                        {voc.japanese}
                      </span>
                      <p className="text-sm font-semibold text-primary-600">{voc.romaji}</p>
                    </div>

                    <button
                      onClick={() => playJapaneseAudio(voc.japanese)}
                      className="w-8 h-8 rounded-full bg-pink-50 text-primary-500 hover:bg-primary-500 hover:text-white flex items-center justify-center transition-colors"
                    >
                      <Volume2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="mt-4 pt-3 border-t border-pink-50">
                    <p className="text-sm font-medium text-navy-dark">{voc.meaning_vi}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-end pt-4">
              <button
                onClick={() => handleTabChange('convo')}
                className="px-6 py-3 rounded-full bg-primary-500 hover:bg-primary-600 text-white font-bold text-sm shadow-sakura flex items-center gap-2 transition-all"
              >
                <span>Học giao tiếp</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* TAB 3: GIAO TIẾP */}
        {activeTab === 'convo' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div>
              <h2 className="text-xl font-bold text-navy-dark">Mẫu câu & Giao tiếp</h2>
              <p className="text-xs text-navy-light">Luyện đọc và nắm vững các câu chào hỏi, hội thoại căn bản</p>
            </div>

            <div className="space-y-4">
              {lesson.conversations.map((convo, i) => (
                <div
                  key={convo.id}
                  className="bg-white rounded-3xl p-6 border border-pink-100 shadow-sakura space-y-4"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-0.5 rounded-md text-xs font-bold bg-primary-100 text-primary-600">
                          Mẫu câu #{i + 1}
                        </span>
                      </div>
                      <p className="text-xl font-bold text-navy-dark font-jp pt-1">
                        {convo.japanese}
                      </p>
                      <p className="text-sm font-semibold text-primary-600">{convo.romaji}</p>
                    </div>

                    <button
                      onClick={() => playJapaneseAudio(convo.japanese)}
                      className="w-10 h-10 rounded-full bg-primary-50 text-primary-500 hover:bg-primary-500 hover:text-white flex items-center justify-center transition-colors shadow-xs flex-shrink-0"
                    >
                      <Volume2 className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="p-4 rounded-2xl bg-sakura-bg border border-pink-100 space-y-2">
                    <p className="text-sm font-bold text-navy-dark">
                      Bản dịch: <span className="font-semibold text-navy-muted">{convo.translation_vi}</span>
                    </p>
                    {convo.explanation && (
                      <p className="text-xs text-navy-light leading-relaxed">
                        💡 Giải thích: {convo.explanation}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-end pt-4">
              <button
                onClick={() => handleTabChange('practice')}
                className="px-6 py-3 rounded-full bg-primary-500 hover:bg-primary-600 text-white font-bold text-sm shadow-sakura flex items-center gap-2 transition-all"
              >
                <span>Luyện tập bài tập</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* TAB 4: BÀI TẬP */}
        {activeTab === 'practice' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div>
              <h2 className="text-xl font-bold text-navy-dark">Checklist bài tập thực hành</h2>
              <p className="text-xs text-navy-light">
                Tích chọn các nhiệm vụ để hoàn thành việc tự luyện tập hôm nay
              </p>
            </div>

            <div className="space-y-4">
              {lesson.sections
                .find((s) => s.section_key === 'practice')
                ?.content?.map((task) => {
                  const isChecked = !!completedPracticeTasks[task.id];
                  return (
                    <div
                      key={task.id}
                      onClick={() => togglePracticeTask(task.id)}
                      className={`cursor-pointer rounded-2xl p-5 border transition-all flex items-center justify-between ${
                        isChecked
                          ? 'bg-emerald-50/70 border-emerald-300 shadow-sm'
                          : 'bg-white border-pink-100 shadow-sakura hover:border-primary-300'
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <div
                          className={`w-7 h-7 rounded-lg flex items-center justify-center transition-colors ${
                            isChecked
                              ? 'bg-emerald-500 text-white'
                              : 'border-2 border-navy-light/40 bg-white'
                          }`}
                        >
                          {isChecked && <Check className="w-4 h-4 stroke-[3]" />}
                        </div>
                        <div>
                          <p
                            className={`text-sm font-bold ${
                              isChecked ? 'text-emerald-800 line-through' : 'text-navy-dark'
                            }`}
                          >
                            {task.instructionVi}
                          </p>
                          <span className="text-xs text-navy-light capitalize">
                            Loại bài tập: {task.type}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
            </div>

            <div className="flex justify-end pt-4">
              <button
                onClick={() => handleTabChange('quiz')}
                className="px-6 py-3 rounded-full bg-primary-500 hover:bg-primary-600 text-white font-bold text-sm shadow-sakura flex items-center gap-2 transition-all"
              >
                <span>Kiểm tra ngày {lesson.day_number}</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* TAB 5: KIỂM TRA */}
        {activeTab === 'quiz' && (
          <div className="bg-white rounded-3xl p-8 border border-pink-100 shadow-sakura text-center space-y-6 animate-in fade-in duration-200">
            <div className="w-16 h-16 rounded-3xl bg-pink-100 text-primary-600 flex items-center justify-center mx-auto text-3xl">
              🎯
            </div>

            <div className="max-w-md mx-auto space-y-2">
              <h2 className="text-2xl font-extrabold text-navy-dark">
                Bài kiểm tra Ngày {lesson.day_number}
              </h2>
              <p className="text-sm text-navy-muted">
                Đánh giá mức độ nắm vững bảng chữ cái, phát âm và từ vựng. Đạt từ{' '}
                <strong className="text-primary-600 font-bold">{lesson.passing_score} điểm trở lên</strong> để hoàn thành và mở khóa ngày tiếp theo!
              </p>
            </div>

            <div className="inline-flex flex-wrap items-center justify-center gap-4 p-4 rounded-2xl bg-sakura-bg border border-pink-100 text-xs font-semibold text-navy-muted">
              <span>📝 Số lượng câu hỏi: {lesson.quiz?.total_questions || 14} câu</span>
              <span>🎯 Điểm đạt yêu cầu: {lesson.passing_score} điểm</span>
              <span>🔒 Chấm điểm bảo mật: Server Backend MySQL</span>
            </div>

            <div>
              <Link
                to={`/quiz/${lesson.day_number}`}
                className="inline-flex items-center gap-3 px-8 py-4 rounded-full text-base font-bold text-white bg-gradient-to-r from-primary-500 to-pink-500 hover:from-primary-600 hover:to-pink-600 shadow-sakura-lg hover:shadow-xl hover:scale-102 transition-all"
              >
                <span>Bắt đầu làm bài kiểm tra</span>
                <ChevronRight className="w-5 h-5" />
              </Link>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
