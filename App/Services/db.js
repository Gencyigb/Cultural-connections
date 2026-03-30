const mysql = require('mysql2');

// Create connection pool to MySQL
const pool = mysql.createPool({
  host: process.env.MYSQL_HOST || 'db',
  user: process.env.MYSQL_USER || 'admin',
  password: process.env.MYSQL_PASS || 'password',
  database: process.env.MYSQL_DATABASE || 'sd2-db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Promisify for async/await support
const promisePool = pool.promise();

module.exports = promisePool;