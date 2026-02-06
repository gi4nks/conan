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

    const displayedTasks = isShowingAll ? allTasks : pendingTasks;

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
        <div className="w-full py-8 px-8">
            <header className="mb-8">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold mb-2">Task Registry</h1>
                        <p className="text-base-content/60">
                            {isShowingAll ? 'Full database dump' : 'Review and complete your active action items.'}
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        {completedCount > 0 && (
                            <Link 
                                href={isShowingAll ? '/tasks' : '/tasks?showCompleted=true'}
                                className="btn btn-ghost btn-xs font-mono text-[10px] uppercase tracking-tighter opacity-50 hover:opacity-100"
                            >
                                {isShowingAll ? 'Hide Completed' : `Show Completed (${completedCount})`}
                            </Link>
                        )}
                        <div className="bg-base-200 px-3 py-1 rounded-lg border border-base-300 flex items-baseline gap-2">
                            <span className="text-sm font-bold text-primary">{pendingTasks.length}</span>
                            <span className="text-[10px] font-bold uppercase opacity-40 tracking-wider">Active</span>
                        </div>
                    </div>
                </div>
            </header>

            {groupedArray.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-64 text-base-content/30">
                    <div className="text-4xl mb-4">🎉</div>
                    <p className="text-lg font-medium">All Clear</p>
                    <p className="text-sm">No pending tasks in any investigation.</p>
                    {!isShowingAll && completedCount > 0 && (
                        <Link href="/tasks?showCompleted=true" className="btn btn-link btn-xs mt-2 text-primary">
                            View {completedCount} completed items
                        </Link>
                    )}
                </div>
            ) : (
                <div className="space-y-8">
                    {groupedArray.map((group: any) => (
                        <div key={group.id} className="w-full">
                            <div className="flex items-center gap-2 mb-3 px-1">
                                <span className={`w-2 h-2 rounded-full ${getCategoryBg(group.category)}`}></span>
                                <Link href={`/p/${group.id}`} className="text-xs font-bold uppercase tracking-widest text-base-content/40 hover:text-primary transition-colors">
                                    {group.title || 'Untitled'}
                                </Link>
                                {group.deadline && (
                                    <span className="text-[10px] font-mono text-error font-bold ml-2">
                                        [{group.deadline}]
                                    </span>
                                )}
                            </div>
                            
                            <div className="space-y-2">
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
        }} className="card bg-base-100 shadow-sm border border-base-200 hover:border-primary/50 transition-colors">
            <button type="submit" className="flex items-center gap-4 p-4 text-left w-full group">
                <div className={`w-5 h-5 rounded-md border-2 shrink-0 flex items-center justify-center transition-all ${isChecked ? 'bg-primary border-primary text-primary-content' : 'border-base-300 group-hover:border-primary'}`}>
                    {isChecked && (
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5">
                            <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" />
                        </svg>
                    )}
                </div>
                <span className={`text-[17px] font-bold leading-tight flex-1 truncate ${isChecked ? 'line-through opacity-30' : 'text-base-content'}`}>
                    {text}
                </span>
                <span className="text-[10px] font-mono opacity-0 group-hover:opacity-20 transition-opacity uppercase tracking-tighter">ID:{task.id}</span>
            </button>
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