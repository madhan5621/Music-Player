import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Plus, Upload, FileSpreadsheet, Trash2, Edit3, Save, X, Check, AlertCircle, Music2, Link2, Search } from 'lucide-react';
import { songService } from '../services/apiServices';
import { extractDriveFileId, validateDriveLink } from '../utils/driveUtils';
import { formatDuration, formatDate } from '../utils/formatters';
import { GENRES } from '../utils/constants';

function AddSongForm({ onAdded }) {
  const [form, setForm] = useState({ title: '', artist: '', album: '', genre: '', driveLink: '', coverImage: '', duration: '' });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [linkValid, setLinkValid] = useState(null);

  const handleChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
    if (field === 'driveLink') {
      setLinkValid(value ? validateDriveLink(value) : null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateDriveLink(form.driveLink)) {
      setMessage('Invalid Google Drive link');
      return;
    }
    setLoading(true);
    try {
      const res = await songService.create({
        ...form,
        duration: form.duration ? Number(form.duration) : 0
      });
      setMessage('Song added successfully!');
      setForm({ title: '', artist: '', album: '', genre: '', driveLink: '', coverImage: '', duration: '' });
      setLinkValid(null);
      onAdded?.(res.data.song);
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      setMessage(err.response?.data?.message || 'Failed to add song');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-text-muted mb-1">Song Title *</label>
          <input type="text" required value={form.title} onChange={(e) => handleChange('title', e.target.value)}
            placeholder="Song name" className="w-full rounded-xl border border-border bg-bg-card px-4 py-2.5 text-sm text-text-primary placeholder-text-muted outline-none focus:border-accent" />
        </div>
        <div>
          <label className="block text-xs font-medium text-text-muted mb-1">Artist *</label>
          <input type="text" required value={form.artist} onChange={(e) => handleChange('artist', e.target.value)}
            placeholder="Artist name" className="w-full rounded-xl border border-border bg-bg-card px-4 py-2.5 text-sm text-text-primary placeholder-text-muted outline-none focus:border-accent" />
        </div>
        <div>
          <label className="block text-xs font-medium text-text-muted mb-1">Album</label>
          <input type="text" value={form.album} onChange={(e) => handleChange('album', e.target.value)}
            placeholder="Album name" className="w-full rounded-xl border border-border bg-bg-card px-4 py-2.5 text-sm text-text-primary placeholder-text-muted outline-none focus:border-accent" />
        </div>
        <div>
          <label className="block text-xs font-medium text-text-muted mb-1">Genre</label>
          <select value={form.genre} onChange={(e) => handleChange('genre', e.target.value)}
            className="w-full rounded-xl border border-border bg-bg-card px-4 py-2.5 text-sm text-text-primary outline-none focus:border-accent">
            <option value="">Select genre</option>
            {GENRES.map(g => <option key={g} value={g}>{g}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-text-muted mb-1">Duration (seconds)</label>
          <input type="number" value={form.duration} onChange={(e) => handleChange('duration', e.target.value)}
            placeholder="e.g. 240" className="w-full rounded-xl border border-border bg-bg-card px-4 py-2.5 text-sm text-text-primary placeholder-text-muted outline-none focus:border-accent" />
        </div>
        <div>
          <label className="block text-xs font-medium text-text-muted mb-1">Cover Image URL</label>
          <input type="url" value={form.coverImage} onChange={(e) => handleChange('coverImage', e.target.value)}
            placeholder="https://..." className="w-full rounded-xl border border-border bg-bg-card px-4 py-2.5 text-sm text-text-primary placeholder-text-muted outline-none focus:border-accent" />
        </div>
      </div>
      <div>
        <label className="block text-xs font-medium text-text-muted mb-1">Google Drive Link *</label>
        <div className="relative">
          <Link2 className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
          <input type="text" required value={form.driveLink} onChange={(e) => handleChange('driveLink', e.target.value)}
            placeholder="https://drive.google.com/file/d/..." className="w-full rounded-xl border border-border bg-bg-card pl-10 pr-10 py-2.5 text-sm text-text-primary placeholder-text-muted outline-none focus:border-accent" />
          {linkValid !== null && (
            <div className="absolute right-3.5 top-1/2 -translate-y-1/2">
              {linkValid ? <Check className="h-4 w-4 text-success" /> : <AlertCircle className="h-4 w-4 text-danger" />}
            </div>
          )}
        </div>
        {form.driveLink && linkValid && (
          <p className="text-xs text-success mt-1">✓ File ID: {extractDriveFileId(form.driveLink)}</p>
        )}
      </div>
      {message && (
        <p className={`text-sm ${message.includes('success') ? 'text-success' : 'text-danger'}`}>{message}</p>
      )}
      <button type="submit" disabled={loading}
        className="rounded-xl bg-accent px-6 py-2.5 text-sm font-semibold text-bg-primary hover:bg-accent-hover disabled:opacity-50 transition-colors flex items-center gap-2">
        <Plus className="h-4 w-4" /> {loading ? 'Adding...' : 'Add Song'}
      </button>
    </form>
  );
}

function BulkImport({ onImported }) {
  const [text, setText] = useState('');
  const [parsedSongs, setParsedSongs] = useState([]);
  const [importing, setImporting] = useState(false);
  const [message, setMessage] = useState('');

  const parseLinks = () => {
    const lines = text.split('\n').filter(l => l.trim());
    const songs = lines.map((line, i) => {
      const parts = line.split('|').map(s => s.trim());
      const link = parts.find(p => p.includes('drive.google.com') || p.length > 25) || parts[parts.length - 1];
      const fileId = extractDriveFileId(link);
      return {
        title: parts[0] || `Song ${i + 1}`,
        artist: parts[1] || 'Unknown',
        album: parts[2] || '',
        genre: parts[3] || '',
        driveLink: link,
        valid: !!fileId,
        fileId
      };
    });
    setParsedSongs(songs);
  };

  const handleImport = async () => {
    const validSongs = parsedSongs.filter(s => s.valid);
    if (validSongs.length === 0) return;
    setImporting(true);
    try {
      const res = await songService.bulkCreate(validSongs);
      setMessage(`Successfully imported ${res.data.count} songs!`);
      setText('');
      setParsedSongs([]);
      onImported?.();
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      setMessage(err.response?.data?.message || 'Import failed');
    } finally {
      setImporting(false);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-xs font-medium text-text-muted mb-2">
          Paste songs (format: Title | Artist | Album | Genre | Drive Link)
        </label>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={6}
          placeholder={`Song Title | Artist Name | Album | Pop | https://drive.google.com/file/d/...\nAnother Song | Another Artist | Album | Rock | https://drive.google.com/file/d/...`}
          className="w-full rounded-xl border border-border bg-bg-card px-4 py-3 text-sm text-text-primary placeholder-text-muted outline-none focus:border-accent font-mono"
        />
      </div>
      <div className="flex gap-2">
        <button onClick={parseLinks} className="rounded-xl border border-border px-4 py-2 text-sm text-text-secondary hover:bg-bg-hover transition-colors">
          Parse Links
        </button>
        {parsedSongs.length > 0 && (
          <button onClick={handleImport} disabled={importing}
            className="rounded-xl bg-accent px-4 py-2 text-sm font-semibold text-bg-primary hover:bg-accent-hover disabled:opacity-50 transition-colors">
            {importing ? 'Importing...' : `Import ${parsedSongs.filter(s => s.valid).length} Songs`}
          </button>
        )}
      </div>
      {parsedSongs.length > 0 && (
        <div className="max-h-48 overflow-y-auto space-y-1">
          {parsedSongs.map((song, i) => (
            <div key={i} className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm ${song.valid ? 'bg-success/10' : 'bg-danger/10'}`}>
              {song.valid ? <Check className="h-4 w-4 text-success flex-shrink-0" /> : <AlertCircle className="h-4 w-4 text-danger flex-shrink-0" />}
              <span className="text-text-primary truncate">{song.title}</span>
              <span className="text-text-muted">—</span>
              <span className="text-text-secondary truncate">{song.artist}</span>
            </div>
          ))}
        </div>
      )}
      {message && <p className={`text-sm ${message.includes('success') ? 'text-success' : 'text-danger'}`}>{message}</p>}
    </div>
  );
}

function CSVImport({ onImported }) {
  const [message, setMessage] = useState('');
  const [importing, setImporting] = useState(false);

  const handleFile = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    const text = await file.text();
    const lines = text.split('\n').filter(l => l.trim());
    const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
    
    const songs = lines.slice(1).map(line => {
      const values = line.split(',').map(v => v.trim().replace(/^"|"$/g, ''));
      const obj = {};
      headers.forEach((h, i) => { obj[h] = values[i] || ''; });
      return {
        title: obj.title || obj.name || 'Unknown',
        artist: obj.artist || 'Unknown',
        album: obj.album || '',
        genre: obj.genre || '',
        driveLink: obj.drivelink || obj.drive_link || obj.link || obj.url || '',
        coverImage: obj.coverimage || obj.cover || '',
        duration: Number(obj.duration) || 0
      };
    }).filter(s => validateDriveLink(s.driveLink));

    if (songs.length === 0) {
      setMessage('No valid songs found in CSV');
      return;
    }

    setImporting(true);
    try {
      const res = await songService.bulkCreate(songs);
      setMessage(`Imported ${res.data.count} songs from CSV!`);
      onImported?.();
    } catch (err) {
      setMessage(err.response?.data?.message || 'Import failed');
    } finally {
      setImporting(false);
    }
  };

  return (
    <div className="space-y-3">
      <p className="text-xs text-text-muted">CSV headers: title, artist, album, genre, driveLink, coverImage, duration</p>
      <label className="flex items-center gap-3 rounded-xl border border-dashed border-border px-4 py-6 cursor-pointer hover:bg-bg-hover transition-colors text-center justify-center">
        <FileSpreadsheet className="h-5 w-5 text-accent" />
        <span className="text-sm text-text-secondary">{importing ? 'Importing...' : 'Choose CSV File'}</span>
        <input type="file" accept=".csv" onChange={handleFile} className="hidden" />
      </label>
      {message && <p className={`text-sm ${message.includes('Imported') ? 'text-success' : 'text-danger'}`}>{message}</p>}
    </div>
  );
}

export default function Admin() {
  const [songs, setSongs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('single');
  const [search, setSearch] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({});

  const loadSongs = async () => {
    try {
      const res = await songService.getAll({ limit: 500, sort: '-createdAt' });
      setSongs(res.data.songs || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadSongs(); }, []);

  const handleDelete = async (id) => {
    if (!confirm('Delete this song?')) return;
    try {
      await songService.delete(id);
      setSongs(prev => prev.filter(s => s._id !== id));
    } catch (err) {}
  };

  const handleEdit = (song) => {
    setEditingId(song._id);
    setEditForm({ title: song.title, artist: song.artist, album: song.album, genre: song.genre });
  };

  const handleSaveEdit = async (id) => {
    try {
      const res = await songService.update(id, editForm);
      setSongs(prev => prev.map(s => s._id === id ? res.data.song : s));
      setEditingId(null);
    } catch (err) {}
  };

  const filteredSongs = songs.filter(s =>
    s.title.toLowerCase().includes(search.toLowerCase()) ||
    s.artist.toLowerCase().includes(search.toLowerCase())
  );

  const tabs = [
    { id: 'single', label: 'Add Song', icon: Plus },
    { id: 'bulk', label: 'Bulk Import', icon: Upload },
    { id: 'csv', label: 'CSV Import', icon: FileSpreadsheet },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-text-primary flex items-center gap-3">
          <Shield className="h-7 w-7 text-accent" />
          Admin
        </h1>
        <p className="text-text-secondary mt-1">Manage your music library</p>
      </div>

      {/* Import Tabs */}
      <div className="glass-light rounded-2xl overflow-hidden">
        <div className="flex border-b border-border">
          {tabs.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium transition-colors ${
                activeTab === id ? 'text-accent border-b-2 border-accent bg-accent/5' : 'text-text-secondary hover:bg-bg-hover'
              }`}
            >
              <Icon className="h-4 w-4" />
              <span className="hidden sm:inline">{label}</span>
            </button>
          ))}
        </div>
        <div className="p-5">
          {activeTab === 'single' && <AddSongForm onAdded={(song) => setSongs(prev => [song, ...prev])} />}
          {activeTab === 'bulk' && <BulkImport onImported={loadSongs} />}
          {activeTab === 'csv' && <CSVImport onImported={loadSongs} />}
        </div>
      </div>

      {/* Song Manager */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-text-primary">Song Manager ({songs.length})</h2>
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search songs..."
              className="w-full rounded-xl border border-border bg-bg-card pl-9 pr-3 py-2 text-sm text-text-primary placeholder-text-muted outline-none focus:border-accent"
            />
          </div>
        </div>

        <div className="overflow-x-auto rounded-2xl border border-border">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-bg-secondary text-text-muted text-xs uppercase tracking-wider">
                <th className="px-4 py-3 text-left">Song</th>
                <th className="px-4 py-3 text-left hidden md:table-cell">Album</th>
                <th className="px-4 py-3 text-left hidden lg:table-cell">Genre</th>
                <th className="px-4 py-3 text-left hidden lg:table-cell">Added</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredSongs.map(song => (
                <tr key={song._id} className="hover:bg-bg-hover transition-colors">
                  <td className="px-4 py-3">
                    {editingId === song._id ? (
                      <div className="space-y-1">
                        <input value={editForm.title} onChange={(e) => setEditForm(p => ({ ...p, title: e.target.value }))}
                          className="w-full rounded border border-border bg-bg-card px-2 py-1 text-sm text-text-primary outline-none" />
                        <input value={editForm.artist} onChange={(e) => setEditForm(p => ({ ...p, artist: e.target.value }))}
                          className="w-full rounded border border-border bg-bg-card px-2 py-1 text-xs text-text-secondary outline-none" />
                      </div>
                    ) : (
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 flex-shrink-0 rounded-lg overflow-hidden bg-bg-card">
                          {song.coverImage ? (
                            <img src={song.coverImage} alt="" className="h-full w-full object-cover" />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center gradient-mesh">
                              <Music2 className="h-3.5 w-3.5 text-text-muted" />
                            </div>
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium text-text-primary truncate">{song.title}</p>
                          <p className="text-xs text-text-muted truncate">{song.artist}</p>
                        </div>
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3 text-text-secondary hidden md:table-cell">
                    {editingId === song._id ? (
                      <input value={editForm.album} onChange={(e) => setEditForm(p => ({ ...p, album: e.target.value }))}
                        className="w-full rounded border border-border bg-bg-card px-2 py-1 text-sm text-text-primary outline-none" />
                    ) : (
                      <span className="truncate block max-w-32">{song.album}</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-text-muted hidden lg:table-cell">{song.genre}</td>
                  <td className="px-4 py-3 text-text-muted text-xs hidden lg:table-cell">{formatDate(song.createdAt)}</td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      {editingId === song._id ? (
                        <>
                          <button onClick={() => handleSaveEdit(song._id)} className="rounded-lg p-1.5 text-success hover:bg-success/10"><Save className="h-4 w-4" /></button>
                          <button onClick={() => setEditingId(null)} className="rounded-lg p-1.5 text-text-muted hover:bg-bg-hover"><X className="h-4 w-4" /></button>
                        </>
                      ) : (
                        <>
                          <button onClick={() => handleEdit(song)} className="rounded-lg p-1.5 text-text-muted hover:bg-bg-hover hover:text-accent"><Edit3 className="h-4 w-4" /></button>
                          <button onClick={() => handleDelete(song._id)} className="rounded-lg p-1.5 text-text-muted hover:bg-bg-hover hover:text-danger"><Trash2 className="h-4 w-4" /></button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredSongs.length === 0 && (
            <div className="text-center py-12 text-text-muted text-sm">
              {search ? 'No matching songs' : 'No songs yet. Add some above!'}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
