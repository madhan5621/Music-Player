import api from './api';

export const authService = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getMe: () => api.get('/auth/me'),
  updateProfile: (data) => api.put('/auth/profile', data),
  changePassword: (data) => api.put('/auth/password', data),
};

export const songService = {
  getAll: (params) => api.get('/songs', { params }),
  getOne: (id) => api.get(`/songs/${id}`),
  create: (data) => api.post('/songs', data),
  bulkCreate: (songs) => api.post('/songs/bulk', { songs }),
  update: (id, data) => api.put(`/songs/${id}`, data),
  delete: (id) => api.delete(`/songs/${id}`),
  getArtists: () => api.get('/songs/artists'),
  getAlbums: () => api.get('/songs/albums'),
  getGenres: () => api.get('/songs/genres'),
};

export const playlistService = {
  getAll: () => api.get('/playlists'),
  getOne: (id) => api.get(`/playlists/${id}`),
  create: (data) => api.post('/playlists', data),
  update: (id, data) => api.put(`/playlists/${id}`, data),
  delete: (id) => api.delete(`/playlists/${id}`),
  addSong: (id, songId) => api.post(`/playlists/${id}/songs`, { songId }),
  removeSong: (id, songId) => api.delete(`/playlists/${id}/songs`, { data: { songId } }),
};

export const favoriteService = {
  getAll: () => api.get('/favorites'),
  toggle: (songId) => api.post(`/favorites/${songId}`),
  check: (songIds) => api.post('/favorites/check', { songIds }),
};

export const analyticsService = {
  logListening: (data) => api.post('/analytics/history', data),
  getRecent: (limit) => api.get('/analytics/recent', { params: { limit } }),
  getStats: () => api.get('/analytics/stats'),
  getRecommendations: () => api.get('/analytics/recommendations'),
};

export const searchService = {
  search: (q, type) => api.get('/search', { params: { q, type } }),
};
