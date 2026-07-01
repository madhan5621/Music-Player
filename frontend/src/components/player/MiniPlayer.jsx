import { Play, Pause, ListMusic } from 'lucide-react';
import usePlayerStore from '../../store/usePlayerStore';
import { truncateText } from '../../utils/formatters';

export default function MiniPlayer() {
  const { currentSong, isPlaying, togglePlay, setShowFullScreen, progress, duration } = usePlayerStore();
  
  if (!currentSong) return null;

  const progressPercent = duration > 0 ? (progress / duration) * 100 : 0;

  return (
    <div
      className="fixed bottom-14 left-0 right-0 z-20 mx-2 mb-1"
      style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
    >
      <div
        className="glass rounded-2xl overflow-hidden shadow-2xl cursor-pointer"
        onClick={() => setShowFullScreen(true)}
      >
        {/* Progress bar */}
        <div className="h-0.5 bg-border">
          <div className="h-full bg-accent transition-all" style={{ width: `${progressPercent}%` }} />
        </div>
        
        <div className="flex items-center gap-3 px-3 py-2.5">
          {/* Cover */}
          <div className="h-11 w-11 flex-shrink-0 overflow-hidden rounded-xl bg-bg-card">
            {currentSong.coverImage ? (
              <img src={currentSong.coverImage} alt="" className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center gradient-mesh">
                <ListMusic className="h-5 w-5 text-accent/40" />
              </div>
            )}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-text-primary truncate">{currentSong.title}</p>
            <p className="text-xs text-text-secondary truncate">{currentSong.artist}</p>
          </div>

          {/* Play/Pause */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              togglePlay();
            }}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-accent text-bg-primary"
          >
            {isPlaying ? <Pause className="h-4 w-4" fill="currentColor" /> : <Play className="h-4 w-4 ml-0.5" fill="currentColor" />}
          </button>
        </div>
      </div>
    </div>
  );
}
