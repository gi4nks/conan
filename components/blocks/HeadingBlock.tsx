'use client';

import { useRef, useEffect } from 'react';

interface HeadingBlockProps {
    value: string;
    onChange: (val: string) => void;
    isFocused: boolean;
    onKeyDown: (e: React.KeyboardEvent) => void;
}

export default function HeadingBlock({ value, onChange, isFocused, onKeyDown }: HeadingBlockProps) {
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (isFocused && inputRef.current) {
            inputRef.current.focus();
        }
    }, [isFocused]);

    return (
        <input 
            ref={inputRef} 
            className="text-xl font-bold w-full bg-transparent border-none focus:outline-none placeholder-base-content/10 py-1" 
            value={value} 
            onChange={e => onChange(e.target.value)} 
            onKeyDown={onKeyDown} 
            placeholder="Heading" 
        />
    );
}
