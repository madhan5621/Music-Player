import ListeningHistory from '../models/ListeningHistory.js';
import Song from '../models/Song.js';
import Favorite from '../models/Favorite.js';

export const logListening = async (req, res) => {
  try {
    const { songId, listenDuration, completedPercentage } = req.body;
    
    await ListeningHistory.create({
      user: req.user._id,
      song: songId,
      listenDuration: listenDuration || 0,
      completedPercentage: completedPercentage || 0
    });

    await Song.findByIdAndUpdate(songId, { $inc: { playCount: 1 } });

    res.status(201).json({ message: 'Listening logged' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const getRecentlyPlayed = async (req, res) => {
  try {
    const limit = Number(req.query.limit) || 20;
    
    const history = await ListeningHistory.aggregate([
      { $match: { user: req.user._id } },
      { $sort: { playedAt: -1 } },
      { $group: { _id: '$song', lastPlayed: { $first: '$playedAt' }, completedPct: { $first: '$completedPercentage' } } },
      { $sort: { lastPlayed: -1 } },
      { $limit: limit },
      { $lookup: { from: 'songs', localField: '_id', foreignField: '_id', as: 'song' } },
      { $unwind: '$song' },
      { $project: {
        _id: '$song._id',
        title: '$song.title',
        artist: '$song.artist',
        album: '$song.album',
        coverImage: '$song.coverImage',
        duration: '$song.duration',
        driveFileId: '$song.driveFileId',
        lastPlayed: 1,
        completedPercentage: '$completedPct'
      }}
    ]);

    res.json({ songs: history });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const getAnalytics = async (req, res) => {
  try {
    const userId = req.user._id;
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekStart = new Date(todayStart);
    weekStart.setDate(weekStart.getDate() - 7);
    const monthStart = new Date(todayStart);
    monthStart.setDate(monthStart.getDate() - 30);

    const [
      totalSongs,
      totalListeningSeconds,
      songsPlayedToday,
      mostPlayedSong,
      favoriteArtist,
      favoriteGenre,
      dailyActivity,
      genreDistribution,
      artistDistribution,
      weeklyActivity
    ] = await Promise.all([
      Song.countDocuments({ addedBy: userId }),
      ListeningHistory.aggregate([
        { $match: { user: userId } },
        { $group: { _id: null, total: { $sum: '$listenDuration' } } }
      ]),
      ListeningHistory.countDocuments({ user: userId, playedAt: { $gte: todayStart } }),
      Song.findOne({ addedBy: userId }).sort('-playCount').select('title artist coverImage playCount'),
      Song.aggregate([
        { $match: { addedBy: userId } },
        { $group: { _id: '$artist', totalPlays: { $sum: '$playCount' } } },
        { $sort: { totalPlays: -1 } },
        { $limit: 1 }
      ]),
      Song.aggregate([
        { $match: { addedBy: userId } },
        { $group: { _id: '$genre', totalPlays: { $sum: '$playCount' } } },
        { $sort: { totalPlays: -1 } },
        { $limit: 1 }
      ]),
      ListeningHistory.aggregate([
        { $match: { user: userId, playedAt: { $gte: weekStart } } },
        { $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$playedAt' } },
          count: { $sum: 1 },
          duration: { $sum: '$listenDuration' }
        }},
        { $sort: { _id: 1 } }
      ]),
      Song.aggregate([
        { $match: { addedBy: userId, playCount: { $gt: 0 } } },
        { $group: { _id: '$genre', count: { $sum: '$playCount' } } },
        { $sort: { count: -1 } },
        { $limit: 8 }
      ]),
      Song.aggregate([
        { $match: { addedBy: userId, playCount: { $gt: 0 } } },
        { $group: { _id: '$artist', count: { $sum: '$playCount' } } },
        { $sort: { count: -1 } },
        { $limit: 10 }
      ]),
      ListeningHistory.aggregate([
        { $match: { user: userId, playedAt: { $gte: monthStart } } },
        { $group: {
          _id: { $isoWeek: '$playedAt' },
          count: { $sum: 1 },
          duration: { $sum: '$listenDuration' }
        }},
        { $sort: { _id: 1 } }
      ])
    ]);

    const totalHours = totalListeningSeconds[0] 
      ? Math.round((totalListeningSeconds[0].total / 3600) * 10) / 10 
      : 0;

    res.json({
      totalSongs,
      totalListeningHours: totalHours,
      songsPlayedToday,
      mostPlayedSong: mostPlayedSong || null,
      favoriteArtist: favoriteArtist[0]?._id || 'N/A',
      favoriteGenre: favoriteGenre[0]?._id || 'N/A',
      dailyActivity,
      weeklyActivity,
      genreDistribution,
      artistDistribution
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const getRecommendations = async (req, res) => {
  try {
    const userId = req.user._id;
    
    // Get user's top artists and genres from listening history
    const [topArtists, topGenres, recentSongIds] = await Promise.all([
      Song.aggregate([
        { $match: { addedBy: userId, playCount: { $gt: 0 } } },
        { $group: { _id: '$artist', plays: { $sum: '$playCount' } } },
        { $sort: { plays: -1 } },
        { $limit: 5 }
      ]),
      Song.aggregate([
        { $match: { addedBy: userId, playCount: { $gt: 0 } } },
        { $group: { _id: '$genre', plays: { $sum: '$playCount' } } },
        { $sort: { plays: -1 } },
        { $limit: 3 }
      ]),
      ListeningHistory.distinct('song', { user: userId })
    ]);

    const artistNames = topArtists.map(a => a._id);
    const genreNames = topGenres.map(g => g._id);

    // Find songs matching user preferences that haven't been heavily played
    const recommendations = await Song.find({
      addedBy: userId,
      $or: [
        { artist: { $in: artistNames } },
        { genre: { $in: genreNames } }
      ]
    })
    .sort({ playCount: 1, createdAt: -1 })
    .limit(20);

    // If not enough recommendations, fill with random songs
    if (recommendations.length < 10) {
      const additionalSongs = await Song.find({
        addedBy: userId,
        _id: { $nin: recommendations.map(s => s._id) }
      })
      .sort({ createdAt: -1 })
      .limit(10 - recommendations.length);
      
      recommendations.push(...additionalSongs);
    }

    res.json({ recommendations });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
