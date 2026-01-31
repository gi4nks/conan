import { NextResponse } from 'next/server';
import AdmZip from 'adm-zip';
import { pageService } from '@/lib/services/pageService';
import { blockService } from '@/lib/services/blockService';
import { handleApiError } from '@/lib/api-error';
import fs from 'fs';
import path from 'path';

export async function GET() {
  try {
    const zip = new AdmZip();
    const pages = pageService.getAllPages();

    for (const page of pages) {
      const blocks = blockService.getBlocksByPageId(page.id);
      let markdown = `# ${page.title}\n\n`;
      markdown += `Category: ${page.category}\n`;
      markdown += `Tags: ${page.tags}\n`;
      markdown += `Deadline: ${page.deadline}\n\n---\n\n`;

      blocks.forEach(block => {
        if (block.type === 'heading') markdown += `## ${block.content}\n\n`;
        else if (block.type === 'bullet') markdown += `* ${block.content}\n`;
        else if (block.type === 'checkbox') markdown += `- [ ] ${block.content}\n`;
        else markdown += `${block.content}\n\n`;
      });

      zip.addFile(`${page.title.replace(/\//g, '-')}.md`, Buffer.from(markdown, 'utf-8'));
    }

    // Add visual evidence if directory exists
    const uploadsDir = path.join(process.cwd(), 'data', 'uploads');
    if (fs.existsSync(uploadsDir)) {
      zip.addLocalFolder(uploadsDir, 'evidence');
    }

    const buffer = zip.toBuffer();

    return new NextResponse(new Uint8Array(buffer), {
      headers: {
        'Content-Type': 'application/zip',
        'Content-Disposition': `attachment; filename="conan-evidence-backup-${new Date().toISOString().split('T')[0]}.zip"`,
      },
    });
  } catch (error) {
    return handleApiError(error, 'SERVER_ERROR', 'Failed to generate evidence backup.');
  }
}