// server/config/db.js
const mysql = require('mysql2');
const path = require('path');

// Load environment variables
require('dotenv').config({
  path: path.resolve(__dirname, '../.env')
});

// Create a single connection pool to be used throughout the application
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Convert callbacks to promises for easier async/await usage
const promisePool = pool.promise();

module.exports = {
  pool,            // For callback style
  promisePool,     // For promise/async style
  query: (sql, params) => {
    return new Promise((resolve, reject) => {
      pool.query(sql, params, (error, results) => {
        if (error) {
          return reject(error);
        }
        return resolve(results);
      });
    });
  }
};