'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import ConfirmModal from './ConfirmModal';

type Page = {
  id: number;
  title: string;
  created_at: number;
};

export default function InboxList({ items }: { items: Page[] }) {
  const router = useRouter();
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const handleMove = async (id: number, category: string) => {
    await fetch(`/api/pages/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ category }),
    });
    router.refresh();
  };

  const confirmDelete = async () => {
    if (deleteId) {
        await fetch(`/api/pages/${deleteId}`, { method: 'DELETE' });
        setDeleteId(null);
        router.refresh();
    }
  };

  if (items.length === 0) {
      return (
          <div className="flex flex-col items-center justify-center h-64 text-base-content/30">
              <div className="text-4xl mb-4">🎉</div>
              <p className="text-lg font-medium">Inbox Zero</p>
              <p className="text-sm">You are all caught up.</p>
          </div>
      );
  }

  return (
    <>
        <div className="max-w-4xl mx-auto space-y-4">
        {items.map((page) => (
            <div key={page.id} className="card bg-base-100 shadow-sm border border-base-200 flex-row items-center p-4 gap-4 hover:border-primary/50 transition-colors">
                
                <div className="flex-1 min-w-0">
                    <Link href={`/p/${page.id}`} className="font-bold text-lg hover:underline hover:text-primary truncate block">
                        {page.title || 'Untitled'}
                    </Link>
                    <div className="text-xs text-base-content/50 mt-1">
                        {new Date(page.created_at * 1000).toLocaleDateString()}
                    </div>
                </div>

                <div className="join">
                    <button onClick={() => handleMove(page.id, 'projects')} className="btn btn-sm join-item btn-ghost hover:bg-base-200 hover:text-primary" title="Move to Projects">Project</button>
                    <button onClick={() => handleMove(page.id, 'areas')} className="btn btn-sm join-item btn-ghost hover:bg-base-200 hover:text-secondary" title="Move to Areas">Area</button>
                    <button onClick={() => handleMove(page.id, 'resources')} className="btn btn-sm join-item btn-ghost hover:bg-base-200 hover:text-accent" title="Move to Resources">Resource</button>
                    <button onClick={() => handleMove(page.id, 'archives')} className="btn btn-sm join-item btn-ghost hover:bg-base-200" title="Archive">Archive</button>
                </div>

                <button onClick={() => setDeleteId(page.id)} className="btn btn-sm btn-ghost text-error btn-square" title="Delete">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                    <path fillRule="evenodd" d="M8.75 1A2.75 2.75 0 006 3.75v.443c-.795.077-1.584.176-2.365.298a.75.75 0 10.23 1.482l.149-.022.841 10.518A2.75 2.75 0 007.596 19h4.807a2.75 2.75 0 002.742-2.53l.841-10.52.149.023a.75.75 0 00.23-1.482A41.03 41.03 0 0014 4.193V3.75A2.75 2.75 0 0011.25 1h-2.5zM10 4c.84 0 1.673.025 2.5.075V3.75c0-.69-.56-1.25-1.25-1.25h-2.5c-.69 0-1.25.56-1.25 1.25v.325C8.327 4.025 9.16 4 10 4zM8.58 7.72a.75.75 0 00-1.5.06l.3 7.5a.75.75 0 101.5-.06l-.3-7.5zm4.34.06a.75.75 0 10-1.5-.06l-.3 7.5a.75.75 0 101.5.06l.3-7.5z" clipRule="evenodd" />
                    </svg>
                </button>
            </div>
        ))}
        </div>

        <ConfirmModal 
            isOpen={!!deleteId} 
            title="Delete Page" 
            message="Are you sure you want to delete this page? This action cannot be undone." 
            confirmText="Delete"
            onConfirm={confirmDelete} 
            onCancel={() => setDeleteId(null)} 
        />
    </>
  );
}