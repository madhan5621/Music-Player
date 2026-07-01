import Favorite from '../models/Favorite.js';

export const getFavorites = async (req, res) => {
  try {
    const favorites = await Favorite.find({ user: req.user._id })
      .populate('song', 'title artist album coverImage duration driveFileId genre')
      .sort('-createdAt');
    
    const songs = favorites.map(f => ({ ...f.song.toObject(), favoriteId: f._id }));
    res.json({ favorites: songs });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const toggleFavorite = async (req, res) => {
  try {
    const { songId } = req.params;
    const existing = await Favorite.findOne({ user: req.user._id, song: songId });
    
    if (existing) {
      await Favorite.deleteOne({ _id: existing._id });
      res.json({ isFavorite: false, message: 'Removed from favorites' });
    } else {
      await Favorite.create({ user: req.user._id, song: songId });
      res.json({ isFavorite: true, message: 'Added to favorites' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const checkFavorites = async (req, res) => {
  try {
    const { songIds } = req.body;
    const favorites = await Favorite.find({ 
      user: req.user._id, 
      song: { $in: songIds } 
    });
    const favoriteMap = {};
    favorites.forEach(f => { favoriteMap[f.song.toString()] = true; });
    res.json({ favorites: favoriteMap });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
