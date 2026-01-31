'use client';

import { useState, useRef, useEffect } from 'react';
import RichTextRenderer from '../RichTextRenderer';

type PageSummary = {
    id: number;
    title: string;
};

interface TextBlockProps {
    type: string;
    value: string;
    onChange: (val: string) => void;
    isFocused: boolean;
    onKeyDown: (e: React.KeyboardEvent) => void;
    allPages: PageSummary[];
}

export default function TextBlock({ type, value, onChange, isFocused, onKeyDown, allPages }: TextBlockProps) {
    const [isEditing, setIsEditing] = useState(isFocused);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    useEffect(() => {
        if (isFocused) setIsEditing(true);
    }, [isFocused]);

    useEffect(() => {
        if (isEditing && textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
            textareaRef.current.focus();
        }
    }, [isEditing, value]);

    const renderInput = (className: string, placeholder: string) => {
        const needsRichRendering = value && (value.includes('[[') || value.includes('](') || value.includes('**') || value.includes('*') || value.includes('~~') || value.includes('<u>'));
        if (!isEditing && needsRichRendering) {
            return (
                <div className="cursor-text w-full" onClick={() => setIsEditing(true)}>
                    <RichTextRenderer content={value} allPages={allPages} className={className} />
                </div>
            );
        }
        return (
            <textarea 
                ref={textareaRef} 
                className={`${className} w-full bg-transparent outline-none border-none resize-none overflow-hidden block p-0 leading-relaxed text-base`} 
                value={value} 
                onChange={e => onChange(e.target.value)} 
                onKeyDown={onKeyDown} 
                onFocus={() => setIsEditing(true)} 
                onBlur={() => setIsEditing(false)} 
                placeholder={placeholder} 
                rows={1} 
            />
        );
    };

    if (type === 'quote') {
        return (
            <div className="flex my-2 group/quote">
                <div className="w-1.5 bg-primary/40 rounded-full mr-6 shrink-0 shadow-[0_0_10px_rgba(var(--p),0.2)]"></div>
                <div className="flex-1 bg-base-200/30 p-4 rounded-r-2xl border-l border-white/5 italic text-base-content/80">
                    {renderInput("font-serif text-lg", "Witness statement...")}
                </div>
            </div>
        );
    }

    if (type === 'bullet') {
        return (
            <div className="flex gap-2 items-start py-0.5">
                <span className="mt-1 text-primary shrink-0 opacity-50">•</span>
                {renderInput("text-base", "List item")}
            </div>
        );
    }

    // Default paragraph
    return renderInput("text-base", "Type '/' for toolkit...");
}
