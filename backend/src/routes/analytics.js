import { Router } from 'express';
import { logListening, getRecentlyPlayed, getAnalytics, getRecommendations } from '../controllers/analyticsController.js';
import auth from '../middleware/auth.js';

const router = Router();

router.post('/history', auth, logListening);
router.get('/recent', auth, getRecentlyPlayed);
router.get('/stats', auth, getAnalytics);
router.get('/recommendations', auth, getRecommendations);

export default router;
