import { NextResponse } from 'next/server';
import { pageService } from '@/lib/services/pageService';
import { handleApiError } from '@/lib/api-error';

export async function POST(request: Request) {
  try {
    const { title, category } = await request.json();
    const newPage = pageService.createPage(title || 'Untitled', category || 'inbox');
    return NextResponse.json(newPage);
  } catch (error) {
    return handleApiError(error, 'SERVER_ERROR', 'Failed to create new case file.');
  }
}