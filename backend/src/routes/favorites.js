import { Router } from 'express';
import { getFavorites, toggleFavorite, checkFavorites } from '../controllers/favoriteController.js';
import auth from '../middleware/auth.js';

const router = Router();

router.get('/', auth, getFavorites);
router.post('/check', auth, checkFavorites);
router.post('/:songId', auth, toggleFavorite);

export default router;
