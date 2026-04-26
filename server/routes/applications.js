const express = require('express');
const db = require('../db');
const { authenticate, authorize } = require('../middleware/auth');
const { calculateOverallCandidateScore } = require('../services/candidateScore');

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

// Update scores
router.put('/:id/score', authenticate, authorize(['hospital_admin']), async (req, res) => {
  try {
    const application = await new Promise((resolve, reject) => {
      db.get(`SELECT * FROM applications WHERE id = ?`, [req.params.id], (err, row) => {
        if (err) {
          reject(err);
          return;
        }
        resolve(row);
      });
    });

    if (!application) {
      res.status(404).json({ error: 'Application not found' });
      return;
    }

    const scoreResult = await calculateOverallCandidateScore({
      userId: application.user_id,
      vacancyId: req.body.vacancy_id || application.vacancy_id,
    });

    db.run(
      `UPDATE applications SET score = ? WHERE id = ?`,
      [scoreResult.overallScore, req.params.id],
      (err) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(scoreResult);
      }
    );
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
