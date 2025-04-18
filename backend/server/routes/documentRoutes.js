// server/routes/documentRoutes.js
const express = require('express');
const { 
  createDocument, 
  getDocumentsByUserRole, 
  getDocumentById,
  updateDocument,
  deleteDocument
} = require('../models/documentModel');
const { authenticateJWT, authorizeRoles } = require('../middleware/authMiddleware');

const router = express.Router();

/**
 * Create a new document
 * POST /api/documents/create
 */
router.post('/create', authenticateJWT, (req, res) => {
  const documentData = req.body;
  documentData.createdBy = req.user.userId;
  
  createDocument(documentData, (err, result) => {
    if (err) {
      console.error('Error creating document:', err);
      return res.status(500).json({ message: 'Error creating document' });
    }
    res.status(201).json({ 
      message: 'Document created successfully',
      documentId: result.insertId
    });
  });
});

/**
 * List documents
 * GET /api/documents/list
 */
router.get('/list', authenticateJWT, (req, res) => {
  const { role, userId } = req.user;
  
  getDocumentsByUserRole(role, userId, (err, documents) => {
    if (err) {
      console.error('Error retrieving documents:', err);
      return res.status(500).json({ message: 'Error retrieving documents' });
    }
    res.json(documents);
  });
});

/**
 * Get a document by ID
 * GET /api/documents/:id
 */
router.get('/:id', authenticateJWT, (req, res) => {
  const documentId = req.params.id;
  
  getDocumentById(documentId, (err, document) => {
    if (err) {
      console.error('Error retrieving document:', err);
      return res.status(500).json({ message: 'Error retrieving document' });
    }
    
    if (!document) {
      return res.status(404).json({ message: 'Document not found' });
    }
    
    res.json(document);
  });
});

/**
 * Update a document
 * PUT /api/documents/:id
 */
router.put('/:id', authenticateJWT, (req, res) => {
  const documentId = req.params.id;
  const updateData = req.body;
  
  // Remove any fields that shouldn't be updated directly
  delete updateData.id;
  delete updateData.documentNumber;
  delete updateData.createdBy;
  delete updateData.created_at;
  
  // Add updated_at timestamp
  updateData.updated_at = new Date();
  
  updateDocument(documentId, updateData, (err, result) => {
    if (err) {
      console.error('Error updating document:', err);
      return res.status(500).json({ message: 'Error updating document' });
    }
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Document not found' });
    }
    
    res.json({ message: 'Document updated successfully' });
  });
});

/**
 * Accept a document (QA specific)
 * POST /api/documents/accept
 */
router.post('/accept', authenticateJWT, authorizeRoles(['QA']), (req, res) => {
  const { id, qaName } = req.body;
  
  if (!id || !qaName) {
    return res.status(400).json({ message: 'Document ID and QA name are required' });
  }
  
  const updateData = {
    status: 'Accepted',
    qaName: qaName
  };
  
  updateDocument(id, updateData, (err, result) => {
    if (err) {
      console.error('Error accepting document:', err);
      return res.status(500).json({ message: 'Error accepting document' });
    }
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Document not found' });
    }
    
    res.json({ message: 'Document accepted successfully' });
  });
});

/**
 * Delete a document
 * DELETE /api/documents/:id
 * Only SaleCo can delete their own documents
 */
router.delete('/:id', authenticateJWT, authorizeRoles(['SaleCo']), (req, res) => {
  const documentId = req.params.id;
  const userId = req.user.userId;
  
  // First, check if the document belongs to this user
  getDocumentById(documentId, (err, document) => {
    if (err) {
      console.error('Error retrieving document:', err);
      return res.status(500).json({ message: 'Error retrieving document' });
    }
    
    if (!document) {
      return res.status(404).json({ message: 'Document not found' });
    }
    
    if (document.createdBy !== userId) {
      return res.status(403).json({ message: 'You can only delete your own documents' });
    }
    
    // Now delete the document
    deleteDocument(documentId, (delErr, result) => {
      if (delErr) {
        console.error('Error deleting document:', delErr);
        return res.status(500).json({ message: 'Error deleting document' });
      }
      
      res.json({ message: 'Document deleted successfully' });
    });
  });
});

module.exports = router;