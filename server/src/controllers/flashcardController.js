import { flashcardRepository } from '../repositories/flashcardRepository.js';
import { successResponse } from '../utils/response.js';

export const flashcardController = {
  async getFlashcards(req, res, next) {
    try {
      const userId = req.user?.id || null;
      const day = req.query.day ? parseInt(req.query.day, 10) : null;
      const status = req.query.status || 'all';

      const flashcards = await flashcardRepository.getFlashcards(userId, { day, status });
      return successResponse(res, flashcards);
    } catch (err) {
      next(err);
    }
  },

  async updateProgress(req, res, next) {
    try {
      const userId = req.user.id;
      const vocabularyId = parseInt(req.params.vocabularyId, 10);
      const { status } = req.body; // 'remembered' or 'need_review'

      const result = await flashcardRepository.updateVocabularyProgress(userId, vocabularyId, status);
      return successResponse(res, result, 'Đã cập nhật trạng thái flashcard');
    } catch (err) {
      next(err);
    }
  },
};
