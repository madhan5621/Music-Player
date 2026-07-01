import { Router } from 'express';
import { getSongs, getSong, addSong, bulkAddSongs, updateSong, deleteSong, getArtists, getAlbums, getGenres } from '../controllers/songController.js';
import auth from '../middleware/auth.js';

const router = Router();

router.get('/', auth, getSongs);
router.get('/artists', auth, getArtists);
router.get('/albums', auth, getAlbums);
router.get('/genres', auth, getGenres);
router.get('/:id', auth, getSong);
router.post('/', auth, addSong);
router.post('/bulk', auth, bulkAddSongs);
router.put('/:id', auth, updateSong);
router.delete('/:id', auth, deleteSong);

export default router;
