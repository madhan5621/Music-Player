import { create } from 'zustand';
import { API_BASE_URL } from '../utils/constants';
import { analyticsService } from '../services/apiServices';

const usePlayerStore = create((set, get) => ({
  // State
  currentSong: null,
  queue: [],
  queueIndex: -1,
  isPlaying: false,
  volume: Number(localStorage.getItem('madhan-music-volume') || 0.8),
  progress: 0,
  duration: 0,
  buffered: 0,
  shuffle: false,
  repeat: 'none', // 'none', 'one', 'all'
  playbackSpeed: 1,
  showFullScreen: false,
  audioElement: null,

  // Initialize audio element
  initAudio: () => {
    if (get().audioElement) return;
    const audio = new Audio();
    audio.volume = get().volume;
    audio.preload = 'auto';

    audio.addEventListener('timeupdate', () => {
      set({ progress: audio.currentTime, duration: audio.duration || 0 });
    });

    audio.addEventListener('loadedmetadata', () => {
      set({ duration: audio.duration });
    });

    audio.addEventListener('ended', () => {
      const { repeat, next } = get();
      if (repeat === 'one') {
        audio.currentTime = 0;
        audio.play();
      } else {
        next();
      }
    });

    audio.addEventListener('progress', () => {
      if (audio.buffered.length > 0) {
        set({ buffered: audio.buffered.end(audio.buffered.length - 1) });
      }
    });

    audio.addEventListener('error', (e) => {
      console.error('Audio error:', e);
    });

    set({ audioElement: audio });
  },

  // Actions
  playSong: (song, songList = null) => {
    const { audioElement, initAudio, currentSong } = get();
    if (!audioElement) {
      initAudio();
    }
    const audio = get().audioElement;
    
    if (songList) {
      const index = songList.findIndex(s => s._id === song._id);
      set({ queue: songList, queueIndex: index >= 0 ? index : 0 });
    }
    
    const streamUrl = `${API_BASE_URL}/api/stream/${song.driveFileId}`;
    
    if (currentSong?._id !== song._id) {
      audio.src = streamUrl;
      set({ currentSong: song, progress: 0, duration: 0 });
    }
    
    audio.play().catch(console.error);
    set({ isPlaying: true });

    // Log to history
    analyticsService.logListening({ songId: song._id, listenDuration: 0, completedPercentage: 0 }).catch(() => {});

    // Update media session
    if ('mediaSession' in navigator) {
      navigator.mediaSession.metadata = new MediaMetadata({
        title: song.title,
        artist: song.artist,
        album: song.album || '',
        artwork: song.coverImage ? [{ src: song.coverImage, sizes: '512x512', type: 'image/jpeg' }] : []
      });
    }
  },

  togglePlay: () => {
    const { audioElement, isPlaying, currentSong } = get();
    if (!audioElement || !currentSong) return;
    
    if (isPlaying) {
      audioElement.pause();
    } else {
      audioElement.play().catch(console.error);
    }
    set({ isPlaying: !isPlaying });
  },

  next: () => {
    const { queue, queueIndex, shuffle, repeat } = get();
    if (queue.length === 0) return;

    let nextIndex;
    if (shuffle) {
      nextIndex = Math.floor(Math.random() * queue.length);
    } else {
      nextIndex = queueIndex + 1;
      if (nextIndex >= queue.length) {
        if (repeat === 'all') nextIndex = 0;
        else { set({ isPlaying: false }); return; }
      }
    }

    set({ queueIndex: nextIndex });
    get().playSong(queue[nextIndex]);
  },

  previous: () => {
    const { queue, queueIndex, audioElement } = get();
    if (queue.length === 0) return;

    // If more than 3 seconds in, restart current song
    if (audioElement && audioElement.currentTime > 3) {
      audioElement.currentTime = 0;
      return;
    }

    let prevIndex = queueIndex - 1;
    if (prevIndex < 0) prevIndex = queue.length - 1;

    set({ queueIndex: prevIndex });
    get().playSong(queue[prevIndex]);
  },

  seekTo: (time) => {
    const { audioElement } = get();
    if (audioElement) {
      audioElement.currentTime = time;
      set({ progress: time });
    }
  },

  setVolume: (vol) => {
    const { audioElement } = get();
    if (audioElement) audioElement.volume = vol;
    localStorage.setItem('madhan-music-volume', vol);
    set({ volume: vol });
  },

  toggleShuffle: () => set(s => ({ shuffle: !s.shuffle })),
  
  toggleRepeat: () => set(s => {
    const modes = ['none', 'all', 'one'];
    const idx = modes.indexOf(s.repeat);
    return { repeat: modes[(idx + 1) % 3] };
  }),

  setPlaybackSpeed: (speed) => {
    const { audioElement } = get();
    if (audioElement) audioElement.playbackRate = speed;
    set({ playbackSpeed: speed });
  },

  addToQueue: (song) => set(s => {
    // Insert right after the currently playing song (play-next behavior)
    const newQueue = [...s.queue];
    const insertAt = s.queueIndex >= 0 ? s.queueIndex + 1 : newQueue.length;
    newQueue.splice(insertAt, 0, song);
    return { queue: newQueue };
  }),

  addToQueueEnd: (song) => set(s => ({ queue: [...s.queue, song] })),
  
  removeFromQueue: (index) => set(s => {
    const newQueue = [...s.queue];
    newQueue.splice(index, 1);
    // Adjust queueIndex if removing before or at current
    let newIndex = s.queueIndex;
    if (index < s.queueIndex) {
      newIndex = s.queueIndex - 1;
    } else if (index === s.queueIndex) {
      // If we removed the currently playing song, keep same index (next song shifts in)
      newIndex = Math.min(s.queueIndex, newQueue.length - 1);
    }
    return { queue: newQueue, queueIndex: newIndex };
  }),

  moveInQueue: (fromIndex, toIndex) => set(s => {
    if (fromIndex === toIndex) return s;
    const newQueue = [...s.queue];
    const [moved] = newQueue.splice(fromIndex, 1);
    newQueue.splice(toIndex, 0, moved);
    // Adjust queueIndex to track the currently playing song
    let newQueueIndex = s.queueIndex;
    if (s.queueIndex === fromIndex) {
      newQueueIndex = toIndex;
    } else if (fromIndex < s.queueIndex && toIndex >= s.queueIndex) {
      newQueueIndex = s.queueIndex - 1;
    } else if (fromIndex > s.queueIndex && toIndex <= s.queueIndex) {
      newQueueIndex = s.queueIndex + 1;
    }
    return { queue: newQueue, queueIndex: newQueueIndex };
  }),

  clearQueue: () => set({ queue: [], queueIndex: -1 }),

  setShowFullScreen: (show) => set({ showFullScreen: show }),
}));

export default usePlayerStore;
