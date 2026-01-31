import { pageService } from '@/lib/services/pageService';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default function StatsPage() {
  const { totalPages, totalBlocks, totalLinks, paraStats, tagCounts } = pageService.getStats();
  const sortedTags = Object.entries(tagCounts).sort((a, b) => b[1] - a[1]);
  const maxCount = Math.max(...paraStats.map(s => s.count), 1);

  return (
    <div className="w-full py-12 px-4 md:px-8">
      <div className="mb-12">
        <h1 className="text-4xl font-black mb-2 flex items-center gap-3">
            <span>🧪</span> Crime Lab
        </h1>
        <p className="text-base-content/60">Forensic analysis of your knowledge base.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <div className="stats shadow bg-base-100 border border-base-200">
          <div className="stat">
            <div className="stat-title uppercase font-bold text-xs tracking-widest">Case Files</div>
            <div className="stat-value text-primary">{totalPages.count}</div>
            <div className="stat-desc">Total pages created</div>
          </div>
        </div>
        
        <div className="stats shadow bg-base-100 border border-base-200">
          <div className="stat">
            <div className="stat-title uppercase font-bold text-xs tracking-widest">Evidence Tags</div>
            <div className="stat-value text-secondary">{Object.keys(tagCounts).length}</div>
            <div className="stat-desc">Unique clues collected</div>
          </div>
        </div>

        <div className="stats shadow bg-base-100 border border-base-200">
          <div className="stat">
            <div className="stat-title uppercase font-bold text-xs tracking-widest">Connections</div>
            <div className="stat-value text-accent">{totalLinks.count}</div>
            <div className="stat-desc">Internal wiki links</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        <div className="card bg-base-100 border border-base-200 shadow-sm p-8">
            <h3 className="text-lg font-bold mb-6 uppercase tracking-wider opacity-50">Archive Distribution</h3>
            <div className="space-y-4">
                {paraStats.map(stat => (
                    <div key={stat.label}>
                        <div className="flex justify-between text-xs font-bold uppercase mb-1">
                            <span>{stat.label}</span>
                            <span>{stat.count}</span>
                        </div>
                        <div className="w-full bg-base-200 rounded-full h-2">
                            <div 
                                className={`h-full rounded-full ${stat.label === 'inbox' ? 'bg-error' : 'bg-primary'}`} 
                                style={{ width: `${(stat.count / maxCount) * 100}%` }}
                            ></div>
                        </div>
                    </div>
                ))}
            </div>
        </div>

        <div className="card bg-base-100 border border-base-200 shadow-sm p-8">
            <h3 className="text-lg font-bold mb-6 uppercase tracking-wider opacity-50">Top Clues</h3>
            <div className="flex flex-wrap gap-2">
                {sortedTags.length === 0 && <p className="text-sm opacity-30 italic">No clues collected yet.</p>}
                {sortedTags.map(([tag, count]) => (
                    <Link 
                        href={`/search?q=${encodeURIComponent(tag)}`}
                        key={tag} 
                        className="badge badge-lg badge-outline hover:badge-primary gap-2 transition-all py-4 px-4"
                    >
                        <span className="opacity-50">#</span>
                        <span className="font-bold">{tag}</span>
                        <span className="badge badge-sm badge-ghost opacity-50">{count}</span>
                    </Link>
                ))}
            </div>
        </div>
      </div>

      <div className="mt-12 text-center">
          <div className="divider opacity-10 uppercase text-[10px] tracking-[0.5em]">Case Closed</div>
          <p className="text-[10px] opacity-20 font-mono italic mt-4">Database: local.db | Engines: forensic-sqlite-3.0</p>
      </div>
    </div>
  );
}