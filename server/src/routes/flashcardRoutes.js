import { Router } from 'express';
import { flashcardController } from '../controllers/flashcardController.js';
import { optionalAuth, authenticate } from '../middleware/authMiddleware.js';

const router = Router();

router.get('/', optionalAuth, flashcardController.getFlashcards);
router.put('/:vocabularyId/progress', authenticate, flashcardController.updateProgress);

export default router;
