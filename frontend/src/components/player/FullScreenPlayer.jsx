import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Play, Pause, SkipBack, SkipForward, Shuffle, Repeat, Repeat1, Heart, ListMusic, MoreHorizontal, ListPlus, Share2, Info, ChevronRight, Plus, X } from 'lucide-react';
import usePlayerStore from '../../store/usePlayerStore';
import { playlistService, favoriteService } from '../../services/apiServices';
import { formatDuration } from '../../utils/formatters';
import { useSwipe } from '../../hooks/useHooks';

export default function FullScreenPlayer() {
  const {
    currentSong, isPlaying, progress, duration,
    shuffle, repeat, togglePlay, next, previous,
    seekTo, toggleShuffle, toggleRepeat, setShowFullScreen, addToQueue
  } = usePlayerStore();

  const [menuOpen, setMenuOpen] = useState(false);
  const [playlistModalOpen, setPlaylistModalOpen] = useState(false);
  const [playlists, setPlaylists] = useState([]);
  const [loadingPlaylists, setLoadingPlaylists] = useState(false);
  const [toast, setToast] = useState(null);
  const [songInfoOpen, setSongInfoOpen] = useState(false);
  const [isFav, setIsFav] = useState(false);
  const [favLoading, setFavLoading] = useState(false);
  const menuRef = useRef(null);

  const swipeHandlers = useSwipe(null, () => setShowFullScreen(false), 80);

  // Check favorite status when song changes
  useEffect(() => {
    if (!currentSong?._id) return;
    let cancelled = false;
    (async () => {
      try {
        const res = await favoriteService.check([currentSong._id]);
        if (!cancelled) {
          const favMap = res.data || {};
          setIsFav(!!favMap[currentSong._id]);
        }
      } catch {
        if (!cancelled) setIsFav(false);
      }
    })();
    return () => { cancelled = true; };
  }, [currentSong?._id]);

  // Close menu on outside click
  useEffect(() => {
    if (!menuOpen) return;
    const handleClick = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };
    const handleKey = (e) => {
      if (e.key === 'Escape') {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    document.addEventListener('keydown', handleKey);
    return () => {
      document.removeEventListener('mousedown', handleClick);
      document.removeEventListener('keydown', handleKey);
    };
  }, [menuOpen]);

  // Auto-dismiss toast
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 2500);
    return () => clearTimeout(t);
  }, [toast]);

  const showToast = (msg) => setToast(msg);

  const handleToggleFavorite = async () => {
    if (favLoading || !currentSong) return;
    setFavLoading(true);
    try {
      const res = await favoriteService.toggle(currentSong._id);
      const nowFav = res.data?.isFavorite ?? !isFav;
      setIsFav(nowFav);
      showToast(nowFav ? 'Added to Favorites' : 'Removed from Favorites');
    } catch {
      showToast('Failed to update favorite');
    }
    setFavLoading(false);
  };

  const handleAddToQueue = () => {
    if (currentSong) {
      addToQueue(currentSong);
      showToast('Added to queue');
    }
    setMenuOpen(false);
  };

  const handleOpenPlaylistModal = async () => {
    setMenuOpen(false);
    setPlaylistModalOpen(true);
    if (playlists.length === 0) {
      setLoadingPlaylists(true);
      try {
        const res = await playlistService.getAll();
        setPlaylists(res.data || []);
      } catch {
        setPlaylists([]);
      }
      setLoadingPlaylists(false);
    }
  };

  const handleAddToPlaylist = async (playlistId) => {
    try {
      await playlistService.addSong(playlistId, currentSong._id);
      showToast('Added to playlist');
    } catch {
      showToast('Already in playlist');
    }
    setPlaylistModalOpen(false);
  };

  const handleShare = async () => {
    const shareData = {
      title: currentSong.title,
      text: `${currentSong.title} by ${currentSong.artist}`,
      url: window.location.href,
    };
    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(`${currentSong.title} by ${currentSong.artist}`);
        showToast('Copied to clipboard');
      }
    } catch {
      // User cancelled share
    }
    setMenuOpen(false);
  };

  const handleSongInfo = () => {
    setMenuOpen(false);
    setSongInfoOpen(true);
  };

  if (!currentSong) return null;

  const progressPercent = duration > 0 ? (progress / duration) * 100 : 0;

  return (
    <motion.div
      initial={{ y: '100%' }}
      animate={{ y: 0 }}
      exit={{ y: '100%' }}
      transition={{ type: 'spring', damping: 28, stiffness: 200 }}
      className="fixed inset-0 z-[100] flex flex-col bg-bg-primary"
      {...swipeHandlers}
    >
      {/* Background Gradient */}
      <div className="absolute inset-0 gradient-mesh opacity-50" />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-bg-primary/50 to-bg-primary" />

      {/* Toast Notification */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -30 }}
            className="fixed top-6 left-1/2 -translate-x-1/2 z-[200] rounded-full bg-accent px-5 py-2.5 text-sm font-medium text-bg-primary shadow-xl"
          >
            {toast}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Song Info Modal */}
      <AnimatePresence>
        {songInfoOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[150] flex items-center justify-center bg-black/60 backdrop-blur-sm px-6"
            onClick={() => setSongInfoOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-sm rounded-2xl bg-bg-card border border-border p-6 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-text-primary">Song Info</h3>
                <button onClick={() => setSongInfoOpen(false)} className="rounded-full p-1 hover:bg-bg-hover transition-colors">
                  <X className="h-5 w-5 text-text-secondary" />
                </button>
              </div>
              <div className="space-y-3">
                {[
                  ['Title', currentSong.title],
                  ['Artist', currentSong.artist],
                  ['Album', currentSong.album || '—'],
                  ['Genre', currentSong.genre || '—'],
                  ['Duration', formatDuration(duration)],
                ].map(([label, value]) => (
                  <div key={label} className="flex justify-between items-baseline gap-4">
                    <span className="text-xs text-text-muted uppercase tracking-wider shrink-0">{label}</span>
                    <span className="text-sm text-text-primary text-right truncate">{value}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Add to Playlist Modal (full-screen modal, not dropdown) */}
      <AnimatePresence>
        {playlistModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[150] flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm"
            onClick={() => setPlaylistModalOpen(false)}
          >
            <motion.div
              initial={{ y: '100%', opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: '100%', opacity: 0 }}
              transition={{ type: 'spring', damping: 28, stiffness: 200 }}
              className="w-full sm:max-w-sm sm:mx-6 rounded-t-2xl sm:rounded-2xl bg-bg-card border border-border shadow-2xl max-h-[70vh] flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Handle bar for mobile */}
              <div className="flex justify-center pt-3 sm:hidden">
                <div className="w-10 h-1 rounded-full bg-border" />
              </div>

              {/* Header */}
              <div className="flex items-center justify-between px-5 py-4 border-b border-border">
                <h3 className="text-lg font-bold text-text-primary">Add to Playlist</h3>
                <button onClick={() => setPlaylistModalOpen(false)} className="rounded-full p-1.5 hover:bg-bg-hover transition-colors">
                  <X className="h-5 w-5 text-text-secondary" />
                </button>
              </div>

              {/* Song being added */}
              <div className="flex items-center gap-3 px-5 py-3 bg-bg-hover/50">
                <div className="h-10 w-10 flex-shrink-0 overflow-hidden rounded-lg bg-bg-card">
                  {currentSong.coverImage ? (
                    <img src={currentSong.coverImage} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center gradient-mesh">
                      <ListMusic className="h-4 w-4 text-accent/40" />
                    </div>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-text-primary truncate">{currentSong.title}</p>
                  <p className="text-xs text-text-secondary truncate">{currentSong.artist}</p>
                </div>
              </div>

              {/* Playlist list */}
              <div className="flex-1 overflow-y-auto">
                {loadingPlaylists ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="h-6 w-6 border-2 border-accent border-t-transparent rounded-full animate-spin" />
                  </div>
                ) : playlists.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-text-muted">
                    <ListMusic className="h-10 w-10 mb-2 opacity-40" />
                    <p className="text-sm">No playlists found</p>
                    <p className="text-xs mt-1">Create a playlist first</p>
                  </div>
                ) : (
                  <div className="py-2">
                    {playlists.map((pl) => (
                      <button
                        key={pl._id}
                        onClick={() => handleAddToPlaylist(pl._id)}
                        className="flex w-full items-center gap-3 px-5 py-3 text-sm text-text-primary hover:bg-bg-hover active:bg-bg-active transition-colors"
                      >
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-bg-hover shrink-0">
                          <ListMusic className="h-5 w-5 text-text-secondary" />
                        </div>
                        <div className="min-w-0 flex-1 text-left">
                          <p className="font-medium truncate">{pl.name}</p>
                          <p className="text-xs text-text-muted">{pl.songs?.length || 0} songs</p>
                        </div>
                        <Plus className="h-4 w-4 text-text-muted shrink-0" />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Content */}
      <div className="relative flex flex-1 flex-col px-6 pt-4 pb-safe">
        {/* Header */}
        <div className="flex items-center justify-between py-2">
          <button onClick={() => setShowFullScreen(false)} className="rounded-full p-2 -ml-2">
            <ChevronDown className="h-6 w-6 text-text-primary" />
          </button>
          <div className="text-center">
            <p className="text-xs text-text-muted uppercase tracking-widest">Now Playing</p>
          </div>
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setMenuOpen(v => !v)}
              className={`rounded-full p-2 transition-colors ${menuOpen ? 'bg-bg-hover text-text-primary' : 'hover:bg-bg-hover'}`}
            >
              <MoreHorizontal className="h-6 w-6 text-text-secondary" />
            </button>

            {/* Dropdown Menu */}
            <AnimatePresence>
              {menuOpen && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9, y: -4 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9, y: -4 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 top-full mt-2 w-56 overflow-hidden rounded-xl bg-bg-card border border-border shadow-2xl z-[110]"
                >
                  <button
                    onClick={handleAddToQueue}
                    className="flex w-full items-center gap-3 px-4 py-3 text-sm text-text-primary hover:bg-bg-hover transition-colors"
                  >
                    <ListPlus className="h-4 w-4 text-text-secondary" />
                    Add to Queue
                  </button>
                  <button
                    onClick={handleOpenPlaylistModal}
                    className="flex w-full items-center justify-between px-4 py-3 text-sm text-text-primary hover:bg-bg-hover transition-colors"
                  >
                    <span className="flex items-center gap-3">
                      <Plus className="h-4 w-4 text-text-secondary" />
                      Add to Playlist
                    </span>
                    <ChevronRight className="h-4 w-4 text-text-muted" />
                  </button>
                  <div className="border-t border-border" />
                  <button
                    onClick={handleShare}
                    className="flex w-full items-center gap-3 px-4 py-3 text-sm text-text-primary hover:bg-bg-hover transition-colors"
                  >
                    <Share2 className="h-4 w-4 text-text-secondary" />
                    Share
                  </button>
                  <button
                    onClick={handleSongInfo}
                    className="flex w-full items-center gap-3 px-4 py-3 text-sm text-text-primary hover:bg-bg-hover transition-colors"
                  >
                    <Info className="h-4 w-4 text-text-secondary" />
                    Song Info
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Cover Art */}
        <div className="flex flex-1 items-center justify-center py-6">
          <div className="relative w-full max-w-xs aspect-square overflow-hidden rounded-3xl bg-bg-card shadow-2xl">
            {currentSong.coverImage ? (
              <img src={currentSong.coverImage} alt={currentSong.title} className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center gradient-mesh">
                <ListMusic className="h-20 w-20 text-accent/30" />
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
          </div>
        </div>

        {/* Song Info */}
        <div className="mb-6">
          <div className="flex items-start justify-between">
            <div className="min-w-0 flex-1">
              <h2 className="text-xl font-bold text-text-primary truncate">{currentSong.title}</h2>
              <p className="mt-1 text-base text-text-secondary">{currentSong.artist}</p>
            </div>
            <button
              onClick={handleToggleFavorite}
              disabled={favLoading}
              className={`ml-4 rounded-full p-2 transition-colors ${isFav ? 'text-rose-500' : 'text-text-secondary hover:text-accent'} ${favLoading ? 'opacity-50' : ''}`}
            >
              <Heart className="h-6 w-6" fill={isFav ? 'currentColor' : 'none'} />
            </button>
          </div>
        </div>

        {/* Seek Bar */}
        <div className="mb-4">
          <div
            className="h-1.5 w-full rounded-full bg-border cursor-pointer"
            onClick={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              const percent = (e.clientX - rect.left) / rect.width;
              seekTo(percent * duration);
            }}
          >
            <div
              className="h-full rounded-full bg-accent relative"
              style={{ width: `${progressPercent}%` }}
            >
              <div className="absolute right-0 top-1/2 -translate-y-1/2 h-4 w-4 rounded-full bg-accent shadow-lg" />
            </div>
          </div>
          <div className="mt-2 flex justify-between text-xs text-text-muted">
            <span>{formatDuration(progress)}</span>
            <span>{formatDuration(duration)}</span>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={toggleShuffle}
            className={`rounded-full p-3 ${shuffle ? 'text-accent' : 'text-text-secondary'}`}
          >
            <Shuffle className="h-5 w-5" />
          </button>
          <button onClick={previous} className="rounded-full p-3 text-text-primary">
            <SkipBack className="h-7 w-7" fill="currentColor" />
          </button>
          <button
            onClick={togglePlay}
            className="flex h-16 w-16 items-center justify-center rounded-full bg-accent text-bg-primary shadow-lg glow-accent"
          >
            {isPlaying ? (
              <Pause className="h-8 w-8" fill="currentColor" />
            ) : (
              <Play className="h-8 w-8 ml-1" fill="currentColor" />
            )}
          </button>
          <button onClick={next} className="rounded-full p-3 text-text-primary">
            <SkipForward className="h-7 w-7" fill="currentColor" />
          </button>
          <button
            onClick={toggleRepeat}
            className={`rounded-full p-3 ${repeat !== 'none' ? 'text-accent' : 'text-text-secondary'}`}
          >
            {repeat === 'one' ? <Repeat1 className="h-5 w-5" /> : <Repeat className="h-5 w-5" />}
          </button>
        </div>
      </div>
    </motion.div>
  );
}
