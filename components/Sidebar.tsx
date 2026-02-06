'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import { restorePageAction, deletePagePermanentlyAction, emptyTrashAction } from '@/lib/actions';

export default function Sidebar({ pages, taskCount }: { pages: any[], taskCount: number }) {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const grouped = {
    inbox: pages.filter(p => (!p.category || p.category === 'inbox') && p.is_deleted === 0),
    projects: pages.filter(p => p.category === 'projects' && p.is_deleted === 0),
    areas: pages.filter(p => p.category === 'areas' && p.is_deleted === 0),
    resources: pages.filter(p => p.category === 'resources' && p.is_deleted === 0),
    archives: pages.filter(p => p.category === 'archives' && p.is_deleted === 0),
    trash: pages.filter(p => p.is_deleted === 1),
  };

  const renderSection = (title: string, items: any[], colorClass: string, defaultOpen = false) => (
      <details className="group mb-1" open={defaultOpen}>
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
                <SidebarItem key={page.id} page={page} isActive={pathname === `/p/${page.id}`} colorClass={colorClass} />
            ))}
          </ul>
      </details>
  );

  if (!mounted) return <aside className="w-64 bg-base-100 shadow-xl flex flex-col shrink-0 h-full relative border-r border-base-300"></aside>;

  return (
    <aside className="w-64 bg-base-100 shadow-xl flex flex-col shrink-0 h-full relative">
        <div className="h-16 border-b border-base-300 flex items-center px-6">
            <Link href="/" className="flex items-center gap-2 group">
                <span className="text-2xl group-hover:scale-110 transition-transform">🔍</span>
                <h1 className="text-xl font-black text-primary tracking-tighter uppercase">Conan</h1>
            </Link>
        </div>

        <div className="flex-1 overflow-y-auto py-2 pb-12 scrollbar-thin">
            <div className="mb-2">
                <Link href="/tasks" className={`flex items-center justify-between px-4 py-2 hover:bg-base-200 rounded-lg mx-2 transition-colors group ${pathname === '/tasks' ? 'bg-base-200 shadow-inner' : ''}`}>
                    <h3 className={`text-[11px] font-black uppercase tracking-[0.12em] flex items-center gap-2 ${pathname === '/tasks' ? 'text-primary' : 'text-base-content/60'}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${pathname === '/tasks' ? 'bg-primary' : 'bg-base-content/20'}`}></span> Tasks
                    </h3>
                    {taskCount > 0 && (
                        <span className={`text-[11px] font-mono opacity-40 ${pathname === '/tasks' ? 'text-primary' : ''}`}>{taskCount}</span>
                    )}
                </Link>

                <Link href="/inbox" className="flex items-center justify-between px-4 py-2 hover:bg-base-200 rounded-lg mx-2 transition-colors group">
                    <h3 className="text-[11px] font-black text-secondary uppercase tracking-[0.12em] flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-secondary"></span> Inbox
                    </h3>
                    <span className="text-[11px] font-mono opacity-40 text-secondary">{grouped.inbox.length}</span>
                </Link>

                {grouped.inbox.length > 0 && (
                    <ul className="menu menu-sm w-full gap-0.5 pl-6 mt-1 pr-2">
                        {grouped.inbox.map((page) => (
                            <SidebarItem key={page.id} page={page} isActive={pathname === `/p/${page.id}`} colorClass="text-secondary" />
                        ))}
                    </ul>
                )}
            </div>

            {renderSection('Projects', grouped.projects, 'text-primary', true)}
            {renderSection('Areas', grouped.areas, 'text-success')}
            {renderSection('Resources', grouped.resources, 'text-warning')}
            {renderSection('Archives', grouped.archives, 'text-slate-400')}

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
            <a href="/api/export" target="_blank" className="btn btn-ghost btn-xs btn-square text-base-content/50 hover:text-primary" title="Export Backup (.zip)">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm.75-11.25a.75.75 0 00-1.5 0v2.5h-2.5a.75.75 0 000 1.5h2.5v2.5a.75.75 0 001.5 0v-2.5h2.5a.75.75 0 000-1.5h-2.5v-2.5z" clipRule="evenodd" /></svg>
            </a>
        </div>
    </aside>
  );
}

function SidebarItem({ page, isActive, colorClass }: any) {
    let deadlineLabel = null;

    if (page.category === 'projects') {
        if (!page.deadline) {
            deadlineLabel = <span title="No Deadline Set" className="text-base-content/20 text-[11px]">--</span>;
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
        <li className="relative group/item">
            <Link 
                href={`/p/${page.id}`} 
                className={`flex justify-between items-center py-2 pl-4 pr-2 border-l-2 rounded-none transition-all text-[13px] ${isActive ? `${activeBg} ${activeBorder} ${colorClass} font-bold shadow-inner` : 'border-base-300 hover:border-primary/50'}`}>
                <span className="truncate flex-1">{page.title || 'Untitled'}</span>
                {deadlineLabel && <span className="ml-2 shrink-0">{deadlineLabel}</span>}
            </Link>
        </li>
    );
}
