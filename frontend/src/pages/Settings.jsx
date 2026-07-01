import { useState } from 'react';
import { motion } from 'framer-motion';
import { Settings as SettingsIcon, Moon, Sun, Lock, Download, Database, Check } from 'lucide-react';
import useAuthStore from '../store/useAuthStore';
import { authService, songService } from '../services/apiServices';

export default function Settings() {
  const { user, updateUser } = useAuthStore();
  const [theme, setTheme] = useState(user?.theme || 'dark');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [passwordMsg, setPasswordMsg] = useState('');
  const [exporting, setExporting] = useState(false);

  const handleThemeChange = async (newTheme) => {
    setTheme(newTheme);
    try {
      await authService.updateProfile({ theme: newTheme });
      updateUser({ theme: newTheme });
    } catch (err) {}
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    try {
      await authService.changePassword({ currentPassword, newPassword });
      setPasswordMsg('Password updated successfully!');
      setCurrentPassword('');
      setNewPassword('');
      setTimeout(() => setPasswordMsg(''), 3000);
    } catch (err) {
      setPasswordMsg(err.response?.data?.message || 'Failed to change password');
    }
  };

  const handleExport = async () => {
    setExporting(true);
    try {
      const res = await songService.getAll({ limit: 5000 });
      const data = JSON.stringify(res.data.songs, null, 2);
      const blob = new Blob([data], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `madhan-music-backup-${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-text-primary">Settings</h1>
        <p className="text-text-secondary mt-1">Customize your experience</p>
      </div>

      {/* Theme */}
      <div className="glass-light rounded-2xl p-5">
        <h3 className="text-sm font-semibold text-text-secondary mb-4 flex items-center gap-2">
          <Moon className="h-4 w-4" /> Appearance
        </h3>
        <div className="flex gap-3">
          <button
            onClick={() => handleThemeChange('dark')}
            className={`flex-1 rounded-xl p-4 text-center border transition-colors ${
              theme === 'dark' ? 'border-accent bg-accent/10' : 'border-border hover:bg-bg-hover'
            }`}
          >
            <Moon className="h-6 w-6 mx-auto mb-2 text-text-primary" />
            <p className="text-sm font-medium text-text-primary">Dark</p>
            {theme === 'dark' && <Check className="h-4 w-4 text-accent mx-auto mt-1" />}
          </button>
          <button
            onClick={() => handleThemeChange('light')}
            className={`flex-1 rounded-xl p-4 text-center border transition-colors ${
              theme === 'light' ? 'border-accent bg-accent/10' : 'border-border hover:bg-bg-hover'
            }`}
          >
            <Sun className="h-6 w-6 mx-auto mb-2 text-text-primary" />
            <p className="text-sm font-medium text-text-primary">Light</p>
            {theme === 'light' && <Check className="h-4 w-4 text-accent mx-auto mt-1" />}
          </button>
        </div>
      </div>

      {/* Change Password */}
      <div className="glass-light rounded-2xl p-5">
        <h3 className="text-sm font-semibold text-text-secondary mb-4 flex items-center gap-2">
          <Lock className="h-4 w-4" /> Change Password
        </h3>
        <form onSubmit={handlePasswordChange} className="space-y-3">
          <input
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            placeholder="Current password"
            required
            className="w-full rounded-xl border border-border bg-bg-card px-4 py-2.5 text-sm text-text-primary placeholder-text-muted outline-none focus:border-accent"
          />
          <input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="New password (min 6 characters)"
            required
            minLength={6}
            className="w-full rounded-xl border border-border bg-bg-card px-4 py-2.5 text-sm text-text-primary placeholder-text-muted outline-none focus:border-accent"
          />
          {passwordMsg && (
            <p className={`text-sm ${passwordMsg.includes('success') ? 'text-success' : 'text-danger'}`}>
              {passwordMsg}
            </p>
          )}
          <button
            type="submit"
            className="rounded-xl bg-accent px-4 py-2.5 text-sm font-semibold text-bg-primary hover:bg-accent-hover transition-colors"
          >
            Update Password
          </button>
        </form>
      </div>

      {/* Data */}
      <div className="glass-light rounded-2xl p-5">
        <h3 className="text-sm font-semibold text-text-secondary mb-4 flex items-center gap-2">
          <Database className="h-4 w-4" /> Data Management
        </h3>
        <div className="space-y-3">
          <button
            onClick={handleExport}
            disabled={exporting}
            className="flex w-full items-center gap-3 rounded-xl border border-border px-4 py-3 text-sm text-text-primary hover:bg-bg-hover transition-colors"
          >
            <Download className="h-4 w-4 text-accent" />
            <div className="text-left">
              <p className="font-medium">{exporting ? 'Exporting...' : 'Export Library'}</p>
              <p className="text-xs text-text-muted">Download all song metadata as JSON</p>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}
