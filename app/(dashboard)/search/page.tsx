'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';

export default function SearchPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
    const initialQuery = searchParams.get('q') || '';
    const [query, setQuery] = useState(initialQuery);
    const [results, setResults] = useState<any[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [activeCategory, setActiveCategory] = useState<string | null>(null);
  
    useEffect(() => {
      const timer = setTimeout(async () => {
          if (query.length < 2) {
              setResults([]);
              return;
          }
          setIsSearching(true);
          try {
              const res = await fetch(`/api/search?q=${encodeURIComponent(query)}&limit=100`);
              const data = await res.json();
              setResults(data);
          } catch (e) {
              console.error(e);
          } finally {
              setIsSearching(false);
          }
      }, 300);
      
      if (query) {
          window.history.replaceState(null, '', `/search?q=${encodeURIComponent(query)}`);
      } else {
          window.history.replaceState(null, '', `/search`);
      }
  
      return () => clearTimeout(timer);
    }, [query]);
  
    const filteredResults = activeCategory 
      ? results.filter(r => r.category === activeCategory)
      : results;
  
    const categories = ['projects', 'areas', 'resources', 'archives'];
  
      return (
        <div className="w-full py-12 px-8 lg:px-16">
          <div className="w-full">
            <div className="mb-12 text-center">              <h1 className="text-4xl font-black mb-2 flex items-center justify-center gap-3">
                  <span>🕵️‍♂️</span> Investigation Board
              </h1>
              <p className="text-base-content/60">Forensic search across case files and clues.</p>
          </div>
  
          <div className="relative mb-6">
              <input 
                  className="input input-lg input-bordered w-full shadow-2xl text-xl pl-12 bg-base-100 border-base-300 focus:border-primary transition-all"
                  placeholder="Type to search evidence..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  autoFocus
              />
              <div className="absolute left-4 top-1/2 -translate-y-1/2 opacity-40">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-6 h-6">
                      <path fillRule="evenodd" d="M9 3.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11zM2 9a7 7 0 1112.452 4.391l3.328 3.329a.75.75 0 11-1.06 1.06l-3.329-3.328A7 7 0 012 9z" clipRule="evenodd" />
                  </svg>
              </div>
              {isSearching && (
                  <div className="absolute right-4 top-1/2 -translate-y-1/2">
                      <span className="loading loading-spinner text-primary"></span>
                  </div>
              )}
          </div>
  
          {/* Category Filters */}
          <div className="flex flex-wrap justify-center gap-2 mb-12">
              <button 
                  onClick={() => setActiveCategory(null)}
                  className={`btn btn-xs rounded-full px-4 ${activeCategory === null ? 'btn-primary' : 'btn-ghost border border-base-300'}`}
              >
                  All Results
              </button>
              {categories.map(cat => (
                  <button 
                      key={cat}
                      onClick={() => setActiveCategory(cat)}
                      className={`btn btn-xs rounded-full px-4 uppercase tracking-tighter ${activeCategory === cat ? 'btn-primary' : 'btn-ghost border border-base-300'}`}
                  >
                      {cat}
                  </button>
              ))}
          </div>
  
          <div className="space-y-4 pb-24">
              {query.length >= 2 && filteredResults.length === 0 && !isSearching && (
                  <div className="text-center py-20 border-2 border-dashed border-base-300 rounded-3xl bg-base-200/20">
                      <div className="text-6xl mb-4 opacity-10">📭</div>
                      <p className="text-lg opacity-40 font-bold uppercase tracking-widest">No evidence found</p>
                  </div>
              )}
  
              {filteredResults.map((result) => (
                  <Link 
                      href={`/p/${result.id}`} 
                      key={result.id}
                      className="card bg-base-100 shadow-sm border border-base-300 hover:border-primary hover:shadow-xl hover:-translate-y-0.5 transition-all block p-6 group"
                  >
                      <div className="flex items-start justify-between mb-3">
                          <div className="flex flex-col gap-1.5">
                              <div className="flex items-center gap-2">
                                  <h2 className="text-xl font-black group-hover:text-primary transition-colors tracking-tight">
                                      {highlightText(result.title, query)}
                                  </h2>
                                  <span className={`badge badge-sm font-black uppercase tracking-tighter h-5 ${getBadgeClass(result.category)}`}>
                                      {result.category}
                                  </span>
                              </div>
                              {result.tags && (
                                  <div className="flex flex-wrap gap-1">
                                      {result.tags.split(',').map((tag: string, i: number) => (
                                          <span key={i} className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${tag.toLowerCase().includes(query.toLowerCase()) ? 'bg-primary text-primary-content border-primary' : 'bg-base-200 border-base-300 text-base-content/40'}`}>
                                              #{tag}
                                          </span>
                                      ))}
                                  </div>
                              )}
                          </div>
                          <span className="text-[10px] text-base-content/30 font-mono bg-base-200 px-2 py-1 rounded">CASE #{result.id}</span>
                      </div>
                      
                      {result.snippet && (
                          <div className="bg-base-200/50 p-4 rounded-xl text-sm text-base-content/70 font-mono border-l-2 border-primary/20">
                              ...{highlightText(result.snippet.substring(0, 300), query)}...
                          </div>
                      )}
                  </Link>
              ))}
          </div>
        </div>
      </div>
    );
}

function getBadgeClass(category: string) {
    switch(category) {
        case 'projects': return 'badge-primary badge-outline';
        case 'areas': return 'badge-secondary badge-outline';
        case 'resources': return 'badge-accent badge-outline';
        case 'archives': return 'badge-ghost badge-outline';
        default: return 'badge-ghost';
    }
}

function highlightText(text: string, query: string) {
    if (!query) return text;
    const parts = text.split(new RegExp(`(${query})`, 'gi'));
    return (
        <>
            {parts.map((part, i) => 
                part.toLowerCase() === query.toLowerCase() 
                    ? <mark key={i} className="bg-warning/40 text-base-content rounded-sm px-0.5">{part}</mark> 
                    : part
            )}
        </>
    );
}
