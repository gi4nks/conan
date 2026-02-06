import db from '@/lib/db';

export const searchService = {
  search(query: string, limit: number = 50) {
    if (!query || query.length < 2) return [];

    // Search in Pages (Titles and Tags)
    const pages = db.prepare(`
      SELECT id, title, category, tags, 'page' as type 
      FROM pages 
      WHERE (title LIKE ? OR tags LIKE ?) AND is_deleted = 0
      LIMIT ?
    `).all(`%${query}%`, `%${query}%`, limit) as any[];

    // Search in Blocks (Content)
    const blocks = db.prepare(`
      SELECT p.id, p.title, p.category, p.tags, b.content as snippet, 'block' as type
      FROM blocks b
      JOIN pages p ON b.page_id = p.id
      WHERE b.content LIKE ? AND p.is_deleted = 0
      GROUP BY p.id
      LIMIT ?
    `).all(`%${query}%`, limit) as any[];

    // Combine and deduplicate
    const results = [...pages, ...blocks] as any[];
    return Array.from(new Map(results.map(item => [item.id, item])).values());
  }
};
