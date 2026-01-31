import db from '@/lib/db';

export const authService = {
  getAttempts(ip: string) {
    return db.prepare('SELECT attempts, last_attempt FROM login_attempts WHERE ip = ?').get(ip) as any;
  },

  resetAttempts(ip: string) {
    return db.prepare('DELETE FROM login_attempts WHERE ip = ?').run(ip);
  },

  recordAttempt(ip: string) {
    return db.prepare(`
      INSERT INTO login_attempts (ip, attempts, last_attempt) 
      VALUES (?, 1, unixepoch())
      ON CONFLICT(ip) DO UPDATE SET 
        attempts = attempts + 1,
        last_attempt = unixepoch()
    `).run(ip);
  }
};
