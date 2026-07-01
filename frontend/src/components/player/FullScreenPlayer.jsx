import { motion } from 'framer-motion';
import { ChevronDown, Play, Pause, SkipBack, SkipForward, Shuffle, Repeat, Repeat1, Heart, ListMusic, MoreHorizontal } from 'lucide-react';
import usePlayerStore from '../../store/usePlayerStore';
import { formatDuration } from '../../utils/formatters';
import { useSwipe } from '../../hooks/useHooks';

export default function FullScreenPlayer() {
  const {
    currentSong, isPlaying, progress, duration,
    shuffle, repeat, togglePlay, next, previous,
    seekTo, toggleShuffle, toggleRepeat, setShowFullScreen
  } = usePlayerStore();

  const swipeHandlers = useSwipe(null, () => setShowFullScreen(false), 80);

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
          <button className="rounded-full p-2">
            <MoreHorizontal className="h-6 w-6 text-text-secondary" />
          </button>
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
            <button className="ml-4 rounded-full p-2 text-text-secondary hover:text-accent transition-colors">
              <Heart className="h-6 w-6" />
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
