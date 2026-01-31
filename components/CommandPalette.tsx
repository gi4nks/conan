'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function CommandPalette() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const router = useRouter();

  // Toggle on CMD+K or custom event
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setIsOpen((open) => !open);
      }
    };

    const handleOpen = () => setIsOpen(true);

    document.addEventListener('keydown', down);
    window.addEventListener('open-search', handleOpen);
    
    return () => {
        document.removeEventListener('keydown', down);
        window.removeEventListener('open-search', handleOpen);
    };
  }, []);

  // Search Effect
  useEffect(() => {
    const timer = setTimeout(async () => {
        if (query.length < 2) {
            setResults([]);
            return;
        }
        try {
            const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
            const data = await res.json();
            setResults(data);
        } catch (e) {
            console.error(e);
        }
    }, 300); // 300ms debounce
    return () => clearTimeout(timer);
  }, [query]);

  const handleSelect = (id: number) => {
    setIsOpen(false);
    setQuery('');
    setResults([]);
    router.push(`/p/${id}`);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[20vh] bg-black/50 backdrop-blur-sm p-4" onClick={() => setIsOpen(false)}>
      <div className="w-full max-w-xl bg-base-100 rounded-xl shadow-2xl overflow-hidden border border-base-300 flex flex-col max-h-[60vh]" onClick={(e) => e.stopPropagation()}>
        <div className="p-4 border-b border-base-200 flex items-center gap-3 shrink-0">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 opacity-50">
            <path fillRule="evenodd" d="M9 3.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11zM2 9a7 7 0 1112.452 4.391l3.328 3.329a.75.75 0 11-1.06 1.06l-3.329-3.328A7 7 0 012 9z" clipRule="evenodd" />
          </svg>
          <input 
            className="w-full bg-transparent outline-none text-lg placeholder-base-content/30"
            placeholder="Investigate case files..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
          />
          <kbd className="kbd kbd-sm">ESC</kbd>
        </div>
        
        <div className="overflow-y-auto p-2">
           {query.length >= 2 && results.length === 0 && (
               <div className="p-4 text-center text-base-content/50">No results found.</div>
           )}
           {query.length < 2 && results.length === 0 && (
               <div className="p-4 text-center text-base-content/30 text-sm">Type at least 2 characters to search...</div>
           )}

           {results.map((page) => (
               <button
                  key={page.id}
                  onClick={() => handleSelect(page.id)}
                  className="w-full text-left px-4 py-3 rounded-lg hover:bg-base-200 flex flex-col gap-1 group transition-colors mb-1"
               >
                  <div className="flex justify-between items-center w-full">
                      <span className="font-medium flex items-center gap-2">
                          {page.title || 'Untitled'}
                      </span>
                      <span className="text-[10px] uppercase font-bold opacity-50 bg-base-300 px-1.5 py-0.5 rounded">
                        {page.category}
                      </span>
                  </div>

                  {/* Show tags if they exist */}
                  {page.tags && (
                      <div className="flex flex-wrap gap-1">
                          {page.tags.split(',').map((tag: string, i: number) => (
                              <span key={i} className={`text-[9px] font-bold px-1 rounded ${tag.toLowerCase().includes(query.toLowerCase()) ? 'bg-primary/20 text-primary' : 'opacity-30'}`}>
                                  #{tag}
                              </span>
                          ))}
                      </div>
                  )}
                  
                  {/* Show snippet if it's a block match */}
                  {page.type === 'block' && page.snippet && (
                      <span className="text-xs text-base-content/50 line-clamp-1 break-all">
                          ...{page.snippet.substring(0, 80)}...
                      </span>
                  )}
               </button>
           ))}
        </div>
        
        <div className="p-2 bg-base-200/50 text-xs text-center text-base-content/40 border-t border-base-200 shrink-0">
            Press <kbd className="kbd kbd-xs">↵</kbd> to select
        </div>
      </div>
    </div>
  );
}