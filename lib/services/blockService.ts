import db from '@/lib/db';

export const blockService = {
  getBlocksByPageId(pageId: number | string) {
    return db.prepare('SELECT * FROM blocks WHERE page_id = ? ORDER BY order_index ASC').all(pageId) as any[];
  },

  updatePageBlocks(pageId: number | string, blocks: { type: string, content: string, order_index: number }[]) {
    const deleteOld = db.prepare('DELETE FROM blocks WHERE page_id = ?');
    const insertNew = db.prepare('INSERT INTO blocks (page_id, type, content, order_index) VALUES (?, ?, ?, ?)');

    // Use a transaction for atomic bulk update
    const transaction = db.transaction((pageId, blocks) => {
      deleteOld.run(pageId);
      for (const block of blocks) {
        insertNew.run(pageId, block.type, block.content, block.order_index);
      }
    });

    return transaction(pageId, blocks);
  },

  getAllTasks() {
    return db.prepare(`
      SELECT b.*, p.title as page_title, p.category as page_category, p.deadline as page_deadline
      FROM blocks b
      JOIN pages p ON b.page_id = p.id
      WHERE b.type = 'checkbox' AND p.is_deleted = 0
      ORDER BY 
        CASE WHEN p.deadline IS NULL THEN 1 ELSE 0 END,
        p.deadline ASC, 
        p.title ASC, 
        b.order_index ASC
    `).all() as any[];
  }
};
