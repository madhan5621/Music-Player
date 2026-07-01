import { Play, Pause, SkipBack, SkipForward, Shuffle, Repeat, Repeat1, Volume2, VolumeX, ListMusic, ChevronUp } from 'lucide-react';
import usePlayerStore from '../../store/usePlayerStore';
import useUIStore from '../../store/useUIStore';
import { formatDuration, truncateText } from '../../utils/formatters';

export default function MusicPlayer() {
  const {
    currentSong, isPlaying, progress, duration, volume,
    shuffle, repeat, togglePlay, next, previous, seekTo,
    setVolume, toggleShuffle, toggleRepeat
  } = usePlayerStore();
  const { toggleQueueDrawer } = useUIStore();

  if (!currentSong) return null;

  const progressPercent = duration > 0 ? (progress / duration) * 100 : 0;

  return (
    <div className="relative z-20 border-t border-border glass">
      {/* Progress bar (thin line at top) */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-border cursor-pointer group"
        onClick={(e) => {
          const rect = e.currentTarget.getBoundingClientRect();
          const percent = (e.clientX - rect.left) / rect.width;
          seekTo(percent * duration);
        }}
      >
        <div
          className="h-full bg-accent transition-all duration-150 relative"
          style={{ width: `${progressPercent}%` }}
        >
          <div className="absolute right-0 top-1/2 -translate-y-1/2 h-3 w-3 rounded-full bg-accent opacity-0 group-hover:opacity-100 transition-opacity shadow-lg" />
        </div>
      </div>

      <div className="flex items-center gap-4 px-4 py-3">
        {/* Song Info */}
        <div className="flex items-center gap-3 w-72 min-w-0">
          <div className="h-12 w-12 flex-shrink-0 overflow-hidden rounded-lg bg-bg-card shadow-lg">
            {currentSong.coverImage ? (
              <img src={currentSong.coverImage} alt={currentSong.title} className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center gradient-mesh">
                <ListMusic className="h-5 w-5 text-accent/40" />
              </div>
            )}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-text-primary truncate">{currentSong.title}</p>
            <p className="text-xs text-text-secondary truncate">{currentSong.artist}</p>
          </div>
        </div>

        {/* Controls */}
        <div className="flex flex-1 flex-col items-center gap-1">
          <div className="flex items-center gap-3">
            <button
              onClick={toggleShuffle}
              className={`rounded-full p-2 transition-colors ${shuffle ? 'text-accent' : 'text-text-secondary hover:text-text-primary'}`}
            >
              <Shuffle className="h-4 w-4" />
            </button>
            <button onClick={previous} className="rounded-full p-2 text-text-secondary hover:text-text-primary transition-colors">
              <SkipBack className="h-5 w-5" fill="currentColor" />
            </button>
            <button
              onClick={togglePlay}
              className="flex h-9 w-9 items-center justify-center rounded-full bg-text-primary text-bg-primary hover:scale-105 transition-transform"
            >
              {isPlaying ? <Pause className="h-5 w-5" fill="currentColor" /> : <Play className="h-5 w-5 ml-0.5" fill="currentColor" />}
            </button>
            <button onClick={next} className="rounded-full p-2 text-text-secondary hover:text-text-primary transition-colors">
              <SkipForward className="h-5 w-5" fill="currentColor" />
            </button>
            <button
              onClick={toggleRepeat}
              className={`rounded-full p-2 transition-colors ${repeat !== 'none' ? 'text-accent' : 'text-text-secondary hover:text-text-primary'}`}
            >
              {repeat === 'one' ? <Repeat1 className="h-4 w-4" /> : <Repeat className="h-4 w-4" />}
            </button>
          </div>

          {/* Time */}
          <div className="flex items-center gap-2 text-xs text-text-muted">
            <span className="w-10 text-right">{formatDuration(progress)}</span>
            <div className="w-96 h-1 bg-border rounded-full cursor-pointer group"
              onClick={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                const percent = (e.clientX - rect.left) / rect.width;
                seekTo(percent * duration);
              }}
            >
              <div className="h-full bg-text-secondary group-hover:bg-accent rounded-full transition-colors relative" style={{ width: `${progressPercent}%` }}>
                <div className="absolute right-0 top-1/2 -translate-y-1/2 h-3 w-3 rounded-full bg-text-primary opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </div>
            <span className="w-10">{formatDuration(duration)}</span>
          </div>
        </div>

        {/* Volume + Queue */}
        <div className="flex items-center gap-3 w-48 justify-end">
          <button onClick={toggleQueueDrawer} className="rounded-full p-2 text-text-secondary hover:text-text-primary transition-colors">
            <ListMusic className="h-4 w-4" />
          </button>
          <button
            onClick={() => setVolume(volume > 0 ? 0 : 0.8)}
            className="rounded-full p-1 text-text-secondary hover:text-text-primary transition-colors"
          >
            {volume === 0 ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
          </button>
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={volume}
            onChange={(e) => setVolume(Number(e.target.value))}
            className="w-24 accent-accent"
          />
        </div>
      </div>
    </div>
  );
}
