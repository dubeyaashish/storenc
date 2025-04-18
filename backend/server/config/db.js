const mysql = require('mysql2');
const path  = require('path');

// Load environment variables from backend/.env
require('dotenv').config({
  path: path.resolve(__dirname, '../.env')
});

// Debug: verify credentials are loaded
console.log('DB_USER=', process.env.DB_USER);
console.log('DB_PASSWORD=', process.env.DB_PASSWORD ? '***' : null);
console.log('DB_NAME=', process.env.DB_NAME);

const pool = mysql.createPool({
  host:     process.env.DB_HOST,
  user:     process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10
});

module.exports = pool;
