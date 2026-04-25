const express = require('express');
const multer = require('multer');
const path = require('path');
const db = require('../db');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname))
});
const upload = multer({ storage });

// Upload document
router.post('/', authenticate, upload.single('file'), (req, res) => {
  const { type, series_number, issue_date, issuing_org } = req.body;
  const file_path = req.file.path;
  // Mock verification
  const verified = series_number.startsWith('AA') ? 1 : 0;

  db.run(`INSERT INTO documents (user_id, type, series_number, issue_date, issuing_org, file_path, verified) VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [req.user.id, type, series_number, issue_date, issuing_org, file_path, verified],
    function(err) {
      if (err) return res.status(400).json({ error: err.message });
      res.json({ id: this.lastID, verified });
    });
});

// Get user documents
router.get('/', authenticate, (req, res) => {
  db.all(`SELECT * FROM documents WHERE user_id = ?`, [req.user.id], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

module.exports = router;