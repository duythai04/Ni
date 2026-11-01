import { Router } from 'express';
import { courseController } from '../controllers/courseController.js';
import { optionalAuth } from '../middleware/authMiddleware.js';

const router = Router();

router.get('/', courseController.getAllCourses);
router.get('/:id', courseController.getCourseById);
router.get('/:id/roadmap', optionalAuth, courseController.getCourseRoadmap);

export default router;
