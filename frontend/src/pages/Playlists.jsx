import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Play, Trash2, Edit3, ListMusic, Music2, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import usePlayerStore from '../store/usePlayerStore';
import { playlistService } from '../services/apiServices';
import { formatDuration } from '../utils/formatters';

function CreatePlaylistModal({ onClose, onCreated }) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await playlistService.create({ name, description });
      onCreated(res.data.playlist);
      onClose();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative w-full max-w-md glass rounded-3xl p-6"
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-bold text-text-primary">New Playlist</h3>
          <button onClick={onClose} className="rounded-lg p-1.5 hover:bg-bg-hover"><X className="h-5 w-5 text-text-secondary" /></button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1.5">Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="My Playlist"
              required
              className="w-full rounded-xl border border-border bg-bg-card px-4 py-2.5 text-sm text-text-primary placeholder-text-muted outline-none focus:border-accent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1.5">Description</label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Optional description"
              className="w-full rounded-xl border border-border bg-bg-card px-4 py-2.5 text-sm text-text-primary placeholder-text-muted outline-none focus:border-accent"
            />
          </div>
          <button type="submit" className="w-full rounded-xl bg-accent py-2.5 text-sm font-semibold text-bg-primary hover:bg-accent-hover transition-colors">
            Create Playlist
          </button>
        </form>
      </motion.div>
    </div>
  );
}

export default function Playlists() {
  const [playlists, setPlaylists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [selectedPlaylist, setSelectedPlaylist] = useState(null);
  const { playSong } = usePlayerStore();
  const navigate = useNavigate();

  useEffect(() => {
    loadPlaylists();
  }, []);

  const loadPlaylists = async () => {
    try {
      const res = await playlistService.getAll();
      setPlaylists(res.data.playlists || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this playlist?')) return;
    try {
      await playlistService.delete(id);
      setPlaylists(prev => prev.filter(p => p._id !== id));
      if (selectedPlaylist?._id === id) setSelectedPlaylist(null);
    } catch (err) {}
  };

  const totalDuration = (songs) => songs?.reduce((acc, s) => acc + (s.duration || 0), 0) || 0;

  // Detail view
  if (selectedPlaylist) {
    return (
      <div className="space-y-6 animate-fade-in">
        <button onClick={() => setSelectedPlaylist(null)} className="text-sm text-text-secondary hover:text-accent">&larr; Back to Playlists</button>
        
        <div className="flex flex-col md:flex-row gap-6 items-start">
          <div className="w-48 h-48 flex-shrink-0 rounded-2xl overflow-hidden bg-bg-card shadow-2xl">
            {selectedPlaylist.coverImage ? (
              <img src={selectedPlaylist.coverImage} alt="" className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center gradient-mesh">
                <ListMusic className="h-14 w-14 text-accent/30" />
              </div>
            )}
          </div>
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-text-primary">{selectedPlaylist.name}</h1>
            {selectedPlaylist.description && <p className="text-text-secondary mt-1">{selectedPlaylist.description}</p>}
            <p className="text-sm text-text-muted mt-2">
              {selectedPlaylist.songs?.length || 0} songs • {formatDuration(totalDuration(selectedPlaylist.songs))}
            </p>
            {selectedPlaylist.songs?.length > 0 && (
              <button
                onClick={() => playSong(selectedPlaylist.songs[0], selectedPlaylist.songs)}
                className="mt-4 rounded-full bg-accent px-6 py-2.5 text-sm font-semibold text-bg-primary hover:bg-accent-hover transition-colors flex items-center gap-2"
              >
                <Play className="h-4 w-4" fill="currentColor" /> Play
              </button>
            )}
          </div>
        </div>

        <div className="space-y-1">
          {selectedPlaylist.songs?.map((song, i) => (
            <div
              key={song._id}
              className="flex items-center gap-3 rounded-xl px-3 py-2.5 hover:bg-bg-hover cursor-pointer transition-colors"
              onClick={() => playSong(song, selectedPlaylist.songs)}
            >
              <span className="w-6 text-center text-xs text-text-muted">{i + 1}</span>
              <div className="h-10 w-10 flex-shrink-0 overflow-hidden rounded-lg bg-bg-card">
                {song.coverImage ? (
                  <img src={song.coverImage} alt="" className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center gradient-mesh">
                    <Music2 className="h-4 w-4 text-text-muted" />
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-text-primary truncate">{song.title}</p>
                <p className="text-xs text-text-muted truncate">{song.artist}</p>
              </div>
              <span className="text-xs text-text-muted">{formatDuration(song.duration)}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-text-primary">Playlists</h1>
          <p className="text-text-secondary mt-1">{playlists.length} playlists</p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="rounded-xl bg-accent px-4 py-2.5 text-sm font-semibold text-bg-primary hover:bg-accent-hover transition-colors flex items-center gap-2"
        >
          <Plus className="h-4 w-4" /> New
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {playlists.map((playlist, i) => (
          <motion.div
            key={playlist._id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="group cursor-pointer"
            onClick={() => setSelectedPlaylist(playlist)}
          >
            <div className="relative aspect-square rounded-2xl overflow-hidden bg-bg-card mb-3 shadow-md">
              {playlist.coverImage ? (
                <img src={playlist.coverImage} alt="" className="h-full w-full object-cover transition-transform group-hover:scale-105" />
              ) : (
                <div className="flex h-full w-full items-center justify-center gradient-mesh">
                  <ListMusic className="h-10 w-10 text-accent/30" />
                </div>
              )}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors" />
              <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                <button
                  onClick={(e) => { e.stopPropagation(); handleDelete(playlist._id); }}
                  className="rounded-full p-2 bg-black/60 text-white hover:bg-danger/80"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
              <div className="absolute bottom-2 right-2 flex h-10 w-10 items-center justify-center rounded-full bg-accent text-bg-primary opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all shadow-xl">
                <Play className="h-4 w-4 ml-0.5" fill="currentColor" />
              </div>
            </div>
            <p className="text-sm font-semibold text-text-primary truncate">{playlist.name}</p>
            <p className="text-xs text-text-muted">{playlist.songs?.length || 0} songs</p>
          </motion.div>
        ))}
      </div>

      {!loading && playlists.length === 0 && (
        <div className="text-center py-20">
          <ListMusic className="h-16 w-16 mx-auto mb-4 text-text-muted opacity-20" />
          <h3 className="text-lg font-semibold text-text-primary mb-1">No playlists yet</h3>
          <p className="text-sm text-text-secondary">Create your first playlist</p>
        </div>
      )}

      {showCreate && <CreatePlaylistModal onClose={() => setShowCreate(false)} onCreated={(p) => setPlaylists(prev => [p, ...prev])} />}
    </div>
  );
}
