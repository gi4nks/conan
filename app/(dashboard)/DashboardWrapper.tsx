'use client';

import { useState, useEffect } from 'react';
import Sidebar from '@/components/Sidebar';
import HeaderToolbar from '@/components/HeaderToolbar';
import CommandPalette from '@/components/CommandPalette';
export default function DashboardWrapper({
  children,
  pages
}: {
  children: React.ReactNode;
  pages: any[];
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  return (
    <div className="flex h-screen bg-base-200 overflow-hidden">
      <CommandPalette />
      
      {/* Sidebar with toggle state */}
      <div className={`transition-all duration-300 ease-in-out h-full overflow-hidden ${isSidebarOpen ? 'w-64 border-r border-base-300' : 'w-0'}`}>
        <div className="w-64 h-full">
            <Sidebar pages={pages} />
        </div>
      </div>

      <div className="flex-1 flex flex-col h-screen overflow-hidden relative">
        <header className="bg-base-100 h-16 border-b border-base-300 flex items-center justify-between px-4 shrink-0 z-20">
           <div className="flex items-center gap-2">
               <button 
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="btn btn-ghost btn-sm btn-circle"
                title="Toggle Sidebar"
               >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25H12" />
                  </svg>
               </button>

               <div className="text-sm font-bold text-base-content/20 uppercase tracking-widest hidden lg:block ml-2">
                  Investigation in progress
               </div>
           </div>
           
           <HeaderToolbar />
        </header>

        <main className="flex-1 overflow-auto bg-base-100 relative">
           {children}
        </main>

        {/* Unified Footer */}
        <footer className="bg-base-100 border-t border-base-300 px-8 h-10 flex items-center shrink-0 z-20">
            <div className="text-xs text-base-content/40 italic">
                Type <kbd className="kbd kbd-xs">/</kbd> for toolkit, <kbd className="kbd kbd-xs">[[</kbd> to link clues, <kbd className="kbd kbd-xs">Cmd+B/I/U</kbd> for style.
            </div>
        </footer>
      </div>
    </div>
  );
}
