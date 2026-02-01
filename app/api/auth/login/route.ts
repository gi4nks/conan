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

    const token = await auth.login(formData);
    
    const response = NextResponse.json({ success: true });
    
    if (token) {
      response.cookies.set('conan_session', token, {
        httpOnly: true,
        secure: false,
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 60 * 24 * 7
      });
    }

    return response;
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Invalid credentials' }, { status: 401 });
  }
}
