import { motion, AnimatePresence } from 'framer-motion';
import { X, ListMusic, Play, Trash2, ChevronUp, ChevronDown, GripVertical } from 'lucide-react';
import useUIStore from '../../store/useUIStore';
import usePlayerStore from '../../store/usePlayerStore';
import { formatDuration } from '../../utils/formatters';

export default function QueueDrawer() {
  const { queueDrawerOpen, closeQueueDrawer } = useUIStore();
  const { queue, queueIndex, playSong, removeFromQueue, clearQueue, moveInQueue } = usePlayerStore();

  const upcomingCount = queue.length > 0 ? queue.length - queueIndex - 1 : 0;

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
              <div>
                <h2 className="text-lg font-bold text-text-primary">Queue</h2>
                <p className="text-xs text-text-muted mt-0.5">
                  {queue.length} {queue.length === 1 ? 'song' : 'songs'}
                  {upcomingCount > 0 && ` · ${upcomingCount} upcoming`}
                </p>
              </div>
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
            <div className="flex-1 overflow-y-auto">
              {queue.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-text-muted">
                  <ListMusic className="h-12 w-12 mb-3 opacity-40" />
                  <p className="text-sm">Queue is empty</p>
                  <p className="text-xs mt-1">Play a song to start</p>
                </div>
              ) : (
                <>
                  {/* Now Playing */}
                  {queueIndex >= 0 && queueIndex < queue.length && (
                    <div className="px-4 pt-4 pb-2">
                      <p className="text-xs font-semibold text-text-muted uppercase tracking-wider px-2 mb-2">Now Playing</p>
                      <div className="flex items-center gap-3 rounded-xl px-3 py-2.5 bg-accent/10 border border-accent/20">
                        <div className="flex flex-1 items-center gap-3 min-w-0">
                          <span className="text-xs w-5 text-right text-accent font-bold">▶</span>
                          <div className="h-10 w-10 flex-shrink-0 overflow-hidden rounded-lg bg-bg-card">
                            {queue[queueIndex].coverImage ? (
                              <img src={queue[queueIndex].coverImage} alt="" className="h-full w-full object-cover" />
                            ) : (
                              <div className="flex h-full w-full items-center justify-center gradient-mesh">
                                <ListMusic className="h-4 w-4 text-text-muted" />
                              </div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-accent truncate">{queue[queueIndex].title}</p>
                            <p className="text-xs text-text-muted truncate">{queue[queueIndex].artist}</p>
                          </div>
                        </div>
                        <span className="text-xs text-text-muted">{formatDuration(queue[queueIndex].duration)}</span>
                      </div>
                    </div>
                  )}

                  {/* Next Up */}
                  {upcomingCount > 0 && (
                    <div className="px-4 pt-3 pb-2">
                      <p className="text-xs font-semibold text-text-muted uppercase tracking-wider px-2 mb-2">Next Up</p>
                      <div className="space-y-1">
                        {queue.map((song, i) => {
                          if (i <= queueIndex) return null;
                          return (
                            <div
                              key={`${song._id}-${i}`}
                              className="flex items-center gap-2 rounded-xl px-3 py-2.5 hover:bg-bg-hover transition-colors group"
                            >
                              <button
                                onClick={() => playSong(song)}
                                className="flex flex-1 items-center gap-3 min-w-0"
                              >
                                <span className="text-xs w-5 text-right text-text-muted">{i - queueIndex}</span>
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
                                  <p className="text-sm font-medium text-text-primary truncate">{song.title}</p>
                                  <p className="text-xs text-text-muted truncate">{song.artist}</p>
                                </div>
                              </button>
                              <span className="text-xs text-text-muted">{formatDuration(song.duration)}</span>
                              {/* Reorder & Remove buttons */}
                              <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button
                                  onClick={() => moveInQueue(i, Math.max(queueIndex + 1, i - 1))}
                                  disabled={i === queueIndex + 1}
                                  className="rounded-lg p-1 hover:bg-bg-active transition-all disabled:opacity-20"
                                  title="Move up"
                                >
                                  <ChevronUp className="h-3.5 w-3.5 text-text-muted" />
                                </button>
                                <button
                                  onClick={() => moveInQueue(i, Math.min(queue.length - 1, i + 1))}
                                  disabled={i === queue.length - 1}
                                  className="rounded-lg p-1 hover:bg-bg-active transition-all disabled:opacity-20"
                                  title="Move down"
                                >
                                  <ChevronDown className="h-3.5 w-3.5 text-text-muted" />
                                </button>
                                <button
                                  onClick={() => removeFromQueue(i)}
                                  className="rounded-lg p-1 hover:bg-bg-active transition-all"
                                  title="Remove"
                                >
                                  <Trash2 className="h-3.5 w-3.5 text-text-muted" />
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Previously Played */}
                  {queueIndex > 0 && (
                    <div className="px-4 pt-3 pb-4">
                      <p className="text-xs font-semibold text-text-muted uppercase tracking-wider px-2 mb-2">Previously Played</p>
                      <div className="space-y-1">
                        {queue.map((song, i) => {
                          if (i >= queueIndex) return null;
                          return (
                            <div
                              key={`${song._id}-${i}`}
                              className="flex items-center gap-3 rounded-xl px-3 py-2.5 hover:bg-bg-hover transition-colors group opacity-50 hover:opacity-80"
                            >
                              <button
                                onClick={() => playSong(song)}
                                className="flex flex-1 items-center gap-3 min-w-0"
                              >
                                <span className="text-xs w-5 text-right text-text-muted">{i + 1}</span>
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
                                  <p className="text-sm font-medium text-text-primary truncate">{song.title}</p>
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
                          );
                        })}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
