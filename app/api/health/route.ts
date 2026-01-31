import { NextResponse } from 'next/server';
import { systemService } from '@/lib/services/systemService';

export async function GET() {
  const isHealthy = systemService.checkDatabaseHealth();
  
  if (isHealthy) {
    return NextResponse.json({
      status: 'healthy',
      database: 'connected',
      timestamp: new Date().toISOString(),
      engine: 'forensic-sqlite-3.0'
    });
  }

  return NextResponse.json({ 
    status: 'unhealthy', 
    error: 'Database connection failed' 
  }, { status: 500 });
}