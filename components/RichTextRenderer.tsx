'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createPageFromLinkAction } from '@/lib/actions';
import DOMPurify from 'isomorphic-dompurify';

type PageSummary = {
    id: number;
    title: string;
};

interface RichTextRendererProps {
    content: string;
    allPages: PageSummary[];
    className?: string;
}

function formatInlineMarkdown(text: string) {
    // Escape HTML to prevent XSS before applying markdown
    let escaped = text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');

    // Markdown patterns
    const patterns = [
        { regex: /&lt;u&gt;(.*?)&lt;\/u&gt;/g, replacement: '<u>$1</u>' },
        { regex: /\*\*(.*?)\*\*/g, replacement: '<strong>$1</strong>' },
        { regex: /\*(.*?)\*/g, replacement: '<em>$1</em>' },
        { regex: /~~(.*?)~~/g, replacement: '<del>$1</del>' },
        { regex: /`([^`]+)`/g, replacement: '<code class="bg-base-300 px-1 rounded text-sm">$1</code>' },
        { regex: /\[(.*?)\]\((.*?)\)/g, replacement: '<a href="$2" target="_blank" rel="noopener noreferrer" class="text-primary hover:underline">$1</a>' }
    ];

    patterns.forEach(({ regex, replacement }) => {
        escaped = escaped.replace(regex, replacement);
    });
    
    return DOMPurify.sanitize(escaped, { 
        ALLOWED_TAGS: ['strong', 'em', 'del', 'code', 'a', 'u'], 
        ALLOWED_ATTR: ['href', 'target', 'rel', 'class'] 
    });
}

export default function RichTextRenderer({ content, allPages, className = "" }: RichTextRendererProps) {
    const router = useRouter();
    const cleanContent = content.startsWith('[x] ') ? content.substring(4) : content;
    const parts = cleanContent.split(/(\[\[.*?\]\])/g);

    const handleDeadLinkClick = async (e: React.MouseEvent, title: string) => {
        e.preventDefault();
        e.stopPropagation();
        await createPageFromLinkAction(title);
    };

    return (
        <div className={`textarea textarea-ghost w-full p-0 leading-relaxed text-base resize-none overflow-hidden bg-transparent min-h-[1.5rem] whitespace-pre-wrap break-words font-sans ${className}`}>
            {parts.map((part, index) => {
                const wikiMatch = part.match(/^\[\[(.*?)\]\]$/);
                if (wikiMatch) {
                    const title = wikiMatch[1];
                    const page = allPages.find(p => p.title.toLowerCase() === title.toLowerCase());
                    if (page) {
                        return (
                            <Link 
                                key={index} 
                                href={`/p/${page.id}`} 
                                className="text-primary font-bold hover:underline bg-primary/5 px-1 rounded-sm inline-block relative z-10" 
                                onClick={(e) => e.stopPropagation()}
                            >
                                {title}
                            </Link>
                        );
                    }
                    return (
                        <button 
                            key={index} 
                            onClick={(e) => handleDeadLinkClick(e, title)}
                            className="text-error font-bold border-b-2 border-dashed border-error/30 hover:bg-error/5 px-1 rounded-sm transition-colors cursor-help"
                            title="Broken Link: Click to create this page"
                        >
                            {title}
                        </button>
                    );
                }
                return <span key={index} dangerouslySetInnerHTML={{ __html: formatInlineMarkdown(part) }} />;
            })}
        </div>
    );
}
