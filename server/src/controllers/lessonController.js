import { lessonRepository } from '../repositories/lessonRepository.js';
import { successResponse, errorResponse } from '../utils/response.js';

export const lessonController = {
  async getAllLessons(req, res, next) {
    try {
      const userId = req.user?.id || null;
      const lessons = await lessonRepository.getAllLessons(userId);
      return successResponse(res, lessons);
    } catch (err) {
      next(err);
    }
  },

  async getLessonByDay(req, res, next) {
    try {
      const day = parseInt(req.params.day, 10);
      if (isNaN(day)) {
        return errorResponse(res, 'Số ngày không hợp lệ', 400);
      }

      const userId = req.user?.id || null;
      const lesson = await lessonRepository.getLessonByDay(day, userId);

      if (!lesson) {
        if (day > 5 && day <= 90) {
          return errorResponse(res, `Bài học Ngày ${day} đang được biên soạn (Sắp ra mắt)!`, 404, { isComingSoon: true, day });
        }
        return errorResponse(res, `Không tìm thấy bài học Ngày ${day}`, 404);
      }

      return successResponse(res, lesson);
    } catch (err) {
      next(err);
    }
  },

  async getLessonById(req, res, next) {
    try {
      const { id } = req.params;
      const userId = req.user?.id || null;
      const lesson = await lessonRepository.getLessonById(id, userId);

      if (!lesson) {
        return errorResponse(res, 'Không tìm thấy bài học', 404);
      }

      return successResponse(res, lesson);
    } catch (err) {
      next(err);
    }
  },

  async getLessonVocabulary(req, res, next) {
    try {
      const { id } = req.params;
      const userId = req.user?.id || null;
      const vocab = await lessonRepository.getVocabularyByLesson(id, userId);
      return successResponse(res, vocab);
    } catch (err) {
      next(err);
    }
  },

  async getLessonConversations(req, res, next) {
    try {
      const { id } = req.params;
      const convos = await lessonRepository.getConversationsByLesson(id);
      return successResponse(res, convos);
    } catch (err) {
      next(err);
    }
  },
};
