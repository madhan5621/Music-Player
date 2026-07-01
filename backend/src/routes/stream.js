import { Router } from 'express';
import { streamAudio } from '../controllers/streamController.js';
import { streamLimiter } from '../middleware/rateLimiter.js';

const router = Router();

// Stream endpoint doesn't require auth for simplicity (fileId is unguessable)
// Add auth middleware here if you want to protect streaming
router.get('/:fileId', streamLimiter, streamAudio);

export default router;
