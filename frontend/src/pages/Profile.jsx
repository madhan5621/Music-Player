import { useState } from 'react';
import { motion } from 'framer-motion';
import { User, Mail, Calendar, Music2, Clock, Edit3, Save, X } from 'lucide-react';
import useAuthStore from '../store/useAuthStore';
import { authService } from '../services/apiServices';
import { formatDate, getInitials } from '../utils/formatters';

export default function Profile() {
  const { user, updateUser } = useAuthStore();
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(user?.name || '');
  const [avatar, setAvatar] = useState(user?.avatar || '');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await authService.updateProfile({ name, avatar });
      updateUser(res.data.user);
      setEditing(false);
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
      <h1 className="text-2xl md:text-3xl font-bold text-text-primary">Profile</h1>

      {/* Profile Card */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-accent/10 via-bg-card to-bg-card">
        <div className="absolute top-0 right-0 w-64 h-64 bg-accent/5 rounded-full blur-3xl" />
        <div className="relative p-6 md:p-8">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
            {/* Avatar */}
            <div className="flex h-24 w-24 items-center justify-center rounded-3xl bg-accent/20 text-3xl font-bold text-accent flex-shrink-0 shadow-xl">
              {user?.avatar ? (
                <img src={user.avatar} alt="" className="h-full w-full rounded-3xl object-cover" />
              ) : (
                getInitials(user?.name)
              )}
            </div>

            <div className="flex-1 text-center md:text-left">
              {editing ? (
                <div className="space-y-3">
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full rounded-xl border border-border bg-bg-card px-4 py-2.5 text-sm text-text-primary outline-none focus:border-accent"
                    placeholder="Name"
                  />
                  <input
                    type="url"
                    value={avatar}
                    onChange={(e) => setAvatar(e.target.value)}
                    className="w-full rounded-xl border border-border bg-bg-card px-4 py-2.5 text-sm text-text-primary outline-none focus:border-accent"
                    placeholder="Avatar URL"
                  />
                  <div className="flex gap-2">
                    <button onClick={handleSave} disabled={saving} className="rounded-xl bg-accent px-4 py-2 text-sm font-semibold text-bg-primary hover:bg-accent-hover flex items-center gap-1.5">
                      <Save className="h-4 w-4" /> {saving ? 'Saving...' : 'Save'}
                    </button>
                    <button onClick={() => setEditing(false)} className="rounded-xl border border-border px-4 py-2 text-sm text-text-secondary hover:bg-bg-hover flex items-center gap-1.5">
                      <X className="h-4 w-4" /> Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <h2 className="text-2xl font-bold text-text-primary">{user?.name}</h2>
                  <p className="text-text-secondary mt-1">{user?.email}</p>
                  <p className="text-sm text-text-muted mt-1 flex items-center gap-1.5 justify-center md:justify-start">
                    <Calendar className="h-3.5 w-3.5" />
                    Joined {formatDate(user?.createdAt)}
                  </p>
                  <button
                    onClick={() => setEditing(true)}
                    className="mt-4 rounded-xl border border-border px-4 py-2 text-sm text-text-secondary hover:bg-bg-hover flex items-center gap-1.5"
                  >
                    <Edit3 className="h-4 w-4" /> Edit Profile
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Info Cards */}
      <div className="grid grid-cols-2 gap-3">
        <div className="glass-light rounded-2xl p-4 text-center">
          <User className="h-5 w-5 text-accent mx-auto mb-2" />
          <p className="text-xs text-text-muted">Name</p>
          <p className="text-sm font-semibold text-text-primary mt-0.5">{user?.name}</p>
        </div>
        <div className="glass-light rounded-2xl p-4 text-center">
          <Mail className="h-5 w-5 text-accent mx-auto mb-2" />
          <p className="text-xs text-text-muted">Email</p>
          <p className="text-sm font-semibold text-text-primary mt-0.5 truncate">{user?.email}</p>
        </div>
      </div>
    </div>
  );
}
