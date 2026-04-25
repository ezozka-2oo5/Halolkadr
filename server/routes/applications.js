const express = require('express');
const db = require('../db');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();

// Apply for vacancy
router.post('/', authenticate, (req, res) => {
  const { vacancy_id } = req.body;
  db.run(`INSERT INTO applications (user_id, vacancy_id) VALUES (?, ?)`,
    [req.user.id, vacancy_id],
    function(err) {
      if (err) return res.status(400).json({ error: err.message });
      res.json({ id: this.lastID });
    });
});

// Get applications for user
router.get('/my', authenticate, (req, res) => {
  db.all(`SELECT * FROM applications WHERE user_id = ?`, [req.user.id], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// Calculate score (mock AI)
function calculateScore(userId, vacancyId) {
  // Mock scoring logic
  return Math.floor(Math.random() * 100);
}

// Update scores
router.put('/:id/score', authenticate, authorize(['hospital_admin']), (req, res) => {
  const score = calculateScore(req.params.id, req.body.vacancy_id);
  db.run(`UPDATE applications SET score = ? WHERE id = ?`, [score, req.params.id], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ score });
  });
});

module.exports = router;