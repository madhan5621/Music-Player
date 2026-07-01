import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BarChart3, Clock, Music2, Mic2, Disc3, TrendingUp, Calendar } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area } from 'recharts';
import { analyticsService } from '../services/apiServices';
import { formatHours } from '../utils/formatters';

const CHART_COLORS = ['#00E5FF', '#7C3AED', '#F59E0B', '#22C55E', '#EF4444', '#EC4899', '#06B6D4', '#8B5CF6'];

function StatCard({ icon: Icon, label, value, subtitle, gradient }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${gradient} p-5`}
    >
      <div className="absolute top-0 right-0 w-20 h-20 bg-white/5 rounded-full blur-2xl" />
      <Icon className="h-5 w-5 text-text-secondary mb-3" />
      <p className="text-2xl font-bold text-text-primary">{value}</p>
      <p className="text-sm text-text-secondary mt-0.5">{label}</p>
      {subtitle && <p className="text-xs text-text-muted mt-1">{subtitle}</p>}
    </motion.div>
  );
}

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="glass rounded-xl px-3 py-2 text-xs">
      <p className="text-text-secondary">{label}</p>
      <p className="text-accent font-semibold">{payload[0].value}</p>
    </div>
  );
};

export default function Analytics() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await analyticsService.getStats();
        setStats(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!stats) return null;

  const dailyData = stats.dailyActivity?.map(d => ({
    date: d._id.slice(5),
    plays: d.count
  })) || [];

  const genreData = stats.genreDistribution?.map((g, i) => ({
    name: g._id,
    value: g.count,
    color: CHART_COLORS[i % CHART_COLORS.length]
  })) || [];

  const artistData = stats.artistDistribution?.map(a => ({
    name: a._id.length > 12 ? a._id.slice(0, 12) + '…' : a._id,
    plays: a.count
  })) || [];

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-text-primary">Analytics</h1>
        <p className="text-text-secondary mt-1">Your listening insights</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard icon={Clock} label="Total Hours" value={formatHours(stats.totalListeningHours)} gradient="from-accent/15 to-cyan-500/5" />
        <StatCard icon={Music2} label="Total Songs" value={stats.totalSongs} gradient="from-violet-500/15 to-purple-500/5" />
        <StatCard icon={TrendingUp} label="Played Today" value={stats.songsPlayedToday} gradient="from-amber-500/15 to-yellow-500/5" />
        <StatCard icon={Mic2} label="Top Artist" value={stats.favoriteArtist} gradient="from-rose-500/15 to-pink-500/5" />
      </div>

      {/* Most Played */}
      {stats.mostPlayedSong && (
        <div className="glass-light rounded-2xl p-5 flex items-center gap-4">
          <div className="h-16 w-16 flex-shrink-0 rounded-xl overflow-hidden bg-bg-card">
            {stats.mostPlayedSong.coverImage ? (
              <img src={stats.mostPlayedSong.coverImage} alt="" className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center gradient-mesh">
                <Music2 className="h-6 w-6 text-accent/30" />
              </div>
            )}
          </div>
          <div>
            <p className="text-xs text-text-muted uppercase tracking-wider">Most Played</p>
            <p className="text-base font-bold text-text-primary">{stats.mostPlayedSong.title}</p>
            <p className="text-sm text-text-secondary">{stats.mostPlayedSong.artist} • {stats.mostPlayedSong.playCount} plays</p>
          </div>
        </div>
      )}

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Daily Activity */}
        {dailyData.length > 0 && (
          <div className="glass-light rounded-2xl p-5">
            <h3 className="text-sm font-semibold text-text-secondary mb-4 flex items-center gap-2">
              <Calendar className="h-4 w-4" /> Daily Activity (Last 7 Days)
            </h3>
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={dailyData}>
                <defs>
                  <linearGradient id="colorPlays" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#00E5FF" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#00E5FF" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#71717A' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#71717A' }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="plays" stroke="#00E5FF" fill="url(#colorPlays)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Genre Distribution */}
        {genreData.length > 0 && (
          <div className="glass-light rounded-2xl p-5">
            <h3 className="text-sm font-semibold text-text-secondary mb-4 flex items-center gap-2">
              <Disc3 className="h-4 w-4" /> Genre Distribution
            </h3>
            <div className="flex items-center justify-center">
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie data={genreData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={3} dataKey="value">
                    {genreData.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-2 flex flex-wrap gap-2 justify-center">
              {genreData.map((g, i) => (
                <span key={i} className="flex items-center gap-1.5 text-xs text-text-muted">
                  <span className="h-2 w-2 rounded-full" style={{ backgroundColor: g.color }} />
                  {g.name}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Top Artists */}
        {artistData.length > 0 && (
          <div className="glass-light rounded-2xl p-5 lg:col-span-2">
            <h3 className="text-sm font-semibold text-text-secondary mb-4 flex items-center gap-2">
              <Mic2 className="h-4 w-4" /> Top Artists
            </h3>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={artistData}>
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#71717A' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#71717A' }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="plays" fill="#00E5FF" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Empty Analytics */}
      {!dailyData.length && !genreData.length && (
        <div className="text-center py-16">
          <BarChart3 className="h-16 w-16 mx-auto mb-4 text-text-muted opacity-20" />
          <h3 className="text-lg font-semibold text-text-primary mb-1">No analytics yet</h3>
          <p className="text-sm text-text-secondary">Start listening to see your stats</p>
        </div>
      )}
    </div>
  );
}
