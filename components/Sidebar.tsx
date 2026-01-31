'use client';

import { useState, useOptimistic, useTransition } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { movePageAction, restorePageAction, deletePagePermanentlyAction, emptyTrashAction } from '@/lib/actions';
import {
  DndContext,
  DragEndEvent,
  useDraggable,
  useDroppable,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';

export default function Sidebar({ pages }: { pages: any[] }) {
  const [filter, setFilter] = useState('');
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();

  const [optimisticPages, addOptimisticPage] = useOptimistic(
    pages,
    (state, { id, newCategory }: { id: number, newCategory: string }) => {
      return state.map(p => p.id === id ? { ...p, category: newCategory } : p);
    }
  );

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    })
  );

  const grouped = {
    inbox: optimisticPages.filter(p => (!p.category || p.category === 'inbox') && p.title.toLowerCase().includes(filter.toLowerCase())),
    projects: optimisticPages.filter(p => p.category === 'projects' && p.title.toLowerCase().includes(filter.toLowerCase())),
    areas: optimisticPages.filter(p => p.category === 'areas' && p.title.toLowerCase().includes(filter.toLowerCase())),
    resources: optimisticPages.filter(p => p.category === 'resources' && p.title.toLowerCase().includes(filter.toLowerCase())),
    archives: optimisticPages.filter(p => p.category === 'archives' && p.title.toLowerCase().includes(filter.toLowerCase())),
    trash: optimisticPages.filter(p => p.is_deleted === 1),
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) return;

    const pageId = active.id as number;
    const newCategory = over.id as string;

    const pageToUpdate = optimisticPages.find(p => p.id === pageId);
    if (pageToUpdate && pageToUpdate.category !== newCategory) {
        startTransition(async () => {
            addOptimisticPage({ id: pageId, newCategory });
            await movePageAction(pageId, newCategory);
        });
    }
  };

  const renderSection = (title: string, items: any[], colorClass: string, defaultOpen = false) => (
      <details className="group mb-1" open={defaultOpen || filter !== ''}>
          <summary className="flex items-center justify-between px-4 py-2 hover:bg-base-200 rounded-lg cursor-pointer transition-colors list-none [&::-webkit-details-marker]:hidden">
              <div className="flex items-center gap-2.5">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={`w-4 h-4 opacity-40 group-open:rotate-90 transition-transform ${colorClass}`}>
                    <path fillRule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clipRule="evenodd" />
                  </svg>
                  <span className={`text-[11px] font-black uppercase tracking-[0.12em] ${colorClass} opacity-70`}>{title}</span>
              </div>
              <span className="text-[11px] font-mono opacity-40">{items.length}</span>
          </summary>
          <ul className="menu menu-sm w-full gap-0.5 pl-6 mt-1 pr-2">
            {items.length === 0 && <li className="text-xs text-base-content/30 px-4 py-1 italic">No results</li>}
            {items.map((page) => (
                <DraggablePage key={page.id} page={page} isActive={pathname === `/p/${page.id}`} colorClass={colorClass} />
            ))}
          </ul>
      </details>
  );

  return (
    <DndContext id="sidebar-dnd-context" sensors={sensors} onDragEnd={handleDragEnd}>
        <aside className="w-64 bg-base-100 shadow-xl flex flex-col shrink-0 h-full relative">
        <div className="h-16 border-b border-base-300 flex items-center px-6">
            <Link href="/" className="flex items-center gap-2 group">
                <span className="text-2xl group-hover:scale-110 transition-transform">🔍</span>
                <h1 className="text-xl font-black text-primary tracking-tighter uppercase">Conan</h1>
            </Link>
        </div>

        <div className="p-4 border-b border-base-200 bg-base-200/20">
            <div className="relative">
                <input 
                    type="text" 
                    placeholder="Filter case files..." 
                    className="input input-sm input-bordered w-full pl-8 bg-base-100 focus:border-primary/50 text-sm"
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                />
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 absolute left-2.5 top-1/2 -translate-y-1/2 opacity-30">
                    <path fillRule="evenodd" d="M9 3.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11zM2 9a7 7 0 1112.452 4.391l3.328 3.329a.75.75 0 11-1.06 1.06l-3.329-3.328A7 7 0 012 9z" clipRule="evenodd" />
                </svg>
            </div>
        </div>
        
        <div className="flex-1 overflow-y-auto py-2 pb-12 scrollbar-thin">
            <DroppableCategory id="inbox">
                <div className="mb-2">
                    <Link href="/inbox" className="flex items-center justify-between px-4 py-2 hover:bg-base-200 rounded-lg mx-2 transition-colors group">
                        <h3 className="text-[11px] font-black text-error uppercase tracking-[0.12em] flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-error animate-pulse"></span> Inbox
                        </h3>
                        <span className="text-[11px] font-mono opacity-40 text-error">{grouped.inbox.length}</span>
                    </Link>
                    {grouped.inbox.length > 0 && (
                        <ul className="menu menu-sm w-full gap-0.5 pl-6 mt-1 pr-2">
                            {grouped.inbox.map((page) => (
                                <DraggablePage key={page.id} page={page} isActive={pathname === `/p/${page.id}`} colorClass="text-error" />
                            ))}
                        </ul>
                    )}
                </div>
            </DroppableCategory>

            <DroppableCategory id="projects">
                {renderSection('Projects', grouped.projects, 'text-primary', true)}
            </DroppableCategory>
            
            <DroppableCategory id="areas">
                {renderSection('Areas', grouped.areas, 'text-success')}
            </DroppableCategory>

            <DroppableCategory id="resources">
                {renderSection('Resources', grouped.resources, 'text-warning')}
            </DroppableCategory>

            <DroppableCategory id="archives">
                {renderSection('Archives', grouped.archives, 'text-slate-400')}
            </DroppableCategory>

            <details className="group mb-1">
                <summary className="flex items-center justify-between px-4 py-2 hover:bg-base-200 rounded-lg cursor-pointer transition-colors list-none [&::-webkit-details-marker]:hidden">
                    <div className="flex items-center gap-2.5">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 opacity-40 text-error">
                            <path fillRule="evenodd" d="M8.75 1A2.75 2.75 0 006 3.75V4H4a1 1 0 000 2h.706l.452 12.14A2.75 2.75 0 007.906 21h4.188a2.75 2.75 0 002.748-2.86L15.294 6H16a1 1 0 100-2h-2v-.25A2.75 2.75 0 0011.25 1h-2.5zM8 4h4v-.25a.75.75 0 00-.75-.75h-2.5a.75.75 0 00-.75.75V4zm1.25 4a.75.75 0 01.75.75v7.5a.75.75 0 01-1.5 0v-7.5a.75.75 0 01.75-.75zM12 8.75a.75.75 0 00-1.5 0v7.5a.75.75 0 001.5 0v-7.5z" clipRule="evenodd" />
                        </svg>
                        <span className="text-[11px] font-black uppercase tracking-[0.15em] text-error opacity-60">Trash</span>
                    </div>
                    <span className="text-[11px] font-mono opacity-30">{grouped.trash.length}</span>
                </summary>
                <ul className="menu menu-sm w-full gap-0.5 pl-6 mt-1 pr-2">
                    {grouped.trash.length === 0 && <li className="text-xs text-base-content/30 px-4 py-1 italic">Empty</li>}
                    {grouped.trash.map((page) => (
                        <li key={page.id} className="flex flex-row items-center justify-between group/trash-item">
                            <span className="truncate flex-1 text-base-content/40 italic line-through text-[13px] py-2">{page.title || 'Untitled'}</span>
                            <div className="flex gap-1 opacity-0 group-hover/trash-item:opacity-100 transition-opacity">
                                <button onClick={() => restorePageAction(page.id)} className="btn btn-ghost btn-xs btn-square text-success" title="Restore">↺</button>
                                <button onClick={() => deletePagePermanentlyAction(page.id)} className="btn btn-ghost btn-xs btn-square text-error" title="Delete Permanently">×</button>
                            </div>
                        </li>
                    ))}
                    {grouped.trash.length > 0 && (
                        <li className="mt-2 border-t border-base-200 pt-2">
                            <button onClick={() => emptyTrashAction()} className="btn btn-ghost btn-xs text-error font-bold uppercase text-[9px] tracking-widest w-full">Empty Trash</button>
                        </li>
                    )}
                </ul>
            </details>
        </div>
        
        <div className="absolute bottom-0 left-0 w-full h-10 border-t border-base-300 flex items-center px-4 bg-base-100 z-10 gap-2">
            <Link href="/stats" className="btn btn-ghost btn-xs btn-square text-base-content/50 hover:text-secondary" title="Crime Lab (Statistics)">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104v1.244c0 .892-.722 1.615-1.612 1.615H7.445m-4.798 3.06c-.076.375-.115.748-.115 1.12V18a2.25 2.25 0 0 0 2.25 2.25h12.684A2.25 2.25 0 0 0 19.703 18v-6.939c0-.372-.039-.745-.115-1.12m-16.14 3.06c.772.298 1.446.733 2.196 1.081 1.02.476 2.14.765 3.276.765 1.065 0 2.108-.256 3.13-.603 1.218-.413 2.431-.964 3.53-1.557a16.69 16.69 0 0 0 4.215-2.857m-4.215 2.857a16.018 16.018 0 0 1-3.412 1.714c-1.041.394-2.132.621-3.21.621-1.177 0-2.319-.271-3.476-.713a17.43 17.43 0 0 1-2.744-1.322m0 0V5.25a2.25 2.25 0 0 1 2.25-2.25h1.35m11.35 12.607c.01.042.02.085.032.128m-9.59-12.607V5.25A2.25 2.25 0 0 1 11.25 3h1.35m0 0h3.03c1.034 0 1.907.707 2.124 1.702l.422 1.94c.223.994.03 2.03-.509 2.851l-1.447 2.185a4.5 4.5 0 0 0-.702 2.407V18" /></svg>
            </Link>
            <a href="/api/export" target="_blank" className="btn btn-ghost btn-xs btn-square text-base-content/50 hover:text-primary" title="Export Backup (.zip)">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm.75-11.25a.75.75 0 00-1.5 0v2.5h-2.5a.75.75 0 000 1.5h2.5v2.5a.75.75 0 001.5 0v-2.5h2.5a.75.75 0 000-1.5h-2.5v-2.5z" clipRule="evenodd" /></svg>
            </a>
        </div>
        </aside>
    </DndContext>
  );
}

