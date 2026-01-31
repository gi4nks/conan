'use client';

import { useRef, useEffect, useState } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

const LANG_OPTIONS = [
    { label: 'JavaScript', value: 'javascript' },
    { label: 'TypeScript', value: 'typescript' },
    { label: 'Python', value: 'python' },
    { label: 'SQL', value: 'sql' },
    { label: 'HTML', value: 'html' },
    { label: 'CSS', value: 'css' },
    { label: 'Bash', value: 'bash' },
    { label: 'JSON', value: 'json' },
    { label: 'Markdown', value: 'markdown' },
];

interface CodeBlockProps {
    value: string;
    onChange: (val: string) => void;
    isFocused: boolean;
    onKeyDown: (e: React.KeyboardEvent) => void;
}

export default function CodeBlock({ value, onChange, isFocused, onKeyDown }: CodeBlockProps) {
    const [isEditing, setIsEditing] = useState(isFocused);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    let codeValue = value;
    let language = 'javascript';
    try {
        const parsed = JSON.parse(value);
        if (parsed.code !== undefined) {
            codeValue = parsed.code;
            language = parsed.language || 'javascript';
        }
    } catch (e) {}

    useEffect(() => {
        if (isFocused) setIsEditing(true);
    }, [isFocused]);

    useEffect(() => {
        if (isEditing && textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
            textareaRef.current.focus();
        }
    }, [isEditing, codeValue]);

    const updateCode = (newCode: string) => onChange(JSON.stringify({ language, code: newCode }));
    const updateLang = (newLang: string) => onChange(JSON.stringify({ language: newLang, code: codeValue }));

    return (
        <div className="relative group/code mb-2">
            <div className="absolute right-4 top-2 flex items-center gap-3 z-10">
                <select 
                    className="select select-ghost select-xs bg-white/5 text-[9px] font-black uppercase tracking-widest text-white/40 hover:text-white border-none focus:bg-white/10"
                    value={language}
                    onChange={(e) => updateLang(e.target.value)}
                >
                    {LANG_OPTIONS.map(opt => <option key={opt.value} value={opt.value} className="bg-[#1e1e1e] text-white">{opt.label}</option>)}
                </select>
                <div className="text-[9px] font-black opacity-20 uppercase tracking-[0.2em] pointer-events-none text-white">Source Code</div>
            </div>
            
            {!isEditing ? (
                <div className="rounded-xl overflow-hidden shadow-2xl border border-white/5 cursor-text" onClick={() => setIsEditing(true)}>
                    <SyntaxHighlighter 
                        language={language} 
                        style={vscDarkPlus}
                        customStyle={{ margin: 0, padding: '20px', fontSize: '13px', borderRadius: '12px' }}
                    >
                        {codeValue || ' '}
                    </SyntaxHighlighter>
                </div>
            ) : (
                <div className="bg-[#1e1e1e] text-gray-300 rounded-xl p-5 font-mono text-sm shadow-2xl border border-white/5 min-h-[4rem]">
                    <textarea 
                        ref={textareaRef} 
                        className="w-full bg-transparent outline-none border-none resize-none overflow-hidden block p-0 leading-relaxed caret-primary" 
                        value={codeValue} 
                        onChange={e => updateCode(e.target.value)} 
                        onKeyDown={onKeyDown}
                        onBlur={() => setIsEditing(false)}
                        placeholder="// investigate script..." 
                        rows={1} 
                    />
                </div>
            )}
        </div>
    );
}
