'use client';

import { useState, useEffect } from 'react';

type Source = {
  id: string;
  name: string;
  url: string;
  type: string;
};

export default function SourcesPage() {
  const [sources, setSources] = useState<Source[]>([]);
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchSources = async () => {
    try {
      const res = await fetch('/api/sources');
      const data = await res.json();
      if (data.success) {
        setSources(data.sources);
      }
    } catch {
      setError('Failed to fetch sources.');
    }
  };

  useEffect(() => {
    let active = true;
    const fetchSourcesInitial = async () => {
      try {
        const res = await fetch('/api/sources');
        const data = await res.json();
        if (data.success && active) {
          setSources(data.sources);
        }
      } catch {
        if (active) setError('Failed to fetch sources.');
      }
    };
    fetchSourcesInitial();
    return () => { active = false; };
  }, []);

  const addSource = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url) return;
    
    setLoading(true);
    setError('');
    
    try {
      const res = await fetch('/api/sources', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url })
      });
      
      const data = await res.json();
      if (data.success) {
        setUrl('');
        fetchSources(); // Refresh list
        // Trigger background fetch to grab initial articles
        fetch('/api/fetch', { method: 'POST' }); 
      } else {
        setError(data.error);
      }
    } catch {
      setError('An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  const deleteSource = async (id: string) => {
    if (!confirm('Are you sure you want to remove this source?')) return;
    
    try {
      const res = await fetch(`/api/sources/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setSources(sources.filter(s => s.id !== id));
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <main className="w-full max-w-5xl mx-auto p-4 md:p-8 pb-20 font-serif">
      <div className="mb-10 text-center md:text-left border-b border-border-subtle pb-6">
        <h1 className="text-3xl md:text-4xl font-bold text-ink tracking-tight">Manage Sources</h1>
        <p className="text-ink-muted mt-3 text-lg font-sans">Add or remove your favorite RSS feeds and YouTube channels.</p>
      </div>
      
      {/* Add Source Form */}
      <section className="bg-card p-6 md:p-8 rounded-sm border border-border-subtle shadow-sm mb-12">
        <h2 className="text-xl font-bold text-ink mb-5 font-serif">
          Subscribe to a New Source
        </h2>
        <form onSubmit={addSource} className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://example.com/rss or YouTube Channel ID (e.g. UC...)"
            required
            className="flex-grow px-4 py-3 bg-paper border border-border-hover rounded-sm text-ink placeholder:text-ink-faint font-sans focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all"
          />
          <button 
            type="submit" 
            disabled={loading}
            className="px-8 py-3 bg-ink text-card font-semibold rounded-sm hover:opacity-80 disabled:opacity-50 transition-colors whitespace-nowrap uppercase tracking-wider text-sm"
          >
            {loading ? 'Adding...' : 'Subscribe'}
          </button>
        </form>
        {error && <p className="text-accent text-sm mt-3 font-medium flex items-center gap-1 font-sans"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg> {error}</p>}
        <p className="text-ink-faint text-sm mt-4 font-sans italic">
          Tip: Paste an RSS feed URL, or simply paste a <strong className="font-semibold">YouTube Channel ID</strong> (e.g., <code className="text-[11px] bg-border-subtle px-1.5 py-0.5 rounded text-ink not-italic">UCHnyfMqiRRG1u-2MsSQLbXA</code>).
        </p>
      </section>

      {/* List of Sources */}
      <section>
        <h2 className="text-xl font-bold text-ink mb-5 font-serif border-b border-border-subtle pb-3">
          Your Subscriptions ({sources.length})
        </h2>
        {sources.length === 0 ? (
          <div className="bg-card border border-border-subtle rounded-sm p-10 text-center text-ink-faint italic">
            Your reading list is currently empty.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {sources.map(source => (
              <div key={source.id} className="bg-card p-5 rounded-sm border border-border-subtle flex items-center justify-between group hover:border-border-hover transition-colors">
                <div className="min-w-0 pr-4">
                  <h3 className="font-bold text-ink truncate text-lg">{source.name}</h3>
                  <p className="text-xs text-ink-faint truncate mt-1 font-sans">{source.url}</p>
                  <span className={`inline-block mt-3 px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.15em] border ${source.type === 'youtube' ? 'bg-card text-accent border-accent/20' : 'bg-card text-ink border-ink/20'}`}>
                    {source.type === 'youtube' ? 'YouTube' : 'RSS / Blog'}
                  </span>
                </div>
                <button 
                  onClick={() => deleteSource(source.id)}
                  className="p-2.5 text-border-hover hover:text-accent transition-colors opacity-100 md:opacity-0 group-hover:opacity-100 flex-shrink-0"
                  title="Remove Source"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"></path><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path></svg>
                </button>
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
