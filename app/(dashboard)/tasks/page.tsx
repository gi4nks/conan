import { blockService } from '@/lib/services/blockService';
import Link from 'next/link';
import { toggleBlockAction } from '@/lib/actions';
import { pageService } from '@/lib/services/pageService';

export const dynamic = 'force-dynamic';

interface PageProps {
    searchParams: Promise<{ showCompleted?: string }>;
}

export default async function TasksPage({ searchParams }: PageProps) {
    const { showCompleted } = await searchParams;
    const isShowingAll = showCompleted === 'true';

    const allTasks = blockService.getAllTasks();
    const pendingTasks = allTasks.filter((t: any) => !t.content.startsWith('[x] '));
    const completedCount = allTasks.length - pendingTasks.length;

    // Decide which tasks to display
    const displayedTasks = isShowingAll ? allTasks : pendingTasks;

    // Group tasks by page
    const groupedTasks = displayedTasks.reduce((acc: any, task: any) => {
        if (!acc[task.page_id]) {
            acc[task.page_id] = {
                id: task.page_id,
                title: task.page_title,
                category: task.page_category,
                deadline: task.page_deadline,
                tasks: []
            };
        }
        acc[task.page_id].tasks.push(task);
        return acc;
    }, {});

    const groupedArray = Object.values(groupedTasks);

    return (
        <div className="w-full max-w-5xl mx-auto py-8 px-6">
            <header className="flex items-center justify-between mb-8 pb-4 border-b border-base-300">
                <div className="flex items-center gap-4">
                    <div className="h-8 w-1 bg-primary rounded-full"></div>
                    <div>
                        <h1 className="text-xl font-black uppercase tracking-[0.2em] text-base-content">Task Registry</h1>
                        <p className="text-[10px] font-mono opacity-50 uppercase tracking-widest">
                            {isShowingAll ? 'Full database dump' : 'Active investigation items'}: {displayedTasks.length} entries
                        </p>
                    </div>
                </div>
                
                <div className="flex items-center gap-3">
                    {completedCount > 0 && (
                        <Link 
                            href={isShowingAll ? '/tasks' : '/tasks?showCompleted=true'}
                            className="btn btn-ghost btn-xs font-mono text-[9px] uppercase tracking-tighter opacity-50 hover:opacity-100"
                        >
                            {isShowingAll ? 'Hide Completed' : `Show Completed (${completedCount})`}
                        </Link>
                    )}
                    <div className="bg-base-200 px-3 py-1 rounded border border-base-300 flex items-baseline gap-2">
                        <span className="text-sm font-black text-primary">{pendingTasks.length}</span>
                        <span className="text-[9px] font-bold uppercase opacity-40">Active</span>
                    </div>
                </div>
            </header>

            {groupedArray.length === 0 ? (
                <div className="py-20 text-center border-2 border-dashed border-base-300 rounded-xl bg-base-200/10">
                    <p className="text-sm font-mono opacity-30 uppercase tracking-tighter">
                        {isShowingAll ? 'Registry is empty' : 'All clear. No pending action items.'}
                    </p>
                    {!isShowingAll && completedCount > 0 && (
                        <Link href="/tasks?showCompleted=true" className="text-[10px] font-bold text-primary uppercase mt-4 inline-block hover:underline">
                            View {completedCount} completed items
                        </Link>
                    )}
                </div>
            ) : (
                <div className="space-y-6">
                    {groupedArray.map((group: any) => (
                        <div key={group.id} className="overflow-hidden">
                            <div className="flex items-center gap-3 mb-2 px-2">
                                <span className={`w-2 h-2 rounded-full ${getCategoryBg(group.category)}`}></span>
                                <Link href={`/p/${group.id}`} className="hover:text-primary transition-colors">
                                    <h2 className="text-xs font-black uppercase tracking-tight truncate max-w-md">
                                        {group.title || 'Untitled'}
                                    </h2>
                                </Link>
                                <div className="h-[1px] flex-1 bg-base-200"></div>
                                {group.deadline && (
                                    <span className="text-[9px] font-mono text-error font-bold whitespace-nowrap">
                                        [{group.deadline}]
                                    </span>
                                )}
                            </div>
                            
                            <div className="grid grid-cols-1 divide-y divide-base-200/50 bg-base-100/50 border border-base-200 rounded-lg">
                                {group.tasks.map((task: any) => (
                                    <TaskItem key={task.id} task={task} />
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

function TaskItem({ task }: { task: any }) {
    const isChecked = task.content.startsWith('[x] ');
    const text = isChecked ? task.content.substring(4) : task.content;

    return (
        <form action={async () => {
            'use server';
            await toggleBlockAction(task.id);
        }} className="group flex items-center gap-3 py-2 px-3 hover:bg-base-200/30 transition-all">
            <button type="submit" className="shrink-0 outline-none">
                <div className={`w-4 h-4 rounded border transition-all flex items-center justify-center ${isChecked ? 'bg-primary/20 border-primary text-primary' : 'border-base-400 group-hover:border-primary'}`}>
                    {isChecked && (
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3 h-3">
                            <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" />
                        </svg>
                    )}
                </div>
            </button>
            <span className={`text-sm leading-none pt-0.5 truncate flex-1 ${isChecked ? 'line-through opacity-30' : 'text-base-content/80'}`}>
                {text}
            </span>
            <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                <span className="text-[9px] font-mono opacity-30 uppercase">ID:{task.id}</span>
            </div>
        </form>
    );
}

function getCategoryBg(category: string) {
    switch (category) {
        case 'projects': return 'bg-primary';
        case 'areas': return 'bg-success';
        case 'resources': return 'bg-warning';
        case 'archives': return 'bg-base-content/30';
        default: return 'bg-secondary';
    }
}
