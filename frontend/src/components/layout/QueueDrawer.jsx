import { motion, AnimatePresence } from 'framer-motion';
import { X, ListMusic, Play, Trash2 } from 'lucide-react';
import useUIStore from '../../store/useUIStore';
import usePlayerStore from '../../store/usePlayerStore';
import { formatDuration } from '../../utils/formatters';

export default function QueueDrawer() {
  const { queueDrawerOpen, closeQueueDrawer } = useUIStore();
  const { queue, queueIndex, playSong, removeFromQueue, clearQueue } = usePlayerStore();

  return (
    <AnimatePresence>
      {queueDrawerOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeQueueDrawer}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
          />
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed inset-y-0 right-0 z-50 w-full max-w-md bg-bg-secondary shadow-2xl flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-border px-5 py-4">
              <h2 className="text-lg font-bold text-text-primary">Queue</h2>
              <div className="flex items-center gap-2">
                {queue.length > 0 && (
                  <button
                    onClick={clearQueue}
                    className="rounded-lg px-3 py-1.5 text-xs text-text-secondary hover:bg-bg-hover hover:text-danger transition-colors"
                  >
                    Clear All
                  </button>
                )}
                <button onClick={closeQueueDrawer} className="rounded-lg p-2 hover:bg-bg-hover">
                  <X className="h-5 w-5 text-text-secondary" />
                </button>
              </div>
            </div>

            {/* Queue List */}
            <div className="flex-1 overflow-y-auto p-4">
              {queue.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-text-muted">
                  <ListMusic className="h-12 w-12 mb-3 opacity-40" />
                  <p className="text-sm">Queue is empty</p>
                  <p className="text-xs mt-1">Play a song to start</p>
                </div>
              ) : (
                <div className="space-y-1">
                  {queue.map((song, i) => (
                    <div
                      key={`${song._id}-${i}`}
                      className={`flex items-center gap-3 rounded-xl px-3 py-2.5 transition-colors group ${
                        i === queueIndex ? 'bg-accent/10 border border-accent/20' : 'hover:bg-bg-hover'
                      }`}
                    >
                      <button
                        onClick={() => playSong(song)}
                        className="flex flex-1 items-center gap-3 min-w-0"
                      >
                        <span className={`text-xs w-5 text-right ${i === queueIndex ? 'text-accent font-bold' : 'text-text-muted'}`}>
                          {i === queueIndex ? '▶' : i + 1}
                        </span>
                        <div className="h-10 w-10 flex-shrink-0 overflow-hidden rounded-lg bg-bg-card">
                          {song.coverImage ? (
                            <img src={song.coverImage} alt="" className="h-full w-full object-cover" />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center gradient-mesh">
                              <ListMusic className="h-4 w-4 text-text-muted" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0 text-left">
                          <p className={`text-sm font-medium truncate ${i === queueIndex ? 'text-accent' : 'text-text-primary'}`}>
                            {song.title}
                          </p>
                          <p className="text-xs text-text-muted truncate">{song.artist}</p>
                        </div>
                      </button>
                      <span className="text-xs text-text-muted">{formatDuration(song.duration)}</span>
                      <button
                        onClick={() => removeFromQueue(i)}
                        className="rounded-lg p-1.5 opacity-0 group-hover:opacity-100 hover:bg-bg-active transition-all"
                      >
                        <Trash2 className="h-3.5 w-3.5 text-text-muted" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
