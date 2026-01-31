import { auth } from '@/lib/auth';

export const middleware = auth.middleware;

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
