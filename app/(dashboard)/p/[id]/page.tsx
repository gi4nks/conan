import { notFound } from 'next/navigation';
import Editor from '@/components/Editor';
import { pageService } from '@/lib/services/pageService';
import { blockService } from '@/lib/services/blockService';

interface Params {
  id: string;
}

export default async function PageEditor({ params }: { params: Promise<Params> }) {
  const { id } = await params;
  
  const page = pageService.getPageById(id);
  if (!page) notFound();

  const blocks = blockService.getBlocksByPageId(id);
  const backlinks = pageService.getBacklinks(id, page.title);
    const allPages = pageService.getAllPages().filter(p => p.is_deleted === 0);
  
    return <Editor initialPage={page} initialBlocks={blocks} allPages={allPages} backlinks={backlinks} />;
  }
  