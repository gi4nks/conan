'use client';

import { useState } from 'react';

interface BookmarkBlockProps {
    value: string;
    onChange: (val: string) => void;
}

export default function BookmarkBlock({ value, onChange }: BookmarkBlockProps) {
    const [loadingMeta, setLoadingMeta] = useState(false);

    let meta = null; 
    try { 
        meta = JSON.parse(value); 
    } catch {}

    const handleBookmark = async (url: string) => {
        if (!url) return;
        setLoadingMeta(true);
        try {
            const res = await fetch(`/api/metadata?url=${encodeURIComponent(url)}`);
            const data = await res.json();
            onChange(JSON.stringify(data));
        } catch(e) { 
            onChange(JSON.stringify({ url, title: url })); 
        } finally { 
            setLoadingMeta(false); 
        }
    };

    if (meta) {
        return (
            <div className="relative group/card my-2">
                <a 
                    href={meta.url} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="block border border-base-300 rounded-2xl overflow-hidden hover:bg-base-200/50 transition-all flex h-32 no-underline text-sm shadow-sm"
                >
                    {meta.image && (
                        <img src={meta.image} alt="" className="w-48 h-full object-cover shrink-0 border-r border-base-200" />
                    )}
                    <div className="p-5 flex flex-col justify-center min-w-0">
                        <h4 className="font-black truncate text-primary uppercase tracking-tight mb-1">{meta.title}</h4>
                        <p className="text-xs text-base-content/60 line-clamp-2 leading-relaxed">{meta.description}</p>
                        <span className="text-[10px] font-mono text-base-content/30 mt-2 truncate uppercase tracking-widest">{new URL(meta.url).hostname}</span>
                    </div>
                </a>
                <button 
                    onClick={() => onChange('')} 
                    className="btn btn-xs btn-circle btn-error absolute -top-2 -right-2 opacity-0 group-hover/card:opacity-100 transition-opacity shadow-lg"
                >
                    ×
                </button>
            </div>
        );
    }

    return (
        <div className="flex gap-3 items-center p-4 bg-base-200/20 rounded-xl border border-base-300">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 opacity-30">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 0 1 1.242 7.244l-4.5 4.5a4.5 4.5 0 0 1-6.364-6.364l1.757-1.757m13.35-.622 1.757-1.757a4.5 4.5 0 0 0-6.364-6.364l-4.5 4.5a4.5 4.5 0 0 0 1.242 7.244" />
            </svg>
            <input 
                className="input input-ghost input-sm flex-1 text-sm focus:bg-base-100" 
                placeholder="Paste investigative URL..." 
                onBlur={(e) => handleBookmark(e.target.value)} 
                onKeyDown={(e) => { if (e.key === 'Enter') handleBookmark(e.currentTarget.value); }} 
            />
            {loadingMeta && <span className="loading loading-spinner loading-xs text-primary"></span>}
        </div>
    );
}
