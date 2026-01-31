import { NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import sharp from 'sharp';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Forensic Image Processing
    // 1. Resize to max 2000px width/height
    // 2. Convert to WebP for maximum compression
    // 3. Strip metadata (EXIF) for privacy and space
    const optimizedBuffer = await sharp(buffer)
      .resize(2000, 2000, {
        fit: 'inside',
        withoutEnlargement: true
      })
      .webp({ quality: 80 })
      .toBuffer();

    const filename = `${Date.now()}-${file.name.split('.')[0]}.webp`;
    
    const storageDir = path.join(process.cwd(), 'data', 'uploads');
    await mkdir(storageDir, { recursive: true });
    
    const filePath = path.join(storageDir, filename);
    await writeFile(filePath, optimizedBuffer);

    return NextResponse.json({ url: `/api/uploads/${filename}` });
  } catch (error) {
    console.error('Image optimization failed:', error);
    return NextResponse.json({ error: 'Upload or optimization failed' }, { status: 500 });
  }
}
