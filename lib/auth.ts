import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import { authService } from './services/authService';
import { logger } from './logger';

const SECRET_KEY = new TextEncoder().encode(process.env.JWT_SECRET || 'local-dev-secret');

export async function checkRateLimit(ip: string) {
  const attempt = authService.getAttempts(ip);
  if (!attempt) return true;

  const now = Math.floor(Date.now() / 1000);
  const fifteenMinutes = 15 * 60;

  if (now - attempt.last_attempt > fifteenMinutes) {
    authService.resetAttempts(ip);
    return true;
  }

  if (attempt.attempts >= 5) {
    logger.warn({ ip }, 'RATE_LIMIT_TRIGGERED');
    return false;
  }

  return true;
}

export async function recordLoginAttempt(ip: string, success: boolean) {
  if (success) {
    logger.info({ ip }, 'LOGIN_SUCCESS');
    authService.resetAttempts(ip);
  } else {
    logger.warn({ ip }, 'LOGIN_FAILURE');
    authService.recordAttempt(ip);
  }
}

export async function login() {
  const token = await new SignJWT({ role: 'admin' })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(SECRET_KEY);

  const cookieStore = await cookies();
  cookieStore.set('session', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
  });
}

export async function logout() {
  const cookieStore = await cookies();
  cookieStore.delete('session');
}

export async function getSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get('session')?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, SECRET_KEY, {
      algorithms: ['HS256'],
    });
    return payload;
  } catch (error) {
    return null;
  }
}