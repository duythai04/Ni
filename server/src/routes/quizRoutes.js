import { Router } from 'express';
import { quizController } from '../controllers/quizController.js';
import { authenticate } from '../middleware/authMiddleware.js';

const router = Router();

router.get('/lesson/:lessonId', quizController.getQuizByLessonId);
router.post('/:quizId/submit', authenticate, quizController.submitQuiz);
router.get('/:quizId/history', authenticate, quizController.getQuizHistory);

export default router;
