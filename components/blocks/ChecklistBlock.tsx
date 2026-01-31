'use client';

import { useState, useRef, useEffect } from 'react';
import RichTextRenderer from '../RichTextRenderer';

type PageSummary = {
    id: number;
    title: string;
};

interface ChecklistBlockProps {
    value: string;
    onChange: (val: string) => void;
    isFocused: boolean;
    onKeyDown: (e: React.KeyboardEvent) => void;
    allPages: PageSummary[];
}

export default function ChecklistBlock({ value, onChange, isFocused, onKeyDown, allPages }: ChecklistBlockProps) {
    const [isEditing, setIsEditing] = useState(isFocused);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    const isChecked = value.startsWith('[x] ');
    const text = isChecked ? value.substring(4) : value;

    useEffect(() => {
        if (isFocused) setIsEditing(true);
    }, [isFocused]);

    useEffect(() => {
        if (isEditing && textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
            textareaRef.current.focus();
        }
    }, [isEditing, text]);

    const handleTextChange = (newText: string) => {
        onChange(isChecked ? '[x] ' + newText : newText);
    };

    const toggleChecked = () => {
        onChange(isChecked ? text : '[x] ' + text);
    };

    return (
        <div className="flex gap-3 items-start group/todo py-0.5">
            <input 
                type="checkbox" 
                className="checkbox checkbox-primary checkbox-xs rounded-md mt-[5px] transition-all hover:scale-110" 
                checked={isChecked} 
                onChange={toggleChecked} 
            />
            <div className="flex-1 min-w-0">
                {!isEditing && (text.includes('[[') || text.includes('**') || text.includes('*')) ? (
                    <div className="cursor-text w-full" onClick={() => setIsEditing(true)}>
                        <RichTextRenderer 
                            content={text} 
                            allPages={allPages} 
                            className={`${isChecked ? 'line-through decoration-primary/30 text-base-content/40' : 'text-base-content'}`}
                        />
                    </div>
                ) : (
                    <textarea 
                        ref={textareaRef}
                        className={`w-full bg-transparent outline-none border-none resize-none overflow-hidden block p-0 leading-relaxed text-base transition-colors ${isChecked ? 'line-through decoration-primary/30 text-base-content/40' : 'text-base-content'}`}
                        value={text}
                        onChange={(e) => handleTextChange(e.target.value)}
                        onKeyDown={onKeyDown}
                        onFocus={() => setIsEditing(true)}
                        onBlur={() => setIsEditing(false)}
                        placeholder="To-do item"
                        rows={1}
                    />
                )}
            </div>
        </div>
    );
}
