'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import ConfirmModal from './ConfirmModal';
import TagInput from './TagInput';
import { useEditorStore, Block } from '@/lib/store/useEditorStore';

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

type PageSummary = { id: number; title: string; };

const BLOCK_OPTIONS = [
    { label: 'Text', type: 'paragraph', description: 'Just start writing', icon: <span>T</span>, color: 'text-primary' },
    { label: 'Heading', type: 'heading', description: 'Section title', icon: <span className="font-bold">H1</span>, color: 'text-secondary' },
    { label: 'Checklist', type: 'checkbox', description: 'Track tasks', icon: <span>☑</span>, color: 'text-success' },
    { label: 'Bullet List', type: 'bullet', description: 'Simple list', icon: <span>•</span>, color: 'text-accent' },
    { label: 'Table', type: 'table', description: 'Data grid', icon: <span>▦</span>, color: 'text-warning' },
    { label: 'Quote', type: 'quote', description: 'Capture quote', icon: <span>"</span>, color: 'text-info' },
    { label: 'Code', type: 'code', description: 'Technical script', icon: <span>{`{}`}</span>, color: 'text-neutral' },
    { label: 'Image', type: 'image', description: 'Visual evidence', icon: <span>🖼</span>, color: 'text-error' },
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
  const [wikiSearch, setWikiSearch] = useState<string | null>(null);
  const [wikiActiveBlockId, setWikiActiveBlockId] = useState<string | null>(null);
  const [slashActiveBlockId, setSlashActiveBlockId] = useState<string | null>(null);
  const [slashQuery, setSlashQuery] = useState('');
  const [slashIndex, setSlashIndex] = useState(0);
  const slashMenuRef = useRef<HTMLDivElement>(null);

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
      await fetch(`/api/pages/${store.id}`, { 
        method: 'PUT', 
        headers: { 'Content-Type': 'application/json' }, 
        body: JSON.stringify({ title: store.title, category: store.category, deadline: store.deadline, tags: store.tags }) 
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
         await fetch(`/api/pages/${store.id}/blocks`, { 
             method: 'PUT', 
             headers: { 'Content-Type': 'application/json' }, 
             body: JSON.stringify({ blocks: cleanBlocks }) 
         });
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
      const filteredCount = 10; // Simple for now
      if (!slashActiveBlockId) return;
      if (e.key === 'ArrowUp') { e.preventDefault(); setSlashIndex(prev => (prev > 0 ? prev - 1 : filteredCount - 1)); }
      else if (e.key === 'ArrowDown') { e.preventDefault(); setSlashIndex(prev => (prev < filteredCount - 1 ? prev + 1 : 0)); }
      else if (e.key === 'Escape') { setSlashActiveBlockId(null); }
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
      store.setCategory('archives');
      store.setIsSaving(true);
      await fetch(`/api/pages/${store.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ category: 'archives' }) });
      store.setIsSaving(false);
      setIsFinishModalOpen(false);
      router.refresh();
      router.push('/');
  };

  if (!store.id) return <div className="p-8 animate-pulse">Initializing forensic lab...</div>;

  return (
     <div className="w-full max-w-none mx-auto py-8 relative">
        <div className="flex justify-end items-center mb-4 gap-1 px-8 shrink-0">
            <div className={`badge badge-sm border-none font-bold uppercase text-[9px] tracking-tighter px-2 h-5 mr-2 ${store.isSaving ? 'bg-warning/20 text-warning animate-pulse' : 'bg-success/10 text-success opacity-50'}`}>
                {store.isSaving ? 'Syncing...' : 'Saved'}
            </div>
            {store.category === 'projects' && (
                <button onClick={() => setIsFinishModalOpen(true)} className="btn btn-ghost btn-sm btn-circle text-success" title="Solve Case (Archive)">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" /></svg>
                </button>
            )}
            <button onClick={() => setIsDeleteModalOpen(true)} className="btn btn-ghost btn-sm btn-circle text-error" title="Delete Case File">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" /></svg>
            </button>
        </div>
        
        <div className="px-8 md:px-16 w-full">
            <input className="text-4xl font-black w-full bg-transparent border-none focus:outline-none mb-2 placeholder-base-content/10 tracking-tight" value={store.title} onChange={(e) => store.setTitle(e.target.value)} placeholder="Untitled Case" onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); if (store.blocks.length > 0) store.setFocusedBlockId(store.blocks[0].tempId); } }} />
            
            <div className="flex flex-wrap items-center gap-y-4 gap-x-8 mb-10 border-y border-base-200 py-4">
                <div className="flex items-center gap-3">
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] opacity-30">Status</span>
                    <div className="relative">
                        <select className="appearance-none bg-primary/5 hover:bg-primary/10 text-primary font-black text-[11px] uppercase tracking-tighter px-3 py-1.5 rounded-lg border border-primary/10 transition-colors cursor-pointer pr-8" value={store.category} onChange={(e) => store.setCategory(e.target.value)}>
                            <option value="inbox">Inbox</option><option value="projects">Project</option><option value="areas">Area</option><option value="resources">Resource</option><option value="archives">Archive</option>
                        </select>
                        <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-primary opacity-40"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4"><path fillRule="evenodd" d="M5.22 8.22a.75.75 0 011.06 0L10 11.94l3.72-3.72a.75.75 0 111.06 1.06l-4.25 4.25a.75.75 0 01-1.06 0L5.22 9.28a.75.75 0 010-1.06z" clipRule="evenodd" /></svg></div>
                    </div>
                </div>
                {store.category === 'projects' && (
                    <div className="flex items-center gap-3">
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] opacity-30">Deadline</span>
                        <input type="date" className="bg-base-200/50 hover:bg-base-200 text-base-content font-bold text-[11px] px-3 py-1.5 rounded-lg border border-base-300 transition-colors cursor-pointer outline-none" value={store.deadline} onChange={(e) => store.setDeadline(e.target.value)} />
                    </div>
                )}
                <div className="flex-1 min-w-[300px]"><TagInput tags={store.tags} onChange={(t) => store.setTags(t)} /></div>
            </div>
            
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
                                {slashActiveBlockId === block.tempId && (
                                    <div className={`absolute left-0 z-[100] w-64 bg-base-100/95 backdrop-blur-xl shadow-2xl border border-base-300 rounded-xl overflow-hidden mt-1 animate-in zoom-in-95 duration-150 ${index > store.blocks.length - 4 ? 'bottom-full mb-4' : 'top-full'}`}>
                                        <div className="p-2 text-[9px] font-black text-base-content/30 uppercase tracking-[0.2em] bg-base-200/50 border-b border-base-300/50">Toolkit</div>
                                        <div ref={slashMenuRef} className="p-1 max-h-[280px] overflow-y-auto scrollbar-hide">
                                            {BLOCK_OPTIONS.filter(opt => opt.label.toLowerCase().includes(slashQuery.toLowerCase())).map((opt, i) => (
                                                <button key={opt.type} data-index={i} onClick={() => { store.updateBlock(block.tempId, ''); store.addBlock(opt.type, index-1); setSlashActiveBlockId(null); }} className={`flex items-center gap-3 w-full p-1.5 rounded-lg transition-all duration-200 group/btn ${i === slashIndex ? 'bg-primary text-primary-content shadow-md shadow-primary/20' : 'hover:bg-base-200'}`}>
                                                    <div className={`w-7 h-7 rounded flex items-center justify-center text-base shadow-inner shrink-0 ${i === slashIndex ? 'bg-white/20' : 'bg-base-200 group-hover/btn:bg-base-100'}`}><span className={i === slashIndex ? 'text-white' : opt.color}>{opt.icon}</span></div>
                                                    <div className="flex flex-col text-left flex-1 min-w-0"><span className={`font-bold text-xs tracking-tight ${i === slashIndex ? 'text-white' : ''}`}>{opt.label}</span><span className={`text-[9px] truncate leading-tight ${i === slashIndex ? 'text-white/70' : 'opacity-50'}`}>{opt.description}</span></div>
                                                    {i === slashIndex && <span className="text-[9px] font-black opacity-40 bg-black/10 px-1.5 py-0.5 rounded text-white">⏎</span>}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                        <div className="h-32 -mt-4 cursor-text" onClick={() => { if (store.blocks.length > 0) store.addBlock('paragraph', store.blocks.length - 1); }}></div>
                    </div>
                </SortableContext>
            </DndContext>
            {backlinks.length > 0 && (
                <div className="mt-20 pt-12 border-t border-base-300 pb-20">
                    <h3 className="text-xs font-bold uppercase tracking-widest text-base-content/30 mb-6">Cross References (Linked Clues)</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">{backlinks.map(link => (
                        <Link href={`/p/${link.id}`} key={link.id} className="p-4 bg-base-200/50 hover:bg-base-200 rounded-xl border border-base-300 transition-colors flex items-center gap-3"><span className="opacity-30">📁</span><span className="font-semibold text-primary text-sm">{link.title}</span></Link>
                    ))}</div>
                </div>
            )}
        </div>
        <ConfirmModal isOpen={isDeleteModalOpen} title="Delete Page" message="Delete this evidence permanently?" confirmText="Delete" onConfirm={async () => { await fetch(`/api/pages/${store.id}`, { method: 'DELETE' }); setIsDeleteModalOpen(false); router.push('/'); router.refresh(); }} onCancel={() => setIsDeleteModalOpen(false)} />
        <ConfirmModal isOpen={isFinishModalOpen} title="Solve Case" message="Mark this project as solved and archive it?" confirmText="Solve & Archive" type="success" onConfirm={confirmFinishProject} onCancel={() => setIsFinishModalOpen(false)} />
     </div>
  );
}

function SortableBlock({ block, index, previousBlockType, onUpdate, onDelete, onEnter, onBackspace, allPages, isFocused, slashActive, onSlashKeyDown }: any) {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: block.tempId });
    const isList = ['bullet', 'checkbox'].includes(block.type);
    const isConsecutiveList = isList && previousBlockType === block.type;
    const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.5 : 1, zIndex: isDragging ? 999 : 'auto', position: 'relative' as 'relative', marginTop: isConsecutiveList ? '-4px' : '8px' };
    
    const renderBlockContent = () => {
        const commonProps = { value: block.content, onChange: (val: string) => onUpdate(block.tempId, val), isFocused, onKeyDown: (e: any) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); onEnter(); } if (e.key === 'Backspace' && block.content === '') { e.preventDefault(); onBackspace(); } if (slashActive) onSlashKeyDown(e); } };
        switch (block.type) {
            case 'heading': return <HeadingBlock {...commonProps} />;
            case 'checkbox': return <ChecklistBlock {...commonProps} allPages={allPages} />;
            case 'table': return <TableBlock {...commonProps} />;
            case 'code': return <CodeBlock {...commonProps} />;
            case 'image': return <ImageBlock {...commonProps} />;
            case 'link_preview': return <BookmarkBlock {...commonProps} />;
            case 'divider': return <DividerBlock />;
            default: return <TextBlock {...commonProps} type={block.type} allPages={allPages} />;
        }
    };

    return (
        <div ref={setNodeRef} style={style} className="group relative pl-8 -ml-8 hover:bg-base-200/30 rounded px-2 py-0.5 transition-colors">
            <div {...attributes} {...listeners} className="absolute left-0 top-1.5 opacity-0 group-hover:opacity-100 transition-opacity cursor-grab text-base-content/30 p-1 hover:text-primary z-20"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4"><path d="M10 3a1.5 1.5 0 110 3 1.5 1.5 0 010-3zM10 8.5a1.5 1.5 0 110 3 1.5 1.5 0 010-3zM11.5 15.5a1.5 1.5 0 10-3 0 1.5 1.5 0 003 0z" /></svg></div>
            {renderBlockContent()}
            <div className="absolute -right-8 top-1 opacity-0 group-hover:opacity-100 transition-opacity"><button onClick={() => onDelete(block.tempId)} className="btn btn-xs btn-ghost text-error">×</button></div>
        </div>
    );
}