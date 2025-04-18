// server/models/documentModel.js
const mysql = require('mysql2');
const db = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

const createDocument = (documentData, callback) => {
  const sql = `INSERT INTO documents_nc SET ?`;  // Changed to documents_nc
  db.query(sql, documentData, callback);
};

const getDocumentsByUserRole = (role, callback) => {
  const sql = `SELECT * FROM documents_nc WHERE role = ?`;  // Changed to documents_nc
  db.query(sql, [role], callback);
};

module.exports = { createDocument, getDocumentsByUserRole };
