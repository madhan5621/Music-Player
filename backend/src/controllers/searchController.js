import Song from '../models/Song.js';
import Playlist from '../models/Playlist.js';

export const search = async (req, res) => {
  try {
    const { q, type = 'all' } = req.query;
    
    if (!q || q.trim().length === 0) {
      return res.json({ songs: [], artists: [], albums: [], playlists: [] });
    }

    const searchRegex = new RegExp(q, 'i');
    const userId = req.user._id;
    const results = {};

    if (type === 'all' || type === 'songs') {
      results.songs = await Song.find({
        addedBy: userId,
        $or: [
          { title: searchRegex },
          { artist: searchRegex },
          { album: searchRegex }
        ]
      }).limit(20);
    }

    if (type === 'all' || type === 'artists') {
      const artistAgg = await Song.aggregate([
        { $match: { addedBy: userId, artist: searchRegex } },
        { $group: { _id: '$artist', songCount: { $sum: 1 }, coverImage: { $first: '$coverImage' } } },
        { $limit: 10 }
      ]);
      results.artists = artistAgg;
    }

    if (type === 'all' || type === 'albums') {
      const albumAgg = await Song.aggregate([
        { $match: { addedBy: userId, album: searchRegex } },
        { $group: { 
          _id: '$album', 
          artist: { $first: '$artist' }, 
          songCount: { $sum: 1 }, 
          coverImage: { $first: '$coverImage' } 
        }},
        { $limit: 10 }
      ]);
      results.albums = albumAgg;
    }

    if (type === 'all' || type === 'playlists') {
      results.playlists = await Playlist.find({
        owner: userId,
        name: searchRegex
      }).limit(10);
    }

    res.json(results);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
