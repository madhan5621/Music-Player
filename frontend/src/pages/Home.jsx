import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Play, Music2, ListMusic, Clock, Heart, TrendingUp, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../store/useAuthStore';
import usePlayerStore from '../store/usePlayerStore';
import { analyticsService } from '../services/apiServices';
import { formatDuration, formatRelativeTime, getInitials, formatHours } from '../utils/formatters';

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.4, ease: 'easeOut' }
  })
};

function SongCard({ song, index, songList }) {
  const { playSong } = usePlayerStore();
  
  return (
    <motion.button
      custom={index}
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      onClick={() => playSong(song, songList)}
      className="group flex-shrink-0 w-40 md:w-44 text-left"
    >
      <div className="relative aspect-square overflow-hidden rounded-2xl bg-bg-card mb-3 shadow-lg">
        {song.coverImage ? (
          <img src={song.coverImage} alt={song.title} className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105" />
        ) : (
          <div className="flex h-full w-full items-center justify-center gradient-mesh">
            <Music2 className="h-10 w-10 text-accent/30" />
          </div>
        )}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors" />
        <div className="absolute bottom-2 right-2 flex h-10 w-10 items-center justify-center rounded-full bg-accent text-bg-primary opacity-0 group-hover:opacity-100 transition-all duration-200 translate-y-2 group-hover:translate-y-0 shadow-xl">
          <Play className="h-4 w-4 ml-0.5" fill="currentColor" />
        </div>
      </div>
      <p className="text-sm font-semibold text-text-primary truncate">{song.title}</p>
      <p className="text-xs text-text-secondary truncate mt-0.5">{song.artist}</p>
    </motion.button>
  );
}

function StatCard({ icon: Icon, label, value, color = 'accent' }) {
  return (
    <div className="glass-light rounded-2xl p-4 flex items-center gap-3">
      <div className={`flex h-10 w-10 items-center justify-center rounded-xl bg-${color}/15`}>
        <Icon className={`h-5 w-5 text-${color}`} />
      </div>
      <div>
        <p className="text-lg font-bold text-text-primary">{value}</p>
        <p className="text-xs text-text-muted">{label}</p>
      </div>
    </div>
  );
}

export default function Home() {
  const { user } = useAuthStore();
  const { playSong } = usePlayerStore();
  const [recentSongs, setRecentSongs] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const loadData = async () => {
      try {
        const [recentRes, recsRes, statsRes] = await Promise.allSettled([
          analyticsService.getRecent(20),
          analyticsService.getRecommendations(),
          analyticsService.getStats()
        ]);
        
        if (recentRes.status === 'fulfilled') setRecentSongs(recentRes.value.data.songs || []);
        if (recsRes.status === 'fulfilled') setRecommendations(recsRes.value.data.recommendations || []);
        if (statsRes.status === 'fulfilled') setStats(statsRes.value.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Welcome Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-accent/10 via-bg-card to-bg-card p-6 md:p-8"
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-accent/5 rounded-full blur-3xl" />
        <div className="relative flex items-center gap-4">
          <div className="flex h-14 w-14 md:h-16 md:w-16 items-center justify-center rounded-2xl bg-accent/20 text-xl font-bold text-accent flex-shrink-0">
            {user?.avatar ? (
              <img src={user.avatar} alt="" className="h-full w-full rounded-2xl object-cover" />
            ) : (
              getInitials(user?.name)
            )}
          </div>
          <div>
            <p className="text-sm text-text-secondary">{greeting()}</p>
            <h1 className="text-2xl md:text-3xl font-bold text-text-primary">{user?.name}</h1>
          </div>
        </div>

        {/* Quick Stats */}
        {stats && (
          <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-3">
            <StatCard icon={Music2} label="Total Songs" value={stats.totalSongs || 0} />
            <StatCard icon={Clock} label="Hours Listened" value={formatHours(stats.totalListeningHours || 0)} />
            <StatCard icon={TrendingUp} label="Played Today" value={stats.songsPlayedToday || 0} />
            <StatCard icon={Heart} label="Top Artist" value={stats.favoriteArtist || 'N/A'} />
          </div>
        )}
      </motion.div>

      {/* Recently Played */}
      {recentSongs.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-text-primary">Recently Played</h2>
            <button onClick={() => navigate('/library')} className="text-sm text-text-secondary hover:text-accent transition-colors flex items-center gap-1">
              See All <ChevronRight className="h-4 w-4" />
            </button>
          </div>
          <div className="flex gap-4 overflow-x-auto no-scrollbar pb-2">
            {recentSongs.slice(0, 10).map((song, i) => (
              <SongCard key={song._id} song={song} index={i} songList={recentSongs} />
            ))}
          </div>
        </section>
      )}

      {/* Recommendations */}
      {recommendations.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-text-primary">Recommended For You</h2>
          </div>
          <div className="flex gap-4 overflow-x-auto no-scrollbar pb-2">
            {recommendations.slice(0, 10).map((song, i) => (
              <SongCard key={song._id} song={song} index={i} songList={recommendations} />
            ))}
          </div>
        </section>
      )}

      {/* Quick Access */}
      <section>
        <h2 className="text-xl font-bold text-text-primary mb-4">Quick Access</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {[
            { label: 'Favorites', icon: Heart, to: '/favorites', color: 'from-rose-500/20 to-pink-500/10' },
            { label: 'Playlists', icon: ListMusic, to: '/playlists', color: 'from-accent/20 to-cyan-500/10' },
            { label: 'All Songs', icon: Music2, to: '/library', color: 'from-violet-500/20 to-purple-500/10' },
          ].map(({ label, icon: Icon, to, color }) => (
            <motion.button
              key={to}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate(to)}
              className={`flex items-center gap-3 rounded-2xl bg-gradient-to-r ${color} p-4 text-left hover:shadow-lg transition-shadow`}
            >
              <Icon className="h-5 w-5 text-text-primary flex-shrink-0" />
              <span className="text-sm font-semibold text-text-primary">{label}</span>
            </motion.button>
          ))}
        </div>
      </section>

      {/* Empty State */}
      {!loading && recentSongs.length === 0 && recommendations.length === 0 && (
        <div className="text-center py-16">
          <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-3xl bg-accent/10">
            <Music2 className="h-10 w-10 text-accent/50" />
          </div>
          <h3 className="text-xl font-bold text-text-primary mb-2">Welcome to Madhan Music!</h3>
          <p className="text-text-secondary mb-6">Start by adding some songs to your library</p>
          <button
            onClick={() => navigate('/admin')}
            className="rounded-xl bg-accent px-6 py-3 text-sm font-semibold text-bg-primary hover:bg-accent-hover transition-colors"
          >
            Add Songs
          </button>
        </div>
      )}
    </div>
  );
}