function SidebarSection({ title, items, pathname, filter }: any) {
    // This is no longer used directly as we integrated it into Sidebar renderSection
    return null;
}

function DraggablePage({ page, isActive, colorClass }: any) {
    const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
        id: page.id,
    });

    const style = transform ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
        zIndex: 100,
    } : undefined;

        let deadlineLabel = null;

        if (page.category === 'projects') {

            if (!page.deadline) {

                deadlineLabel = <span title="Missing Deadline" className="text-error animate-pulse text-[11px]">⚠️</span>;

            } else {

                const today = new Date(); today.setHours(0,0,0,0);

                const d = new Date(page.deadline);

                const diff = d.getTime() - today.getTime();

                const days = Math.ceil(diff / (1000 * 60 * 60 * 24));

                if (days < 0) deadlineLabel = <span className="text-[10px] font-bold text-error">EXP</span>;

                else if (days === 0) deadlineLabel = <span className="text-[10px] font-bold text-warning">NOW</span>;

                else if (days <= 3) deadlineLabel = <span className="text-[10px] font-bold text-warning">{days}d</span>;

                else deadlineLabel = <span className="text-[10px] opacity-40 font-mono">{days}d</span>;

            }

        }

    

        const activeBg = colorClass.replace('text-', 'bg-') + '/5';

        const activeBorder = colorClass.replace('text-', 'border-');

    

        return (

            <li ref={setNodeRef} style={style} className={`relative group/item ${isDragging ? 'opacity-50' : ''}`}>

                <div {...attributes} {...listeners} className="absolute left-1 top-1/2 -translate-y-1/2 opacity-0 group-hover/item:opacity-100 cursor-grab p-1 text-base-content/20 hover:text-primary z-20">

                    ⋮⋮

                </div>

                <Link 

                    href={`/p/${page.id}`} 

                    className={`flex justify-between items-center py-2 pl-7 pr-2 border-l-2 rounded-none transition-all text-[13px] ${isActive ? `${activeBg} ${activeBorder} ${colorClass} font-bold shadow-inner` : 'border-base-300 hover:border-primary/50'}`}>

                    <span className="truncate flex-1">{page.title || 'Untitled'}</span>

                    {deadlineLabel && <span className="ml-2 shrink-0">{deadlineLabel}</span>}

                </Link>

            </li>

        );

    
}

function DroppableCategory({ id, children }: any) {
    const { setNodeRef, isOver } = useDroppable({ id });
    return (
        <div ref={setNodeRef} className={`transition-colors rounded-xl mx-1 ${isOver ? 'bg-primary/10 ring-2 ring-primary/20 ring-inset' : ''}`}>
            {children}
        </div>
    );
}
