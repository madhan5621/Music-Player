import { ListMusic, Play } from 'lucide-react';
import usePlayerStore from '../../store/usePlayerStore';
import useUIStore from '../../store/useUIStore';
import { formatDuration, truncateText } from '../../utils/formatters';

export default function RightPanel() {
  const { currentSong, queue, queueIndex } = usePlayerStore();

  return (
    <aside className="hidden xl:flex w-80 flex-shrink-0 flex-col border-l border-border bg-bg-secondary overflow-hidden">
      {/* Now Playing */}
      {currentSong && (
        <div className="border-b border-border p-5">
          <h3 className="mb-4 text-xs font-semibold uppercase tracking-wider text-text-muted">Now Playing</h3>
          <div className="flex flex-col items-center text-center">
            <div className="relative mb-4 h-44 w-44 overflow-hidden rounded-2xl bg-bg-card shadow-2xl">
              {currentSong.coverImage ? (
                <img src={currentSong.coverImage} alt={currentSong.title} className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full w-full items-center justify-center gradient-mesh">
                  <ListMusic className="h-12 w-12 text-accent/40" />
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
            </div>
            <h4 className="text-base font-semibold text-text-primary">{truncateText(currentSong.title, 28)}</h4>
            <p className="mt-1 text-sm text-text-secondary">{currentSong.artist}</p>
            {currentSong.album && (
              <p className="mt-0.5 text-xs text-text-muted">{currentSong.album}</p>
            )}
          </div>
        </div>
      )}

      {/* Queue */}
      <div className="flex-1 overflow-y-auto p-5">
        <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-text-muted">
          Queue {queue.length > 0 && `(${queue.length})`}
        </h3>
        {queue.length === 0 ? (
          <p className="text-sm text-text-muted py-8 text-center">No songs in queue</p>
        ) : (
          <div className="space-y-1">
            {queue.slice(queueIndex + 1, queueIndex + 21).map((song, i) => (
              <button
                key={`${song._id}-${i}`}
                onClick={() => usePlayerStore.getState().playSong(song)}
                className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left hover:bg-bg-hover transition-colors group"
              >
                <span className="text-xs text-text-muted w-5 text-right">{i + 1}</span>
                <div className="h-9 w-9 flex-shrink-0 overflow-hidden rounded-md bg-bg-card">
                  {song.coverImage ? (
                    <img src={song.coverImage} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center">
                      <ListMusic className="h-4 w-4 text-text-muted" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-text-primary truncate">{song.title}</p>
                  <p className="text-xs text-text-muted truncate">{song.artist}</p>
                </div>
                <span className="text-xs text-text-muted">{formatDuration(song.duration)}</span>
              </button>
            ))}
          </div>
        )}
      </div>
    </aside>
  );
}
