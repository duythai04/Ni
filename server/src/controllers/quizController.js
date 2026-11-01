import { quizRepository } from '../repositories/quizRepository.js';
import { submitQuizSchema } from '../validators/quizValidator.js';
import { successResponse, errorResponse } from '../utils/response.js';

export const quizController = {
  async getQuizByLessonId(req, res, next) {
    try {
      const { lessonId } = req.params;
      const quiz = await quizRepository.getStudentQuiz(lessonId);
      if (!quiz) {
        return errorResponse(res, 'Không tìm thấy bài kiểm tra cho bài học này', 404);
      }
      return successResponse(res, quiz);
    } catch (err) {
      next(err);
    }
  },

  async submitQuiz(req, res, next) {
    try {
      const { quizId } = req.params;
      const userId = req.user.id;
      const validated = submitQuizSchema.parse(req.body);

      const result = await quizRepository.evaluateAndSubmit(userId, quizId, validated.answers);
      return successResponse(
        res,
        result,
        result.isPassed
          ? `Chúc mừng! Bạn đã vượt qua bài kiểm tra với ${result.score}/${result.totalQuestions} điểm!`
          : `Rất tiếc! Bạn đạt ${result.score}/${result.totalQuestions} điểm. Điểm cần đạt là ${result.passingScore}. Hãy ôn tập và thử lại nhé!`
      );
    } catch (err) {
      next(err);
    }
  },

  async getQuizHistory(req, res, next) {
    try {
      const { quizId } = req.params;
      const userId = req.user.id;
      const history = await quizRepository.getQuizHistory(userId, quizId);
      return successResponse(res, history);
    } catch (err) {
      next(err);
    }
  },
};
