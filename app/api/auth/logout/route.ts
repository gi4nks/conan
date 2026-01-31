import auth from '@/lib/auth';
import { NextResponse } from 'next/server';

export async function POST() {
  await auth.logout();
  return NextResponse.json({ success: true });
}

