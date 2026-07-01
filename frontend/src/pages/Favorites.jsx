import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Heart, Play, Pause, Music2, ListMusic } from 'lucide-react';
import usePlayerStore from '../store/usePlayerStore';
import { favoriteService } from '../services/apiServices';
import { formatDuration } from '../utils/formatters';

export default function Favorites() {
  const [songs, setSongs] = useState([]);
  const [loading, setLoading] = useState(true);
  const { playSong, currentSong, isPlaying } = usePlayerStore();

  useEffect(() => {
    const load = async () => {
      try {
        const res = await favoriteService.getAll();
        setSongs(res.data.favorites || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleUnfavorite = async (songId) => {
    await favoriteService.toggle(songId);
    setSongs(prev => prev.filter(s => s._id !== songId));
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-rose-500/20 via-pink-500/10 to-bg-card p-6 md:p-8">
        <div className="absolute top-0 right-0 w-48 h-48 bg-rose-500/10 rounded-full blur-3xl" />
        <div className="relative flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-500/20">
            <Heart className="h-7 w-7 text-rose-400" fill="currentColor" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-text-primary">Favorites</h1>
            <p className="text-text-secondary">{songs.length} liked songs</p>
          </div>
        </div>
        {songs.length > 0 && (
          <button
            onClick={() => playSong(songs[0], songs)}
            className="mt-4 rounded-full bg-accent px-6 py-2.5 text-sm font-semibold text-bg-primary hover:bg-accent-hover transition-colors flex items-center gap-2"
          >
            <Play className="h-4 w-4" fill="currentColor" /> Play All
          </button>
        )}
      </div>

      {/* Songs */}
      <div className="space-y-1">
        {songs.map((song, i) => (
          <motion.div
            key={song._id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: Math.min(i * 0.03, 0.5) }}
            className={`flex items-center gap-3 rounded-xl px-3 py-2.5 group cursor-pointer transition-colors ${
              currentSong?._id === song._id ? 'bg-accent/10' : 'hover:bg-bg-hover'
            }`}
            onClick={() => playSong(song, songs)}
          >
            <span className="w-6 text-center text-xs text-text-muted">{i + 1}</span>
            <div className="h-10 w-10 flex-shrink-0 overflow-hidden rounded-lg bg-bg-card">
              {song.coverImage ? (
                <img src={song.coverImage} alt="" className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full w-full items-center justify-center gradient-mesh">
                  <ListMusic className="h-4 w-4 text-text-muted" />
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className={`text-sm font-medium truncate ${currentSong?._id === song._id ? 'text-accent' : 'text-text-primary'}`}>{song.title}</p>
              <p className="text-xs text-text-muted truncate">{song.artist} • {song.album}</p>
            </div>
            <button
              onClick={(e) => { e.stopPropagation(); handleUnfavorite(song._id); }}
              className="rounded-full p-1.5 text-rose-400 hover:bg-rose-400/10 transition-colors"
            >
              <Heart className="h-4 w-4" fill="currentColor" />
            </button>
            <span className="text-xs text-text-muted w-10 text-right">{formatDuration(song.duration)}</span>
          </motion.div>
        ))}
      </div>

      {!loading && songs.length === 0 && (
        <div className="text-center py-20">
          <Heart className="h-16 w-16 mx-auto mb-4 text-text-muted opacity-20" />
          <h3 className="text-lg font-semibold text-text-primary mb-1">No favorites yet</h3>
          <p className="text-sm text-text-secondary">Like songs to add them here</p>
        </div>
      )}
    </div>
  );
}
