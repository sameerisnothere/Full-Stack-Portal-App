// authservice/tokenCleanup.js
import cron from 'node-cron';
import pool from './config/db.js';

/** deletes expired tokens.
 */
// '0 * * * *' every hour
// '*/10 * * * *'	Every 10 minutes
// '*/5 * * * *'	Every 5 minutes
// '* * * * *'	Every minute
// '0 * * * *' every hour
cron.schedule('* * * * *', async () => {  // runs every minute
  try {
    const now = new Date();
    await pool.execute(
      "DELETE FROM tokens WHERE expires_at < ?",
      [now]
    );
  } catch (err) {
    console.error("Token cleanup error:", err);
  }
});

