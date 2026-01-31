'use client';

import { useState } from 'react';

interface ImageBlockProps {
    value: string;
    onChange: (val: string) => void;
}

export default function ImageBlock({ value, onChange }: ImageBlockProps) {
    const [uploading, setUploading] = useState(false);

    let imgUrl = value; 
    let imgWidth = 'auto';
    try { 
        const parsed = JSON.parse(value); 
        if (parsed.url) { 
            imgUrl = parsed.url; 
            imgWidth = parsed.width || 'auto'; 
        } 
    } catch {}

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files?.length) return;
        setUploading(true);
        const formData = new FormData();
        formData.append('file', e.target.files[0]);
        try {
            const res = await fetch('/api/upload', { method: 'POST', body: formData });
            if (res.ok) { 
                const data = await res.json(); 
                onChange(data.url); 
            }
        } finally { 
            setUploading(false); 
        }
    };

    const handleResize = (e: React.MouseEvent) => {
        e.preventDefault();
        const startX = e.clientX;
        const startWidth = (e.target as HTMLElement).parentElement?.querySelector('img')?.offsetWidth || 0;
        
        const onMouseMove = (moveEvent: MouseEvent) => {
            const currentWidth = startWidth + (moveEvent.clientX - startX);
            const img = (e.target as HTMLElement).parentElement?.querySelector('img');
            if (img) img.style.width = `${currentWidth}px`;
        };
        
        const onMouseUp = () => {
            const img = (e.target as HTMLElement).parentElement?.querySelector('img');
            if (img) onChange(JSON.stringify({ url: imgUrl, width: img.offsetWidth }));
            window.removeEventListener('mousemove', onMouseMove);
            window.removeEventListener('mouseup', onMouseUp);
        };
        
        window.addEventListener('mousemove', onMouseMove);
        window.addEventListener('mouseup', onMouseUp);
    };

    if (imgUrl) {
        return (
            <div className="relative group/image inline-block">
                <img 
                    src={imgUrl} 
                    alt="Uploaded Evidence" 
                    style={{ width: imgWidth === 'auto' ? 'auto' : `${imgWidth}px` }} 
                    className="max-w-full max-h-[500px] rounded-xl shadow-lg border border-base-300 object-contain" 
                />
                <div 
                    onMouseDown={handleResize} 
                    className="absolute bottom-0 right-0 w-4 h-4 bg-primary/50 cursor-ew-resize rounded-tl opacity-0 group-hover/image:opacity-100 transition-opacity" 
                />
                <button 
                    onClick={() => onChange('')} 
                    className="btn btn-xs btn-circle btn-error absolute top-2 right-2 opacity-0 group-hover/image:opacity-100 transition-opacity"
                >
                    ×
                </button>
            </div>
        );
    }

    return (
        <div className="p-8 border-2 border-dashed border-base-300 rounded-2xl flex flex-col items-center justify-center text-base-content/50 gap-2 hover:bg-base-200/50 transition-colors">
            {uploading ? (
                <span className="loading loading-spinner"></span>
            ) : (
                <>
                    <input type="file" accept="image/*" onChange={handleUpload} className="file-input file-input-sm file-input-bordered w-full max-w-xs" />
                    <span className="text-[10px] uppercase font-black opacity-30">Visual Evidence (max 2MB)</span>
                </>
            )}
        </div>
    );
}
