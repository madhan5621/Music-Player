import Song from '../models/Song.js';
import { extractDriveFileId, validateDriveLink, generateStreamUrl } from '../utils/driveUtils.js';

export const getSongs = async (req, res) => {
  try {
    const { page = 1, limit = 50, sort = '-createdAt', artist, album, genre, search } = req.query;
    
    const filter = { addedBy: req.user._id };
    if (artist) filter.artist = new RegExp(artist, 'i');
    if (album) filter.album = new RegExp(album, 'i');
    if (genre) filter.genre = new RegExp(genre, 'i');
    if (search) {
      filter.$or = [
        { title: new RegExp(search, 'i') },
        { artist: new RegExp(search, 'i') },
        { album: new RegExp(search, 'i') }
      ];
    }

    const songs = await Song.find(filter)
      .sort(sort)
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit));

    const total = await Song.countDocuments(filter);

    res.json({
      songs,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit))
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const getSong = async (req, res) => {
  try {
    const song = await Song.findOne({ _id: req.params.id, addedBy: req.user._id });
    if (!song) return res.status(404).json({ message: 'Song not found' });
    res.json({ song });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const addSong = async (req, res) => {
  try {
    const { title, artist, album, genre, duration, coverImage, driveLink } = req.body;
    
    const driveFileId = extractDriveFileId(driveLink);
    if (!driveFileId) {
      return res.status(400).json({ message: 'Invalid Google Drive link' });
    }

    const streamUrl = generateStreamUrl(driveFileId);

    const song = await Song.create({
      title,
      artist,
      album: album || 'Unknown Album',
      genre: genre || 'Unknown',
      duration: duration || 0,
      coverImage: coverImage || '',
      driveFileId,
      streamUrl,
      driveLink,
      addedBy: req.user._id
    });

    res.status(201).json({ song });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const bulkAddSongs = async (req, res) => {
  try {
    const { songs } = req.body;
    
    if (!Array.isArray(songs) || songs.length === 0) {
      return res.status(400).json({ message: 'Songs array is required' });
    }

    const processedSongs = songs.map(song => {
      const driveFileId = extractDriveFileId(song.driveLink);
      if (!driveFileId) throw new Error(`Invalid Drive link for "${song.title}"`);
      
      return {
        title: song.title,
        artist: song.artist,
        album: song.album || 'Unknown Album',
        genre: song.genre || 'Unknown',
        duration: song.duration || 0,
        coverImage: song.coverImage || '',
        driveFileId,
        streamUrl: generateStreamUrl(driveFileId),
        driveLink: song.driveLink,
        addedBy: req.user._id
      };
    });

    const createdSongs = await Song.insertMany(processedSongs);
    res.status(201).json({ songs: createdSongs, count: createdSongs.length });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const updateSong = async (req, res) => {
  try {
    const { title, artist, album, genre, duration, coverImage, driveLink } = req.body;
    const updates = {};
    
    if (title) updates.title = title;
    if (artist) updates.artist = artist;
    if (album) updates.album = album;
    if (genre) updates.genre = genre;
    if (duration !== undefined) updates.duration = duration;
    if (coverImage !== undefined) updates.coverImage = coverImage;
    
    if (driveLink) {
      const driveFileId = extractDriveFileId(driveLink);
      if (!driveFileId) return res.status(400).json({ message: 'Invalid Google Drive link' });
      updates.driveFileId = driveFileId;
      updates.streamUrl = generateStreamUrl(driveFileId);
      updates.driveLink = driveLink;
    }

    const song = await Song.findOneAndUpdate(
      { _id: req.params.id, addedBy: req.user._id },
      updates,
      { new: true }
    );
    
    if (!song) return res.status(404).json({ message: 'Song not found' });
    res.json({ song });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const deleteSong = async (req, res) => {
  try {
    const song = await Song.findOneAndDelete({ _id: req.params.id, addedBy: req.user._id });
    if (!song) return res.status(404).json({ message: 'Song not found' });
    res.json({ message: 'Song deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const getArtists = async (req, res) => {
  try {
    const artists = await Song.aggregate([
      { $match: { addedBy: req.user._id } },
      { $group: { _id: '$artist', songCount: { $sum: 1 }, coverImage: { $first: '$coverImage' } } },
      { $sort: { songCount: -1 } }
    ]);
    res.json({ artists });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const getAlbums = async (req, res) => {
  try {
    const albums = await Song.aggregate([
      { $match: { addedBy: req.user._id } },
      { $group: { 
        _id: '$album', 
        artist: { $first: '$artist' }, 
        songCount: { $sum: 1 }, 
        coverImage: { $first: '$coverImage' } 
      }},
      { $sort: { _id: 1 } }
    ]);
    res.json({ albums });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const getGenres = async (req, res) => {
  try {
    const genres = await Song.aggregate([
      { $match: { addedBy: req.user._id } },
      { $group: { _id: '$genre', songCount: { $sum: 1 } } },
      { $sort: { songCount: -1 } }
    ]);
    res.json({ genres });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
