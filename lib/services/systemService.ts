import db from '@/lib/db';

export const systemService = {
  checkDatabaseHealth() {
    try {
      db.prepare('SELECT 1').get();
      return true;
    } catch (e) {
      return false;
    }
  }
};
