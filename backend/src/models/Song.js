import mongoose from 'mongoose';

const songSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Song title is required'],
    trim: true,
    index: true
  },
  artist: {
    type: String,
    required: [true, 'Artist is required'],
    trim: true,
    index: true
  },
  album: {
    type: String,
    trim: true,
    default: 'Unknown Album',
    index: true
  },
  genre: {
    type: String,
    trim: true,
    default: 'Unknown',
    index: true
  },
  duration: {
    type: Number,
    default: 0
  },
  coverImage: {
    type: String,
    default: ''
  },
  driveFileId: {
    type: String,
    required: [true, 'Google Drive File ID is required']
  },
  streamUrl: {
    type: String,
    default: ''
  },
  driveLink: {
    type: String,
    default: ''
  },
  addedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  playCount: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

songSchema.index({ title: 'text', artist: 'text', album: 'text', genre: 'text' });

export default mongoose.model('Song', songSchema);
