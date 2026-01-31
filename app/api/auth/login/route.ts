import { NextResponse } from 'next/server';
import { login, checkRateLimit, recordLoginAttempt } from '@/lib/auth';
import { handleApiError } from '@/lib/api-error';

export async function POST(request: Request) {
  try {
    const ip = request.headers.get('x-forwarded-for') || 'unknown';
    const { username, password } = await request.json();

    const isAllowed = await checkRateLimit(ip);
    if (!isAllowed) {
      return handleApiError(new Error('Rate limit exceeded'), 'RATE_LIMIT');
    }

    if (
      username === process.env.AUTH_USER &&
      password === process.env.AUTH_PASSWORD
    ) {
      await recordLoginAttempt(ip, true);
      await login();
      return NextResponse.json({ success: true });
    }

    await recordLoginAttempt(ip, false);
    return handleApiError(new Error('Invalid badge credentials'), 'UNAUTHORIZED');
  } catch (error) {
    return handleApiError(error, 'SERVER_ERROR');
  }
}