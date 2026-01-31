import { NextResponse } from 'next/server';
import { pageService } from '@/lib/services/pageService';
import { blockService } from '@/lib/services/blockService';

type Params = { id: string };

export async function GET(request: Request, { params }: { params: Promise<Params> }) {
  const { id } = await params;
  
  const page = pageService.getPageById(id);
  if (!page) {
    return NextResponse.json({ error: 'Page not found' }, { status: 404 });
  }
  
  const blocks = blockService.getBlocksByPageId(id);
  const backlinks = pageService.getBacklinks(id, page.title);

  return NextResponse.json({ ...page, blocks, backlinks });
}

export async function PUT(request: Request, { params }: { params: Promise<Params> }) {
  const { id } = await params;
  const data = await request.json();
  
  pageService.updatePage(id, data);
  return NextResponse.json({ success: true });
}

export async function DELETE(request: Request, { params }: { params: Promise<Params> }) {
  const { id } = await params;
  pageService.trashPage(id);
  return NextResponse.json({ success: true });
}