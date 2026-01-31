import db from '@/lib/db';

export const pageService = {
  getAllPages() {
    return db.prepare('SELECT id, title, category, deadline, tags FROM pages WHERE is_deleted = 0 ORDER BY updated_at DESC').all() as any[];
  },

  getTrashPages() {
    return db.prepare('SELECT id, title, category FROM pages WHERE is_deleted = 1 ORDER BY updated_at DESC').all() as any[];
  },

  getPageById(id: number | string) {
    return db.prepare('SELECT * FROM pages WHERE id = ?').get(id) as any;
  },

  createPage(title: string, category: string = 'inbox') {
    const result = db.prepare('INSERT INTO pages (title, category) VALUES (?, ?)').run(title, category);
    return { id: result.lastInsertRowid };
  },

  updatePage(id: number | string, data: { title?: string, category?: string, deadline?: string, tags?: string, is_deleted?: number }) {
    const sets: string[] = [];
    const params: any[] = [];

    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined) {
        sets.push(`${key} = ?`);
        params.push(value);
      }
    });

    if (sets.length === 0) return;

    sets.push('updated_at = unixepoch()');
    params.push(id);

    const query = `UPDATE pages SET ${sets.join(', ')} WHERE id = ?`;
    return db.prepare(query).run(...params);
  },

  // Soft delete (move to trash)
  trashPage(id: number | string) {
    return db.prepare('UPDATE pages SET is_deleted = 1, updated_at = unixepoch() WHERE id = ?').run(id);
  },

  // Restore from trash
  restorePage(id: number | string) {
    return db.prepare('UPDATE pages SET is_deleted = 0, updated_at = unixepoch() WHERE id = ?').run(id);
  },

  // Permanent delete
  deletePagePermanently(id: number | string) {
    return db.prepare('DELETE FROM pages WHERE id = ?').run(id);
  },

  emptyTrash() {
    return db.prepare('DELETE FROM pages WHERE is_deleted = 1').run();
  },

  getBacklinks(id: number | string, title: string) {
    return db.prepare(`
      SELECT DISTINCT p.id, p.title 
      FROM pages p
      JOIN blocks b ON p.id = b.page_id
      WHERE b.content LIKE ? AND p.id != ? AND p.is_deleted = 0
    `).all(`%[[${title}]]%`, id) as any[];
  },

  getStats() {
    const totalPages = db.prepare("SELECT COUNT(*) as count FROM pages WHERE is_deleted = 0").get() as any;
    const totalBlocks = db.prepare("SELECT COUNT(*) as count FROM blocks b JOIN pages p ON b.page_id = p.id WHERE p.is_deleted = 0").get() as any;
    const totalLinks = db.prepare("SELECT COUNT(*) as count FROM blocks b JOIN pages p ON b.page_id = p.id WHERE b.content LIKE '%[[%]]%' AND p.is_deleted = 0").get() as any;
    const categories = ['inbox', 'projects', 'areas', 'resources', 'archives'];
    
    const paraStats = categories.map(cat => {
        const result = db.prepare("SELECT COUNT(*) as count FROM pages WHERE category = ? AND is_deleted = 0").get(cat) as any;
        return { label: cat, count: result.count };
    });

    const allTagsRows = db.prepare("SELECT tags FROM pages WHERE tags != '' AND is_deleted = 0").all() as any[];
    const tagCounts: Record<string, number> = {};
    allTagsRows.forEach(row => {
        row.tags.split(',').forEach((tag: string) => {
            const t = tag.trim();
            if (t) tagCounts[t] = (tagCounts[t] || 0) + 1;
        });
    });

    return { totalPages, totalBlocks, totalLinks, paraStats, tagCounts };
  }
};