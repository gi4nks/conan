import { NextResponse } from 'next/server';
import * as cheerio from 'cheerio';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const url = searchParams.get('url');

  if (!url) {
    return NextResponse.json({ error: 'URL required' }, { status: 400 });
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5s timeout

    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(timeoutId);

    const html = await res.text();
    const $ = cheerio.load(html);

    const getMeta = (name: string) => 
      $(`meta[property="${name}"]`).attr('content') || 
      $(`meta[name="${name}"]`).attr('content');

    const title = getMeta('og:title') || $('title').text() || url;
    const description = getMeta('og:description') || getMeta('description') || '';
    const image = getMeta('og:image') || '';

    return NextResponse.json({ url, title, description, image });
  } catch (error) {
    console.error('Metadata fetch error:', error);
    return NextResponse.json({ url, title: url, description: 'Could not fetch metadata', image: '' });
  }
}
