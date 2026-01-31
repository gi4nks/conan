const db = require('better-sqlite3')('local.db');

try {
  db.prepare("ALTER TABLE pages ADD COLUMN tags TEXT DEFAULT ''").run();
  console.log("Migration successful: Added 'tags' column.");
} catch (error) {
  console.log("Migration skipped: Column already exists or error occured.");
}
