import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const SECRET_KEY = new TextEncoder().encode(process.env.JWT_SECRET || 'local-dev-secret');

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;

  // Basic CSRF Protection: Verify Origin for POST/PUT/DELETE
  if (['POST', 'PUT', 'DELETE'].includes(request.method)) {
    const origin = request.headers.get('origin');
    const host = request.headers.get('host');
    
    // In production, we should be stricter. For local/docker we check if origin exists and matches host
    if (origin && !origin.includes(host as string)) {
      return NextResponse.json({ error: 'CSRF Protection: Invalid Origin' }, { status: 403 });
    }
  }

  // Public paths
  if (path === '/login' || path === '/api/auth/login') {
    return NextResponse.next();
  }

  const token = request.cookies.get('session')?.value;

  if (!token) {
    if (path.startsWith('/api/')) {
       return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.redirect(new URL('/login', request.url));
  }

  try {
    await jwtVerify(token, SECRET_KEY, {
      algorithms: ['HS256'],
    });
    return NextResponse.next();
  } catch (err) {
    if (path.startsWith('/api/')) {
       return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.redirect(new URL('/login', request.url));
  }
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
