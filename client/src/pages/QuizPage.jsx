import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import confetti from 'canvas-confetti';
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  XCircle,
  Award,
  RotateCcw,
  Sparkles,
  HelpCircle,
  AlertTriangle,
} from 'lucide-react';
import apiClient from '../api/client';
import { useAuthStore } from '../stores/authStore';
import { toast } from 'sonner';

export default function QuizPage() {
  const { day } = useParams();
  const dayNumber = parseInt(day, 10) || 1;
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { isAuthenticated } = useAuthStore();

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [quizResult, setQuizResult] = useState(null);
  const [showExitConfirm, setShowExitConfirm] = useState(false);

  // Fetch student quiz (questions and options without is_correct)
  const { data: quiz, isLoading, error } = useQuery({
    queryKey: ['studentQuiz', dayNumber],
    queryFn: async () => {
      // First get lesson by day to obtain lesson id
      const lessonRes = await apiClient.get(`/lessons/day/${dayNumber}`);
      const lesson = lessonRes.data.data;
      const quizRes = await apiClient.get(`/quizzes/lesson/${lesson.id}`);
      return quizRes.data.data;
    },
  });

  const submitMutation = useMutation({
    mutationFn: async ({ quizId, answers }) => {
      const res = await apiClient.post(`/quizzes/${quizId}/submit`, { answers });
      return res.data.data;
    },
    onSuccess: (result) => {
      setQuizResult(result);
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['roadmap'] });
      queryClient.invalidateQueries({ queryKey: ['lesson', dayNumber] });

      if (result.isPassed) {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
        });
        toast.success(`Chúc mừng! Bạn đạt ${result.score}/${result.totalQuestions} điểm và mở khóa ngày tiếp theo!`);
      } else {
        toast.error(`Bạn đạt ${result.score}/${result.totalQuestions} điểm. Điểm cần đạt là ${result.passingScore}. Hãy thử lại!`);
      }
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Có lỗi xảy ra khi nộp bài.');
    },
  });

  if (isLoading) {
    return <div className="max-w-3xl mx-auto py-20 text-center text-navy-muted">Đang tải đề thi...</div>;
  }

  if (error || !quiz) {
    return (
      <div className="max-w-xl mx-auto py-20 text-center space-y-4">
        <h2 className="text-2xl font-bold text-navy-dark">Không tìm thấy bài kiểm tra</h2>
        <p className="text-sm text-navy-muted">Bài kiểm tra cho ngày này chưa khả dụng.</p>
        <Link to={`/learn/${dayNumber}`} className="px-6 py-2.5 rounded-full bg-primary-500 text-white font-bold text-sm">
          Quay lại bài học
        </Link>
      </div>
    );
  }

  const questions = quiz.questions || [];
  const currentQuestion = questions[currentQuestionIndex];
  const totalQuestions = questions.length;
  const progressPercent = Math.round(((currentQuestionIndex + 1) / totalQuestions) * 100);

  const handleSelectOption = (optionIdOrText) => {
    setSelectedAnswers({
      ...selectedAnswers,
      [currentQuestion.id]: optionIdOrText,
    });
  };

  const handleNext = () => {
    if (currentQuestionIndex < totalQuestions - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex((prev) => prev - 1);
    }
  };

  const handleSubmit = () => {
    if (!isAuthenticated) {
      toast.error('Vui lòng đăng nhập để lưu kết quả và mở khóa bài học tiếp theo!');
      navigate('/login');
      return;
    }

    submitMutation.mutate({
      quizId: quiz.id,
      answers: selectedAnswers,
    });
  };

  const handleRetry = () => {
    setQuizResult(null);
    setSelectedAnswers({});
    setCurrentQuestionIndex(0);
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
      
      {/* RESULT VIEW AFTER SUBMISSION */}
      {quizResult ? (
        <div className="bg-white rounded-3xl p-6 sm:p-10 border border-pink-100 shadow-sakura space-y-8 animate-in fade-in duration-300">
          
          {/* Header Banner */}
          <div className="text-center space-y-3">
            <div
              className={`w-20 h-20 rounded-full mx-auto flex items-center justify-center text-4xl shadow-sakura ${
                quizResult.isPassed ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-600'
              }`}
            >
              {quizResult.isPassed ? '🎉' : '📖'}
            </div>

            <h1 className="text-3xl font-extrabold text-navy-dark">
              {quizResult.isPassed ? 'Chúc mừng bạn đã vượt qua!' : 'Cố gắng lên nhé!'}
            </h1>
            <p className="text-sm text-navy-muted">
              {quizResult.isPassed
                ? `Bạn đã xuất sắc vượt qua bài kiểm tra Ngày ${dayNumber} với điểm số đạt chuẩn JLPT N5.`
                : `Điểm của bạn chưa đạt mức yêu cầu (${quizResult.passingScore} điểm). Hãy ôn lại từ vựng và thử lại!`}
            </p>

            <div className="inline-flex items-center gap-6 p-4 rounded-2xl bg-sakura-bg border border-pink-100 text-center">
              <div>
                <p className="text-xs text-navy-light font-bold">Điểm số</p>
                <p className="text-2xl font-extrabold text-navy-dark">
                  {quizResult.score} / {quizResult.totalQuestions}
                </p>
              </div>
              <div className="h-8 w-px bg-pink-200"></div>
              <div>
                <p className="text-xs text-navy-light font-bold">Tỷ lệ chính xác</p>
                <p className="text-2xl font-extrabold text-primary-600">
                  {quizResult.percentage}%
                </p>
              </div>
              <div className="h-8 w-px bg-pink-200"></div>
              <div>
                <p className="text-xs text-navy-light font-bold">Kết quả</p>
                <p className={`text-base font-extrabold ${quizResult.isPassed ? 'text-emerald-600' : 'text-red-500'}`}>
                  {quizResult.isPassed ? 'ĐẠT ✓' : 'CHƯA ĐẠT ✕'}
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
            <button
              onClick={handleRetry}
              className="w-full sm:w-auto px-6 py-3.5 rounded-full border-2 border-primary-300 text-primary-600 font-bold text-sm hover:bg-pink-50 flex items-center justify-center gap-2 transition-colors"
            >
              <RotateCcw className="w-4 h-4" /> Làm lại bài kiểm tra
            </button>

            {quizResult.isPassed && quizResult.nextLessonUnlocked && (
              <Link
                to={`/learn/${quizResult.nextLessonUnlocked.day_number}`}
                className="w-full sm:w-auto px-8 py-3.5 rounded-full bg-primary-500 hover:bg-primary-600 text-white font-bold text-sm shadow-sakura flex items-center justify-center gap-2 transition-all hover:scale-102"
              >
                <span>Học tiếp Ngày {quizResult.nextLessonUnlocked.day_number}</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            )}
          </div>

          {/* Detailed Question Review with Explanations */}
          <div className="space-y-4 pt-6 border-t border-pink-100">
            <h3 className="text-lg font-bold text-navy-dark">Xem lại đáp án và giải thích chi tiết</h3>
            
            <div className="space-y-4">
              {quizResult.questions.map((q, idx) => (
                <div
                  key={q.id}
                  className={`p-5 rounded-2xl border ${
                    q.isCorrect ? 'bg-emerald-50/50 border-emerald-200' : 'bg-red-50/50 border-red-200'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <p className="text-xs font-bold text-navy-muted">Câu {idx + 1}</p>
                      <p className="text-base font-bold text-navy-dark">{q.prompt}</p>
                    </div>
                    {q.isCorrect ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                    ) : (
                      <XCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                    )}
                  </div>

                  <div className="mt-3 text-xs space-y-1">
                    <p>
                      <span className="font-bold">Bạn đã chọn:</span>{' '}
                      <span className={q.isCorrect ? 'text-emerald-700 font-bold' : 'text-red-600 font-bold'}>
                        {q.userAnswer || '(Bỏ trống)'}
                      </span>
                    </p>
                    {!q.isCorrect && (
                      <p>
                        <span className="font-bold text-emerald-700">Đáp án đúng:</span>{' '}
                        <strong className="text-emerald-700">{q.correctAnswer}</strong>
                      </p>
                    )}
                    {q.explanation && (
                      <p className="text-navy-light pt-1 italic">
                        💡 Giải thích: {q.explanation}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      ) : (
        /* QUIZ TAKING VIEW matching screenshot */
        <div className="space-y-6">
          
          {/* Header matching screenshot: Title & Counter (Câu 3 / 10) */}
          <div className="bg-white rounded-3xl p-6 border border-pink-100 shadow-sakura space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setShowExitConfirm(true)}
                  className="p-1 text-navy-muted hover:text-navy-dark"
                  title="Thoát kiểm tra"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <div className="flex items-center gap-2">
                  <span className="text-xl">📝</span>
                  <h1 className="text-lg font-bold text-navy-dark">
                    Bài kiểm tra ngày {dayNumber}
                  </h1>
                </div>
              </div>

              {/* Counter matching screenshot */}
              <span className="text-sm font-extrabold text-navy-muted">
                Câu {currentQuestionIndex + 1} / {totalQuestions}
              </span>
            </div>

            {/* Progress bar */}
            <div className="w-full bg-pink-100 h-2.5 rounded-full overflow-hidden">
              <div
                className="bg-primary-500 h-full rounded-full transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              ></div>
            </div>
          </div>

          {/* Question Card matching screenshot */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-pink-100 shadow-sakura space-y-6">
            
            <h2 className="text-xl sm:text-2xl font-extrabold text-navy-dark tracking-tight">
              {currentQuestion.prompt}
            </h2>

            {/* 4 Radio Options matching screenshot */}
            <div className="space-y-3">
              {currentQuestion.options.map((opt) => {
                const isSelected = selectedAnswers[currentQuestion.id] === opt.text || selectedAnswers[currentQuestion.id] === opt.id;
                return (
                  <button
                    key={opt.id}
                    onClick={() => handleSelectOption(opt.text)}
                    className={`w-full p-4 rounded-2xl border text-left flex items-center gap-4 transition-all duration-150 cursor-pointer ${
                      isSelected
                        ? 'border-2 border-emerald-400 bg-emerald-50/40 text-emerald-950 shadow-xs'
                        : 'border-pink-100 bg-white hover:bg-sakura-bg/80 text-navy-dark hover:border-pink-200'
                    }`}
                  >
                    {/* Custom Radio Circle matching screenshot's green selected checkmark */}
                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center transition-all ${
                        isSelected
                          ? 'bg-emerald-500 text-white'
                          : 'border-2 border-navy-light/40 bg-white'
                      }`}
                    >
                      {isSelected && <CheckCircle2 className="w-4 h-4 fill-emerald-500 text-white" />}
                    </div>

                    <span className="text-base font-bold font-jp">
                      {opt.text}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Bottom Actions: Previous / Next matching screenshot */}
            <div className="flex items-center justify-between pt-4 border-t border-pink-100">
              <button
                onClick={handlePrev}
                disabled={currentQuestionIndex === 0}
                className="px-5 py-2.5 rounded-full text-xs font-bold text-navy-muted hover:text-navy-dark disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                &larr; Câu trước
              </button>

              {currentQuestionIndex < totalQuestions - 1 ? (
                <button
                  onClick={handleNext}
                  className="px-8 py-3 rounded-full bg-gradient-to-r from-primary-500 to-pink-500 hover:from-primary-600 hover:to-pink-600 text-white font-bold text-sm shadow-sakura flex items-center gap-2 transition-all hover:scale-102"
                >
                  <span>Tiếp theo</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  onClick={handleSubmit}
                  disabled={submitMutation.isPending}
                  className="px-8 py-3 rounded-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-sm shadow-sakura flex items-center gap-2 transition-all hover:scale-102"
                >
                  <span>{submitMutation.isPending ? 'Đang chấm điểm...' : 'Nộp bài kiểm tra'}</span>
                  <CheckCircle2 className="w-4 h-4" />
                </button>
              )}
            </div>

          </div>

        </div>
      )}

      {/* Confirmation modal when leaving before submission */}
      {showExitConfirm && (
        <div className="fixed inset-0 z-50 bg-navy-dark/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-sm w-full shadow-sakura-lg border border-pink-100 space-y-4 text-center">
            <div className="w-12 h-12 rounded-full bg-amber-100 text-amber-600 mx-auto flex items-center justify-center">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-navy-dark">Rời khỏi bài kiểm tra?</h3>
            <p className="text-xs text-navy-muted leading-relaxed">
              Các câu trả lời của bạn chưa được nộp. Bạn có chắc muốn rời đi và quay lại sau không?
            </p>
            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={() => setShowExitConfirm(false)}
                className="flex-1 py-2.5 rounded-full border border-pink-200 text-xs font-bold text-navy-muted hover:bg-pink-50"
              >
                Tiếp tục làm
              </button>
              <button
                onClick={() => navigate(`/learn/${dayNumber}`)}
                className="flex-1 py-2.5 rounded-full bg-red-500 hover:bg-red-600 text-xs font-bold text-white"
              >
                Rời đi
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
