'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import ConfirmModal from './ConfirmModal';
import TagInput from './TagInput';
import { useEditorStore, Block } from '@/lib/store/useEditorStore';
import { updatePageAction, updateBlocksAction, deletePagePermanentlyAction } from '@/lib/actions';

// Atomic Block Imports
import TextBlock from './blocks/TextBlock';
import HeadingBlock from './blocks/HeadingBlock';
import ChecklistBlock from './blocks/ChecklistBlock';
import TableBlock from './blocks/TableBlock';
import CodeBlock from './blocks/CodeBlock';
import ImageBlock from './blocks/ImageBlock';
import BookmarkBlock from './blocks/BookmarkBlock';
import DividerBlock from './blocks/DividerBlock';

import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
  arrayMove
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { createPortal } from 'react-dom';

type PageSummary = { id: number; title: string; };

const BLOCK_OPTIONS = [
    { label: 'Text', type: 'paragraph', description: 'Just start writing', icon: <span>T</span>, color: 'text-primary' },
    { label: 'Heading', type: 'heading', description: 'Section title', icon: <span className="font-bold">H1</span>, color: 'text-secondary' },
    { label: 'Checklist', type: 'checkbox', description: 'Track tasks', icon: <span>☑</span>, color: 'text-success' },
    { label: 'Bullet List', type: 'bullet', description: 'Simple list', icon: <span>•</span>, color: 'text-accent' },
    { label: 'Table', type: 'table', description: 'Data grid', icon: <span>▦</span>, color: 'text-warning' },
    { label: 'Quote', type: 'quote', description: 'Capture quote', icon: <span>"</span>, color: 'text-info' },
    { label: 'Code', type: 'code', description: 'Technical snippet', icon: <span>{`{}`}</span>, color: 'text-neutral' },
    { label: 'Image', type: 'image', description: 'Visual asset', icon: <span>🖼</span>, color: 'text-error' },
    { label: 'Bookmark', type: 'link_preview', description: 'Web reference', icon: <span>🔗</span>, color: 'text-primary' },
    { label: 'Divider', type: 'divider', description: 'Separator', icon: <span>—</span>, color: 'text-base-content/30' },
];

export default function Editor({ initialPage, initialBlocks, allPages, backlinks = [] }: { initialPage: any, initialBlocks: any[], allPages: PageSummary[], backlinks?: any[] }) {
  const router = useRouter();
  
  // Zustand Store
  const store = useEditorStore();
  
  // Local UI State (not in store because they are transient/UI-specific)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isFinishModalOpen, setIsFinishModalOpen] = useState(false);
  const [showMetadata, setShowMetadata] = useState(false);
  const [wikiSearch, setWikiSearch] = useState<string | null>(null);
  const [wikiActiveBlockId, setWikiActiveBlockId] = useState<string | null>(null);
  const [slashActiveBlockId, setSlashActiveBlockId] = useState<string | null>(null);
  const [slashQuery, setSlashQuery] = useState('');
  const [slashIndex, setSlashIndex] = useState(0);
  const slashMenuRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Scroll active slash item into view
  useEffect(() => {
    if (slashActiveBlockId && slashMenuRef.current) {
      const activeItem = slashMenuRef.current.children[slashIndex] as HTMLElement;
      if (activeItem) {
        activeItem.scrollIntoView({ block: 'nearest' });
      }
    }
  }, [slashIndex, slashActiveBlockId]);

  // Lock body scroll when slash menu is active
  useEffect(() => {
    if (slashActiveBlockId) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [slashActiveBlockId]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  // Initialize store with server data
  useEffect(() => {
    store.initialize(initialPage, initialBlocks);
  }, [initialPage.id]); // Only re-init if page ID changes

  // Auto-Save Meta
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (!store.id) return;
      const hasChanged = store.title !== initialPage.title || store.category !== initialPage.category || store.deadline !== initialPage.deadline || store.tags !== initialPage.tags;
      if (!hasChanged) return;

      store.setIsSaving(true);
      await updatePageAction(store.id, { 
        title: store.title, 
        category: store.category, 
        deadline: store.deadline, 
        tags: store.tags 
      });
      store.setIsSaving(false);
      router.refresh();
    }, 1000);
    return () => clearTimeout(timer);
  }, [store.title, store.category, store.deadline, store.tags, store.id]);

  // Auto-Save Blocks
  useEffect(() => {
     const timer = setTimeout(async () => {
         if (!store.id || store.blocks.length === 0) return;
         store.setIsSaving(true);
         const cleanBlocks = store.blocks.map((b, i) => ({ type: b.type, content: b.content, order_index: i }));
         await updateBlocksAction(store.id, cleanBlocks);
         store.setIsSaving(false);
     }, 2000);
     return () => clearTimeout(timer);
  }, [store.blocks, store.id]);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = store.blocks.findIndex((i) => i.tempId === active.id);
      const newIndex = store.blocks.findIndex((i) => i.tempId === over.id);
      store.setBlocks(arrayMove(store.blocks, oldIndex, newIndex));
    }
  };

  const handleSlashKeyDown = (e: React.KeyboardEvent) => {
      const filteredOptions = BLOCK_OPTIONS.filter(opt => opt.label.toLowerCase().includes(slashQuery.toLowerCase()));
      const filteredCount = filteredOptions.length;
      
      if (!slashActiveBlockId) return;
      
      if (e.key === 'ArrowUp') { 
          e.preventDefault(); 
          setSlashIndex(prev => (prev > 0 ? prev - 1 : filteredCount - 1)); 
      }
      else if (e.key === 'ArrowDown') { 
          e.preventDefault(); 
          setSlashIndex(prev => (prev < filteredCount - 1 ? prev + 1 : 0)); 
      }
      else if (e.key === 'Enter') {
          e.preventDefault();
          if (filteredCount > 0) {
              const opt = filteredOptions[slashIndex];
              // Update the current block instead of adding a new one
              store.updateBlockType(slashActiveBlockId, opt.type);
              store.updateBlock(slashActiveBlockId, opt.type === 'code' ? JSON.stringify({ language: 'javascript', code: '' }) : '');
              setSlashActiveBlockId(null);
          }
      }
      else if (e.key === 'Escape') { 
          setSlashActiveBlockId(null); 
      }
  };

  const handleBlockUpdate = (tempId: string, content: string) => {
      store.updateBlock(tempId, content);
      // Slash menu logic
      if (content.startsWith('/') && !content.includes(' ')) {
          setSlashActiveBlockId(tempId);
          setSlashQuery(content.substring(1));
          setSlashIndex(0);
      } else {
          setSlashActiveBlockId(null);
      }
  };

  const confirmFinishProject = async () => {
      if (!store.id) return;
      store.setIsSaving(true);
      await updatePageAction(store.id, { 
        title: store.title, 
        category: 'archives',
        deadline: store.deadline,
        tags: store.tags
      });
      store.setIsSaving(false);
      setIsFinishModalOpen(false);
      router.refresh();
      router.push('/');
  };

  if (!store.id) return <div className="p-8 animate-pulse">Initializing workspace...</div>;

  const metadataPortal = mounted && typeof document !== 'undefined' && document.getElementById('right-panel-content') ? createPortal(
    <div className="flex flex-col gap-8">
        <div>
            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] opacity-30 mb-4">Metadata</h3>
            <div className="flex flex-col gap-6">
                <div className="flex flex-col gap-2">
                    <span className="text-[10px] font-bold uppercase opacity-50">Status</span>
                    <select className="select select-sm select-bordered w-full font-bold text-xs" value={store.category} onChange={(e) => store.setCategory(e.target.value)}>
                        <option value="inbox">Inbox</option><option value="projects">Project</option><option value="areas">Area</option><option value="resources">Resource</option><option value="archives">Archive</option>
                    </select>
                </div>
                <div className="flex flex-col gap-2">
                    <span className="text-[10px] font-bold uppercase opacity-50">Deadline</span>
                    <input type="date" className="input input-sm input-bordered w-full font-bold text-xs" value={store.deadline} onChange={(e) => store.setDeadline(e.target.value)} />
                </div>
                <div className="flex flex-col gap-2">
                    <span className="text-[10px] font-bold uppercase opacity-50">Tags</span>
                    <TagInput tags={store.tags} onChange={(t) => store.setTags(t)} />
                </div>
            </div>
        </div>

        <div className="border-t border-base-200 pt-8">
            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] opacity-30 mb-4">Actions</h3>
            <div className="flex flex-col gap-2">
                {store.category === 'projects' && (
                    <button onClick={() => setIsFinishModalOpen(true)} className="btn btn-outline btn-success btn-sm justify-start gap-3">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" /></svg>
                        Archive Page
                    </button>
                )}
                <button onClick={() => setIsDeleteModalOpen(true)} className="btn btn-outline btn-error btn-sm justify-start gap-3">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.244 2.244 0 0 1-2.244 2.077H8.084a2.244 2.244 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" /></svg>
                    Delete Permanently
                </button>
            </div>
        </div>
    </div>,
    document.getElementById('right-panel-content')!
  ) : null;

  return (
     <div className="w-full py-8 relative">
        {metadataPortal}
        
        <div className="flex justify-end items-center mb-4 gap-1 px-8 shrink-0">
            <div className={`badge badge-sm border-none font-bold uppercase text-[9px] tracking-tighter px-2 h-5 mr-2 ${store.isSaving ? 'bg-warning/20 text-warning animate-pulse' : 'bg-success/10 text-success opacity-50'}`}>
                {store.isSaving ? 'Syncing...' : 'Saved'}
            </div>
        </div>
        
        <div className="px-4 md:px-8 w-full">
            <input className="text-4xl font-black w-full bg-transparent border-none focus:outline-none mb-10 placeholder-base-content/10 tracking-tight" value={store.title} onChange={(e) => store.setTitle(e.target.value)} placeholder="Untitled Page" onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); if (store.blocks.length > 0) { store.setFocusedBlockId(store.blocks[0].tempId); } else { store.addBlock('paragraph', -1); } } }} />
            
            <DndContext id="editor-dnd-context" sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                <SortableContext items={store.blocks.map(b => b.tempId)} strategy={verticalListSortingStrategy}>
                    <div className="min-h-[100px] pb-20">
                        {store.blocks.map((block, index) => (
                            <div key={block.tempId} className="relative">
                                <SortableBlock 
                                    block={block} 
                                    index={index} 
                                    previousBlockType={index > 0 ? store.blocks[index - 1].type : null} 
                                    onUpdate={handleBlockUpdate} 
                                    onDelete={store.deleteBlock} 
                                    onEnter={() => store.addBlock('paragraph', index)} 
                                    onBackspace={() => { if (index > 0) store.deleteBlock(block.tempId); }} 
                                    allPages={allPages} 
                                    isFocused={store.focusedBlockId === block.tempId} 
                                    slashActive={slashActiveBlockId === block.tempId} 
                                    onSlashKeyDown={handleSlashKeyDown} 
                                />
                            </div>
                        ))}
                        <div className="h-32 -mt-4 cursor-text" onClick={() => store.addBlock('paragraph', store.blocks.length - 1)}></div>
                    </div>
                </SortableContext>
            </DndContext>

            {/* Inline Slash Toolkit */}
            {slashActiveBlockId && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" onClick={() => setSlashActiveBlockId(null)}>
                    <div 
                        className="w-full max-w-sm bg-base-100 shadow-2xl border border-base-300 rounded-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="p-2 bg-base-200/50 border-b border-base-300 flex items-center justify-between">
                            <span className="text-[9px] font-black text-base-content/40 uppercase tracking-[0.2em] ml-2">Block Toolkit</span>
                            <kbd className="kbd kbd-xs opacity-30">ESC</kbd>
                        </div>
                        <div className="p-1">
                            <input 
                                className="w-full bg-base-100 rounded-lg px-3 py-1.5 text-sm outline-none border border-base-300 focus:border-primary/30 mb-1 font-mono"
                                placeholder="Search blocks..."
                                value={slashQuery}
                                onChange={(e) => {
                                    setSlashQuery(e.target.value);
                                    setSlashIndex(0);
                                }}
                                autoFocus
                                onKeyDown={handleSlashKeyDown}
                            />
                            <div ref={slashMenuRef} className="max-h-[300px] overflow-y-auto flex flex-col gap-0.5">
                                {BLOCK_OPTIONS.filter(opt => opt.label.toLowerCase().includes(slashQuery.toLowerCase())).map((opt, i) => {
                                    const blockIndex = store.blocks.findIndex(b => b.tempId === slashActiveBlockId);
                                    return (
                                        <button 
                                            key={opt.type} 
                                            onClick={() => { 
                                                store.updateBlock(slashActiveBlockId, ''); 
                                                store.addBlock(opt.type, blockIndex - 1); 
                                                setSlashActiveBlockId(null); 
                                            }} 
                                            className={`flex items-center gap-2.5 w-full p-1.5 rounded-lg transition-all group/btn ${i === slashIndex ? 'bg-primary text-primary-content shadow-md' : 'hover:bg-base-200'}`}
                                        >
                                            <div className={`w-7 h-7 rounded flex items-center justify-center text-sm shrink-0 ${i === slashIndex ? 'bg-white/20' : 'bg-base-200 group-hover/btn:bg-base-100'}`}>
                                                <span className={i === slashIndex ? 'text-white' : opt.color}>{opt.icon}</span>
                                            </div>
                                            <div className="flex flex-col text-left flex-1 min-w-0">
                                                <span className={`font-bold text-[13px] tracking-tight ${i === slashIndex ? 'text-white' : ''}`}>{opt.label}</span>
                                            </div>
                                            {i === slashIndex && <span className="text-[9px] font-black opacity-40 bg-black/10 px-1.5 py-0.5 rounded text-white uppercase tracking-tighter mr-1">Enter</span>}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {backlinks.length > 0 && (
                <div className="mt-20 pt-12 border-t border-base-300 pb-20">
                    <h3 className="text-xs font-bold uppercase tracking-widest text-base-content/30 mb-6">Cross References (Linked Pages)</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">{backlinks.map(link => (
                        <Link href={`/p/${link.id}`} key={link.id} className="p-4 bg-base-200/50 hover:bg-base-200 rounded-xl border border-base-300 transition-colors flex items-center gap-3"><span className="opacity-30">📁</span><span className="font-semibold text-primary text-sm">{link.title}</span></Link>
                    ))}</div>
                </div>
            )}
        </div>
        <ConfirmModal isOpen={isDeleteModalOpen} title="Delete Page" message="Delete this evidence permanently?" confirmText="Delete" onConfirm={async () => { if (store.id) await deletePagePermanentlyAction(store.id); setIsDeleteModalOpen(false); router.push('/'); router.refresh(); }} onCancel={() => setIsDeleteModalOpen(false)} />
        <ConfirmModal isOpen={isFinishModalOpen} title="Solve Case" message="Mark this project as solved and archive it?" confirmText="Solve & Archive" type="success" onConfirm={confirmFinishProject} onCancel={() => setIsFinishModalOpen(false)} />
     </div>
  );
}

