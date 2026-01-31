import { NextResponse } from 'next/server';
import { searchService } from '@/lib/services/searchService';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q') || '';
  const limit = parseInt(searchParams.get('limit') || '5');

  const results = searchService.search(query, limit);
  return NextResponse.json(results);
}