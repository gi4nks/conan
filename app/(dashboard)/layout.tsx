import { Suspense } from 'react';
import { pageService } from '@/lib/services/pageService';
import DashboardWrapper from './DashboardWrapper';
import SidebarSkeleton from '@/components/SidebarSkeleton';

export const dynamic = 'force-dynamic';

async function SidebarLoader({ children }: { children: React.ReactNode }) {
  const pages = pageService.getAllPages();
  return (
    <DashboardWrapper pages={pages}>
        {children}
    </DashboardWrapper>
  );
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Suspense fallback={<div className="flex h-screen bg-base-200"><SidebarSkeleton /><main className="flex-1 bg-base-100"></main></div>}>
        <SidebarLoader>
            {children}
        </SidebarLoader>
    </Suspense>
  );
}
