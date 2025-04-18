// server/models/documentModel.js
const db = require('../config/db');

/**
 * Create a new document
 * @param {Object} documentData - Document data from form
 * @param {Function} callback - Callback function(err, result)
 */
const createDocument = (documentData, callback) => {
  const sql = `INSERT INTO documents_nc SET ?`;
  db.pool.query(sql, documentData, callback);
};

/**
 * Get documents based on user role
 * @param {String} role - User role (SaleCo, QA, Inventory)
 * @param {Number} userId - User ID for filtering
 * @param {Function} callback - Callback function(err, documents)
 */
const getDocumentsByUserRole = (role, userId, callback) => {
  let sql = '';
  let params = [];
  
  // Different SQL based on role
  switch (role) {
    case 'SaleCo':
      // SaleCo users see only their documents
      sql = `SELECT d.*, u.name AS creatorName 
             FROM documents_nc d 
             JOIN NC_Login u ON d.createdBy = u.id 
             WHERE d.createdBy = ?`;
      params = [userId];
      break;
      
    case 'QA':
      // QA users see all documents
      sql = `SELECT d.*, u.name AS creatorName 
             FROM documents_nc d 
             JOIN NC_Login u ON d.createdBy = u.id 
             ORDER BY d.created_at DESC`;
      break;
      
    case 'Inventory':
      // Inventory sees all documents
      sql = `SELECT d.*, u.name AS creatorName 
             FROM documents_nc d 
             JOIN NC_Login u ON d.createdBy = u.id 
             ORDER BY d.created_at DESC`;
      break;
      
    default:
      return callback(new Error('Invalid role'));
  }
  
  db.pool.query(sql, params, (err, results) => {
    if (err) return callback(err);
    
    // Convert binary data if needed
    const documents = results.map(doc => {
      // Remove any Buffer objects that can't be JSON serialized
      const serializable = { ...doc };
      return serializable;
    });
    
    callback(null, documents);
  });
};

/**
 * Get a document by ID
 * @param {Number} id - Document ID
 * @param {Function} callback - Callback function(err, document)
 */
const getDocumentById = (id, callback) => {
  const sql = `SELECT d.*, u.name AS creatorName 
               FROM documents_nc d 
               JOIN NC_Login u ON d.createdBy = u.id 
               WHERE d.id = ?`;
  
  db.pool.query(sql, [id], (err, results) => {
    if (err) return callback(err);
    if (results.length === 0) return callback(null, null);
    
    callback(null, results[0]);
  });
};

/**
 * Update a document
 * @param {Number} id - Document ID
 * @param {Object} updateData - Data to update
 * @param {Function} callback - Callback function(err, result)
 */
const updateDocument = (id, updateData, callback) => {
  const sql = `UPDATE documents_nc SET ? WHERE id = ?`;
  db.pool.query(sql, [updateData, id], callback);
};

/**
 * Delete a document
 * @param {Number} id - Document ID
 * @param {Function} callback - Callback function(err, result)
 */
const deleteDocument = (id, callback) => {
  const sql = `DELETE FROM documents_nc WHERE id = ?`;
  db.pool.query(sql, [id], callback);
};

module.exports = {
  createDocument,
  getDocumentsByUserRole,
  getDocumentById,
  updateDocument,
  deleteDocument
};