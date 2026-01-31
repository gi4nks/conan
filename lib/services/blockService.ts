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
  }
};
