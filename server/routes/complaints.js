const express = require('express');
const multer = require('multer');
const path = require('path');
const db = require('../db');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname))
});
const upload = multer({ storage });

// Submit complaint
router.post('/', upload.single('evidence'), (req, res) => {
  const { hospital_id, vacancy_id, category, description, anonymous } = req.body;
  const evidence_file = req.file ? req.file.path : null;

  db.run(`INSERT INTO complaints (hospital_id, vacancy_id, category, description, evidence_file, anonymous) VALUES (?, ?, ?, ?, ?, ?)`,
    [hospital_id, vacancy_id, category, description, evidence_file, anonymous ? 1 : 0],
    function(err) {
      if (err) return res.status(400).json({ error: err.message });
      res.json({ id: this.lastID });
    });
});

// Get complaints (admin)
router.get('/', authenticate, authorize(['admin']), (req, res) => {
  db.all(`SELECT * FROM complaints`, [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

module.exports = router;