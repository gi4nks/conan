'use server';

import db from './db';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

export async function createPageAction() {
  const result = db.prepare('INSERT INTO pages (title, category) VALUES (?, ?)').run('Untitled', 'inbox');
  revalidatePath('/');
  redirect(`/p/${result.lastInsertRowid}`);
}

export async function createPageFromLinkAction(title: string) {
  const result = db.prepare('INSERT INTO pages (title, category) VALUES (?, ?)').run(title, 'inbox');
  revalidatePath('/');
  redirect(`/p/${result.lastInsertRowid}`);
}

export async function movePageAction(id: number, category: string) {
  db.prepare('UPDATE pages SET category = ?, updated_at = unixepoch() WHERE id = ?').run(category, id);
  revalidatePath('/');
}

export async function trashPageAction(id: number) {
  db.prepare('UPDATE pages SET is_deleted = 1, updated_at = unixepoch() WHERE id = ?').run(id);
  revalidatePath('/');
}

export async function restorePageAction(id: number) {
  db.prepare('UPDATE pages SET is_deleted = 0, updated_at = unixepoch() WHERE id = ?').run(id);
  revalidatePath('/');
}

export async function deletePagePermanentlyAction(id: number) {
  db.prepare('DELETE FROM pages WHERE id = ?').run(id);
  revalidatePath('/');
}

export async function updatePageAction(id: number, data: { title: string, category: string, deadline?: string, tags?: string }) {
  db.prepare('UPDATE pages SET title = ?, category = ?, deadline = ?, tags = ?, updated_at = unixepoch() WHERE id = ?')
    .run(data.title, data.category, data.deadline || null, data.tags || '', id);
  revalidatePath('/');
}

export async function updateBlocksAction(pageId: number, blocks: any[]) {
  const deleteStmt = db.prepare('DELETE FROM blocks WHERE page_id = ?');
  const insertStmt = db.prepare('INSERT INTO blocks (page_id, type, content, order_index) VALUES (?, ?, ?, ?)');

  const transaction = db.transaction((pId, bks) => {
    deleteStmt.run(pId);
    for (const block of bks) {
      insertStmt.run(pId, block.type, block.content, block.order_index);
    }
  });

  transaction(pageId, blocks);
  revalidatePath(`/p/${pageId}`);
}

export async function emptyTrashAction() {
  db.prepare('DELETE FROM pages WHERE is_deleted = 1').run();
  revalidatePath('/');
}

export async function openTodayAction() {
  const today = new Date().toISOString().split('T')[0];
  const existing = db.prepare('SELECT id FROM pages WHERE title = ?').get(today) as any;
  
  if (existing) {
      redirect(`/p/${existing.id}`);
  } else {
      const result = db.prepare('INSERT INTO pages (title, category) VALUES (?, ?)').run(today, 'inbox');
      revalidatePath('/');
      redirect(`/p/${result.lastInsertRowid}`);
  }
}
