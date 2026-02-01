import { NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import path from 'path';
import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ filename: string }> }
) {
  const { filename } = await params;
  
  // 1. Security Check: Verify JWT session
  const cookieStore = await cookies();
  const token = cookieStore.get('session')?.value;

  if (!token) {
    return new NextResponse('Unauthorized: Agent badge missing', { status: 401 });
  }

  try {
    const secret = new TextEncoder().encode(process.env.ANT_JWT_SECRET || 'atlas-secret-key-12345-very-long-and-secure-default');
    await jwtVerify(token, secret);
  } catch (err) {
    return new NextResponse('Invalid Credentials', { status: 401 });
  }

  // 2. Serve the file from private storage
  try {
    const filePath = path.join(process.cwd(), 'data', 'uploads', filename);
    const fileBuffer = await readFile(filePath);
    
    // Determine content type based on extension
    const ext = path.extname(filename).toLowerCase();
    const contentType = ext === '.png' ? 'image/png' : 
                        ext === '.jpg' || ext === '.jpeg' ? 'image/jpeg' : 
                        ext === '.gif' ? 'image/gif' : 
                        ext === '.webp' ? 'image/webp' : 'application/octet-stream';

    return new NextResponse(fileBuffer, {
      headers: { 'Content-Type': contentType },
    });
  } catch (error) {
    return new NextResponse('Evidence not found', { status: 404 });
  }
}
