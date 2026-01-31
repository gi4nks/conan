const db = require('better-sqlite3')('local.db');

try {
  console.log("Migrating database for Trash Bin support...");
  db.prepare("ALTER TABLE pages ADD COLUMN is_deleted INTEGER DEFAULT 0").run();
  console.log("Migration successful: Added 'is_deleted' column.");
} catch (error) {
  console.log("Migration skipped: Column already exists.");
}
