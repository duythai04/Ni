import { progressRepository } from '../repositories/progressRepository.js';
import { successResponse } from '../utils/response.js';

export const progressController = {
  async getDashboard(req, res, next) {
    try {
      const userId = req.user.id;
      const dashboard = await progressRepository.getDashboard(userId);
      return successResponse(res, dashboard);
    } catch (err) {
      next(err);
    }
  },

  async getUserLessonProgress(req, res, next) {
    try {
      const userId = req.user.id;
      const progress = await progressRepository.getUserLessonProgress(userId);
      return successResponse(res, progress);
    } catch (err) {
      next(err);
    }
  },

  async updateLessonProgress(req, res, next) {
    try {
      const { lessonId } = req.params;
      const { status, progressPercent } = req.body;
      const userId = req.user.id;

      await progressRepository.updateLessonProgress(userId, lessonId, status, progressPercent);
      return successResponse(res, { lessonId, status, progressPercent }, 'Cập nhật tiến độ bài học thành công');
    } catch (err) {
      next(err);
    }
  },

  async updateSectionProgress(req, res, next) {
    try {
      const { sectionId } = req.params;
      const { lessonId, isCompleted } = req.body;
      const userId = req.user.id;

      const result = await progressRepository.updateSectionProgress(
        userId,
        lessonId,
        sectionId,
        isCompleted !== undefined ? Boolean(isCompleted) : true
      );
      return successResponse(res, result, 'Cập nhật tiến độ phần học thành công');
    } catch (err) {
      next(err);
    }
  },

  async getStatistics(req, res, next) {
    try {
      const userId = req.user.id;
      const stats = await progressRepository.getStatistics(userId);
      return successResponse(res, stats);
    } catch (err) {
      next(err);
    }
  },
};
