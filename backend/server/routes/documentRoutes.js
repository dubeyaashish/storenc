// server/routes/documentRoutes.js
const express = require('express');
const { createDocument, getDocumentsByUserRole } = require('../models/documentModel');
const { authenticateJWT } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/create', authenticateJWT, (req, res) => {
  const documentData = req.body;
  documentData.createdBy = req.user.userId;  // User ID from JWT
  createDocument(documentData, (err, result) => {
    if (err) return res.status(500).send('Error creating document');
    res.status(200).send('Document created');
  });
});

router.get('/documents', authenticateJWT, (req, res) => {
  const { role } = req.user;
  getDocumentsByUserRole(role, (err, documents) => {
    if (err) return res.status(500).send('Error retrieving documents');
    res.json(documents);
  });
});

module.exports = router;
