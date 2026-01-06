// deleteservice/config/db.js
import mysql from "mysql2/promise";
import dotenv from "dotenv";

dotenv.config();

/**
 * Creates a MySQL connection pool using mysql2/promise.
 * 
 * Connection pool allows multiple concurrent connections and reuses them efficiently.
 * - host: database host
 * - user: database username
 * - password: database password
 * - database: database name
 * - connectionLimit: maximum number of simultaneous connections in the pool
 */
const pool = mysql.createPool({
  host: process.env.DB_HOSTNAME,
  user: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  connectionLimit: 100, // Max connections in the pool
});

/**
 * Test initial database connection.
 * Logs success or error message and releases the connection back to the pool.
 */
pool.getConnection((err, connection) => {
  if (err) {
    console.error("Error connecting to the database:", err);
    return;
  }
  console.log("Connected to database!");
  connection.release();
});

export default pool;
