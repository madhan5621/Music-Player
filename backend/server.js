import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import connectDB from './src/config/db.js';
import { apiLimiter } from './src/middleware/rateLimiter.js';

// Route imports
import authRoutes from './src/routes/auth.js';
import songRoutes from './src/routes/songs.js';
import playlistRoutes from './src/routes/playlists.js';
import favoriteRoutes from './src/routes/favorites.js';
import analyticsRoutes from './src/routes/analytics.js';
import searchRoutes from './src/routes/search.js';
import streamRoutes from './src/routes/stream.js';

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use(cors({
  origin: process.env.FRONTEND_URL || '*',
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use('/api', apiLimiter);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/songs', songRoutes);
app.use('/api/playlists', playlistRoutes);
app.use('/api/favorites', favoriteRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/stream', streamRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!', error: err.message });
});

// Start server
const startServer = async () => {
  await connectDB();
  app.listen(PORT, () => {
    console.log(`🎵 Madhan Music API running on port ${PORT}`);
  });
};

startServer();
