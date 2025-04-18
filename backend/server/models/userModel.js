// server/models/userModel.js
const mysql = require('mysql2');
require('dotenv').config();

const db = mysql.createPool({
  host:     process.env.DB_HOST,
  user:     process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10
});

/**
 * Find a confirmed user in NC_Login table
 */
function findUserByEmail(email, cb) {
  db.query(
    'SELECT * FROM NC_Login WHERE email = ?',
    [email],
    (err, results) => {
      if (err) return cb(err);
      const user = Array.isArray(results) && results.length ? results[0] : null;
      cb(null, user);
    }
  );
}

/**
 * Find a pending registration in pending_registrations_nc table
 */
function findPendingByEmail(email, cb) {
  db.query(
    'SELECT * FROM pending_registrations_nc WHERE email = ?',
    [email],
    (err, results) => {
      if (err) return cb(err);
      const pending = Array.isArray(results) && results.length ? results[0] : null;
      cb(null, pending);
    }
  );
}

/**
 * Create a pending registration record
 */
function createPending(data, cb) {
  const sql = `
    INSERT INTO pending_registrations_nc
      (name, surname, employeeId, email, role, department, password, otp, otp_expiry, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
  `;
  db.query(sql, [
    data.name,
    data.surname,
    data.employeeId,
    data.email,
    data.role,
    data.department,
    data.passwordHash,
    data.otp,
    data.otp_expiry
  ], cb);
}

/**
 * Delete a pending registration record after confirmation
 */
function deletePending(email, cb) {
  db.query(
    'DELETE FROM pending_registrations_nc WHERE email = ?',
    [email],
    cb
  );
}

/**
 * Create a confirmed user record in NC_Login
 */
function createUser(data, cb) {
  const sql = `
    INSERT INTO NC_Login
      (name, surname, employeeId, email, role, department, password, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, NOW())
  `;
  db.query(sql, [
    data.name,
    data.surname,
    data.employeeId,
    data.email,
    data.role,
    data.department,
    data.passwordHash
  ], cb);
}

module.exports = {
  findUserByEmail,
  findPendingByEmail,
  createPending,
  deletePending,
  createUser
};
