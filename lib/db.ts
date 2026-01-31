import Database from 'better-sqlite3';
import path from 'path';

const dbPath = process.env.DATABASE_PATH || path.join(process.cwd(), 'local.db');

const db = new Database(dbPath, { 
  // 1. Wait up to 5 seconds if the database is locked by another process
  timeout: 5000 
});

// 2. Enable WAL mode for better concurrency (multiple readers, one writer)
db.pragma('journal_mode = WAL');
db.pragma('synchronous = NORMAL');
db.pragma('foreign_keys = ON');

db.exec(`
  CREATE TABLE IF NOT EXISTS pages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    category TEXT DEFAULT 'inbox',
    deadline TEXT,
    tags TEXT DEFAULT '',
    is_deleted INTEGER DEFAULT 0,
    created_at INTEGER DEFAULT (unixepoch()),
    updated_at INTEGER DEFAULT (unixepoch())
  );

  CREATE TABLE IF NOT EXISTS blocks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    page_id INTEGER NOT NULL,
    type TEXT NOT NULL,
    content TEXT,
    order_index INTEGER NOT NULL,
    FOREIGN KEY(page_id) REFERENCES pages(id) ON DELETE CASCADE
  );

  CREATE INDEX IF NOT EXISTS idx_pages_category ON pages(category);
  CREATE INDEX IF NOT EXISTS idx_blocks_page_id ON blocks(page_id);
  CREATE INDEX IF NOT EXISTS idx_pages_tags ON pages(tags);
  CREATE INDEX IF NOT EXISTS idx_pages_updated_at ON pages(updated_at);

  CREATE TABLE IF NOT EXISTS login_attempts (
    ip TEXT PRIMARY KEY,
    attempts INTEGER DEFAULT 0,
    last_attempt INTEGER DEFAULT (unixepoch())
  );
`);

export default db;