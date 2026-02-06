'use client';

import { useState, KeyboardEvent } from 'react';
import Link from 'next/link';

interface TagInputProps {
  tags: string;
  onChange: (newTags: string) => void;
}

export default function TagInput({ tags, onChange }: TagInputProps) {
  const [inputValue, setInputValue] = useState('');
  
  // Convert comma-separated string to array
  const tagArray = tags ? tags.split(',').map(t => t.trim()).filter(t => t !== '') : [];

  const addTag = (tag: string) => {
    const cleanedTag = tag.trim().replace(/,/g, '');
    if (cleanedTag && !tagArray.includes(cleanedTag)) {
      const newTags = [...tagArray, cleanedTag].join(',');
      onChange(newTags);
    }
    setInputValue('');
  };

  const removeTag = (indexToRemove: number) => {
    const newTags = tagArray.filter((_, index) => index !== indexToRemove).join(',');
    onChange(newTags);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addTag(inputValue);
    } else if (e.key === 'Backspace' && inputValue === '' && tagArray.length > 0) {
      removeTag(tagArray.length - 1);
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-2 p-2 border border-base-300 rounded-lg bg-base-200/30 hover:border-primary/30 focus-within:border-primary/50 focus-within:ring-1 focus-within:ring-primary/20 transition-all w-full max-w-2xl">
      <span className="text-primary font-bold ml-1 opacity-50">#</span>
      
      {tagArray.map((tag, index) => (
        <span key={index} className="badge badge-primary badge-sm gap-1 py-3 pr-1 pl-3 font-mono font-bold group flex items-center tracking-tighter">
          <Link href={`/search?q=${encodeURIComponent(tag)}`} className="hover:underline">
            {tag}
          </Link>
          <button 
            onClick={() => removeTag(index)}
            className="btn btn-ghost btn-xs btn-circle h-4 w-4 min-h-0 hover:bg-primary-focus text-primary-content/70 ml-1"
          >
            ×
          </button>
        </span>
      ))}
      
      <input
        type="text"
        className="bg-transparent outline-none flex-1 min-w-[120px] text-sm py-1 placeholder-base-content/20"
        placeholder={tagArray.length === 0 ? "Add evidence tags (press Enter)..." : ""}
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={() => inputValue && addTag(inputValue)}
      />
    </div>
  );
}
