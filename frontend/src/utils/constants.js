export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export const COLORS = {
  accent: '#00E5FF',
  accentHover: '#00B8D4',
  bgPrimary: '#080808',
  bgSecondary: '#111111',
  bgCard: '#1A1A1A',
};

export const GENRES = [
  'Pop', 'Rock', 'Hip Hop', 'R&B', 'Jazz', 'Classical',
  'Electronic', 'Country', 'Blues', 'Reggae', 'Folk',
  'Metal', 'Punk', 'Soul', 'Funk', 'Latin', 'Indie',
  'Alternative', 'Dance', 'Lo-fi', 'Tamil', 'Hindi',
  'Telugu', 'Malayalam', 'Kannada', 'Devotional', 'Instrumental', 'Other'
];

export const SORT_OPTIONS = [
  { value: '-createdAt', label: 'Newest First' },
  { value: 'createdAt', label: 'Oldest First' },
  { value: 'title', label: 'Name A-Z' },
  { value: '-title', label: 'Name Z-A' },
  { value: 'duration', label: 'Duration ↑' },
  { value: '-duration', label: 'Duration ↓' },
  { value: '-playCount', label: 'Most Played' },
];
