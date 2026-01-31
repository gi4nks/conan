import { NextResponse } from 'next/server';
import { blockService } from '@/lib/services/blockService';
import { handleApiError } from '@/lib/api-error';

type Params = { id: string };

export async function PUT(request: Request, { params }: { params: Promise<Params> }) {
  try {
    const { id } = await params;
    const { blocks } = await request.json();

    if (!Array.isArray(blocks)) {
      return handleApiError(new Error('Invalid blocks format'), 'BAD_REQUEST');
    }

    blockService.updatePageBlocks(id, blocks);
    return NextResponse.json({ success: true });
  } catch (error) {
    return handleApiError(error, 'SERVER_ERROR', 'Failed to sync evidence blocks.');
  }
}
