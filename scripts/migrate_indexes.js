const db = require('better-sqlite3')('local.db');

try {
  console.log("Applying database indexes for performance...");
  
  // Index for category filtering (Sidebar & Search)
  db.prepare("CREATE INDEX IF NOT EXISTS idx_pages_category ON pages(category)").run();
  
  // Index for Wiki-links and block retrieval (Backlinks & Editor)
  db.prepare("CREATE INDEX IF NOT EXISTS idx_blocks_page_id ON blocks(page_id)").run();
  
  // Index for tag searching
  db.prepare("CREATE INDEX IF NOT EXISTS idx_pages_tags ON pages(tags)").run();

  console.log("Performance indexes applied successfully.");
} catch (error) {
  console.error("Error applying indexes:", error);
}
