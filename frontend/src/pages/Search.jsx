import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search as SearchIcon, Music2, Disc3, Mic2, ListMusic, X, Clock } from 'lucide-react';
import usePlayerStore from '../store/usePlayerStore';
import { searchService } from '../services/apiServices';
import { useDebounce, useLocalStorage } from '../hooks/useHooks';
import { formatDuration } from '../utils/formatters';

export default function SearchPage() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState({ songs: [], artists: [], albums: [], playlists: [] });
  const [loading, setLoading] = useState(false);
  const [recentSearches, setRecentSearches] = useLocalStorage('madhan-recent-searches', []);
  const debouncedQuery = useDebounce(query, 250);
  const { playSong } = usePlayerStore();

  useEffect(() => {
    if (!debouncedQuery.trim()) {
      setResults({ songs: [], artists: [], albums: [], playlists: [] });
      return;
    }

    const doSearch = async () => {
      setLoading(true);
      try {
        const res = await searchService.search(debouncedQuery);
        setResults(res.data);
        
        // Save to recent searches
        setRecentSearches(prev => {
          const filtered = prev.filter(s => s !== debouncedQuery);
          return [debouncedQuery, ...filtered].slice(0, 8);
        });
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    doSearch();
  }, [debouncedQuery]);

  const hasResults = results.songs?.length > 0 || results.artists?.length > 0 || results.albums?.length > 0;

  return (
    <div className="space-y-6 animate-fade-in">
      <h1 className="text-2xl md:text-3xl font-bold text-text-primary">Search</h1>

      {/* Search Input */}
      <div className="relative">
        <SearchIcon className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-text-muted" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="What do you want to listen to?"
          autoFocus
          className="w-full rounded-2xl border border-border bg-bg-card px-12 py-4 text-base text-text-primary placeholder-text-muted outline-none focus:border-accent transition-colors"
        />
        {query && (
          <button onClick={() => setQuery('')} className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full p-1 hover:bg-bg-hover">
            <X className="h-4 w-4 text-text-muted" />
          </button>
        )}
      </div>

      {/* Recent Searches */}
      {!query && recentSearches.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-text-secondary">Recent Searches</h3>
            <button onClick={() => setRecentSearches([])} className="text-xs text-text-muted hover:text-accent">Clear all</button>
          </div>
          <div className="flex flex-wrap gap-2">
            {recentSearches.map(term => (
              <button
                key={term}
                onClick={() => setQuery(term)}
                className="flex items-center gap-2 rounded-full bg-bg-card px-4 py-2 text-sm text-text-secondary hover:bg-bg-hover transition-colors"
              >
                <Clock className="h-3.5 w-3.5" />
                {term}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Results */}
      {hasResults && (
        <div className="space-y-8">
          {/* Songs */}
          {results.songs?.length > 0 && (
            <section>
              <h3 className="text-lg font-bold text-text-primary mb-3 flex items-center gap-2">
                <Music2 className="h-5 w-5 text-accent" />
                Songs
              </h3>
              <div className="space-y-1">
                {results.songs.map(song => (
                  <button
                    key={song._id}
                    onClick={() => playSong(song, results.songs)}
                    className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left hover:bg-bg-hover transition-colors"
                  >
                    <div className="h-11 w-11 flex-shrink-0 overflow-hidden rounded-lg bg-bg-card">
                      {song.coverImage ? (
                        <img src={song.coverImage} alt="" className="h-full w-full object-cover" />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center gradient-mesh">
                          <Music2 className="h-4 w-4 text-text-muted" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-text-primary truncate">{song.title}</p>
                      <p className="text-xs text-text-muted truncate">{song.artist} • {song.album}</p>
                    </div>
                    <span className="text-xs text-text-muted">{formatDuration(song.duration)}</span>
                  </button>
                ))}
              </div>
            </section>
          )}

          {/* Artists */}
          {results.artists?.length > 0 && (
            <section>
              <h3 className="text-lg font-bold text-text-primary mb-3 flex items-center gap-2">
                <Mic2 className="h-5 w-5 text-accent" />
                Artists
              </h3>
              <div className="flex gap-4 overflow-x-auto no-scrollbar">
                {results.artists.map(artist => (
                  <div key={artist._id} className="flex-shrink-0 text-center w-28">
                    <div className="h-24 w-24 mx-auto rounded-full bg-bg-card overflow-hidden mb-2">
                      {artist.coverImage ? (
                        <img src={artist.coverImage} alt="" className="h-full w-full object-cover" />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center gradient-mesh">
                          <Mic2 className="h-8 w-8 text-accent/30" />
                        </div>
                      )}
                    </div>
                    <p className="text-sm font-medium text-text-primary truncate">{artist._id}</p>
                    <p className="text-xs text-text-muted">{artist.songCount} songs</p>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Albums */}
          {results.albums?.length > 0 && (
            <section>
              <h3 className="text-lg font-bold text-text-primary mb-3 flex items-center gap-2">
                <Disc3 className="h-5 w-5 text-accent" />
                Albums
              </h3>
              <div className="flex gap-4 overflow-x-auto no-scrollbar">
                {results.albums.map(album => (
                  <div key={album._id} className="flex-shrink-0 w-36">
                    <div className="aspect-square rounded-2xl bg-bg-card overflow-hidden mb-2">
                      {album.coverImage ? (
                        <img src={album.coverImage} alt="" className="h-full w-full object-cover" />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center gradient-mesh">
                          <Disc3 className="h-8 w-8 text-accent/30" />
                        </div>
                      )}
                    </div>
                    <p className="text-sm font-medium text-text-primary truncate">{album._id}</p>
                    <p className="text-xs text-text-muted truncate">{album.artist} • {album.songCount} songs</p>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      )}

      {/* No Results */}
      {query && !loading && !hasResults && (
        <div className="text-center py-16">
          <SearchIcon className="h-14 w-14 mx-auto mb-4 text-text-muted opacity-30" />
          <p className="text-lg font-semibold text-text-primary">No results for "{query}"</p>
          <p className="text-sm text-text-secondary mt-1">Try different keywords</p>
        </div>
      )}
    </div>
  );
}
