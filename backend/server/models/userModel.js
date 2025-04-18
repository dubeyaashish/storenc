// server/models/userModel.js
const db = require('../config/db');

/**
 * Find a confirmed user in NC_Login table
 * @param {String} email - User email
 * @param {Function} cb - Callback function(err, user)
 */
function findUserByEmail(email, cb) {
  db.pool.query(
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
 * Find a user by ID
 * @param {Number} id - User ID
 * @param {Function} cb - Callback function(err, user)
 */
function findUserById(id, cb) {
  db.pool.query(
    'SELECT id, name, surname, employeeId, email, role, department, created_at FROM NC_Login WHERE id = ?',
    [id],
    (err, results) => {
      if (err) return cb(err);
      const user = Array.isArray(results) && results.length ? results[0] : null;
      cb(null, user);
    }
  );
}

/**
 * Find a pending registration in pending_registrations_nc table
 * @param {String} email - User email
 * @param {Function} cb - Callback function(err, pending)
 */
function findPendingByEmail(email, cb) {
  db.pool.query(
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
 * @param {Object} data - Registration data
 * @param {Function} cb - Callback function(err, result)
 */
function createPending(data, cb) {
  // Check if existing pending registration exists
  db.pool.query(
    'SELECT id FROM pending_registrations_nc WHERE email = ?',
    [data.email],
    (err, results) => {
      if (err) return cb(err);
      
      if (results.length > 0) {
        // Update existing pending registration
        const sql = `
          UPDATE pending_registrations_nc
          SET name = ?, surname = ?, employeeId = ?, role = ?, 
              department = ?, password = ?, otp = ?, otp_expiry = ?
          WHERE email = ?
        `;
        
        db.pool.query(sql, [
          data.name,
          data.surname,
          data.employeeId,
          data.role,
          data.department,
          data.passwordHash,
          data.otp,
          data.otp_expiry,
          data.email
        ], cb);
      } else {
        // Create new pending registration
        const sql = `
          INSERT INTO pending_registrations_nc
            (name, surname, employeeId, email, role, department, password, otp, otp_expiry, created_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
        `;
        
        db.pool.query(sql, [
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
    }
  );
}

/**
 * Delete a pending registration record after confirmation
 * @param {String} email - User email
 * @param {Function} cb - Callback function(err, result)
 */
function deletePending(email, cb) {
  db.pool.query(
    'DELETE FROM pending_registrations_nc WHERE email = ?',
    [email],
    cb
  );
}

/**
 * Create a confirmed user record in NC_Login
 * @param {Object} data - User data
 * @param {Function} cb - Callback function(err, result)
 */
function createUser(data, cb) {
  // First check if user already exists
  db.pool.query(
    'SELECT id FROM NC_Login WHERE email = ?',
    [data.email],
    (err, results) => {
      if (err) return cb(err);
      
      if (results.length > 0) {
        return cb(new Error('User with this email already exists'));
      }
      
      // Create new user
      const sql = `
        INSERT INTO NC_Login
          (name, surname, employeeId, email, role, department, password, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, NOW())
      `;
      
      db.pool.query(sql, [
        data.name,
        data.surname,
        data.employeeId,
        data.email,
        data.role,
        data.department,
        data.passwordHash
      ], cb);
    }
  );
}

module.exports = {
  findUserByEmail,
  findUserById,
  findPendingByEmail,
  createPending,
  deletePending,
  createUser
};