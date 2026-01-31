export default function SidebarSkeleton() {
  return (
    <aside className="w-64 bg-base-100 shadow-xl flex flex-col shrink-0 h-full relative border-r border-base-300">
      <div className="h-16 border-b border-base-300 flex items-center px-6">
        <div className="flex items-center gap-2 animate-pulse">
            <div className="w-8 h-8 bg-base-300 rounded-full"></div>
            <div className="w-24 h-6 bg-base-300 rounded-lg"></div>
        </div>
      </div>
      <div className="flex-1 p-4 space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="space-y-2 animate-pulse">
                  <div className="w-16 h-3 bg-base-300 rounded"></div>
                  <div className="w-full h-8 bg-base-200 rounded-lg"></div>
              </div>
          ))}
      </div>
    </aside>
  );
}
