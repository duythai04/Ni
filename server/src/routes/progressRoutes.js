import { Router } from 'express';
import { progressController } from '../controllers/progressController.js';
import { authenticate } from '../middleware/authMiddleware.js';

const router = Router();

router.get('/dashboard', authenticate, progressController.getDashboard);
router.get('/lessons', authenticate, progressController.getUserLessonProgress);
router.put('/lessons/:lessonId', authenticate, progressController.updateLessonProgress);
router.put('/sections/:sectionId', authenticate, progressController.updateSectionProgress);
router.get('/statistics', authenticate, progressController.getStatistics);

export default router;
