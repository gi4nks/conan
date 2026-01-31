import { auth } from '@/lib/auth';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const user = body.username?.trim();
    const password = body.password?.trim();
    
    const formData = new FormData();
    formData.append('user', user);
    formData.append('password', password);

    await auth.login(formData);
    
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Invalid credentials' }, { status: 401 });
  }
}