import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Volume2,
  ChevronLeft,
  ChevronRight,
  Check,
  X,
  RotateCw,
  Sparkles,
  ArrowLeft,
  Filter,
} from 'lucide-react';
import apiClient from '../api/client';
import { playJapaneseAudio } from '../utils/audio';
import { useAuthStore } from '../stores/authStore';
import { toast } from 'sonner';

export default function FlashcardsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const dayParam = searchParams.get('day') || '';
  const [selectedDay, setSelectedDay] = useState(dayParam);
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const queryClient = useQueryClient();
  const { isAuthenticated } = useAuthStore();

  const { data: flashcards = [], isLoading } = useQuery({
    queryKey: ['flashcards', selectedDay, selectedStatus],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (selectedDay) params.append('day', selectedDay);
      if (selectedStatus && selectedStatus !== 'all') params.append('status', selectedStatus);

      const res = await apiClient.get(`/flashcards?${params.toString()}`);
      return res.data.data;
    },
  });

  // Reset index when cards change
  useEffect(() => {
    setCurrentIndex(0);
    setIsFlipped(false);
  }, [selectedDay, selectedStatus, flashcards.length]);

  const updateMutation = useMutation({
    mutationFn: async ({ id, status }) => {
      if (!isAuthenticated) return;
      const res = await apiClient.put(`/flashcards/${id}/progress`, { status });
      return res.data.data;
    },
    onSuccess: (data, variables) => {
      toast.success(variables.status === 'remembered' ? 'Đã đánh dấu Đã nhớ! 🌸' : 'Đã thêm vào danh sách Cần ôn tập!');
      queryClient.invalidateQueries({ queryKey: ['flashcards'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      // Advance to next card
      handleNext();
    },
  });

  const currentCard = flashcards[currentIndex];

  const handlePrev = () => {
    setIsFlipped(false);
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : flashcards.length - 1));
  };

  const handleNext = () => {
    setIsFlipped(false);
    setCurrentIndex((prev) => (prev < flashcards.length - 1 ? prev + 1 : 0));
  };

  const handleMark = (status) => {
    if (!currentCard) return;
    updateMutation.mutate({ id: currentCard.id, status });
  };

  // Keyboard shortcut listener (Space to flip, Left/Right arrow to navigate)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.code === 'Space') {
        e.preventDefault();
        setIsFlipped((f) => !f);
      } else if (e.code === 'ArrowLeft') {
        handlePrev();
      } else if (e.code === 'ArrowRight') {
        handleNext();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [flashcards.length]);

  // Cute dynamic illustration mapper for vocab
  const getVocabIllustration = (japanese, meaning) => {
    if (japanese.includes('あめ') || meaning.includes('mưa')) {
      return '/assets/rain-cloud.svg';
    }
    return '/assets/torii-icon.svg';
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
      
      {/* Top Controls: Breadcrumb & Filter Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-xs font-bold text-navy-muted hover:text-primary-600 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Về trang chủ</span>
        </Link>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3">
          <select
            value={selectedDay}
            onChange={(e) => {
              setSelectedDay(e.target.value);
              setSearchParams({ day: e.target.value });
            }}
            className="px-3.5 py-2 rounded-xl text-xs font-bold bg-white border border-pink-200 text-navy-dark focus:outline-none focus:ring-2 focus:ring-primary-300 shadow-xs"
          >
            <option value="">Tất cả các ngày (1-5)</option>
            <option value="1">Ngày 1</option>
            <option value="2">Ngày 2</option>
            <option value="3">Ngày 3</option>
            <option value="4">Ngày 4</option>
            <option value="5">Ngày 5</option>
          </select>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-3.5 py-2 rounded-xl text-xs font-bold bg-white border border-pink-200 text-navy-dark focus:outline-none focus:ring-2 focus:ring-primary-300 shadow-xs"
          >
            <option value="all">Tất cả từ vựng</option>
            <option value="need_review">Chưa nhớ (Cần ôn)</option>
            <option value="remembered">Đã nhớ</option>
          </select>
        </div>
      </div>

      {isLoading ? (
        <div className="text-center py-20 text-navy-muted">Đang tải thẻ Flashcard...</div>
      ) : flashcards.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-pink-100 shadow-sakura space-y-4">
          <div className="text-4xl">🌸</div>
          <h3 className="text-xl font-bold text-navy-dark">Không có thẻ flashcard nào</h3>
          <p className="text-xs text-navy-muted">
            Không tìm thấy từ vựng theo bộ lọc này. Hãy chọn ngày học khác hoặc hiển thị tất cả.
          </p>
          <button
            onClick={() => {
              setSelectedDay('');
              setSelectedStatus('all');
            }}
            className="px-5 py-2.5 rounded-full bg-primary-500 text-white font-bold text-xs"
          >
            Đặt lại bộ lọc
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          
          {/* Header matching screenshot: Title & Counter (1 / 10) */}
          <div className="flex items-center justify-between px-2">
            <h2 className="text-lg font-bold text-navy-dark flex items-center gap-2">
              <span className="text-primary-500">💎</span> Từ vựng {currentCard?.lessonTitle || `Ngày ${currentCard?.dayNumber}`}
            </h2>
            <span className="text-sm font-extrabold text-navy-muted">
              {currentIndex + 1} / {flashcards.length}
            </span>
          </div>

          {/* Flashcard container with side navigation arrows */}
          <div className="relative flex items-center justify-center gap-4">
            
            {/* Prev Arrow */}
            <button
              onClick={handlePrev}
              className="w-12 h-12 rounded-full bg-white border border-pink-200 text-navy-muted hover:text-primary-600 hover:scale-105 shadow-sakura flex items-center justify-center transition-all z-10"
              title="Thẻ trước"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>

            {/* Flashcard Flip Card matching screenshot */}
            <div
              onClick={() => setIsFlipped(!isFlipped)}
              className="w-full max-w-lg h-96 perspective-1000 cursor-pointer"
            >
              <motion.div
                className="w-full h-full relative transform-style-3d transition-transform duration-500"
                animate={{ rotateY: isFlipped ? 180 : 0 }}
                transition={{ duration: 0.5, ease: 'easeInOut' }}
              >
                {/* FRONT FACE (Japanese word + hint + audio) */}
                <div className="absolute inset-0 backface-hidden bg-white rounded-3xl p-8 border border-pink-100 shadow-sakura flex flex-col items-center justify-between text-center select-none">
                  <div className="w-full flex justify-between items-center text-xs text-navy-light font-bold">
                    <span>Mặt trước</span>
                    <span className="px-2.5 py-1 rounded-full bg-pink-50 text-primary-600">
                      Ngày {currentCard.dayNumber}
                    </span>
                  </div>

                  <div className="space-y-4 my-auto">
                    <span className="text-6xl font-extrabold font-jp text-navy-dark tracking-wide">
                      {currentCard.japanese}
                    </span>
                    <p className="text-base font-semibold text-primary-500">
                      {currentCard.romaji}
                    </p>
                  </div>

                  <div className="w-full flex items-center justify-between pt-4 border-t border-pink-50">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        playJapaneseAudio(currentCard.japanese);
                      }}
                      className="w-10 h-10 rounded-full bg-pink-50 text-primary-500 hover:bg-primary-500 hover:text-white flex items-center justify-center transition-colors shadow-xs"
                      title="Phát âm"
                    >
                      <Volume2 className="w-5 h-5" />
                    </button>
                    <span className="text-xs font-semibold text-navy-light flex items-center gap-1">
                      <RotateCw className="w-3.5 h-3.5" /> Nhấn để lật xem nghĩa
                    </span>
                  </div>
                </div>

                {/* BACK FACE (Romaji, Vietnamese Meaning, Cute Illustration, Audio) matching screenshot */}
                <div className="absolute inset-0 backface-hidden rotate-y-180 bg-white rounded-3xl p-8 border border-pink-200 shadow-sakura flex flex-col items-center justify-between text-center select-none">
                  <div className="w-full flex justify-between items-center text-xs text-navy-light font-bold">
                    <span>Mặt sau</span>
                    <span className="text-primary-600">Ý nghĩa</span>
                  </div>

                  <div className="space-y-3 my-auto flex flex-col items-center">
                    <span className="text-5xl font-extrabold font-jp text-navy-dark">
                      {currentCard.japanese}
                    </span>
                    <p className="text-xl font-bold text-primary-600">
                      {currentCard.romaji}
                    </p>
                    <p className="text-2xl font-bold text-navy-dark">
                      {currentCard.meaningVi}
                    </p>

                    {/* Cute Illustration (e.g. raincloud for ame) matching screenshot */}
                    <div className="w-24 h-24 my-2">
                      <img
                        src={getVocabIllustration(currentCard.japanese, currentCard.meaningVi)}
                        alt="Vocabulary Visual"
                        className="w-full h-full object-contain"
                      />
                    </div>
                  </div>

                  <div className="w-full flex items-center justify-between pt-4 border-t border-pink-50">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        playJapaneseAudio(currentCard.japanese);
                      }}
                      className="w-10 h-10 rounded-full bg-pink-50 text-primary-500 hover:bg-primary-500 hover:text-white flex items-center justify-center transition-colors shadow-xs"
                      title="Phát âm"
                    >
                      <Volume2 className="w-5 h-5" />
                    </button>
                    <span className="text-xs font-semibold text-navy-light flex items-center gap-1">
                      <RotateCw className="w-3.5 h-3.5" /> Nhấn để lật lại
                    </span>
                  </div>
                </div>

              </motion.div>
            </div>

            {/* Next Arrow */}
            <button
              onClick={handleNext}
              className="w-12 h-12 rounded-full bg-white border border-pink-200 text-navy-muted hover:text-primary-600 hover:scale-105 shadow-sakura flex items-center justify-center transition-all z-10"
              title="Thẻ tiếp theo"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </div>

          {/* Action Buttons matching screenshot: [❌ Chưa nhớ] and [✔️ Đã nhớ] */}
          <div className="flex items-center justify-center gap-6 pt-4">
            <button
              onClick={() => handleMark('need_review')}
              className="flex-1 max-w-xs py-3.5 px-6 rounded-full border-2 border-red-200 bg-white hover:bg-red-50 text-red-600 font-bold text-sm shadow-sm flex items-center justify-center gap-2 transition-all hover:scale-102 active:scale-98"
            >
              <X className="w-5 h-5 stroke-[2.5]" />
              <span>Chưa nhớ</span>
            </button>

            <button
              onClick={() => handleMark('remembered')}
              className="flex-1 max-w-xs py-3.5 px-6 rounded-full border-2 border-emerald-400 bg-white hover:bg-emerald-50 text-emerald-600 font-bold text-sm shadow-sm flex items-center justify-center gap-2 transition-all hover:scale-102 active:scale-98"
            >
              <Check className="w-5 h-5 stroke-[2.5]" />
              <span>Đã nhớ</span>
            </button>
          </div>

        </div>
      )}

    </div>
  );
}
