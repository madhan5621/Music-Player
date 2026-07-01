import { Router } from 'express';
import { getPlaylists, getPlaylist, createPlaylist, updatePlaylist, deletePlaylist, addSongToPlaylist, removeSongFromPlaylist } from '../controllers/playlistController.js';
import auth from '../middleware/auth.js';

const router = Router();

router.get('/', auth, getPlaylists);
router.get('/:id', auth, getPlaylist);
router.post('/', auth, createPlaylist);
router.put('/:id', auth, updatePlaylist);
router.delete('/:id', auth, deletePlaylist);
router.post('/:id/songs', auth, addSongToPlaylist);
router.delete('/:id/songs', auth, removeSongFromPlaylist);

export default router;
