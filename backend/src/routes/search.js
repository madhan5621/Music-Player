import { Router } from 'express';
import { search } from '../controllers/searchController.js';
import auth from '../middleware/auth.js';

const router = Router();

router.get('/', auth, search);

export default router;
