import { Router } from 'express';
import { lessonController } from '../controllers/lessonController.js';
import { optionalAuth } from '../middleware/authMiddleware.js';

const router = Router();

router.get('/', optionalAuth, lessonController.getAllLessons);
router.get('/day/:day', optionalAuth, lessonController.getLessonByDay);
router.get('/:id', optionalAuth, lessonController.getLessonById);
router.get('/:id/vocabulary', optionalAuth, lessonController.getLessonVocabulary);
router.get('/:id/conversations', lessonController.getLessonConversations);

export default router;