const BLOCK_RENDERERS: Record<string, React.ComponentType<any>> = {
    heading: HeadingBlock,
    checkbox: ChecklistBlock,
    table: TableBlock,
    code: CodeBlock,
    image: ImageBlock,
    link_preview: BookmarkBlock,
    divider: DividerBlock,
    paragraph: TextBlock,
    bullet: TextBlock,
    quote: TextBlock,
};

function SortableBlock({ block, index, previousBlockType, onUpdate, onDelete, onEnter, onBackspace, allPages, isFocused, slashActive, onSlashKeyDown }: any) {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: block.tempId });
    const isList = ['bullet', 'checkbox'].includes(block.type);
    const isConsecutiveList = isList && previousBlockType === block.type;
    const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.5 : 1, zIndex: isDragging ? 999 : 'auto', position: 'relative' as 'relative', marginTop: isConsecutiveList ? '-4px' : '8px' };
    
    const renderBlockContent = () => {
        const Component = BLOCK_RENDERERS[block.type] || TextBlock;
        const commonProps = { 
            value: block.content, 
            onChange: (val: string) => onUpdate(block.tempId, val), 
            isFocused, 
            onKeyDown: (e: any) => { 
                if (slashActive) {
                    onSlashKeyDown(e);
                    return;
                }
                if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); onEnter(); } 
                if (e.key === 'Backspace' && block.content === '') { e.preventDefault(); onBackspace(); } 
            },
            // Props used by specific blocks
            allPages,
            type: block.type 
        };
        
        return <Component {...commonProps} />;
    };

    return (
        <div ref={setNodeRef} style={style} className="group relative pl-8 -ml-8 hover:bg-base-200/30 rounded px-2 py-0.5 transition-colors">
            <div {...attributes} {...listeners} className="absolute left-0 top-1.5 opacity-0 group-hover:opacity-100 transition-opacity cursor-grab text-base-content/30 p-1 hover:text-primary z-20"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4"><path d="M10 3a1.5 1.5 0 110 3 1.5 1.5 0 010-3zM10 8.5a1.5 1.5 0 110 3 1.5 1.5 0 010-3zM11.5 15.5a1.5 1.5 0 10-3 0 1.5 1.5 0 003 0z" /></svg></div>
            {renderBlockContent()}
            <div className="absolute -right-8 top-1 opacity-0 group-hover:opacity-100 transition-opacity"><button onClick={() => onDelete(block.tempId)} className="btn btn-xs btn-ghost text-error">×</button></div>
        </div>
    );
}