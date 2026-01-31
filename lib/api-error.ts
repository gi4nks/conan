import { NextResponse } from 'next/server';
import { logger } from './logger';

export type ApiErrorType = 'BAD_REQUEST' | 'UNAUTHORIZED' | 'FORBIDDEN' | 'NOT_FOUND' | 'SERVER_ERROR' | 'RATE_LIMIT';

export function handleApiError(error: unknown, type: ApiErrorType = 'SERVER_ERROR', customMessage?: string) {
  // Professional forensic logging
  logger.error({ 
    type, 
    error: error instanceof Error ? { message: error.message, stack: error.stack } : error,
    timestamp: new Date().toISOString()
  }, 'API_ERROR_INTERCEPTED');

  const statusMap: Record<ApiErrorType, number> = {
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    RATE_LIMIT: 429,
    SERVER_ERROR: 500,
  };

  const messageMap: Record<ApiErrorType, string> = {
    BAD_REQUEST: 'Invalid evidence provided.',
    UNAUTHORIZED: 'Badge not recognized. Access denied.',
    FORBIDDEN: 'Clearance denied for this operation.',
    NOT_FOUND: 'Case file or lead not found.',
    RATE_LIMIT: 'Too many attempts. System locked.',
    SERVER_ERROR: 'Internal forensic engine failure.',
  };

  return NextResponse.json(
    {
      success: false,
      error: customMessage || messageMap[type],
      code: type,
      timestamp: new Date().toISOString()
    }, 
    { status: statusMap[type] }
  );
}
