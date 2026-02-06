import { blockService } from '@/lib/services/blockService';
import Link from 'next/link';
import { toggleBlockAction } from '@/lib/actions';
import { pageService } from '@/lib/services/pageService';

export const dynamic = 'force-dynamic';

export default async function TasksPage() {
    const tasks = blockService.getAllTasks();
    const allPages = pageService.getAllPages();

    const pendingCount = tasks.filter((t: any) => !t.content.startsWith('[x] ')).length;

    // Group tasks by page
    const groupedTasks = tasks.reduce((acc: any, task: any) => {
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
        <div className="w-full max-w-5xl mx-auto py-12 px-8">
            <header className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6 border-b-2 border-primary/20 pb-8">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 bg-primary text-primary-content flex items-center justify-center rounded-lg font-black text-xl shadow-lg shadow-primary/20">
                            ✓
                        </div>
                        <h1 className="text-4xl font-black tracking-tighter uppercase text-base-content">Task Registry</h1>
                    </div>
                    <p className="text-base-content/50 font-mono text-xs uppercase tracking-[0.3em]">Centralized intelligence & action items</p>
                </div>
                
                <div className="flex gap-4">
                    <div className="bg-base-200 px-6 py-3 rounded-xl border border-base-300 flex flex-col items-center min-w-[120px]">
                        <span className="text-2xl font-black text-primary">{pendingCount}</span>
                        <span className="text-[10px] font-bold uppercase opacity-40">Pending</span>
                    </div>
                    <div className="bg-base-200 px-6 py-3 rounded-xl border border-base-300 flex flex-col items-center min-w-[120px]">
                        <span className="text-2xl font-black opacity-40">{tasks.length - pendingCount}</span>
                        <span className="text-[10px] font-bold uppercase opacity-40">Completed</span>
                    </div>
                </div>
            </header>

            {groupedArray.length === 0 ? (
                <div className="bg-base-200/30 rounded-3xl p-20 text-center border-4 border-dotted border-base-300">
                    <div className="text-5xl mb-4 opacity-20">📂</div>
                    <p className="text-base-content/40 font-medium italic">The registry is currently empty. No active tasks detected.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-12">
                    {groupedArray.map((group: any) => (
                        <section key={group.id} className="relative">
                            <div className="sticky top-0 z-10 bg-base-100/80 backdrop-blur-md py-4 mb-6 flex items-center justify-between border-b border-base-300/50">
                                <Link href={`/p/${group.id}`} className="group/link flex items-center gap-4">
                                    <div className={`w-2 h-8 rounded-full ${getCategoryBg(group.category)}`}></div>
                                    <div>
                                        <h2 className="text-xl font-black group-hover/link:text-primary transition-colors flex items-center gap-2">
                                            {group.title || 'Untitled Investigation'}
                                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 opacity-0 -translate-x-2 group-hover/link:opacity-100 group-hover/link:translate-x-0 transition-all">
                                                <path fillRule="evenodd" d="M3 10a.75.75 0 01.75-.75h10.638L10.23 5.29a.75.75 0 111.04-1.08l5.5 5.25a.75.75 0 010 1.08l-5.5 5.25a.75.75 0 11-1.04-1.08l4.158-3.96H3.75A.75.75 0 013 10z" clipRule="evenodd" />
                                            </svg>
                                        </h2>
                                        <div className="flex items-center gap-3 mt-0.5">
                                            <span className="text-[10px] font-mono uppercase opacity-40 tracking-widest">{group.category}</span>
                                            {group.deadline && (
                                                <span className="text-[10px] font-mono text-error uppercase font-bold tracking-tighter flex items-center gap-1">
                                                    <span className="w-1 h-1 rounded-full bg-error animate-pulse"></span>
                                                    Deadline: {group.deadline}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </Link>
                                <span className="text-[10px] font-mono opacity-30 bg-base-200 px-2 py-1 rounded">
                                    ID: #{group.id.toString().padStart(4, '0')}
                                </span>
                            </div>
                            
                            <div className="grid grid-cols-1 gap-2 pl-6 border-l-2 border-base-200 ml-1">
                                {group.tasks.map((task: any) => (
                                    <TaskItem key={task.id} task={task} />
                                ))}
                            </div>
                        </section>
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
        }} className="flex items-start gap-4 py-3 px-4 rounded-xl hover:bg-base-200/50 transition-colors group/item border border-transparent hover:border-base-300/50">
            <button type="submit" className="mt-0.5 shrink-0">
                <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${isChecked ? 'bg-primary border-primary' : 'border-base-400 group-hover/item:border-primary'}`}>
                    {isChecked && (
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5 text-primary-content">
                            <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" />
                        </svg>
                    )}
                </div>
            </button>
            <span className={`text-[15px] font-medium leading-relaxed ${isChecked ? 'line-through opacity-30 text-base-content' : 'text-base-content/80'}`}>
                {text}
            </span>
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
