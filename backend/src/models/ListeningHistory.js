import mongoose from 'mongoose';

const listeningHistorySchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  song: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Song',
    required: true
  },
  playedAt: {
    type: Date,
    default: Date.now
  },
  listenDuration: {
    type: Number,
    default: 0
  },
  completedPercentage: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  }
}, {
  timestamps: true
});

listeningHistorySchema.index({ user: 1, playedAt: -1 });
listeningHistorySchema.index({ user: 1, song: 1 });

export default mongoose.model('ListeningHistory', listeningHistorySchema);
