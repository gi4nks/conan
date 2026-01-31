'use server';

import db from './db';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

export async function createPageAction() {
  const result = db.prepare('INSERT INTO pages (title, category) VALUES (?, ?)').run('Untitled', 'inbox');
  revalidatePath('/');
  return { id: result.lastInsertRowid };
}

export async function createPageFromLinkAction(title: string) {
  const result = db.prepare('INSERT INTO pages (title, category) VALUES (?, ?)').run(title, 'inbox');
  revalidatePath('/');
  return { id: result.lastInsertRowid };
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
