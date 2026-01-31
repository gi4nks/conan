const db = require('better-sqlite3')('local.db');

try {
  db.prepare("ALTER TABLE pages ADD COLUMN deadline TEXT").run();
  console.log("Migration successful: Added 'deadline' column.");
} catch (error) {
  if (error.message.includes('duplicate column name')) {
    console.log("Migration skipped: Column already exists.");
  } else {
    console.error("Migration failed:", error);
  }
}
