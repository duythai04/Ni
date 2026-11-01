import { courseRepository } from '../repositories/courseRepository.js';
import { successResponse, errorResponse } from '../utils/response.js';

export const courseController = {
  async getAllCourses(req, res, next) {
    try {
      const courses = await courseRepository.getAllCourses();
      return successResponse(res, courses);
    } catch (err) {
      next(err);
    }
  },

  async getCourseById(req, res, next) {
    try {
      const { id } = req.params;
      const course = await courseRepository.getCourseById(id);
      if (!course) {
        return errorResponse(res, 'Không tìm thấy khóa học', 404);
      }
      return successResponse(res, course);
    } catch (err) {
      next(err);
    }
  },

  async getCourseRoadmap(req, res, next) {
    try {
      const { id } = req.params;
      const userId = req.user?.id || null;
      const roadmap = await courseRepository.getRoadmap(id, userId);
      if (!roadmap) {
        return errorResponse(res, 'Không tìm thấy khóa học', 404);
      }
      return successResponse(res, roadmap);
    } catch (err) {
      next(err);
    }
  },
};
