import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Search, Grid3X3, List, Play, Pause, Heart, MoreHorizontal, Music2, SlidersHorizontal, ListMusic } from 'lucide-react';
import usePlayerStore from '../store/usePlayerStore';
import { songService, favoriteService } from '../services/apiServices';
import { formatDuration } from '../utils/formatters';
import { useDebounce } from '../hooks/useHooks';
import { SORT_OPTIONS } from '../utils/constants';

export default function Library() {
  const [songs, setSongs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [view, setView] = useState('grid');
  const [sort, setSort] = useState('-createdAt');
  const [filterGenre, setFilterGenre] = useState('');
  const [genres, setGenres] = useState([]);
  const [favorites, setFavorites] = useState({});
  const [showFilters, setShowFilters] = useState(false);
  const debouncedSearch = useDebounce(search, 300);
  const { playSong, currentSong, isPlaying, togglePlay } = usePlayerStore();

  useEffect(() => {
    const load = async () => {
      try {
        const [songsRes, genresRes] = await Promise.all([
          songService.getAll({ sort, search: debouncedSearch, genre: filterGenre, limit: 200 }),
          songService.getGenres()
        ]);
        const songsList = songsRes.data.songs || [];
        setSongs(songsList);
        setGenres(genresRes.data.genres || []);
        
        if (songsList.length > 0) {
          const favRes = await favoriteService.check(songsList.map(s => s._id));
          setFavorites(favRes.data.favorites || {});
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [debouncedSearch, sort, filterGenre]);

  const handleFavorite = async (songId) => {
    try {
      const res = await favoriteService.toggle(songId);
      setFavorites(prev => ({ ...prev, [songId]: res.data.isFavorite }));
    } catch (err) {}
  };

  const isCurrentlyPlaying = (song) => currentSong?._id === song._id && isPlaying;

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-text-primary">Library</h1>
        <p className="text-text-secondary mt-1">{songs.length} songs</p>
      </div>

      {/* Search & Controls */}
      <div className="flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search songs, artists, albums..."
            className="w-full rounded-xl border border-border bg-bg-card px-10 py-2.5 text-sm text-text-primary placeholder-text-muted outline-none focus:border-accent transition-colors"
          />
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`rounded-xl border px-3 py-2 text-sm flex items-center gap-2 transition-colors ${showFilters ? 'border-accent text-accent bg-accent/10' : 'border-border text-text-secondary hover:bg-bg-hover'}`}
          >
            <SlidersHorizontal className="h-4 w-4" />
            Filters
          </button>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="rounded-xl border border-border bg-bg-card px-3 py-2 text-sm text-text-primary outline-none"
          >
            {SORT_OPTIONS.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
          <div className="hidden md:flex rounded-xl border border-border overflow-hidden">
            <button
              onClick={() => setView('grid')}
              className={`px-3 py-2 ${view === 'grid' ? 'bg-accent/10 text-accent' : 'text-text-secondary hover:bg-bg-hover'}`}
            >
              <Grid3X3 className="h-4 w-4" />
            </button>
            <button
              onClick={() => setView('list')}
              className={`px-3 py-2 ${view === 'list' ? 'bg-accent/10 text-accent' : 'text-text-secondary hover:bg-bg-hover'}`}
            >
              <List className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Genre Filters */}
      {showFilters && (
        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} className="overflow-hidden">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setFilterGenre('')}
              className={`rounded-full px-4 py-1.5 text-xs font-medium transition-colors ${!filterGenre ? 'bg-accent text-bg-primary' : 'bg-bg-card text-text-secondary hover:bg-bg-hover'}`}
            >
              All
            </button>
            {genres.map(g => (
              <button
                key={g._id}
                onClick={() => setFilterGenre(g._id)}
                className={`rounded-full px-4 py-1.5 text-xs font-medium transition-colors ${filterGenre === g._id ? 'bg-accent text-bg-primary' : 'bg-bg-card text-text-secondary hover:bg-bg-hover'}`}
              >
                {g._id} ({g.songCount})
              </button>
            ))}
          </div>
        </motion.div>
      )}

      {/* Songs Grid */}
      {view === 'grid' ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {songs.map((song, i) => (
            <motion.div
              key={song._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: Math.min(i * 0.03, 0.5) }}
              className="group"
            >
              <button
                onClick={() => playSong(song, songs)}
                className="w-full text-left"
              >
                <div className="relative aspect-square overflow-hidden rounded-2xl bg-bg-card mb-2 shadow-md">
                  {song.coverImage ? (
                    <img src={song.coverImage} alt="" className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center gradient-mesh">
                      <Music2 className="h-8 w-8 text-accent/30" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors" />
                  <div className="absolute bottom-2 right-2 flex h-10 w-10 items-center justify-center rounded-full bg-accent text-bg-primary opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all shadow-xl">
                    {isCurrentlyPlaying(song) ? <Pause className="h-4 w-4" fill="currentColor" /> : <Play className="h-4 w-4 ml-0.5" fill="currentColor" />}
                  </div>
                </div>
              </button>
              <p className="text-sm font-semibold text-text-primary truncate">{song.title}</p>
              <p className="text-xs text-text-secondary truncate">{song.artist}</p>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="space-y-1">
          {songs.map((song, i) => (
            <motion.div
              key={song._id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: Math.min(i * 0.02, 0.4) }}
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
              <span className="text-xs text-text-muted hidden sm:block">{song.genre}</span>
              <button
                onClick={(e) => { e.stopPropagation(); handleFavorite(song._id); }}
                className={`p-1.5 rounded-full transition-colors ${favorites[song._id] ? 'text-accent' : 'text-text-muted opacity-0 group-hover:opacity-100'}`}
              >
                <Heart className="h-4 w-4" fill={favorites[song._id] ? 'currentColor' : 'none'} />
              </button>
              <span className="text-xs text-text-muted w-10 text-right">{formatDuration(song.duration)}</span>
            </motion.div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && songs.length === 0 && (
        <div className="text-center py-20">
          <Music2 className="h-16 w-16 mx-auto mb-4 text-text-muted opacity-30" />
          <h3 className="text-lg font-semibold text-text-primary mb-1">No songs found</h3>
          <p className="text-sm text-text-secondary">
            {search ? 'Try a different search term' : 'Add songs from the Admin page'}
          </p>
        </div>
      )}
    </div>
  );
}
