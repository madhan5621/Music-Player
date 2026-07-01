import Playlist from '../models/Playlist.js';

export const getPlaylists = async (req, res) => {
  try {
    const playlists = await Playlist.find({ owner: req.user._id })
      .populate('songs', 'title artist album coverImage duration driveFileId')
      .sort('-updatedAt');
    res.json({ playlists });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const getPlaylist = async (req, res) => {
  try {
    const playlist = await Playlist.findOne({ _id: req.params.id, owner: req.user._id })
      .populate('songs', 'title artist album coverImage duration driveFileId genre playCount');
    if (!playlist) return res.status(404).json({ message: 'Playlist not found' });
    res.json({ playlist });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const createPlaylist = async (req, res) => {
  try {
    const { name, description, coverImage, songs } = req.body;
    const playlist = await Playlist.create({
      name,
      description,
      coverImage,
      songs: songs || [],
      owner: req.user._id
    });
    res.status(201).json({ playlist });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const updatePlaylist = async (req, res) => {
  try {
    const { name, description, coverImage, songs } = req.body;
    const updates = {};
    if (name) updates.name = name;
    if (description !== undefined) updates.description = description;
    if (coverImage !== undefined) updates.coverImage = coverImage;
    if (songs) updates.songs = songs;

    const playlist = await Playlist.findOneAndUpdate(
      { _id: req.params.id, owner: req.user._id },
      updates,
      { new: true }
    ).populate('songs', 'title artist album coverImage duration driveFileId');
    
    if (!playlist) return res.status(404).json({ message: 'Playlist not found' });
    res.json({ playlist });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const deletePlaylist = async (req, res) => {
  try {
    const playlist = await Playlist.findOneAndDelete({ _id: req.params.id, owner: req.user._id });
    if (!playlist) return res.status(404).json({ message: 'Playlist not found' });
    res.json({ message: 'Playlist deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const addSongToPlaylist = async (req, res) => {
  try {
    const { songId } = req.body;
    const playlist = await Playlist.findOne({ _id: req.params.id, owner: req.user._id });
    if (!playlist) return res.status(404).json({ message: 'Playlist not found' });
    
    if (playlist.songs.includes(songId)) {
      return res.status(400).json({ message: 'Song already in playlist' });
    }
    
    playlist.songs.push(songId);
    await playlist.save();
    
    await playlist.populate('songs', 'title artist album coverImage duration driveFileId');
    res.json({ playlist });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const removeSongFromPlaylist = async (req, res) => {
  try {
    const { songId } = req.body;
    const playlist = await Playlist.findOne({ _id: req.params.id, owner: req.user._id });
    if (!playlist) return res.status(404).json({ message: 'Playlist not found' });
    
    playlist.songs = playlist.songs.filter(id => id.toString() !== songId);
    await playlist.save();
    
    await playlist.populate('songs', 'title artist album coverImage duration driveFileId');
    res.json({ playlist });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
