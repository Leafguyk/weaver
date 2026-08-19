'use client';

import { useState, useMemo } from 'react';
import { formatDistanceToNow } from 'date-fns';

type ItemWithSource = {
  id: string;
  title: string;
  link: string;
  contentSnippet: string | null;
  publishedAt: Date;
  thumbnailUrl: string | null;
  isSaved: boolean;
  isRead: boolean;
  source: {
    id: string;
    name: string;
    type: string;
  };
};

export default function FeedList({ initialItems }: { initialItems: ItemWithSource[] }) {
  const [items, setItems] = useState(initialItems);
  const [filterType, setFilterType] = useState<'all' | 'text' | 'video'>('all');
  const [filterSource, setFilterSource] = useState<string>('all');

  const uniqueSources = useMemo(() => {
    const sourcesMap = new Map();
    initialItems.forEach(item => {
      if (!sourcesMap.has(item.source.id)) {
        sourcesMap.set(item.source.id, item.source);
      }
    });
    return Array.from(sourcesMap.values());
  }, [initialItems]);

  const toggleReadStatus = async (e: React.MouseEvent, id: string, currentlyRead: boolean) => {
    e.stopPropagation(); // Prevent opening the link

    // Optimistic UI update
    setItems((prev) => 
      prev.map(item => item.id === id ? { ...item, isRead: !currentlyRead } : item)
    );
    
    // Send to backend
    try {
      await fetch(`/api/items/${id}/read`, { 
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isRead: !currentlyRead })
      });
    } catch (e) {
      console.error('Failed to toggle read status', e);
    }
  };

  const markAsRead = async (id: string, link: string, currentlyRead: boolean) => {
    // Only update state if it wasn't already read
    if (!currentlyRead) {
      setItems((prev) => 
        prev.map(item => item.id === id ? { ...item, isRead: true } : item)
      );
      
      // Send to backend to mark as read
      try {
        await fetch(`/api/items/${id}/read`, { 
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ isRead: true })
        });
      } catch (e) {
        console.error('Failed to mark as read', e);
      }
    }

    // Open in new tab
    window.open(link, '_blank', 'noopener,noreferrer');
  };

  const toggleSave = async (e: React.MouseEvent, id: string, isSaved: boolean) => {
    e.stopPropagation(); // Prevent opening the link when clicking the save button
    
    // Optimistic update
    setItems((prev) => prev.map(item => item.id === id ? { ...item, isSaved: !isSaved } : item));
    
    // Send to backend
    try {
      await fetch(`/api/items/${id}/save`, { 
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isSaved: !isSaved })
      });
    } catch (e) {
      console.error('Failed to toggle save state', e);
    }
  };

  if (items.length === 0) {
    return (
      <div className="text-center py-24 px-4 bg-card border border-border-subtle rounded-sm shadow-sm font-serif">
        <div className="w-16 h-16 mx-auto mb-4 text-border-hover">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-full h-full" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"></path></svg>
        </div>
        <h3 className="text-xl font-bold text-ink mb-2">You&apos;ve finished the paper.</h3>
        <p className="text-ink-muted max-w-sm mx-auto font-sans text-sm">There are no new items in your feed. Check back later or add more sources to discover new content.</p>
      </div>
    );
  }

  const filteredItems = items.filter(item => {
    if (filterType === 'text' && item.source.type !== 'rss') return false;
    if (filterType === 'video' && item.source.type !== 'youtube') return false;
    if (filterSource !== 'all' && item.source.id !== filterSource) return false;
    return true;
  });

  return (
    <div>
      {/* Filters */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border-subtle pb-5">
        <div className="flex gap-2">
          <button 
            onClick={() => setFilterType('all')} 
            className={`px-4 py-1.5 text-xs font-bold uppercase tracking-[0.1em] rounded-sm transition-colors border ${filterType === 'all' ? 'bg-ink text-card border-ink' : 'bg-transparent text-ink-muted border-border-subtle hover:border-border-hover hover:text-ink'}`}
          >
            All
          </button>
          <button 
            onClick={() => setFilterType('text')} 
            className={`px-4 py-1.5 text-xs font-bold uppercase tracking-[0.1em] rounded-sm transition-colors border ${filterType === 'text' ? 'bg-ink text-card border-ink' : 'bg-transparent text-ink-muted border-border-subtle hover:border-border-hover hover:text-ink'}`}
          >
            Articles
          </button>
          <button 
            onClick={() => setFilterType('video')} 
            className={`px-4 py-1.5 text-xs font-bold uppercase tracking-[0.1em] rounded-sm transition-colors border ${filterType === 'video' ? 'bg-ink text-card border-ink' : 'bg-transparent text-ink-muted border-border-subtle hover:border-border-hover hover:text-ink'}`}
          >
            Videos
          </button>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs text-ink-faint uppercase tracking-widest font-semibold hidden sm:inline-block">Source:</span>
          <select 
            value={filterSource}
            onChange={(e) => setFilterSource(e.target.value)}
            className="w-full sm:w-auto bg-card border border-border-subtle text-ink text-sm rounded-sm px-3 py-1.5 focus:outline-none focus:border-accent font-sans cursor-pointer"
          >
            <option value="all">All Sources</option>
            {uniqueSources.map(s => (
               <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
        </div>
      </div>

      {filteredItems.length === 0 ? (
        <div className="text-center py-16 text-ink-faint italic font-serif">
          No items match your current filters.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {filteredItems.map((item) => (
            <article 
          key={item.id} 
          onClick={() => markAsRead(item.id, item.link, item.isRead)}
          className={`group border rounded-sm transition-all duration-300 cursor-pointer flex flex-row md:flex-col h-40 md:h-[400px] relative overflow-hidden ${
            item.isRead 
              ? 'bg-paper border-border-subtle opacity-70 shadow-none' 
              : 'bg-card border-border-subtle hover:border-border-hover shadow-[0_2px_4px_rgba(0,0,0,0.02)] dark:shadow-[0_2px_4px_rgba(0,0,0,0.1)] hover:shadow-[0_4px_12px_rgba(0,0,0,0.05)] dark:hover:shadow-[0_4px_12px_rgba(0,0,0,0.2)]'
          }`}
        >
          {/* Top accent line resembling a classic book header line (hidden if read) */}
          {!item.isRead && (
            <div className="absolute top-0 left-0 right-0 h-1 bg-border-subtle group-hover:bg-accent transition-colors z-10" />
          )}

          {/* Thumbnail / Media Section */}
          {item.source.type === 'youtube' && item.thumbnailUrl ? (
            <div className={`w-2/5 md:w-full md:h-52 min-w-[140px] relative bg-ink flex-shrink-0 overflow-hidden border-r md:border-r-0 md:border-b border-border-subtle ${item.isRead ? 'grayscale' : ''}`}>
              <img 
                src={item.thumbnailUrl} 
                alt="Thumbnail" 
                className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ${item.isRead ? 'opacity-60' : 'opacity-90 group-hover:opacity-100 dark:sepia-0 sepia-[.2]'}`}
              />
              <div className="absolute inset-0 flex items-center justify-center bg-black/20 dark:bg-black/40 group-hover:bg-transparent transition-colors">
                <div className={`bg-card/90 backdrop-blur-sm rounded-full p-2 md:p-3 shadow-sm transform transition-transform ${item.isRead ? '' : 'group-hover:scale-110'}`}>
                   <svg xmlns="http://www.w3.org/2000/svg" className={`w-5 h-5 md:w-6 md:h-6 ml-0.5 ${item.isRead ? 'text-ink-muted' : 'text-accent'}`} viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
                </div>
              </div>
            </div>
          ) : null}

          {/* Content Section */}
          <div className={`p-4 md:p-6 flex flex-col justify-between flex-grow min-w-0 ${item.isRead ? 'bg-transparent' : 'bg-card'}`}>
            <div>
              <div className="flex justify-between items-start gap-2 mb-3 border-b border-border-subtle pb-2">
                <span className={`text-[10px] font-bold uppercase tracking-[0.15em] truncate ${item.isRead ? 'text-ink-faint' : 'text-accent'}`}>
                  {item.source.name}
                </span>
                <span className="text-xs font-medium text-ink-faint whitespace-nowrap italic">
                  {formatDistanceToNow(new Date(item.publishedAt)).replace('about ', '')}
                </span>
              </div>
              <h2 className={`text-[15px] md:text-xl font-bold leading-snug line-clamp-2 md:line-clamp-3 mb-3 transition-colors ${item.isRead ? 'text-ink-muted' : 'text-ink group-hover:text-accent'}`}>
                {item.title}
              </h2>
              {item.source.type !== 'youtube' && item.contentSnippet && (
                <p className={`text-xs md:text-sm font-sans leading-relaxed line-clamp-2 md:line-clamp-4 hidden md:-webkit-box ${item.isRead ? 'text-ink-faint' : 'text-ink-muted'}`}>
                  {item.contentSnippet}
                </p>
              )}
            </div>

            <div className="flex justify-end items-center mt-auto pt-3 gap-1 h-12 flex-shrink-0">
              <span className="text-[10px] text-ink-faint flex-grow font-sans uppercase tracking-widest font-semibold flex items-center gap-1.5 overflow-hidden">
                {item.isRead ? (
                  <span className="flex items-center gap-1 opacity-70">
                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0"><polyline points="20 6 9 17 4 12"></polyline></svg>
                    <span>Read</span>
                  </span>
                ) : null}
              </span>
              
              <div className="flex items-center gap-1 flex-shrink-0 bg-card z-10 pl-2">
                <button 
                  onClick={(e) => toggleReadStatus(e, item.id, item.isRead)}
                  className="p-2 transition-all duration-200 text-border-hover hover:text-ink flex-shrink-0"
                  title={item.isRead ? "Mark as unread" : "Mark as read without opening"}
                >
                  {item.isRead ? (
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M13.4 10.4 8.6 15.6"></path><path d="m15.6 8.6-2.2 2.2"></path><path d="M22 12c0 5.5-4.5 10-10 10S2 17.5 2 12 6.5 2 12 2s10 4.5 10 10Z"></path><path d="m8.6 8.6 2.2 2.2"></path></svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
                  )}
                </button>

                <button 
                  onClick={(e) => toggleSave(e, item.id, item.isSaved)}
                  className={`p-2 transition-all duration-200 flex-shrink-0 ${item.isSaved ? 'text-accent' : 'text-border-hover hover:text-accent'}`}
                  title={item.isSaved ? "Saved" : "Save for later"}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill={item.isSaved ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z"></path></svg>
                </button>
              </div>
            </div>
          </div>
        </article>
      ))}
      </div>
      )}
    </div>
  );
}
